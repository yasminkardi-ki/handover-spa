// Local learner API for Power Academy | SPA AI Governance KARDI.
// Learner workspaces stay private in this browser (localStorage); nothing is sent to a server.
// Trainer requests pass through to the protected server API.
(function () {
  var LABELS = {"B01-field-0": "B01 · Phase 1 · My Pre-SJT answers and confidence", "B01-field-1": "B01 · Phase 2 · My self-assessment", "B01-field-2": "B01 · Phase 4 · Task and indispensable expertise", "B01-field-3": "B01 · Phase 4 · My learning contract", "B01-field-4": "B01 · Phase 6 · Exit answer and confidence", "B01-field-5": "B01 · Phase 6 · My if-then sentence", "B01-check": "B01 · Phase 5 · Comparison and next step", "B02-field-0": "B02 · Phase 1 · My recall answers and confidence", "B02-field-1": "B02 · Phase 2 · My next words and my guess for the model", "B02-field-2": "B02 · Phase 4 · My explanation sketch", "B02-field-3": "B02 · Phase 4 · What follows for my work", "B02-field-4": "B02 · Phase 6 · Exit answer and confidence", "B02-field-5": "B02 · Phase 6 · My if-then sentence", "B02-check": "B02 · Phase 5 · Comparison and next step", "B03-field-0": "B03 · Phase 1 · My recall answers and confidence", "B03-field-1": "B03 · Phase 2 · My confidence bet", "B03-field-2": "B03 · Phase 4 · Claim audit", "B03-field-3": "B03 · Phase 4 · Corrected summary", "B03-field-4": "B03 · Phase 4 · My calibration value and one new check", "B03-field-5": "B03 · Phase 6 · Exit answer and confidence", "B03-field-6": "B03 · Phase 6 · My if-then sentence", "B03-check": "B03 · Phase 5 · Comparison and next step", "B04-field-0": "B04 · Phase 1 · My recall answers and confidence", "B04-field-1": "B04 · Phase 2 · My checks", "B04-field-2": "B04 · Phase 4 · Check protocol", "B04-field-3": "B04 · Phase 4 · Agent permissions and approval", "B04-field-4": "B04 · Phase 4 · My structured prompt", "B04-field-5": "B04 · Phase 6 · Exit answer and confidence", "B04-field-6": "B04 · Phase 6 · My if-then sentence", "B04-check": "B04 · Phase 5 · Comparison and next step", "B05-field-0": "B05 · Phase 1 · My recall answers and confidence", "B05-field-1": "B05 · Phase 2 · My first sorting", "B05-field-2": "B05 · Phase 4 · Role assignment with deciding facts", "B05-field-3": "B05 · Phase 4 · Two maps for my department", "B05-field-4": "B05 · Phase 6 · Exit answer and confidence", "B05-field-5": "B05 · Phase 6 · My if-then sentence", "B05-check": "B05 · Phase 5 · Comparison and next step", "B06-field-0": "B06 · Phase 1 · My recall answers and confidence", "B06-field-1": "B06 · Phase 2 · My questions", "B06-field-2": "B06 · Phase 4 · Gap cases 3–5", "B06-field-3": "B06 · Phase 4 · Free cases 6–8", "B06-field-4": "B06 · Phase 4 · Missing facts and escalation", "B06-field-5": "B06 · Phase 6 · Exit answer and confidence", "B06-field-6": "B06 · Phase 6 · My if-then sentence", "B06-check": "B06 · Phase 5 · Comparison and next step", "B07-field-0": "B07 · Phase 1 · My recall answers and confidence", "B07-field-1": "B07 · Phase 2 · My decision", "B07-field-2": "B07 · Phase 4 · Literacy measures per role", "B07-field-3": "B07 · Phase 4 · Oversight points", "B07-field-4": "B07 · Phase 4 · Change message", "B07-field-5": "B07 · Phase 6 · Exit answer and confidence", "B07-field-6": "B07 · Phase 6 · My if-then sentence", "B07-check": "B07 · Phase 5 · Comparison and next step", "B08-field-0": "B08 · Phase 1 · My recall answers and confidence", "B08-field-1": "B08 · Phase 2 · My first decision", "B08-field-2": "B08 · Phase 4 · Group decision table", "B08-field-3": "B08 · Phase 4 · Revision after the changed assumption", "B08-field-4": "B08 · Phase 6 · Exit answer and confidence", "B08-field-5": "B08 · Phase 6 · My if-then sentence", "B08-check": "B08 · Phase 5 · Comparison and next step", "B09-field-0": "B09 · Phase 1 · My recall answers and confidence", "B09-field-1": "B09 · Phase 2 · What must exist", "B09-field-2": "B09 · Phase 4 · My assignment of cards 3–7", "B09-field-3": "B09 · Phase 4 · Gap in my area", "B09-field-4": "B09 · Phase 6 · Exit answer and confidence", "B09-field-5": "B09 · Phase 6 · My if-then sentence", "B09-check": "B09 · Phase 5 · Comparison and next step", "B10-field-0": "B10 · Phase 1 · My recall answers and confidence", "B10-field-1": "B10 · Phase 2 · My first sketch", "B10-field-2": "B10 · Phase 4 · My RACI", "B10-field-3": "B10 · Phase 4 · Measure and record per role", "B10-field-4": "B10 · Phase 6 · Exit answer and confidence", "B10-field-5": "B10 · Phase 6 · My if-then sentence", "B10-check": "B10 · Phase 5 · Comparison and next step", "B11-field-0": "B11 · Phase 1 · My recall answers and confidence", "B11-field-1": "B11 · Phase 2 · My first choice", "B11-field-2": "B11 · Phase 4 · Decision tree result", "B11-field-3": "B11 · Phase 4 · Permissions and approval", "B11-field-4": "B11 · Phase 6 · Exit answer and confidence", "B11-field-5": "B11 · Phase 6 · My if-then sentence", "B11-check": "B11 · Phase 5 · Comparison and next step", "B12-field-0": "B12 · Phase 1 · My recall answers and confidence", "B12-field-1": "B12 · Phase 2 · Why the teams disagree", "B12-field-2": "B12 · Phase 4 · My annotations or weighting", "B12-field-3": "B12 · Phase 4 · Gate decision", "B12-field-4": "B12 · Phase 6 · Exit answer and confidence", "B12-field-5": "B12 · Phase 6 · My if-then sentence", "B12-check": "B12 · Phase 5 · Comparison and next step", "B13-field-0": "B13 · Phase 1 · My recall answers and confidence", "B13-field-1": "B13 · Phase 2 · Evidence for a fair comparison", "B13-field-2": "B13 · Phase 4 · My completed matrices", "B13-field-3": "B13 · Phase 4 · Recommendation and missing evidence", "B13-field-4": "B13 · Phase 6 · Exit answer and confidence", "B13-field-5": "B13 · Phase 6 · My if-then sentence", "B13-check": "B13 · Phase 5 · Comparison and next step", "B14-field-0": "B14 · Phase 1 · My recall answers and confidence", "B14-field-1": "B14 · Phase 2 · My task in two sentences", "B14-field-2": "B14 · Phase 4 · Use-case canvas", "B14-field-3": "B14 · Phase 4 · Risk identification and triage", "B14-field-4": "B14 · Phase 4 · Matrix and gate", "B14-field-5": "B14 · Phase 6 · Exit answer and confidence", "B14-field-6": "B14 · Phase 6 · My if-then sentence", "B14-check": "B14 · Phase 5 · Comparison and next step", "B15-field-0": "B15 · Phase 1 · My recall answers and confidence", "B15-field-1": "B15 · Phase 2 · My counter-evaluation", "B15-field-2": "B15 · Phase 4 · Differences and causes", "B15-field-3": "B15 · Phase 4 · My calibration note", "B15-field-4": "B15 · Phase 6 · Exit answer and confidence", "B15-field-5": "B15 · Phase 6 · My if-then sentence", "B15-check": "B15 · Phase 5 · Comparison and next step", "B16-field-0": "B16 · Phase 1 · My recall answers and confidence", "B16-field-1": "B16 · Phase 2 · My decision in one sentence", "B16-field-2": "B16 · Phase 4 · My decision memo", "B16-field-3": "B16 · Phase 4 · Revision after the challenge", "B16-field-4": "B16 · Phase 6 · Exit answer and confidence", "B16-field-5": "B16 · Phase 6 · My if-then sentence", "B16-check": "B16 · Phase 5 · Comparison and next step", "B17-field-0": "B17 · Phase 1 · My recall answers and confidence", "B17-field-1": "B17 · Phase 2 · My calibration value", "B17-field-2": "B17 · Phase 4 · My rubric ratings", "B17-field-3": "B17 · Phase 6 · Exit answer and confidence", "B17-field-4": "B17 · Phase 6 · My if-then sentence", "B17-check": "B17 · Phase 5 · Comparison and next step", "B18-field-0": "B18 · Phase 1 · My recall answers and confidence", "B18-field-1": "B18 · Phase 2 · My first decision", "B18-field-2": "B18 · Phase 4 · Group decision record", "B18-field-3": "B18 · Phase 4 · Open questions for specialists", "B18-field-4": "B18 · Phase 6 · Exit answer and confidence", "B18-field-5": "B18 · Phase 6 · My if-then sentence", "B18-check": "B18 · Phase 5 · Comparison and next step", "B19-field-0": "B19 · Phase 1 · My recall answers and confidence", "B19-field-1": "B19 · Phase 2 · My first decision on the new card", "B19-field-2": "B19 · Phase 4 · Group decision and comparison", "B19-field-3": "B19 · Phase 4 · Two patterns", "B19-field-4": "B19 · Phase 6 · Exit answer and confidence", "B19-field-5": "B19 · Phase 6 · My if-then sentence", "B19-check": "B19 · Phase 5 · Comparison and next step", "B20-field-0": "B20 · Phase 1 · My recall answers and confidence", "B20-field-1": "B20 · Phase 2 · My role position", "B20-field-2": "B20 · Phase 4 · Group recommendation", "B20-field-3": "B20 · Phase 4 · Escalation note", "B20-field-4": "B20 · Phase 6 · Exit answer and confidence", "B20-field-5": "B20 · Phase 6 · My if-then sentence", "B20-check": "B20 · Phase 5 · Comparison and next step", "B21-field-0": "B21 · Phase 1 · My recall answers and confidence", "B21-field-1": "B21 · Phase 2 · My checkpoints", "B21-field-2": "B21 · Phase 4 · Oversight design", "B21-field-3": "B21 · Phase 4 · Change message", "B21-field-4": "B21 · Phase 6 · Exit answer and confidence", "B21-field-5": "B21 · Phase 6 · My if-then sentence", "B21-check": "B21 · Phase 5 · Comparison and next step", "B22-field-0": "B22 · Phase 1 · My recall answers and confidence", "B22-field-1": "B22 · Phase 2 · My first decisions", "B22-field-2": "B22 · Phase 4 · Dossier sections 1–5", "B22-field-3": "B22 · Phase 4 · Dossier sections 6–9", "B22-field-4": "B22 · Phase 4 · Peer rubric levels and revision", "B22-field-5": "B22 · Phase 6 · Exit answer and confidence", "B22-field-6": "B22 · Phase 6 · My if-then sentence", "B22-check": "B22 · Phase 5 · Comparison and next step", "B23-field-0": "B23 · Phase 1 · My recall answers and confidence", "B23-field-1": "B23 · Phase 2 · My Monday answer", "B23-field-2": "B23 · Phase 4 · My pilot plan", "B23-field-3": "B23 · Phase 4 · Three if-then plans", "B23-field-4": "B23 · Phase 4 · Manager conversation", "B23-field-5": "B23 · Phase 6 · Exit answer and confidence", "B23-field-6": "B23 · Phase 6 · My if-then sentence", "B23-check": "B23 · Phase 5 · Comparison and next step", "B24-field-0": "B24 · Phase 1 · My Pre-SJT answers and confidence", "B24-field-1": "B24 · Phase 2 · Learning contract revisited", "B24-field-2": "B24 · Phase 4 · My reflection", "B24-field-3": "B24 · Phase 4 · My 30/60/90 plan", "B24-field-4": "B24 · Phase 6 · Exit answer and confidence", "B24-field-5": "B24 · Phase 6 · My if-then sentence", "B24-check": "B24 · Phase 5 · Comparison and next step", "C01": "C01 · Plausible is not verified", "C02": "C02 · Maintenance notes, external assistant", "C03": "C03 · A persuasive supplier recommendation", "C04": "C04 · Generated code, real consequences", "C05": "C05 · The wrong version of the manual", "C06": "C06 · An agent with too much permission", "C07": "C07 · An AI-assisted HR recommendation", "C08": "C08 · Another trainer takes over", "R01": "R01 · Procurement meets engineering", "R02": "R02 · A learning rollout for different roles", "B01": "B01 · Entry diagnosis and learning contract", "B02": "B02 · How language models work", "B03": "B03 · Hallucination, bias and automation bias", "B04": "B04 · RAG, agents and tools", "B05": "B05 · AI Act architecture after the Digital Omnibus", "B06": "B06 · Applying risk classes", "B07": "B07 · Article 4 (new version) and human oversight", "B08": "B08 · Whole task 1: Is it AI — and who are we?", "B09": "B09 · Day 1 recall and the ISO/IEC 42001 management system", "B10": "B10 · Governance building blocks: roles, RACI and Article 4 measures", "B11": "B11 · LLM assistant or agentic AI?", "B12": "B12 · The eight-criterion evaluation matrix", "B13": "B13 · Five tool classes", "B14": "B14 · Evaluate your own use case: benefit, risk and fit", "B15": "B15 · Peer review and calibration", "B16": "B16 · Whole task 2: the tool decision memo", "B17": "B17 · Recall Day 1 and 2 · case-card briefing", "B18": "B18 · Case cards round 1: grid, service, engineering, management", "B19": "B19 · Case cards round 2 and debrief", "B20": "B20 · Role simulation 1: procuring an AI tool", "B21": "B21 · Role simulation 2: designing oversight in an engineering or HR process", "B22": "B22 · Whole task 3: the decision dossier", "B23": "B23 · Transfer: pilot plan, guide and if-then plans", "B24": "B24 · Post-SJT, reflection and 30/60/90 follow-up"};
  var WS_KEY = "pa-studio.workspace.v1";
  var TASK_KEY = "pa-studio.trainer-tasks.v1";
  var MAX = 400000;
  var realFetch = window.fetch.bind(window);
  var EMPTY = { completed: [], notes: {}, matrix: {} };

  function json(status, data) {
    return Promise.resolve(new Response(JSON.stringify(data), { status: status, headers: { "Content-Type": "application/json" } }));
  }
  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function valid(ws) {
    return ws && typeof ws === "object" && Array.isArray(ws.completed) && ws.notes && typeof ws.notes === "object" && ws.matrix && typeof ws.matrix === "object";
  }
  function workbook(ws) {
    var md = "# My KI-PA-A+ workbook\n\nPower Academy | SPA AI Governance KARDI · exported " + new Date().toLocaleString("en-GB") + "\n\n";
    md += "Completed blocks: " + (ws.completed.length ? ws.completed.join(", ") : "none yet") + "\n\n";
    var keys = Object.keys(ws.notes).filter(function (k) { return String(ws.notes[k] || "").trim(); }).sort();
    md += "## Notes and responses\n\n";
    if (!keys.length) md += "No notes saved yet.\n\n";
    keys.forEach(function (k) { md += "### " + (LABELS[k] || k) + "\n\n" + ws.notes[k] + "\n\n"; });
    var mk = Object.keys(ws.matrix || {});
    if (mk.length) {
      md += "## Selection matrix\n\n| Entry | Value |\n|---|---|\n";
      mk.forEach(function (k) { var v = ws.matrix[k]; md += "| " + k + " | " + String(typeof v === "object" ? JSON.stringify(v) : v).replace(/\|/g, "/").replace(/\n/g, " ") + " |\n"; });
    }
    return md;
  }

  function esc(v) { return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function workbookHtml(ws) {
    var F = location.origin + "/fonts/";
    var css = "@font-face{font-family:Plex;src:url(" + F + "ibm-plex-sans-latin-400-normal.woff2)}@font-face{font-family:Plex;font-weight:500;src:url(" + F + "ibm-plex-sans-latin-500-normal.woff2)}@font-face{font-family:Plex;font-weight:600;src:url(" + F + "ibm-plex-sans-latin-600-normal.woff2)}@font-face{font-family:PlexMono;src:url(" + F + "ibm-plex-mono-latin-400-normal.woff2)}" +
      "@page{size:A4;margin:16mm}*{box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;background:#F3F5F8;font:16px/1.55 Plex,Arial,sans-serif;color:#11132E}" +
      ".page{max-width:820px;margin:0 auto;padding:32px 24px 64px}.cover{background:#11132E;color:#fff;border-radius:6px;padding:36px 32px}.brand{display:flex;gap:10px;align-items:center;font-weight:600}.brand small{display:block;font:400 11px PlexMono,monospace;letter-spacing:.14em;text-transform:uppercase;color:#B5BBD0}" +
      ".k{font:400 12px PlexMono,monospace;letter-spacing:.14em;text-transform:uppercase;color:#5FC3C7;margin:32px 0 6px}h1{font-weight:500;font-size:40px;line-height:1.1;margin:0}.meta{color:#DCE0EC;margin-top:14px}" +
      ".bar{display:flex;justify-content:flex-end;margin:16px 0}button{font:500 15px Plex,sans-serif;background:#007D82;color:#fff;border:0;border-radius:4px;padding:10px 16px;cursor:pointer}button:hover{background:#00666A}" +
      "h2{font-weight:500;font-size:22px;margin:28px 0 10px;padding-top:10px;border-top:2px solid #11132E}.card{background:#fff;border:1px solid #D9DEE5;border-top:3px solid #007D82;border-radius:4px;padding:14px 18px;margin:12px 0;break-inside:avoid}" +
      ".card h3{font-size:15px;font-weight:600;margin:0 0 6px}.card p{margin:0;white-space:pre-wrap}.empty{color:#50566C}table{width:100%;border-collapse:collapse;background:#fff;font-size:14px}th{background:#11132E;color:#fff;text-align:left;font-weight:500;padding:8px 10px}td{padding:8px 10px;border-bottom:1px solid #D9DEE5;vertical-align:top}" +
      ".foot{margin-top:32px;font:400 11px PlexMono,monospace;letter-spacing:.12em;text-transform:uppercase;color:#50566C}@media print{body{background:#fff}.page{padding:0}.bar{display:none}}";
    var logo = '<svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#5FC3C7" stroke-width="2.5" aria-hidden="true"><rect x="3" y="3" width="26" height="26"/><path d="M3 14h11V3"/></svg>';
    var done = ws.completed.length ? ws.completed.map(esc).join(", ") : "none yet";
    var h = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My KI-PA-A+ workbook</title><style>' + css + '</style></head><body><main class="page">';
    h += '<section class="cover"><div class="brand">' + logo + '<div>Power Academy<small>SPA AI Governance KARDI</small></div></div><p class="k">KI-PA-A+ · My workbook</p><h1>My saved workbook</h1><p class="meta">Exported ' + esc(new Date().toLocaleString("en-GB")) + ' · Completed blocks: ' + done + '</p></section>';
    h += '<div class="bar"><button onclick="window.print()">Print or save as PDF</button></div>';
    var keys = Object.keys(ws.notes).filter(function (k) { return String(ws.notes[k] || "").trim(); }).sort();
    h += '<h2>Notes and responses</h2>';
    if (!keys.length) h += '<p class="empty">No notes saved yet.</p>';
    keys.forEach(function (k) { h += '<div class="card"><h3>' + esc(LABELS[k] || k) + '</h3><p>' + esc(ws.notes[k]) + '</p></div>'; });
    var mk = Object.keys(ws.matrix || {});
    if (mk.length) {
      h += '<h2>Selection matrix</h2><table><thead><tr><th>Entry</th><th>Value</th></tr></thead><tbody>';
      mk.forEach(function (k) { var v = ws.matrix[k]; h += '<tr><td>' + esc(k) + '</td><td>' + esc(typeof v === "object" ? JSON.stringify(v) : v) + '</td></tr>'; });
      h += '</tbody></table>';
    }
    return h + '<p class="foot">Power Academy / KI-PA-A+ · Stored only in this browser · synthetic course data only</p></main></body></html>';
  }

  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : input && input.url;
    var path;
    try { path = new URL(url, location.href).pathname; } catch (e) { return realFetch(input, init); }
    var method = ((init && init.method) || "GET").toUpperCase();
    var body = {};
    try { body = init && init.body ? JSON.parse(init.body) : {}; } catch (e) {}

    if (path === "/api/learner/session") return json(200, { token: "browser-local" });
    if (path === "/api/workspace" && method === "GET") {
      var ws = read(WS_KEY, EMPTY);
      return json(200, valid(ws) ? ws : EMPTY);
    }
    if (path === "/api/workspace" && method === "PUT") {
      if (!valid(body)) return json(400, { message: "The workspace could not be saved." });
      var raw = JSON.stringify({ completed: body.completed, notes: body.notes, matrix: body.matrix });
      if (raw.length > MAX) return json(413, { message: "Your workspace is too large to save. Please shorten some notes." });
      try { localStorage.setItem(WS_KEY, raw); } catch (e) { return json(507, { message: "This browser does not allow local saving. Please allow site storage." }); }
      return json(200, { ok: true });
    }
    if (path === "/api/download" && method === "POST") {
      if (body.id === "participant-workbook") return json(200, { url: "/downloads/KI-PA-A-plus_Participant-workbook.pdf" });
      if (body.id === "baseline-survey") return json(200, { url: "/downloads/KI-PA-A-plus_AI-literacy-baseline-survey-toolkit.md" });
      if (body.id === "baseline-analysis") return json(200, { url: "/downloads/KI-PA-A-plus_AI-literacy-baseline_analysis-template.xlsx" });
      if (body.id === "my-workbook") {
        var w = read(WS_KEY, EMPTY);
        var blob = new Blob([workbookHtml(valid(w) ? w : EMPTY)], { type: "text/html;charset=utf-8" });
        return json(200, { url: URL.createObjectURL(blob) });
      }
      return json(404, { message: "Unknown download." });
    }
    if (path === "/api/trainer/task" && method === "PATCH") {
      var auth = init && init.headers && (init.headers.Authorization || init.headers.authorization);
      if (!auth) return json(401, { message: "Your trainer session has expired. Please sign in again." });
      var t = read(TASK_KEY, {});
      if (typeof body.id === "string" && typeof body.status === "string") t[body.id] = body.status.slice(0, 40);
      try { localStorage.setItem(TASK_KEY, JSON.stringify(t)); } catch (e) {}
      return json(200, { ok: true });
    }
    if (path === "/api/trainer/content" && method === "GET") {
      return realFetch(input, init).then(function (res) {
        if (!res.ok) return res;
        return res.json().then(function (c) {
          var t = read(TASK_KEY, {});
          (c.tasks || []).forEach(function (x) { if (t[x.id]) x.status = t[x.id]; });
          return new Response(JSON.stringify(c), { status: 200, headers: { "Content-Type": "application/json" } });
        });
      });
    }
    return realFetch(input, init);
  };
})();
