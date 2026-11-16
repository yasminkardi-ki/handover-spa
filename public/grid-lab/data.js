// Grid Ops Lab — synthetic training data for case card G1 (B18/B19).
// Everything here is invented. No connection to any real grid, SCADA/EMS or supplier product.
// Based on the earlier "Grid Operations Dashboard" prototype, re-scoped to a fictional training zone.

export const SCENARIO = {
  zone: "Training Zone East (fictional)",
  date: "Tue 14 Oct · training scenario",
  now: "12:45",
  disclaimer:
    "All values are synthetic and simplified for training. No connection to SCADA, EMS, asset systems or any supplier product.",
};

export const KPIS = [
  { id: "freq", label: "Grid frequency", value: "49.98", unit: "Hz", note: "Target band 49.8–50.2 Hz" },
  { id: "load", label: "Load in zone", value: "8.4", unit: "GW", note: "Peak today 9.1 GW at 11:00" },
  { id: "res", label: "Renewable share of generation", value: "61", unit: "%", note: "Wind 38 % · solar 23 %" },
  { id: "redis", label: "Redispatch today", value: "3.2", unit: "GWh", note: "Simulated, cumulative since 00:00" },
];

// 24 hourly points: load and renewable generation in GW (synthetic)
export const TREND = {
  hours: Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0") + ":00"),
  load: [6.1, 5.8, 5.6, 5.5, 5.6, 6.0, 6.9, 7.8, 8.4, 8.8, 9.0, 9.1, 8.9, 8.7, 8.5, 8.4, 8.6, 8.9, 9.0, 8.7, 8.1, 7.4, 6.8, 6.3],
  renewables: [3.2, 3.4, 3.5, 3.3, 3.2, 3.4, 3.9, 4.6, 5.3, 5.9, 6.3, 6.5, 6.4, 6.2, 5.8, 5.2, 4.7, 4.2, 3.9, 3.7, 3.6, 3.5, 3.4, 3.3],
  until: 13, // data available up to index 12 (12:00), rest is forecast
};

// Asset sensor view as the control room sees it (source of truth for this exercise)
export const ASSETS = [
  {
    id: "TRF-N2", name: "Northfield T2", level: "380/110 kV", region: "North", age: 38,
    oilTemp: 87, oilLimit: 90, oilTrend: "+9 °C since 06:00",
    dga: "Ethylene 48 ppm · +60 % in 7 days", dgaFlag: "rising",
    tapOps: "6,900 / 15,000", moisture: "normal", sensor: "online", lastReading: "14 Oct 12:42",
  },
  {
    id: "TRF-C1", name: "Central Junction T1", level: "380/110 kV", region: "Central", age: 21,
    oilTemp: 64, oilLimit: 90, oilTrend: "stable",
    dga: "All gases within normal range", dgaFlag: "stable",
    tapOps: "12,400 / 15,000", moisture: "normal", sensor: "online", lastReading: "14 Oct 12:40",
    remark: "Tap-changer overhaul already scheduled in 5 months (routine).",
  },
  {
    id: "TRF-S1", name: "Southmoor T1", level: "220/110 kV", region: "South", age: 41,
    oilTemp: null, oilLimit: 90, oilTrend: "no data",
    dga: "Last known: acetylene trace 2 ppm (11 Oct)", dgaFlag: "unknown",
    tapOps: "unknown", moisture: "unknown", sensor: "gateway offline", lastReading: "11 Oct 09:15",
  },
  {
    id: "TRF-N4", name: "Northfield T4", level: "110/20 kV", region: "North", age: 29,
    oilTemp: 69, oilLimit: 90, oilTrend: "stable",
    dga: "Within normal range", dgaFlag: "stable",
    tapOps: "8,100 / 15,000", moisture: "slightly elevated", sensor: "online", lastReading: "14 Oct 12:41",
  },
  {
    id: "TRF-M3", name: "Metro West T3", level: "110/20 kV", region: "Metro", age: 12,
    oilTemp: 71, oilLimit: 90, oilTrend: "stable",
    dga: "Within normal range", dgaFlag: "stable",
    tapOps: "3,200 / 15,000", moisture: "normal", sensor: "online", lastReading: "14 Oct 12:43",
  },
  {
    id: "TRF-C2", name: "Central Junction T2", level: "380/110 kV", region: "Central", age: 17,
    oilTemp: 62, oilLimit: 90, oilTrend: "stable",
    dga: "Within normal range", dgaFlag: "stable",
    tapOps: "1,050 / 15,000", moisture: "normal", sensor: "online", lastReading: "14 Oct 12:40",
    remark: "Full service completed in August.",
  },
];

