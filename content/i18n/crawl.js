const {chromium}=require('/tmp/qa/node_modules/playwright');
const fs=require('fs');
const B='http://localhost:8090/';
const texts=new Set(), attrs=new Set();
async function collect(p){
  for (const f of p.frames()){
  try{
  const r=await f.evaluate(()=>{const t=[],a=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
    while(n=w.nextNode()){const v=n.nodeValue;if(v&&v.trim()&&!n.parentElement.closest('script,style,textarea'))t.push(v.trim());}
    document.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach(e=>['placeholder','aria-label','title','alt'].forEach(k=>{const v=e.getAttribute(k);if(v&&v.trim())a.push(v.trim())}));
    a.push(document.title);return {t,a};});
  r.t.forEach(x=>texts.add(x));r.a.forEach(x=>attrs.add(x));}catch(e){}}
}
const BAD=/sign out|log out|abmelden|clear|reset|delete|remove|download|upload|print|export|copy|dark|theme|save all|mark as complete/i;
async function clickAll(p,url){
  await p.goto(B+url,{waitUntil:'networkidle'});await p.waitForTimeout(400);await collect(p);
  const n=await p.locator('main button, main [role=tab], main summary, [role=tablist] button').count();
  for(let i=0;i<Math.min(n,120);i++){
    const el=p.locator('main button, main [role=tab], main summary, [role=tablist] button').nth(i);
    let label='';try{label=(await el.innerText({timeout:500}))||'';}catch(e){continue}
    if(BAD.test(label))continue;
    try{await el.click({timeout:800});await p.waitForTimeout(150);await collect(p);}catch(e){}
    if(!p.url().endsWith(url)){await p.goto(B+url,{waitUntil:'networkidle'});await p.waitForTimeout(250);}
  }
}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:1000}});
p.on('dialog',d=>d.dismiss());
const routes=['#/','#/curriculum','#/curriculum/1','#/curriculum/2','#/curriculum/3','#/cases','#/toolkit','#/notebook','#/resources','#/downloads','#/trainer','#/trainer/downloads'];
for(let i=1;i<=24;i++)routes.push('#/block/B'+String(i).padStart(2,'0'));
for(const c of ['C01','C02','C03','C04','C05','C06','C07','C08','R01','R02'])routes.push('#/case/'+c);
routes.push('grid-lab/','pitch/');
for(const r of routes){await clickAll(p,r);}
// trainer login
await p.goto(B+'#/trainer',{waitUntil:'networkidle'});
const pw=p.locator('input[type=password]');
if(await pw.count()){await pw.fill(process.env.PW);await p.keyboard.press('Enter');await p.waitForTimeout(1500);}
for(const r of ['#/trainer','#/trainer/downloads']) await clickAll(p,r);
// trainer area per block guides: click links inside trainer page
const links=await p.$$eval('a[href*="#/trainer"]',as=>[...new Set(as.map(a=>a.getAttribute('href')))]);
for(const l of links.slice(0,80)) await clickAll(p,l.replace(/^\//,''));
// mobile
const m=await b.newPage({viewport:{width:390,height:844}});for(const r of ['#/','#/curriculum','#/block/B01','#/trainer']){await m.goto(B+r,{waitUntil:'networkidle'});await collect(m);const mb=m.locator('header button').first();try{await mb.click({timeout:800});await m.waitForTimeout(200);await collect(m);}catch(e){}}
fs.writeFileSync('/tmp/i18n/crawl.json',JSON.stringify({texts:[...texts],attrs:[...attrs],links}));
console.log(texts.size,attrs.size,links.length);await b.close();})();
