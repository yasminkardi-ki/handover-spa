"""Builds German editions of all English downloads.
Usage:
  python3 content/i18n/build_downloads_de.py collect   # writes office_src.json (untranslated strings)
  node content/i18n/tr.mjs content/i18n/office_src.json content/i18n/office_de_raw.json   (EXTRA env, see README)
  python3 content/i18n/build_downloads_de.py apply     # writes *_DE files + PDFs
"""
import json, os, re, shutil, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import office_de as O
from pptx import Presentation
from pptx.util import Emu

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS, DL, TMP = f"{ROOT}/docs", f"{ROOT}/public/downloads", "/tmp/de_build"
os.makedirs(TMP, exist_ok=True)

WORKSHEETS = [("Modul-1", "Module-1"), ("Modul-2", "Module-2"), ("Modul-3", "Module-3"), ("Modul-4", "Module-4"), ("Tag-3", "Day-3")]
PRINTKITS = ["Modul-1_Druckkit-Trainer", "Modul-2_Druckkit-Trainer", "Tag-2_Druckkit-Trainer", "Tag-3_Druckkit-Trainer", "Tag-3_Rollensimulationen-B20-B21_Druckkit"]
DECKS = [("Modul-1", "Slides_Module-1_Understand"), ("Modul-2", "Slides_Module-2_Govern"), ("Modul-3", "Slides_Module-3_Select"),
         ("Modul-4", "Slides_Module-4_Apply"), ("Tag-3", "Slides_Day-3_Practice")]

def participant_deck(src, name):
    """Same rules as content/build_participant_handouts.py (EN participant edition)."""
    p = Presentation(f"{DOCS}/KI-PA-A-plus_{src}_Folien.pptx")
    def text(s): return " | ".join(sh.text_frame.text for sh in s.shapes if sh.has_text_frame)
    lst = p.slides._sldIdLst
    for sid, s in zip(list(lst), list(p.slides)):
        t = text(s)
        if re.search(r"PHASE 5\s*·\s*COMPARE", t) or re.search(r"\bSJT key\b", t, re.I):
            p.part.drop_rel(sid.rId); lst.remove(sid)
    for n, s in enumerate(p.slides, 1):
        if s.has_notes_slide: s.notes_slide.notes_text_frame.text = ""
        for sh in s.shapes:
            if not sh.has_text_frame or abs(Emu(sh.top).inches - 5.25) > 0.02: continue
            tf = sh.text_frame; t = tf.text.strip(); r = tf.paragraphs[0].runs
            if not r: continue
            if t.isdigit(): r[0].text = str(n); [setattr(x, "text", "") for x in r[1:]]
            elif t.startswith("KI-PA-A+") and "Participant edition" not in t: r[-1].text = r[-1].text + "  ·  Participant edition"
    f = f"{TMP}/KI-PA-A-plus_{name}_participant.pptx"; p.save(f); return f

def jobs():
    J = []  # (kind, src, out)
    for src, dst in WORKSHEETS:
        J.append(("w", f"{DOCS}/KI-PA-A-plus_{src}_Arbeitsblaetter.docx", f"{DOCS}/KI-PA-A-plus_{src}_Arbeitsblaetter_DE.docx"))
    for k in PRINTKITS:
        J.append(("w", f"{DOCS}/KI-PA-A-plus_{k}.docx", f"{DOCS}/KI-PA-A-plus_{k}_DE.docx"))
    for src, name in DECKS:
        J.append(("a", f"{DOCS}/KI-PA-A-plus_{src}_Folien.pptx", f"{DOCS}/KI-PA-A-plus_{src}_Folien_DE.pptx"))
        J.append(("a", participant_deck(src, name), f"{TMP}/KI-PA-A-plus_{name}_participant_DE.pptx"))
    J.append(("md", f"{DOCS}/Follow-up-30-60-90_KI-PA-A-plus.md", f"{DOCS}/Follow-up-30-60-90_KI-PA-A-plus_DE.md"))
    J.append(("md", f"{DL}/KI-PA-A-plus_AI-literacy-baseline-survey-toolkit.md", f"{DL}/KI-PA-A-plus_AI-literacy-baseline-survey-toolkit_DE.md"))
    J.append(("x", f"{DL}/KI-PA-A-plus_AI-literacy-baseline_analysis-template.xlsx", f"{DL}/KI-PA-A-plus_AI-literacy-baseline_analysis-template_DE.xlsx"))
    J.append(("html", "/tmp/pa-workbook/workbook.html", f"{TMP}/workbook_de.html"))
    return J

