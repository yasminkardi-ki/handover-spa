// Power Academy | AI Learning Studio — trainer API (Vercel Node function)
// Trainer content is only returned after a server-checked sign-in.
// Learner workspaces are kept in the participant's own browser (see public/local-api.js).
import crypto from "node:crypto";
import { content } from "../lib/trainer-content.js";
import { buildDocument } from "../lib/trainer-documents.js";
import { projectDocs } from "../lib/project-docs.js";
import { MAX_UPLOAD, ALLOWED, CATEGORIES, configured, listFiles, addFile, getFile, deleteFile, safeName } from "../lib/trainer-files.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const isLocked = (d) => Boolean(d.availableFrom && Date.parse(d.availableFrom) > Date.now());
const lockText = (d) =>
  `Locked until ${new Date(d.availableFrom).toLocaleString("en-GB", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" })} (Berlin) so the blind rating stays blind.`;

async function readRaw(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) {
      const e = new Error("too large");
      e.status = 413;
      throw e;
    }
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}
const hdr = (req, k) => {
  try { return decodeURIComponent(String(req.headers[k] || "")); } catch { return ""; }
};

const SESSION_MS = 2 * 60 * 60 * 1000; // 2 hours
const DOWNLOAD_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const failures = new Map(); // best effort per function instance

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing configuration: ${name}`);
  return v;
}

// TRAINER_PASSWORD_HASH format: scrypt$<saltBase64>$<hashBase64>
function verifyPassword(password) {
  const [scheme, saltB64, hashB64] = env("TRAINER_PASSWORD_HASH").split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) throw new Error("Invalid password configuration");
  const expected = Buffer.from(hashB64, "base64");
  const actual = crypto.scryptSync(String(password), Buffer.from(saltB64, "base64"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// Changing TRAINER_PASSWORD_HASH changes this fingerprint and revokes all tokens and download links.
function keyMaterial() {
  return crypto.createHmac("sha256", env("SESSION_SECRET")).update(env("TRAINER_PASSWORD_HASH")).digest();
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", keyMaterial()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function verify(token, kind) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, mac] = token.split(".");
  const expected = crypto.createHmac("sha256", keyMaterial()).update(body).digest("base64url");
  const a = Buffer.from(mac || "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (data.kind !== kind || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 10_000) throw new Error("Request too large");
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString();
  return raw ? JSON.parse(raw) : {};
}

function sendFile(res, filename, mime, buf) {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "'");
  res.statusCode = 200;
  res.setHeader("Content-Type", mime);
  res.setHeader("Content-Length", buf.length);
  res.setHeader("Content-Disposition", `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
  res.setHeader("Cache-Control", "no-store");
  return res.end(buf);
}

