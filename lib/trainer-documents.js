// Builds the trainer-only Markdown downloads from the trainer content.
const header = (title, c) =>
  `# ${title}\n\nPower Academy | AI Learning Studio · KI-PA-A+ · Trainer only — do not share with participants.\n\n> ${c.status}\n\n`;

function handbook(c) {
  let md = header("Trainer guide KI-PA-A+ (B01–B24)", c);
  md += `## Delivery rhythm\n\n${c.rhythm}\n\n## KARDI-Lernblock 45 · six phases\n\n| Minutes | Phase | Trainer action |\n|---|---|---|\n`;
  md += c.runbook.map((r) => `| ${r.time} | ${r.title} | ${r.text} |`).join("\n") + "\n\n";
  md += `## Formative rubric\n\n${c.rubric}\n\n`;
  const tbl = (h, rows) =>
    `| ${h.join(" | ")} |\n|${h.map(() => "---").join("|")}|\n` +
    rows.map((r) => `| ${r.map((x) => String(x ?? "—").replace(/\n/g, " ").replace(/\|/g, "/")).join(" | ")} |`).join("\n") + "\n\n";
  for (const g of c.foundationGuides) {
    md += `## ${g.id} · ${g.title}\n\n### 1 · Header\n\n` + tbl(["Field", "Entry"], g.head);
    md += `### 2 · Objective and alignment\n\n${g.objective}\n\n` + tbl(["Objective", "Activity", "Evidence", "Assessment"], g.alignment);
    md += `### 3 · Sequence\n\n` + tbl(["#", "Phase", "Min.", "Grade", "ICAP"], g.phases);
    md += g.sjt && g.sjt.length
      ? `### 3.1 · Pre-SJT key (draft — agree with Bilal, cognitive pre-test)\n\n` + tbl(["Item", "Dimension", "Key", "Rationale"], g.sjt)
      : `### 3.1 · Recall\n\n` + tbl(["Question", "Block", "Correct answer", "Common wrong answer"], g.recall);
    md += `### 3.2 · Prompt\n\n${g.prompt.case}\n\n**Task:** ${g.prompt.task}\n\n` + g.prompt.variety.map((x) => `- ${x}`).join("\n") + "\n\n";
    md += `### 3.3 · Explain\n\n**Core idea:** ${g.explain.core}\n\n` + (g.explain.bridge ? `**Bridge:** ${g.explain.bridge}\n\n` : "");
    md += g.explain.steps ? tbl(["Step", "Worked solution", "Self-explanation"], g.explain.steps) : (g.explain.points || []).map((x) => `- ${x}`).join("\n") + "\n\n";
    md += `### 3.4 · Apply\n\n` + tbl(["Variant", "Task", "Support"], g.apply) + (g.minicases && g.minicases.length ? `**Mini case key**\n\n` + tbl(["#", "Type", "Mini case", "Key"], g.minicases) : "") + `**Work product:** ${g.product}\n\n`;
    md += `### 3.5 · Compare\n\n**Reference answer:** ${g.modelAnswer}\n\n` + tbl(["Misconception", "Recognise", "Correction"], g.misconceptions);
    md += `**Feedback stems:** ` + g.feedback.map((x) => `“${x}”`).join(" · ") + "\n\n";
    md += `### 3.6 · Secure\n\n**Exit question:** ${g.exit.q}\n\n**Key:** ${g.exit.key}\n\n**If-then:** ${g.ifthen}\n\n### 3.7 · Evaluation matrix\n\n${g.matrix}\n\n`;
    md += `### 4 · Material and containers\n\n` + tbl(["Container", "Use"], g.containers) + `${g.extras}\n\n`;
    md += `### 5 · Trainer notes\n\n` + tbl(["Aspect", "Note"], g.notes);
    md += `### 6 · Data protection and law\n\n` + g.privacy.map((x) => `- ${x}`).join("\n") + "\n\n";
    md += `### 7 · Definition of done\n\n` + g.dod.map(([x, v]) => `- [${v === true ? "x" : " "}] ${x}${v === null ? " (n/a)" : ""}`).join("\n") + "\n\n";
    md += `### 8 · Design-rationale log\n\n` + tbl(["Date", "Requirement", "Principle", "Decision", "Check", "Dry run"], g.log);
  }
  return md;
}

function answerKey(c) {
  let md = header("Answer key: case cards and role simulations", c);
  for (const a of c.answers) {
    md += `## ${a.id} · ${a.title}\n\n**Expected reasoning:** ${a.answer}\n\n**Facilitation:** ${a.facilitation}\n\n**Probing question:** ${a.probe}\n\n`;
  }
  return md;
}

function register(c) {
  let md = header("Project & delivery register", c);
  md += `## Roles\n\n` + c.roles.map((r) => `- **${r.name}:** ${r.role}`).join("\n") + "\n\n";
  md += `## Action register\n\n| ID | Action | Owner | Due | Status |\n|---|---|---|---|---|\n`;
  md += c.tasks.map((t) => `| ${t.id} | ${t.title} | ${t.owner} | ${t.due} | ${t.status} |`).join("\n") + "\n\n";
  md += `Status values are the server baseline; status changes made in the trainer workspace are stored in the trainer's browser.\n\n`;
  md += `## Open decisions\n\n` + c.decisions.map((d) => `- ${d}`).join("\n") + "\n\n";
  md += `## Deliverables\n\n| Deliverable | Scope | Status |\n|---|---|---|\n`;
  md += c.deliverables.map((d) => `| ${d.title} | ${d.detail} | ${d.status} |`).join("\n") + "\n\n";
  md += `## Kick-off agenda\n\n| Time | Topic |\n|---|---|\n` + c.agenda.map(([a, b]) => `| ${a} | ${b} |`).join("\n") + "\n\n";
  md += `## Visibility\n\n| Audience | Can see | Cannot see |\n|---|---|---|\n` + c.visibility.map((v) => `| ${v.join(" | ")} |`).join("\n") + "\n";
  return md;
}

const builders = {
  "trainer-handbook-m1m2": ["KI-PA-A-plus_Trainer-guide_B01-B24.md", handbook],
  "trainer-answer-key": ["KI-PA-A-plus_Answer-key_cases.md", answerKey],
  "trainer-delivery-register": ["KI-PA-A-plus_Delivery-register.md", register],
};

export function buildDocument(id, c) {
  const [filename, fn] = builders[id];
  return { filename, body: fn(c) };
}
