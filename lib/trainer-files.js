// Trainer uploads: stored in a locked Supabase table, reachable only through
// SECURITY DEFINER functions that check a server-side secret (PA_FILES_SECRET).
// Participants never reach these routes; every call requires a signed trainer session.
export const MAX_UPLOAD = 4 * 1024 * 1024; // Vercel request limit is 4.5 MB
export const ALLOWED = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  md: "text/markdown; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};
export const CATEGORIES = ["Course delivery", "Programme design", "Review and quality", "Kick-off", "Slides and media", "Other"];

export function configured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.PA_FILES_SECRET);
}

async function rpc(fn, args) {
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_secret: process.env.PA_FILES_SECRET, ...args }),
  });
  if (!r.ok) throw new Error(`Storage error ${r.status}`);
  return r.json();
}

export const listFiles = () => rpc("pa_trainer_files_list", {});
export const addFile = (f) =>
  rpc("pa_trainer_files_add", { p_title: f.title, p_note: f.note, p_category: f.category, p_filename: f.filename, p_mime: f.mime, p_content_b64: f.b64 });
export async function getFile(id) {
  const rows = await rpc("pa_trainer_files_get", { p_id: id });
  return rows[0] || null;
}
export const deleteFile = (id) => rpc("pa_trainer_files_delete", { p_id: id });

export function safeName(name) {
  const n = String(name || "").normalize("NFC").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").replace(/\s+/g, " ").trim();
  return n.slice(-200) || "file";
}
