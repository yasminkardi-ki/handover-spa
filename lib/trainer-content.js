import { projectDocs } from "./project-docs.js";
import { foundationGuides } from "./foundation-guides.js";

// Trainer-only content. Bundled into the server function, never shipped to the browser bundle.
// Rebuilt 20 October 2026 from the participant materials and project records; working draft pending review.


const answers = [
  {
    id: "C01",
    title: "Plausible is not verified",
    answer:
      "18/20 = 90% describes one lab test with synthetic data, not daily-operation reliability. Unsupported: prevents all critical incidents; ready for autonomous deployment; sensor defects as cause; no further human review needed. Corrected summary keeps context, denominator and unknown causes. Check: technical owner reviews against the test record. Not authorised: production or autonomous use.",
    facilitation: "Let pairs audit before revealing anything. Collect the sentence that would most affect a real decision first.",
    probe: "Which population, environment and outcome does the 90% actually describe? What evidence would support a production claim?",
  },
  {
    id: "C02",
    title: "Maintenance notes, external assistant",
    answer:
      "Pause. Missing: content classification (personal, confidential, export-controlled data), tool approval and contract terms, recipients, purpose. Clarifiers: information security, data protection, content owner, IT. Alternative: synthetic notes in an approved environment.",
    facilitation: "Push back on 'the data are only technical'. Ask who would notice if the notes contained names or customer details.",
    probe: "What would have to be true for 'proceed' to be a responsible answer?",
  },
  {
    id: "C03",
    title: "A persuasive supplier recommendation",
    answer:
      "Comparable evidence is missing because the assistants were tested on different tasks and no failure rate is stated. Define a common test set, success and failure criteria and acceptance thresholds. Request: error rates, test conditions, data handling, security documentation, support model. Recommendation: conditional — run a common bounded test before preferring any option.",
    facilitation: "Do not let groups name a winner. Ask them to rewrite the supplier claim as a testable statement.",
    probe: "Which marketing claim would change your decision if it turned out to be false?",
  },
  {
    id: "C04",
    title: "Generated code, real consequences",
    answer:
      "Minimum permissions: read the synthetic input folder, write only to a separate test output folder. Sandbox without network or production access. Expected results and failure cases defined in advance (empty file, malformed rows). Reviewer: a qualified developer; change control applies before wider use. Stop condition: any write attempt outside the test folder or unexpected output.",
    facilitation: "Ask engineering participants to lead; ask managers to name the change-control owner.",
    probe: "How would you know the script did something you did not ask for?",
  },
  {
    id: "C05",
    title: "The wrong version of the manual",
    answer:
      "Authoritative source: manual version 3 supplied by the course owner. Compare the answer with the relevant V3 passage and record differences and their effect. Correction request: update the retrieval collection, remove or mark V2, retest the same questions and record the date and version checked.",
    facilitation: "Highlight that the assistant may be faithful to the wrong source — faithfulness and currency are different checks.",
    probe: "Who owns the collection, and how would they learn that a new version exists?",
  },
  {
    id: "C06",
    title: "An agent with too much permission",
    answer:
      "Keep draft-only capability; remove sending messages and changing records. Add an approval gate before any action, a stop control and a recovery procedure (log, undo, notify). Owner of the next controlled test: the process owner with IT security.",
    facilitation: "Ask groups to list every permission and justify each one against the task.",
    probe: "What is the worst thing this configuration could do on a bad day, and how would you undo it?",
  },
  {
    id: "C07",
    title: "An AI-assisted HR recommendation",
    answer:
      "Clarify the intended decisions and their consequences for staff. Questions: personal-data lawfulness, transparency, fairness and bias, works council involvement, possible high-risk route for employment-related uses. Specialists: data protection, HR/legal, works council, governance. Offer a non-personal learning-planning exercise instead. The output is a review brief, not a classification or ranking.",
    facilitation: "Stop any attempt to rank fictional employees. Keep the discussion on process and specialist review.",
    probe: "Which people would be affected by an error, and how would they find out?",
  },
  {
    id: "C08",
    title: "Another trainer takes over",
    answer:
      "Priority handover items: answer key, timing per block, source versions and dates, fallback without AI access, case materials, access instructions. Minimum package: agenda, trainer guides B01–B24, case keys, source list. Revalidate legal references and dates. Checklist: version, reviewer, release date, next review.",
    facilitation: "Use this case to show why this trainer workspace exists.",
    probe: "What would the new trainer most likely get wrong in the first 45 minutes?",
  },
  {
    id: "R01",
    title: "Procurement meets engineering",
    answer:
      "A good outcome is a conditional pilot recommendation: bounded task, matrix with unknowns kept visible, mandatory gates (data, security) resolved first, named owner, review date and stop conditions. No purchase decision.",
    facilitation: "Give each role card privately. The decision chair must record dissent.",
    probe: "Which unknown would you resolve first, and why?",
  },
  {
    id: "R02",
    title: "A learning rollout for different roles",
    answer:
      "Role-specific learning needs, activities and workplace support; participation records distinguished from evidence of learning (e.g. a decision record); owners for updates and follow-up at 30/60/90 days. No assessment or ranking of individuals.",
    facilitation: "Ask the governance representative to connect each learning measure to a responsibility.",
    probe: "How would you know in 60 days that the rollout changed decisions at work?",
  },
];