def run(mode):
    cache = O.load_cache() if mode == "apply" else None
    keys = set()
    for kind, src, out in jobs():
        o = out if mode == "apply" else None
        if kind in ("w", "a"): O.walk_ooxml(src, kind, cache=cache, out=o, keys=keys)
        if kind == "a" and o: print("  fitted shapes", O.fit_pptx(o))
        elif kind == "x": O.walk_xlsx(src, cache=cache, out=o, keys=keys)
        elif kind == "md": O.walk_md(src, cache=cache, out=o, keys=keys)
        elif kind == "html":
            h = O.walk_html(open(src, encoding="utf-8").read(), cache=cache, keys=keys)
            if o: open(o, "w", encoding="utf-8").write(h.replace('<html lang="en">', '<html lang="de">'))
        if o: print("wrote", os.path.basename(o))
    if mode == "collect":
        have = O.load_cache()
        todo = sorted(k for k in keys if k not in have)
        json.dump(todo, open(f"{O.HERE}/office_src.json", "w"), ensure_ascii=False)
        print("keys", len(keys), "todo", len(todo), "chars", sum(map(len, todo)))
    else:
        miss = [k for k in keys if k not in cache]
        print("missing translations", len(miss))
        pdfs()

def soffice(f, outdir):
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", outdir, f], check=True, capture_output=True)
    return f"{outdir}/{os.path.basename(f).rsplit('.', 1)[0]}.pdf"

def pdfs():
    for src, dst in WORKSHEETS:
        d = f"{DOCS}/KI-PA-A-plus_{src}_Arbeitsblaetter_DE.docx"
        shutil.copy(d, f"{DL}/KI-PA-A-plus_Worksheets_{dst}_DE.docx")
        shutil.copy(soffice(d, TMP), f"{DL}/KI-PA-A-plus_Worksheets_{dst}_DE.pdf")
    for src, name in DECKS:
        shutil.copy(soffice(f"{TMP}/KI-PA-A-plus_{name}_participant_DE.pptx", TMP), f"{DL}/KI-PA-A-plus_{name}_participant_DE.pdf")
    # workbook PDF (same renderer settings as content/build_workbook_pdf.py, German footer)
    out = f"{DL}/KI-PA-A-plus_Participant-workbook_DE.pdf"
    js = f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://{TMP}/workbook_de.html',{{waitUntil:'networkidle'}});await p.evaluate(()=>document.fonts.ready);
await p.pdf({{path:'{out}',format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:true,headerTemplate:'<span></span>',
footerTemplate:'<div style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:7.5px;letter-spacing:.06em;color:#50566C;padding:0 16mm;display:flex;justify-content:space-between"><span>POWER ACADEMY / KI-PA-A+ ARBEITSHEFT FÜR TEILNEHMENDE</span><span><span class=pageNumber></span> / <span class=totalPages></span></span></div>',
margin:{{top:'15mm',bottom:'16mm',left:'16mm',right:'16mm'}}}});await b.close()}})();"""
    open(f"{TMP}/wb.js", "w").write(js)
    subprocess.run(["node", f"{TMP}/wb.js"], check=True, env=dict(os.environ, NODE_PATH="/tmp/qa/node_modules"))
    print("pdfs ok")

if __name__ == "__main__":
    run(sys.argv[1] if len(sys.argv) > 1 else "collect")
