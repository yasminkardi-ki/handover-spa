"""German editions of Office/Markdown/HTML downloads (EN -> DE) with a translation cache.

Two passes per run:
  collect(...)  -> unique source strings that are not yet in office_de_raw.json
  (translate with: node tr.mjs office_src.json office_de_raw.json, EXTRA instruction for tags)
  apply(...)    -> writes the German files

Paragraph runs/segments with different formatting are wrapped in <tN>…</tN> so the translation
keeps bold/italic/colour boundaries. German parts in mixed documents stay unchanged.
"""
import json, os, re, zipfile, copy
from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE_F = f"{HERE}/office_de_raw.json"
OVR_F = f"{HERE}/office_overrides.json"
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
S = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
C = "http://schemas.openxmlformats.org/drawingml/2006/chart"

def load_cache():
    c = json.load(open(CACHE_F)) if os.path.exists(CACHE_F) else {}
    if os.path.exists(OVR_F): c.update(json.load(open(OVR_F)))
    return c

WORD = re.compile(r"[A-Za-z]{2,}")
def wants(t):
    t = t.strip()
    if not t or not WORD.search(t): return False
    if re.fullmatch(r"(B|C|R|G|S|E|M)\d{1,2}([–-]B?\d{2})?|KI-PA-A\+?|[A-Z]{1,3}", t): return False
    return True

# ---------- paragraph segmentation (docx: w:p/w:r/w:t, pptx: a:p/a:r/a:t) ----------
def _ns(kind): return W if kind == "w" else A

def merge_runs(p, kind):
    ns = _ns(kind); r_tag, t_tag, pr_tag = f"{{{ns}}}r", f"{{{ns}}}t", f"{{{ns}}}rPr"
    prev, prev_key = None, None
    for r in list(p):
        if r.tag != r_tag: prev = None; continue
        kids = [k for k in r if k.tag != pr_tag]
        if len(kids) != 1 or kids[0].tag != t_tag: prev = None; continue
        pr = r.find(pr_tag)
        key = etree.tostring(pr) if pr is not None else b""
        if prev is not None and key == prev_key:
            pt = prev.find(t_tag); pt.text = (pt.text or "") + (kids[0].text or "")
            pt.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
            p.remove(r); continue
        prev, prev_key = r, key

def segments(p, kind):
    ns = _ns(kind); t_tag = f"{{{ns}}}t"; p_tag = f"{{{ns}}}p"
    out = []
    for t in p.iter(t_tag):
        anc = t.getparent()
        while anc is not None and anc.tag != p_tag: anc = anc.getparent()
        if anc is p: out.append(t)
    return out

def para_key(segs):
    texts = [s.text or "" for s in segs]
    idx = [i for i, x in enumerate(texts) if x.strip()]
    if not idx: return None, idx
    if len(idx) == 1:
        k = texts[idx[0]].strip()
    else:
        k = "".join(f"<t{n+1}>{texts[i].strip()}</t{n+1}>" for n, i in enumerate(idx))
    full = " ".join(texts[i].strip() for i in idx)
    return (k if wants(full) else None), idx

def apply_para(segs, idx, de):
    texts = [s.text or "" for s in segs]
    def keep_ws(orig, new):
        a = orig[:len(orig) - len(orig.lstrip())]; b = orig[len(orig.rstrip()):]
        return a + new + b
    if len(idx) == 1:
        segs[idx[0]].text = keep_ws(texts[idx[0]], de); return
    parts = {}
    for m in re.finditer(r"<t(\d+)>(.*?)</t\1>", de, re.S): parts[int(m.group(1))] = m.group(2)
    if len(parts) == len(idx) and all((n + 1) in parts for n in range(len(idx))):
        for n, i in enumerate(idx):
            segs[i].text = keep_ws(texts[i], parts[n + 1].strip())
            segs[i].set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    else:
        plain = re.sub(r"</?t\d+>", "", de)
        segs[idx[0]].text = keep_ws(texts[idx[0]], plain)
        for i in idx[1:]: segs[i].text = ""

def ooxml_parts(path, kind):
    z = zipfile.ZipFile(path)
    names = z.namelist()
    if kind == "w":
        return [n for n in names if re.fullmatch(r"word/(document|header\d*|footer\d*|footnotes|endnotes)\.xml", n)]
    return [n for n in names if re.fullmatch(r"ppt/slides/slide\d+\.xml", n)]