const runbook = [
  { time: "00–04", title: "1 · Recall [A]", text: "2–3 retrieval questions from earlier blocks with confidence rating. No scoring; correct briefly." },
  { time: "04–10", title: "2 · Prompt (productive failure) [B]", text: "Short case, first individual attempt before any input. Collect the variety of solutions, do not correct yet." },
  { time: "10–20", title: "3 · Explain [B]", text: "Max. 10 minutes input: core idea, bridge to the group's attempts, worked example for procedures. Variant C: shorten." },
  { time: "20–35", title: "4 · Apply [B]", text: "Task variants A Beginners / B Leadership / C Engineering/IT; same objective, different support. Circulate and ask, do not answer." },
  { time: "35–41", title: "5 · Compare [A]", text: "Show the reference answer; participants compare against criteria. Name misconceptions with counter-examples. Feedback on task, process and self-regulation." },
  { time: "41–45", title: "6 · Secure [A]", text: "Exit question (individual, diagnostic) and an if-then implementation sentence for the participant's own workplace." },
];

const rubric =
  "Decision-dossier rubric (E4, draft), 5 criteria × 4 levels: (1) evidence identification, (2) treatment of uncertainty and unknowns, (3) safe decision boundary and escalation, (4) clarity and traceability of the output, (5) weighting justified from the context, alternatives checked. Levels: 1 missing or wrong · 2 partly present · 3 sound · 4 justified from the context. Used formatively in all blocks (criteria 1–4) and for the dossier in B22 (all five). Anchor examples and ≥ 80 % agreement between Yasmin Kardi and Bilal Arikan are outstanding; no pass mark or certification decision has been agreed.";

const rhythm =
  "Every block follows KARDI-Lernblock 45: six phases (recall, prompt, explain, apply, compare, secure), at most 10 minutes of input and at least 30 minutes of active practice. Days run 09:00–17:00: eight blocks until 16:30 with breaks after blocks 2, 4 and 6, then 30 minutes of reflection and recap. Onsite and online deliveries follow the same three-day live programme.";

const status =
  "Working draft. B01–B08 follow the evidence-based block template and, since 22 October 2026, the topics of the Lernarchitektur KI-PA-A+ (entry diagnosis with Pre-SJT, how LLMs work, hallucination and automation bias, RAG and agents, AI Act after the Digital Omnibus, risk triage, Article 4 and human oversight, whole task 1). The course material \"AI Literacy für die Energiewelt\" is integrated as practitioner guidance. Since 22 October 2026, B09–B24 (M3, M4 and Day 3) are also worked out in the same template along the Lernarchitektur: ISO/IEC 42001 and recall, RACI with Article 4 measures, LLM vs agents, eight-criterion matrix, five tool classes, own use case with risk identification, peer calibration, decision memo, case cards (grid, service, engineering, management), two role simulations, decision dossier, transfer and Post-SJT. The eight criteria, five tool classes and the rubric remain discussion proposals. Subject-matter review (Bilal Arikan), legal review (G3, 28 Oct) and dry run (G4, 29 Oct) are outstanding. Live status 25 October 2026: all 24 blocks are published on the participant site; the trainer library holds 14 protected documents plus the shared trainer file store (upload, download and delete tested live on 23 October). New on 25 October: AI literacy baseline survey integrated into B10, B23 and B24 without changing agenda or timing — participant toolkit and analysis template (synthetic data only) under Resources, German trainer document in the library. The rubric anchor key stays locked until 27 October 2026, 00:00 (Berlin). Outstanding: decision on the eight criteria and five tool classes plus blind anchor rating (Bilal Arikan, 26 Oct), subject-matter and legal review (G3, 28 Oct), Pre/Post-SJT pilot, slides, co-determination check, dry run (G4, 29 Oct) and handover (G5, 31 Oct). This is not a released Siemens Power Academy course.";

