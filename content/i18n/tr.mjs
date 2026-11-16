import fs from "fs"; import {spawn} from "child_process";
const src=JSON.parse(fs.readFileSync(process.argv[2]||"src.json"));
const outF=process.argv[3]||"de_raw.json";
const done=fs.existsSync(outF)?JSON.parse(fs.readFileSync(outF)):{};
const todo=src.filter(s=>!(s in done));
const INS0=`Translate each English UI/course string in "en" into German for a professional AI-literacy and AI-governance training website (Siemens Power Academy, engineers and managers). Return array "de" with EXACTLY the same number of items in the same order, one translation per input item. Rules: formal "Sie" address (imperatives as "Lesen Sie ..." or infinitive style for buttons/labels, e.g. "Save" -> "Speichern"); concise, natural German; keep unchanged: block/case codes (B01, C05, R01, M1), numbers, symbols, punctuation style, \${} placeholders, markdown, line breaks, URLs, product names (Power Academy, AI Learning Studio, KI-PA-A+, Grid Ops Lab, Siemens, KARDI), article/legal references (Art. 4, Annex III -> Anhang III). If an item is already German, return it unchanged. Glossary: provider=Anbieter, deployer=Betreiber, high-risk=Hochrisiko, prohibited practices=verbotene Praktiken, AI system=KI-System, AI=KI, AI Act=AI Act, AI literacy=KI-Kompetenz, human oversight=menschliche Aufsicht, gate=Gate, score=Punktwert, Pre-SJT/Post-SJT unchanged, SJT unchanged, RACI unchanged, if-then sentence=Wenn-dann-Satz, exit question=Exit-Frage, confidence=Konfidenz, recall=Abruf, worked example=Lösungsbeispiel, learning contract=Lernvertrag, workbook=Arbeitsheft, worksheet=Arbeitsblatt, learning path=Lernpfad, trainer=Trainer, facilitator=Moderation, rubric=Rubrik, case=Fall, decision record=Entscheidungsprotokoll, owner=Verantwortliche/r (accountable owner), stop criterion=Stoppkriterium, use case=Anwendungsfall, automation bias=Automation Bias, hallucination=Halluzination, prompt=Prompt, token=Token, RAG=RAG, agent=Agent, tool classes=Toolklassen, Day 1=Tag 1, Module=Modul, block=Block, phase=Phase.`;
const INS=INS0+(process.env.EXTRA?" "+process.env.EXTRA:"");
const batches=[];let cur=[],len=0;
for(const s of todo){if(len+s.length>3500&&cur.length){batches.push(cur);cur=[];len=0}cur.push(s);len+=s.length;if(cur.length>=(+process.env.BS||45)){batches.push(cur);cur=[];len=0}}
if(cur.length)batches.push(cur);
console.log("batches",batches.length);
const schema='{"type":"object","properties":{"de":{"type":"array","items":{"type":"string"}}},"required":["de"]}';
function run(b){return new Promise(res=>{const p=spawn("pplx",["llm","extract","--instruction",INS,"--output-schema",schema]);let o="",e="";p.stdout.on("data",d=>o+=d);p.stderr.on("data",d=>e+=d);p.on("close",()=>{try{const j=JSON.parse(o);const de=j.results[0].result.de;if(de.length!==b.length)return res({ok:false,why:"len "+de.length+"/"+b.length});res({ok:true,de})}catch(x){res({ok:false,why:(e||o).slice(0,200)})}});p.stdin.write(JSON.stringify({en:b})+"\n");p.stdin.end();});}
let i=0,fail=0;
async function worker(){while(i<batches.length){const b=batches[i++];let r=await run(b);if(!r.ok)r=await run(b);if(r.ok){b.forEach((s,j)=>done[s]=r.de[j]);}else{fail++;console.log("fail",r.why)}fs.writeFileSync(outF,JSON.stringify(done));}}
await Promise.all(Array.from({length:10},worker));
console.log("done",Object.keys(done).length,"fail",fail);