def walk_ooxml(path, kind, cache=None, out=None, keys=None):
    z = zipfile.ZipFile(path)
    parts = set(ooxml_parts(path, kind))
    ns = _ns(kind)
    newdata = {}
    for n in parts:
        root = etree.fromstring(z.read(n))
        for p in root.iter(f"{{{ns}}}p"):
            merge_runs(p, kind)
            segs = segments(p, kind)
            k, idx = para_key(segs)
            if not k: continue
            if keys is not None: keys.add(k)
            if cache is not None and k in cache: apply_para(segs, idx, cache[k])
        newdata[n] = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
    if out:
        with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zo:
            for item in z.infolist():
                zo.writestr(item, newdata.get(item.filename, z.read(item.filename)))

# ---------- xlsx ----------
def xlsx_literals(z):
    lits = set()
    for n in z.namelist():
        if n.startswith("xl/worksheets/sheet"):
            x = z.read(n).decode("utf8")
            for f in re.findall(r"<f[^>]*>(.*?)</f>", x, re.S):
                lits.update(re.findall(r"&quot;(.*?)&quot;|\"(.*?)\"", f) and [a or b for a, b in re.findall(r"&quot;(.*?)&quot;|\"(.*?)\"", f)])
    return lits

def walk_xlsx(path, cache=None, out=None, keys=None):
    z = zipfile.ZipFile(path); lits = xlsx_literals(z); newdata = {}
    def tr(s):
        if s is None or s.strip() in lits or not wants(s): return s
        k = s.strip()
        if keys is not None: keys.add(k)
        if cache and k in cache:
            a = s[:len(s) - len(s.lstrip())]; b = s[len(s.rstrip()):]
            return a + cache[k] + b
        return s
    for n in z.namelist():
        if n == "xl/sharedStrings.xml":
            root = etree.fromstring(z.read(n))
            for si in root.iter(f"{{{S}}}si"):
                ts = [t for t in si.iter(f"{{{S}}}t")]
                if len(ts) == 1: ts[0].text = tr(ts[0].text)
                elif ts:
                    full = "".join(t.text or "" for t in ts)
                    new = tr(full)
                    if new != full: ts[0].text = new; [setattr(t, "text", "") for t in ts[1:]]
            newdata[n] = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
        elif n.startswith("xl/charts/chart"):
            root = etree.fromstring(z.read(n))
            for t in root.iter(f"{{{A}}}t"): t.text = tr(t.text)
            for v in root.iter(f"{{{C}}}v"):
                if v.text and not re.fullmatch(r"[-\d.,E]+", v.text): v.text = tr(v.text)
            newdata[n] = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
        elif n.startswith("xl/worksheets/sheet"):
            x = z.read(n).decode("utf8")
            def dv(m):
                items = m.group(1).split(",")
                return "<formula1>&quot;" + ",".join(tr(i) for i in items) + "&quot;</formula1>"
            x2 = re.sub(r"<formula1>&quot;(.*?)&quot;</formula1>", dv, x)
            x2 = re.sub(r'(error|prompt|errorTitle|promptTitle)="([^"]*)"', lambda m: f'{m.group(1)}="{tr(m.group(2))}"', x2)
            # inline strings
            x2 = re.sub(r"(<is><t[^>]*>)(.*?)(</t></is>)", lambda m: m.group(1) + (tr(m.group(2)) or "") + m.group(3), x2, flags=re.S)
            if x2 != x: newdata[n] = x2.encode("utf8")
    if out:
        with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zo:
            for item in z.infolist():
                zo.writestr(item, newdata.get(item.filename, z.read(item.filename)))

# ---------- Markdown ----------
def md_wants(b):
    s = b.strip()
    return bool(s) and s not in ("---", "&nbsp;") and not s.startswith("```") and wants(re.sub(r"[#>*_|`\-]", " ", s))

def walk_md(path, cache=None, out=None, keys=None):
    parts = re.split(r"(\n[ \t]*\n)", open(path, encoding="utf-8").read())
    res = []
    for i, b in enumerate(parts):
        if i % 2 == 0 and md_wants(b):
            k = b.strip()
            if keys is not None: keys.add(k)
            if cache and k in cache:
                b = b[:len(b) - len(b.lstrip())] + cache[k] + b[len(b.rstrip()):]
        res.append(b)
    if out: open(out, "w", encoding="utf-8").write("".join(res))

