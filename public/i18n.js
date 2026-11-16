// DE/EN language layer for Power Academy | AI Learning Studio.
// English is the source language. German translations come from i18n-de.js (window.__PA_DE).
// The layer translates rendered text and a few attributes in place and can switch back without reload.
(function () {
  var KEY = "pa-lang";
  var DE = null;
  var SRC = (document.currentScript && document.currentScript.src || "").replace(/i18n\.js(\?.*)?$/, "i18n-de.js");
  var lang = "en";
  try { lang = localStorage.getItem(KEY) === "de" ? "de" : "en"; } catch (e) {}
  try { var q = new URLSearchParams(location.search).get("lang"); if (q === "de" || q === "en") { lang = q; localStorage.setItem(KEY, q); } } catch (e) {}

  // Number templates: "3 of 24 complete" -> "# of # complete"
  var TPL = {};
  var NUM = /\d+(?:[.,]\d+)*/g;
  function buildTpl() { Object.keys(DE).forEach(function (en) {
    var ne = en.match(NUM); if (!ne) return;
    var de = DE[en], nd = de.match(NUM);
    if (!nd || nd.length !== ne.length) return;
    for (var i = 0; i < ne.length; i++) if (ne[i] !== nd[i]) return;
    var k = en.replace(NUM, "#");
    if (!(k in TPL)) TPL[k] = de.replace(NUM, "#");
  }); }
  var loading = null;
  function loadDE(cb) {
    if (DE) return cb();
    if (window.__PA_DE) { DE = window.__PA_DE; buildTpl(); return cb(); }
    if (!loading) {
      loading = [];
      var s = document.createElement("script"); s.src = SRC;
      s.onload = function () { DE = window.__PA_DE || {}; buildTpl(); var l = loading; loading = null; l.forEach(function (f) { f(); }); };
      s.onerror = function () { DE = {}; var l = loading; loading = null; l.forEach(function (f) { f(); }); };
      document.head.appendChild(s);
    }
    loading.push(cb);
  }

  function lookup(t) {
    if (!DE) return null;
    if (Object.prototype.hasOwnProperty.call(DE, t)) return DE[t];
    var n = t.match(NUM);
    if (n) {
      var k = t.replace(NUM, "#");
      if (Object.prototype.hasOwnProperty.call(TPL, k)) { var i = 0; return TPL[k].replace(/#/g, function () { return n[i++]; }); }
    }
    return null;
  }
  function tr(v) {
    var t = v.trim(); if (!t) return null;
    var d = lookup(t); if (d == null || d === t) return null;
    var a = v.indexOf(t);
    return v.slice(0, a) + d + v.slice(a + t.length);
  }

  var SKIP = "script,style,textarea,input,code,pre,[contenteditable],[data-no-i18n],.pa-lang";
  var ATTRS = ["placeholder", "title", "aria-label", "alt"];
  var textOrig = new WeakMap(); // node -> {en, de}
  var attrOrig = new WeakMap(); // el -> {attr: {en, de}}
  var touched = new Set();

  function doText(n) {
    var p = n.parentElement; if (!p || p.closest(SKIP)) return;
    var v = n.nodeValue, rec = textOrig.get(n);
    if (lang === "de") {
      if (rec && v === rec.de) return;
      var d = tr(v); if (d == null) return;
      textOrig.set(n, { en: v, de: d }); touched.add(n); n.nodeValue = d;
    } else if (rec && v === rec.de) { n.nodeValue = rec.en; }
  }
  function doAttrs(el) {
    if (el.closest && el.closest("[data-no-i18n],.pa-lang")) return;
    var rec = attrOrig.get(el);
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a); if (v == null) continue;
      var r = rec && rec[a];
      if (lang === "de") {
        if (r && v === r.de) continue;
        var d = tr(v); if (d == null) continue;
        if (!rec) { rec = {}; attrOrig.set(el, rec); touched.add(el); }
        rec[a] = { en: v, de: d }; el.setAttribute(a, d);
      } else if (r && v === r.de) { el.setAttribute(a, r.en); }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1) return;
    if (root.hasAttribute && root.matches("[placeholder],[title],[aria-label],[alt]")) doAttrs(root);
    var els = root.querySelectorAll("[placeholder],[title],[aria-label],[alt]");
    for (var i = 0; i < els.length; i++) doAttrs(els[i]);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) doText(n);
  }
  var titleEn = null;
  function doTitle() {
    var t = document.title;
    if (lang === "de") { var d = lookup(t.trim()); if (d && d !== t) { titleEn = t; document.title = d; } }
    else if (titleEn && t !== titleEn) { var d2 = lookup(titleEn.trim()); if (t === d2) document.title = titleEn; }
  }

  // German subtitles for the tutorial videos
  function doTracks() {
    var vids = document.querySelectorAll("video");
    for (var i = 0; i < vids.length; i++) {
      var v = vids[i], en = v.querySelector('track[srclang="en"]'); if (!en) continue;
      var de = v.querySelector('track[srclang="de"]');
      if (!de) {
        de = document.createElement("track");
        de.kind = "subtitles"; de.srclang = "de"; de.label = "Deutsch";
        de.src = en.getAttribute("src").replace(/\.vtt$/, ".de.vtt");
        v.appendChild(de);
      }
      var tt = v.textTracks;
      for (var j = 0; j < tt.length; j++) {
        if (tt[j].language === "de") tt[j].mode = lang === "de" ? "showing" : "disabled";
        if (tt[j].language === "en") tt[j].mode = lang === "de" ? "disabled" : "showing";
      }
    }
  }

  var busy = false;
  var mo = new MutationObserver(function (list) {
    if (busy) return; busy = true;
    try {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === "characterData") doText(m.target);
        else if (m.type === "attributes") doAttrs(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
      doTitle(); ensureToggle(); doTracks();
    } finally { busy = false; }
  });

  // Toggle
  function makeToggle() {
    var g = document.createElement("div");
    g.className = "pa-lang"; g.setAttribute("role", "group"); g.setAttribute("aria-label", lang === "de" ? "Sprache" : "Language");
    ["de", "en"].forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = l.toUpperCase(); b.setAttribute("data-lang", l);
      b.setAttribute("aria-pressed", String(l === lang));
      b.setAttribute("aria-label", l === "de" ? "Deutsch" : "English");
      b.addEventListener("click", function () { setLang(l); });
      g.appendChild(b);
    });
    return g;
  }
  function ensureToggle() {
    var host = document.querySelector(".topbar > div:last-child") || document.querySelector("header.bar .bar-tools") || document.querySelector("header.bar");
    var g = document.querySelector(".pa-lang");
    if (g && (!g.classList.contains("pa-lang-fixed") || !host)) return;
    if (g) { g.classList.remove("pa-lang-fixed"); var b0 = host.querySelector(".icon-button"); host.insertBefore(g, b0 || host.firstChild); return; }
    if (!document.body) return;
    g = makeToggle();
    if (host) { var btn = host.querySelector(".icon-button"); host.insertBefore(g, btn || host.firstChild); }
    else if (document.body) { g.classList.add("pa-lang-fixed"); document.body.appendChild(g); }
  }
  function syncToggle() {
    var bs = document.querySelectorAll(".pa-lang button");
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-pressed", String(bs[i].getAttribute("data-lang") === lang));
    var g = document.querySelector(".pa-lang"); if (g) g.setAttribute("aria-label", lang === "de" ? "Sprache" : "Language");
  }
  function setLang(l) {
    if (l === lang) return;
    if (l === "de" && !DE) return loadDE(function () { setLang("de"); });
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    document.documentElement.lang = l;
    busy = true;
    try {
      if (l === "en") {
        touched.forEach(function (n) {
          if (n.nodeType === 3) { var r = textOrig.get(n); if (r && n.nodeValue === r.de) n.nodeValue = r.en; textOrig.delete(n); }
          else { var ra = attrOrig.get(n); if (ra) Object.keys(ra).forEach(function (a) { if (n.getAttribute(a) === ra[a].de) n.setAttribute(a, ra[a].en); }); attrOrig.delete(n); }
        });
        touched.clear();
      } else walk(document.body);
      doTitle(); syncToggle(); doTracks();
    } finally { busy = false; }
    try { window.dispatchEvent(new CustomEvent("pa-lang", { detail: l })); } catch (e) {}
  }
  window.paSetLang = setLang;
  window.paLang = function () { return lang; };

  var css = document.createElement("style");
  css.textContent =
    ".pa-lang{display:inline-flex;flex-shrink:0;align-items:center;border:1px solid currentColor;border-radius:999px;overflow:hidden;margin-right:8px;font:600 12px/1 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.06em;opacity:.95}" +
    ".pa-lang button{all:unset;cursor:pointer;padding:6px 9px;min-width:22px;text-align:center}" +
    ".pa-lang button[aria-pressed=true]{background:#0E7C86;color:#fff}" +
    ".pa-lang button:focus-visible{outline:2px solid #0E7C86;outline-offset:2px}" +
    ".pa-lang-fixed{position:fixed;top:10px;right:10px;z-index:9999;background:#fff;color:#11132E}" +
    "@media (max-width:520px){.pa-lang{margin-right:2px}.pa-lang button{padding:5px 6px}.topbar>div>span:not(.badge){max-width:110px}header.bar .brand small{display:none}}" +
    "@media print{.pa-lang{display:none}}" +
    "html.pa-i18n-wait body{visibility:hidden}";
  document.head.appendChild(css);

  document.documentElement.lang = lang;
  function start() {
    ensureToggle();
    if (lang === "de") {
      document.documentElement.classList.add("pa-i18n-wait");
      loadDE(function () { walk(document.body); doTitle(); doTracks(); document.documentElement.classList.remove("pa-i18n-wait"); });
      setTimeout(function () { document.documentElement.classList.remove("pa-i18n-wait"); }, 4000);
    }
    doTitle(); doTracks();
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    mo.observe(document.head, { subtree: true, childList: true, characterData: true });
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
