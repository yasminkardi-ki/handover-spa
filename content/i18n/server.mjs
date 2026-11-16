import http from "http"; import fs from "fs"; import path from "path";
const R = "/home/user/workspace/pa-studio"; const PUB = R + "/public";
const { default: handler } = await import(R + "/api/handler.js");
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".svg":"image/svg+xml", ".woff2":"font/woff2", ".png":"image/png", ".jpg":"image/jpeg", ".webp":"image/webp", ".mp4":"video/mp4", ".vtt":"text/vtt", ".pdf":"application/pdf" };
http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname.startsWith("/api/")) {
    let body = ""; for await (const c of req) body += c;
    req.body = body ? JSON.parse(body) : undefined;
    req.url = "/api/handler?__route=" + u.pathname.replace(/^\/api/, "");
    const r = { statusCode: 200, h: {}, status(c){this.statusCode=c;return this}, setHeader(k,v){res.setHeader(k,v)}, json(o){res.statusCode=this.statusCode;res.setHeader("content-type","application/json");res.end(JSON.stringify(o));return this}, send(b){res.statusCode=this.statusCode;res.end(b);return this}, end(b){res.statusCode=this.statusCode;res.end(b);return this} };
    try { await handler(req, r); } catch (e) { res.statusCode = 500; res.end(String(e)); }
    return;
  }
  let p = path.join(PUB, decodeURIComponent(u.pathname));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (!fs.existsSync(p)) p = PUB + "/index.html";
  res.setHeader("content-type", types[path.extname(p)] || "application/octet-stream");
  fs.createReadStream(p).pipe(res);
}).listen(8090, () => console.log("up"));
