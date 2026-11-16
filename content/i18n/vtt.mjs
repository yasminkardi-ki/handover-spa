import fs from "fs"; import {execFileSync} from "child_process";
const dir="/home/user/workspace/pa-studio/public/media/";
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith(".vtt")&&!f.endsWith(".de.vtt"))){
  const blocks=fs.readFileSync(dir+f,"utf8").split(/\n\n/);
  const cues=[];blocks.forEach((b,i)=>{const L=b.split("\n");const t=L.findIndex(x=>x.includes("-->"));if(t>=0)cues.push([i,t,L.slice(t+1).join("\n")]);});
  const ins="Translate these consecutive subtitle cues of a course tutorial video into natural spoken German (formal Sie). Return array de with exactly the same number of items, one per cue, same order; keep each cue roughly as long as the original. Keep KI-PA-A plus, Power Academy, AI Learning Studio unchanged. Glossary: AI=KI, AI literacy=KI-Kompetenz, workbook=Arbeitsheft, learning path=Lernpfad, trainer=Trainer, case=Fall, block=Block, confidence=Konfidenz, if-then sentence=Wenn-dann-Satz.";
  const out=execFileSync("pplx",["llm","extract","--instruction",ins,"--output-schema",'{"type":"object","properties":{"de":{"type":"array","items":{"type":"string"}}},"required":["de"]}'],{input:JSON.stringify({en:cues.map(c=>c[2])})+"\n"}).toString();
  const de=JSON.parse(out).results[0].result.de; if(de.length!==cues.length) throw new Error(f+" len "+de.length+"/"+cues.length);
  cues.forEach((c,k)=>{const L=blocks[c[0]].split("\n");blocks[c[0]]=L.slice(0,c[1]+1).join("\n")+"\n"+de[k];});
  fs.writeFileSync(dir+f.replace(/\.vtt$/,".de.vtt"),blocks.join("\n\n"));console.log(f,de.length);
}