const roles = [
  { name: "Programme design · Yasmin Kardi", role: "Framework, delivery agenda, didactic design, EU AI Act, ISO/IEC 42001 and governance content; trainer materials." },
  { name: "Subject-matter lead · Bilal Arikan", role: "Engineering depth, T&D grid and operations context, content reviews and day-to-day coordination at Power Academy." },
  { name: "Milestone sponsor · Power Academy", role: "Receives milestone summaries; final acceptance and operational requirements." },
  { name: "Specialist reviewers", role: "Legal content review of M2 before release; information security and data protection for exercise environments." },
];

const tasks = [
  { "id": "A-01", "title": "Clarify Teams guest access with Siemens IT · Evidence: 05 Oct, Bilal added Yasmin to the Siemens Teams team \"KI PA Training Programme\".", "owner": "Bilal Arikan", "due": "06 Oct 2026", "status": "Completed" },
  { "id": "A-02", "title": "Set up interim folder for file exchange · No shared folder found; Bilal's 13 Oct invite still mentions setting up share folders.", "owner": "Yasmin Kardi", "due": "06 Oct 2026", "status": "Not verified" },
  { "id": "A-03", "title": "Send complete framework to Bilal · Framework exists; handover to Bilal not evidenced.", "owner": "Yasmin Kardi", "due": "07 Oct 2026", "status": "Not verified" },
  { "id": "A-04", "title": "Submit delivery agenda per module and block · Agenda exists (Agenda-Check v2); handover not evidenced.", "owner": "Yasmin Kardi", "due": "08 Oct 2026", "status": "Not verified" },
  { "id": "A-05", "title": "Provide academic and didactic benchmarks · Handover not evidenced.", "owner": "Yasmin Kardi", "due": "09 Oct 2026", "status": "Not verified" },
  { "id": "A-06", "title": "Submit M1/M2 foundation blocks for review · B01–B08 are live in the trainer area; formal submission not evidenced.", "owner": "Yasmin Kardi", "due": "12 Oct 2026", "status": "Not verified" },
  { "id": "A-07", "title": "Send invitation for the next weekly · Evidence: weekly follow-ups set up by Bilal (Tuesdays 13, 20, 27 Oct, 3 Nov).", "owner": "Yasmin Kardi", "due": "07 Oct 2026", "status": "Completed" },
  { id: "R-01", title: "Decide on eight criteria and five tool classes; blind rating of anchor dossiers X, Y, Z", owner: "Bilal Arikan", due: "26 Oct 2026", status: "Open" },
  { id: "BA-01", title: "Confirm baseline survey integration in B10, B23 and B24", owner: "Bilal Arikan", due: "28 Oct 2026 (with G3)", status: "Open" },
  { id: "BA-02", title: "Pilot the baseline questionnaire with 3–5 people in different roles (clarity, duration)", owner: "Yasmin Kardi", due: "before first delivery", status: "Open" },
  { id: "BA-03", title: "Data protection and co-determination check before any real survey use", owner: "Siemens (reviewing body to be named)", due: "before real use", status: "Open" },
  { id: "BA-04", title: "German participant version of the baseline survey after English validation", owner: "Yasmin Kardi", due: "after BA-02", status: "Planned" },
  { id: "GL-01", title: "Subject review of the Grid Ops Lab for card G1 (synthetic transformer values, thresholds, four planted findings) and dry-run test on a group device", owner: "Bilal Arikan", due: "28 Oct 2026 (with G3)", status: "Open" },
  { id: "S-01", title: "Pre-test the SJT items (Pre/Post-SJT)", owner: "Yasmin Kardi / Bilal Arikan", due: "before G4", status: "Open" },
  { id: "S-02", title: "Produce slides for all 24 blocks (M1–M4, Day 3)", owner: "Yasmin Kardi", due: "before G4", status: "Done 04 Nov 2026 · 223 slides in trainer library" },
  { id: "G3", title: "Subject-matter and legal review of content", owner: "Bilal Arikan / legal", due: "28 Oct 2026", status: "Not verified" },
  { id: "G4", title: "Dry run of the programme", owner: "Yasmin Kardi / Bilal Arikan", due: "29 Oct 2026", status: "Not verified" },
  { id: "G5", title: "Handover and acceptance", owner: "Power Academy", due: "31 Oct 2026", status: "Not verified" },
];

