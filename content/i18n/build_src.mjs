import fs from "fs";
const c=JSON.parse(fs.readFileSync("crawl.json"));
const k=JSON.parse(fs.readFileSync("keep0.json")).map(x=>typeof x=="string"?x:(x.s||x[0]));
const set=new Set();
const hasWord=s=>/[A-Za-z]{2,}/.test(s);
const junk=s=>/data-\[|React|QueryClient|Slottable|sideCar|\bpx\b|^[a-z0-9\-\/:\[\]\.\s=_%()&>]+$|[{};]\s*$|^\s*[\]\)]/.test(s)||/(^|\s)(flex|grid|inset|border|bg-|text-|rounded|items-|justify|w-|h-|p[xytb]?-|m[xytb]?-)/.test(s)&&!/[.!?]$/.test(s.trim());
const skipExact=s=>/^(B|C|R|M)\d{2}([–-](B)?\d{2})?$/.test(s)||/^[\d\s.,:%/–\-+·×#()]+$/.test(s)||/^KI-PA-A\+?$/.test(s);
for(const s0 of [...c.texts,...c.attrs]){const s=s0.trim();if(!s||!hasWord(s)||skipExact(s))continue;set.add(s);}
let ex=0;
for(const s0 of k){const s=s0.trim();if(!s||set.has(s)||!hasWord(s)||skipExact(s))continue;
  if(junk(s))continue; if(!/\s/.test(s)&&!/^[A-Z][a-z]+$/.test(s))continue; if(s.includes("\n")&&/^[#>\-|]/m.test(s)&&s.length>200)continue;
  set.add(s);ex++;}
const arr=[...set].sort((a,b)=>a.length-b.length);
fs.writeFileSync("src.json",JSON.stringify(arr));
console.log(arr.length,ex,arr.reduce((a,x)=>a+x.length,0));