function clientKey(req) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "local";
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function requireTrainer(req) {
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return verify(token, "trainer");
}

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const route = url.searchParams.get("__route") || url.pathname.replace(/^\/api/, "");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");

  try {
    if (route === "/auth/login" && req.method === "POST") {
      const key = clientKey(req);
      const state = failures.get(key);
      if (state && state.until > Date.now()) {
        return send(res, 429, { message: "Too many failed attempts. Please wait 15 minutes and try again." });
      }
      const { password } = await readBody(req);
      if (typeof password === "string" && password.length <= 200 && verifyPassword(password)) {
        failures.delete(key);
        return send(res, 200, { token: sign({ kind: "trainer", exp: Date.now() + SESSION_MS, jti: crypto.randomUUID() }) });
      }
      const count = (state && state.until <= Date.now() ? 0 : state?.count || 0) + 1;
      failures.set(key, { count, until: count >= MAX_FAILS ? Date.now() + LOCK_MS : 0 });
      await new Promise((r) => setTimeout(r, 400));
      return send(res, 401, { message: "The password was not accepted." });
    }

    if (route === "/auth/logout" && req.method === "POST") {
      return send(res, 200, { ok: true });
    }

    if (route.startsWith("/trainer/") && route !== "/trainer/file") {
      if (!requireTrainer(req)) return send(res, 401, { message: "Your trainer session has expired. Please sign in again." });

      if (route === "/trainer/content" && req.method === "GET") {
        const documents = content.documents.map((d) => (isLocked(d) ? { ...d, locked: lockText(d) } : d));
        return send(res, 200, { ...content, documents, uploads: { enabled: configured(), maxBytes: MAX_UPLOAD, types: Object.keys(ALLOWED), categories: CATEGORIES } });
      }

      if (route === "/trainer/files" && req.method === "GET") {
        if (!configured()) return send(res, 200, { enabled: false, files: [] });
        return send(res, 200, { enabled: true, files: await listFiles() });
      }

      if (route === "/trainer/files" && req.method === "POST") {
        if (!configured()) return send(res, 503, { message: "File uploads are not configured on this deployment yet." });
        const filename = safeName(hdr(req, "x-file-name"));
        const ext = (filename.split(".").pop() || "").toLowerCase();
        if (!ALLOWED[ext] || !filename.includes(".")) return send(res, 415, { message: `This file type is not accepted. Allowed: ${Object.keys(ALLOWED).join(", ")}.` });
        const title = hdr(req, "x-file-title").trim().slice(0, 160) || filename;
        const note = hdr(req, "x-file-note").trim().slice(0, 500);
        const cat = hdr(req, "x-file-category");
        const category = CATEGORIES.includes(cat) ? cat : "Other";
        let buf;
        try {
          buf = await readRaw(req, MAX_UPLOAD);
        } catch (e) {
          if (e.status === 413) return send(res, 413, { message: "The file is larger than 4 MB." });
          throw e;
        }
        if (!buf.length) return send(res, 400, { message: "The file is empty." });
        const id = await addFile({ title, note, category, filename, mime: ALLOWED[ext], b64: buf.toString("base64") });
        return send(res, 201, { id, title, filename, size: buf.length });
      }

      if (route === "/trainer/files/delete" && req.method === "POST") {
        if (!configured()) return send(res, 503, { message: "File uploads are not configured on this deployment yet." });
        const { id } = await readBody(req);
        if (!UUID.test(String(id || ""))) return send(res, 400, { message: "Unknown file." });
        const ok = await deleteFile(id);
        return ok ? send(res, 200, { ok: true }) : send(res, 404, { message: "This file no longer exists." });
      }

      if (route === "/trainer/download" && req.method === "POST") {
        const { id } = await readBody(req);
        const known = content.documents.find((d) => d.id === id);
        const upload = typeof id === "string" && id.startsWith("trainer-upload-") && UUID.test(id.slice(15));
        if (!known && !upload) return send(res, 404, { message: "Unknown document." });
        if (known && isLocked(known)) return send(res, 403, { message: lockText(known) });
        const t = sign({ kind: "download", id, exp: Date.now() + DOWNLOAD_MS });
        return send(res, 200, { url: `/api/trainer/file?t=${encodeURIComponent(t)}` });
      }

      if (route === "/trainer/password" && req.method === "POST") {
        return send(res, 409, {
          message:
            "On this hosting the trainer password is managed by the programme owner in the Vercel project settings (TRAINER_PASSWORD_HASH). Changing it there signs out every trainer session.",
        });
      }
      return send(res, 404, { message: "Not found." });
    }

    if (route === "/trainer/file" && req.method === "GET") {
      const data = verify(url.searchParams.get("t") || "", "download");
      if (!data) return send(res, 401, { message: "This download link has expired. Prepare a new download in the trainer workspace." });
      if (data.id.startsWith("trainer-upload-")) {
        if (!configured()) return send(res, 503, { message: "File uploads are not configured on this deployment yet." });
        const f = await getFile(data.id.slice(15));
        if (!f) return send(res, 404, { message: "This file no longer exists." });
        return sendFile(res, f.filename, f.mime, Buffer.from(f.content_b64, "base64"));
      }
      const pd = projectDocs.find((d) => d.id === data.id);
      if (pd) {
        if (isLocked(pd)) return send(res, 403, { message: lockText(pd) });
        return sendFile(res, pd.filename, pd.mime, Buffer.from(pd.b64, "base64"));
      }
      const doc = buildDocument(data.id, content);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${doc.filename}"`);
      res.setHeader("Cache-Control", "no-store");
      return res.end(doc.body);
    }

    return send(res, 404, { message: "Not found." });
  } catch (err) {
    console.error(err);
    return send(res, 500, { message: "The service could not complete this request." });
  }
}