export const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export const ALERTS = [
  { id: "EV-2041", time: "12:42", severity: "High", asset: "TRF-N2", region: "North", text: "Oil temperature 87 °C — above warning threshold 85 °C", status: "Open" },
  { id: "EV-2038", time: "11:58", severity: "Medium", asset: "TRF-N2", region: "North", text: "DGA: ethylene rate of rise above trend limit", status: "Open" },
  { id: "EV-2033", time: "Since 11 Oct", severity: "Medium", asset: "TRF-S1", region: "South", text: "Sensor gateway offline — no condition data", status: "Acknowledged" },
  { id: "EV-2029", time: "10:15", severity: "Low", asset: "TRF-N4", region: "North", text: "Moisture in oil slightly elevated", status: "Open" },
  { id: "EV-2021", time: "08:30", severity: "Low", asset: "LINE-C7", region: "Central", text: "Planned switching completed", status: "Resolved" },
];

// The supplier tool's output — fictional product "VoltSight PM". Contains planted issues (trainer key in the trainer workspace).
export const TOOL = {
  product: "VoltSight PM (fictional supplier tool) · v2.3",
  mode: "Shadow mode — ranking is shown, not followed",
  snapshot: "Input data snapshot: 14 Oct 06:00",
  modelCard: [
    ["Purpose", "Predict transformer failure probability (90 days) and rank maintenance priority."],
    ["Training data", "2,100 transformers of a distribution operator (110/20 kV), temperate-maritime climate, 2016–2023."],
    ["Validation", "Supplier states AUC 0.93; validation report 'available on request'."],
    ["Data refresh", "Daily batch at 06:00."],
    ["Missing data", "Not documented."],
    ["Integration", "One-click export of the ranking into the outage-planning system."],
  ],
  ranking: [
    { rank: 1, asset: "TRF-C1", score: 0.91, confidence: "97 %", reason: "Tap-changer operations near limit (12,400 / 15,000)." },
    { rank: 2, asset: "TRF-N4", score: 0.74, confidence: "92 %", reason: "Moisture in oil above fleet median." },
    { rank: 3, asset: "TRF-N2", score: 0.69, confidence: "95 %", reason: "Oil temperature 78 °C within normal band; dissolved gases stable." },
    { rank: 4, asset: "TRF-M3", score: 0.22, confidence: "96 %", reason: "No anomalies." },
    { rank: 5, asset: "TRF-C2", score: 0.12, confidence: "98 %", reason: "Recently serviced." },
    { rank: 6, asset: "TRF-S1", score: 0.08, confidence: "97 %", reason: "Low risk — no anomalies detected." },
  ],
};

export const DECISION_FIELDS = [
  ["ai", "AI system?", "Inference from inputs to outputs? What makes it one — or not?"],
  ["role", "Our role", "Provider, deployer, other? Why?"],
  ["route", "Triage route", "Prohibited · high-risk check · transparency · data/confidentiality · internal approvals. Safety component in electricity supply? Who must decide that?"],
  ["class", "Tool class and matrix", "Which class? Which criteria are 'unknown'? ('Unknown' never counts as acceptable.)"],
  ["gate", "Mandatory gate", "Data protection/confidentiality, security/permissions, applicable law."],
  ["oversight", "Oversight and RACI", "Who decides on the outage plan? Who may trigger the export? What is logged?"],
  ["decision", "Decision with conditions", "Proceed · pilot under conditions · pause · stop — with owner, duration and conditions."],
  ["stop", "Stop criterion", "Which observable event ends or pauses the pilot?"],
  ["open", "Open questions for specialists", "What we could not decide — and who must."],
];

export const VARIANTS = {
  A: "A · Beginners — work through the decision fields in order; use the prompts under each field.",
  B: "B · Leadership — add who decides at which point and the escalation route when tool and planner disagree.",
  C: "C · Engineering/IT — specify technical controls: data-freshness check, missing-data handling, validation on own fleet, permissions for the export, logging.",
};