# ---------- HTML (leaf blocks keep inline tags) ----------
INLINE = {"strong", "em", "b", "i", "a", "code", "span", "br", "sup", "sub", "small", "u", "mark", "abbr"}
BLOCK = {"p", "li", "h1", "h2", "h3", "h4", "td", "th", "dt", "dd", "figcaption", "blockquote", "label", "div", "span", "title", "b", "i", "small", "em", "strong"}

def walk_html(src, cache=None, keys=None):
    import lxml.html as LH
    doc = LH.document_fromstring(src)
    def leafish(el):
        return all(c.tag in INLINE for c in el.iterchildren() if isinstance(c.tag, str))
    done = set()
    for el in list(doc.iter()):
        if not isinstance(el.tag, str) or el.tag in ("style", "script", "svg", "path", "rect"): continue
        if any(a in done for a in el.iterancestors()): continue
        if el.getroottree().getroot() is not doc: continue
        if el.tag not in BLOCK or not leafish(el): continue
        inner = (el.text or "") + "".join(LH.tostring(c, encoding="unicode") for c in el.iterchildren())
        txt = el.text_content()
        if not wants(txt): continue
        done.add(el)
        k = inner.strip()
        if keys is not None: keys.add(k)
        if cache and k in cache:
            frag = LH.fragment_fromstring("<x>" + cache[k] + "</x>")
            for c in list(el): el.remove(c)
            el.text = frag.text
            for c in frag.iterchildren(): el.append(c)
    return LH.tostring(doc, encoding="unicode", doctype="<!doctype html>")

# ---------- fit German text into pptx shapes (Calibri ~ Carlito metrics) ----------
def fit_pptx(path, out=None, min_scale=0.62, log=None):
    from pptx import Presentation
    from pptx.util import Pt
    from PIL import ImageFont
    FR = ImageFont.truetype("/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf", 1000)
    FB = ImageFont.truetype("/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf", 1000)
    def wlen(s, size, bold): return (FB if bold else FR).getlength(s) * size / 1000.0
    def need(tf, width, scale):
        h, longest = 0.0, 0.0
        for p in tf.paragraphs:
            runs = [r for r in p.runs if r.text]
            size = max([r.font.size.pt for r in p.runs if r.font.size] or [18]) * scale
            bold = sum(len(r.text) for r in runs if r.font.bold) > sum(len(r.text) for r in runs) / 2
            text = "".join(r.text for r in p.runs)
            sp = (p.space_before.pt if p.space_before else 0) + (p.space_after.pt if p.space_after else 0)
            lines = 0
            for seg in re.split(r"[\v\n]", text) or [""]:
                cur, n = 0.0, 1
                for w in seg.split(" "):
                    wl = wlen(w, size, bold); longest = max(longest, wl)
                    add = wl if cur == 0 else wlen(" ", size, bold) + wl
                    if cur + add > width and cur > 0: n += 1; cur = wl
                    else: cur += add
                lines += n
            h += lines * size * 1.2 + sp * scale
        return h, longest
    prs = Presentation(path); changed = 0
    for si, s in enumerate(prs.slides, 1):
        shapes = list(s.shapes)
        for sh in shapes:
            if not sh.has_text_frame or not sh.text_frame.text.strip() or sh.text_frame.word_wrap is False: continue
            tf = sh.text_frame
            if not any(r.font.size for p in tf.paragraphs for r in p.runs): continue
            li = (tf.margin_left if tf.margin_left is not None else 91440); ri = (tf.margin_right if tf.margin_right is not None else 91440)
            ti = (tf.margin_top if tf.margin_top is not None else 45720); bi = (tf.margin_bottom if tf.margin_bottom is not None else 45720)
            W = (sh.width - li - ri) / 12700.0; H = (sh.height - ti - bi) / 12700.0
            if W <= 0 or H <= 0: continue
            scale = 1.0
            while scale > min_scale:
                h, lw = need(tf, W, scale)
                if h <= H * 1.08 and lw <= W: break
                scale -= 0.03
            if scale < 0.999:
                for p in tf.paragraphs:
                    for r in p.runs:
                        if r.font.size: r.font.size = Pt(round(r.font.size.pt * scale * 2) / 2)
                changed += 1
                if log is not None: log.append((si, round(scale, 2), tf.text[:60]))
    prs.save(out or path)
    return changed
