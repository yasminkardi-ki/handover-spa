import { SCENARIO, KPIS, TREND, ASSETS, ALERTS, SEVERITY_ORDER, TOOL, DECISION_FIELDS, VARIANTS } from "./data.js";

const KEY = "gridlab-g1-v1";
const $ = (s, r = document) => r.querySelector(s);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const blank = () => ({ alerts: {}, rank: null, checks: {}, findings: "", variant: "A", firstDec: "", firstConf: "", fields: {} });
let state;
try { state = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { state = blank(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable: keep in memory */ } };

const assetName = (id) => { const a = ASSETS.find((x) => x.id === id); return a ? `${a.id} · ${a.name}` : id; };

/* Step 1 — control room */
$("#disclaimer").textContent = SCENARIO.disclaimer;
$("#zone").textContent = SCENARIO.zone;
$("#scenario-meta").textContent = `${SCENARIO.date} · situation at ${SCENARIO.now}`;

function alertStatus(a) { return state.alerts[a.id] || a.status; }
function renderKpis() {
  const open = ALERTS.filter((a) => alertStatus(a) !== "Resolved").length;
  const items = [...KPIS, { id: "alerts", label: "Unresolved alerts", value: String(open), unit: "", note: "Open or acknowledged" }];
  $("#kpis").innerHTML = items.map((k) => `<div class="kpi"><p class="k-label">${esc(k.label)}</p><p class="k-val">${esc(k.value)}<small>${esc(k.unit)}</small></p><p class="k-note">${esc(k.note)}</p></div>`).join("");
}

function renderTrend() {
  const W = 720, H = 220, P = { l: 36, r: 12, t: 12, b: 26 };
  const max = 10, n = TREND.hours.length;
  const x = (i) => P.l + (i * (W - P.l - P.r)) / (n - 1);
  const y = (v) => H - P.b - (v / max) * (H - P.t - P.b);
  const path = (arr, from, to) => arr.slice(from, to).map((v, i) => `${i ? "L" : "M"}${x(i + from).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const u = TREND.until;
  let grid = "";
  for (let v = 0; v <= max; v += 2) grid += `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" class="g"/><text x="${P.l - 6}" y="${y(v) + 4}" class="ax" text-anchor="end">${v}</text>`;
  for (let i = 0; i < n; i += 3) grid += `<text x="${x(i)}" y="${H - 8}" class="ax" text-anchor="middle">${TREND.hours[i]}</text>`;
  $("#trend").innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Load peaks at 9.1 GW around 11:00; renewables peak at 6.5 GW around 11:00. Values after 12:00 are forecast.">
    ${grid}
    <line x1="${x(u - 1)}" x2="${x(u - 1)}" y1="${P.t}" y2="${H - P.b}" class="now"/>
    <path d="${path(TREND.load, 0, u)}" class="l1"/><path d="${path(TREND.load, u - 1, n)}" class="l1 f"/>
    <path d="${path(TREND.renewables, 0, u)}" class="l2"/><path d="${path(TREND.renewables, u - 1, n)}" class="l2 f"/>
  </svg>
  <p class="legend"><span class="sw s1"></span>Load <span class="sw s2"></span>Renewable generation</p>`;
}

function renderAlerts() {
  const f = $("#sev-filter").value;
  const rows = ALERTS.filter((a) => !f || a.severity === f)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  $("#alerts tbody").innerHTML = rows.map((a) => {
    const st = alertStatus(a);
    const btn = st === "Open" ? `<button class="mini" data-ack="${a.id}">Acknowledge</button>`
      : st === "Acknowledged" ? `<button class="mini" data-res="${a.id}">Resolve</button>` : "";
    return `<tr><td class="mono">${esc(a.time)}</td><td><span class="sev ${a.severity.toLowerCase()}">${esc(a.severity)}</span></td><td class="mono">${esc(a.asset)}</td><td>${esc(a.text)}</td><td>${esc(st)}</td><td>${btn}</td></tr>`;
  }).join("") || `<tr><td colspan="6">No alerts for this filter.</td></tr>`;
  $("#alert-count").textContent = `${ALERTS.filter((a) => alertStatus(a) !== "Resolved").length} unresolved`;
}
$("#alerts").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.ack) state.alerts[b.dataset.ack] = "Acknowledged";
  if (b.dataset.res) state.alerts[b.dataset.res] = "Resolved";
  save(); renderAlerts(); renderKpis();
});
$("#sev-filter").addEventListener("change", renderAlerts);

function renderAssets() {
  $("#assets tbody").innerHTML = ASSETS.map((a) => {
    const t = a.oilTemp == null ? `<span class="unk">no data</span>` : `<b class="${a.oilTemp >= 85 ? "warn" : ""}">${a.oilTemp} °C</b><small>${esc(a.oilTrend)}</small>`;
    const s = a.sensor === "online" ? esc(a.sensor) : `<span class="unk">${esc(a.sensor)}</span>`;
    return `<tr><th scope="row"><span class="mono">${esc(a.id)}</span><small>${esc(a.name)} · ${esc(a.region)}</small>${a.remark ? `<small class="rem">${esc(a.remark)}</small>` : ""}</th>
      <td>${esc(a.level)}<small>${a.age} years</small></td><td>${t}</td>
      <td class="${a.dgaFlag === "rising" ? "warn" : a.dgaFlag === "unknown" ? "unk" : ""}">${esc(a.dga)}</td>
      <td class="mono">${esc(a.tapOps)}</td><td>${esc(a.moisture)}</td><td>${s}<small class="mono">${esc(a.lastReading)}</small></td></tr>`;
  }).join("");
}

/* Step 2 — rank first */
const form = $("#my-rank");
["r1", "r2", "r3"].forEach((n) => {
  form.elements[n].innerHTML = `<option value="">–</option>` + ASSETS.map((a) => `<option value="${a.id}">${esc(assetName(a.id))}</option>`).join("");
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const r = [form.elements.r1.value, form.elements.r2.value, form.elements.r3.value];
  if (new Set(r).size < 3 || r.includes("")) { $("#rank-msg").textContent = "Choose three different transformers."; return; }
  if (!form.elements.conf.value) { $("#rank-msg").textContent = "Add your confidence."; return; }
  state.rank = { order: r, conf: form.elements.conf.value, why: form.elements.why.value.trim() };
  save(); applyLock(); $("#rank-msg").textContent = "Ranking locked. Step 3 is open.";
  $("#s4").scrollIntoView({ behavior: "smooth", block: "start" });
});
function applyLock() {
  const locked = !state.rank;
  $("#s4").classList.toggle("locked", locked);
  $("#s4 .tool-body").toggleAttribute("inert", locked);
  [...form.elements].forEach((el) => { el.disabled = !locked && el.type !== "button"; });
  $("#lock").textContent = locked ? "Lock my ranking and unlock the tool" : "Ranking locked";
  if (state.rank) {
    ["r1", "r2", "r3"].forEach((n, i) => { form.elements[n].value = state.rank.order[i]; });
    form.elements.conf.value = state.rank.conf; form.elements.why.value = state.rank.why;
  }
}

/* Step 3 — tool */
$("#tool-title").textContent = TOOL.product;
$("#tool-meta").textContent = `${TOOL.mode} · ${TOOL.snapshot}`;
$("#model-card").innerHTML = TOOL.modelCard.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
function renderTool() {
  $("#tool-rank tbody").innerHTML = TOOL.ranking.map((r) => {
    const c = state.checks[r.asset] || {};
    const opt = (v) => `<option${c.v === v ? " selected" : ""}>${v}</option>`;
    return `<tr><td class="mono">${r.rank}</td><td><span class="mono">${esc(r.asset)}</span></td><td class="mono">${r.score.toFixed(2)} · ${esc(r.confidence)}</td><td>${esc(r.reason)}</td>
      <td class="check"><select data-c="${r.asset}" aria-label="Your check for ${r.asset}"><option value="">–</option>${opt("Agree")}${opt("Disagree")}${opt("Cannot judge")}</select>
      <input data-w="${r.asset}" value="${esc(c.w || "")}" placeholder="because …" aria-label="Reason for ${r.asset}" maxlength="240"></td></tr>`;
  }).join("");
}
$("#tool-rank").addEventListener("change", (e) => {
  const a = e.target.dataset.c; if (!a) return;
  state.checks[a] = { ...(state.checks[a] || {}), v: e.target.value }; save();
});
$("#tool-rank").addEventListener("input", (e) => {
  const a = e.target.dataset.w; if (!a) return;
  state.checks[a] = { ...(state.checks[a] || {}), w: e.target.value }; save();
});
$("#findings").value = state.findings;
$("#findings").addEventListener("input", (e) => { state.findings = e.target.value; save(); });

const modal = $("#modal");
let lastFocus = null;
$("#apply").addEventListener("click", () => { lastFocus = document.activeElement; modal.hidden = false; $("#modal-close").focus(); });
const closeModal = () => { modal.hidden = true; lastFocus?.focus(); };
$("#modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

/* Step 4 — decision record */
function renderVariant() {
  document.querySelectorAll(".seg button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.v === state.variant)));
  $("#variant-hint").textContent = VARIANTS[state.variant];
}
document.querySelector(".seg").addEventListener("click", (e) => {
  const v = e.target.dataset?.v; if (!v) return; state.variant = v; save(); renderVariant();
});
$("#fields").innerHTML = DECISION_FIELDS.map(([k, label, hint]) => `<label class="field"><span>${esc(label)}</span><small>${esc(hint)}</small><textarea data-f="${k}" rows="2"></textarea></label>`).join("");
document.querySelectorAll("[data-f]").forEach((t) => { t.value = state.fields[t.dataset.f] || ""; });
$("#fields").addEventListener("input", (e) => { const k = e.target.dataset.f; if (!k) return; state.fields[k] = e.target.value; save(); });
$("#first-dec").value = state.firstDec; $("#first-conf").value = state.firstConf;
$("#first-dec").addEventListener("change", (e) => { state.firstDec = e.target.value; save(); });
$("#first-conf").addEventListener("change", (e) => { state.firstConf = e.target.value; save(); });

export function toMarkdown(s = state) {
  const L = [];
  L.push("# Grid Ops Lab · Case card G1 · decision record", "", `Variant: ${VARIANTS[s.variant] || s.variant}`, "Synthetic training exercise — no real data.", "");
  L.push("## Phase 2 · First decision", `- Decision: ${s.firstDec || "–"} (confidence ${s.firstConf || "–"})`);
  if (s.rank) L.push(`- My ranking: ${s.rank.order.map((id, i) => `${i + 1}. ${assetName(id)}`).join(" · ")} (confidence ${s.rank.conf})`, `- Why priority 1: ${s.rank.why || "–"}`);
  L.push("", "## Tool ranking check");
  TOOL.ranking.forEach((r) => { const c = s.checks[r.asset] || {}; L.push(`- #${r.rank} ${r.asset}: ${c.v || "not checked"}${c.w ? " — " + c.w : ""}`); });
  L.push("", "## Other findings", s.findings || "–", "", "## Decision record");
  DECISION_FIELDS.forEach(([k, label]) => L.push(`### ${label}`, (s.fields[k] || "–").trim(), ""));
  return L.join("\n");
}
$("#download").addEventListener("click", () => {
  const blob = new Blob([toMarkdown()], { type: "text/markdown;charset=utf-8" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "G1_decision-record_grid-ops-lab.md" });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  $("#export-msg").textContent = "Downloaded.";
});
$("#copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(toMarkdown()); $("#export-msg").textContent = "Copied."; }
  catch { $("#export-msg").textContent = "Copy not available — use the download."; }
});
$("#print").addEventListener("click", () => window.print());
$("#reset").addEventListener("click", () => {
  if (!confirm("Delete all entries in this browser and start fresh (e.g. for the B19 rotation)?")) return;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  location.reload();
});

renderKpis(); renderTrend(); renderAlerts(); renderAssets(); renderTool(); renderVariant(); applyLock();
window.__gridlab = { toMarkdown, state: () => state };