const decisions = [
  "Language scope: English base first; German participant materials and course descriptions to follow — to be confirmed with Bilal.",
  "Named review owners per module and the final approver at Power Academy.",
  "Acceptance criteria for trainer handbook, slides, case cards and course descriptions.",
  "Hosting, data protection and access management for this website before use with participants.",
  "Owner for the daily five-minute recap podcast and milestone reports.",
  "Train-the-trainer sessions, live pilot and delivery days are not automatically part of the design package.",
];

const deliverables = [
  { title: "Course concept", detail: "Three-day learning design, agenda, module structure and learning objectives.", status: "Draft" },
  { title: "Trainer materials", detail: "Trainer handbook (approx. 30–40 pages): facilitation, timing, expected outcomes, fallbacks.", status: "B01–B24 drafted · live in trainer area" },
  { title: "Presentation materials", detail: "Five decks with German speaker notes: Module 1 (38), Module 2 (38), Module 3 (37), Module 4 (37), Day 3 (73 slides).", status: "Delivered · trainer library" },
  { title: "Selection materials", detail: "Eight-criterion matrix and five tool classes.", status: "Draft" },
  { title: "Practice materials", detail: "Eight case cards and two role simulations.", status: "Draft" },
  { title: "Transfer materials", detail: "Reflection sheet, functional transfer guides, 30/60/90 follow-up package (recall questions, voluntary artefact, 4-item short SJT); baseline survey repeat after 4–8 weeks (B24).", status: "Draft (B23/B24) · follow-up package 04 Nov" },
  { title: "Delivery adaptations", detail: "Classroom and online instructions, digital case cards and breakouts.", status: "In progress" },
  { title: "Needs baseline (AI literacy survey)", detail: "Questionnaire A–D, confidentiality rules (min. group 5), analysis template with dashboard and measures plan; used in B10, B23, B24.", status: "Draft · live under Resources" },
  { title: "Governance inlays (B09, B10, B22–B24)", detail: "Bilingual EN/DE: lifecycle, change assessment, register entry and evidence pack, scenario catalogue, 30/60/90 for owners. Inside existing phases, no extra time.", status: "Draft · Fachreview Bilal by 13.11." },
  { title: "Course descriptions", detail: "In the official Power Academy template; placeholder draft in the trainer library until the template arrives.", status: "Draft · template pending (13.11.)" },
];

const agenda = [
  ["09:00–09:20", "Welcome, context and decisions for the day"],
  ["09:20–10:05", "Objectives and target audience"],
  ["10:05–10:45", "Scope and course architecture"],
  ["10:45–11:00", "Break"],
  ["11:00–12:00", "Content inventory and material walkthrough"],
  ["12:00–12:30", "Content transfer and learning evidence"],
  ["12:30–13:30", "Lunch"],
  ["13:30–14:15", "Deliverables and acceptance"],
  ["14:15–15:00", "Technical context and responsibilities"],
  ["15:00–15:15", "Break"],
  ["15:15–16:00", "Timeline and milestones"],
  ["16:00–16:35", "Collaboration setup"],
  ["16:35–17:00", "Decision review and next steps"],
];

const coreDocuments = [
  { id: "trainer-handbook-m1m2", category: "Course delivery", title: "Trainer guide KI-PA-A+ (B01–B24)", note: "All 24 block plans with timing, worked examples, discussion keys and adaptations. Markdown." },
  { id: "trainer-answer-key", category: "Course delivery", title: "Answer key: case cards and role simulations", note: "Expected reasoning, facilitation and probing questions for C01–C08, R01 and R02. Markdown." },
  { id: "trainer-delivery-register", category: "Course delivery", title: "Project & delivery register", note: "Roles, action register, decisions, deliverables and workshop agenda. Markdown." },
];

// Project documents (docs/, generated into lib/project-docs.js) follow the course-delivery downloads.
const documents = [
  ...coreDocuments,
  ...projectDocs.map(({ b64, ...meta }) => meta),
];

const visibility = [
  ["Participants", "Learning path, block content, case tasks, toolkit, personal workbook, resources", "Worked answers, facilitation notes, project register, prices, correspondence"],
  ["Trainers (signed in)", "Everything above plus trainer guides, answer keys, rubric, delivery register, project documents and trainer uploads", "Other people's workbook entries, prices, private contact details"],
  ["Not on this website", "—", "Prices, private correspondence, personal contact details, confidential Siemens data"],
];

export const content = {
  foundationGuides,
  rhythm,
  answers,
  runbook,
  rubric,
  status,
  roles,
  tasks,
  decisions,
  deliverables,
  agenda,
  documents,
  visibility,
};
