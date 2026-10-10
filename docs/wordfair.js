// Wordfair: count an essay the way markers do.
// Everything runs in the browser; files are never uploaded.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'wordfair.v1';
  var doc = null; // { name, paras: [{ text, heading }], notes: [text] } when a Word file is loaded

  var CJK = /[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯ｦ-ﾟ]/g;
  var REF_HEAD = /^\s*(references?|reference list|bibliography|works cited|sources|list of references)\s*:?\s*$/i;
  var CITE = /\((?=[^()]*\b(?:1[5-9]|20)\d{2}[a-z]?\b)[^()]{1,160}\)|\[\d+(?:\s*[-–,]\s*\d+)*\]/g;
  var QUOTE = /“[^”]*”|"[^"\n]*"|‘[^’\n]{20,}’/g;

  function words(text) {
    if (!text) return 0;
    var n = 0;
    text.split(/\s+/).forEach(function (tok) {
      if (!tok) return;
      var cjk = tok.match(CJK);
      if (cjk) {
        n += cjk.length;
        tok.replace(CJK, ' ').split(' ').forEach(function (rest) { if (/[\p{L}\p{N}]/u.test(rest)) n++; });
      } else if (/[\p{L}\p{N}]/u.test(tok)) {
        n++;
      }
    });
    return n;
  }

  function sumMatches(text, re) {
    var total = 0;
    var rest = text.replace(re, function (m) { total += words(m); return ' '; });
    return { removed: total, rest: rest };
  }

  function analyse() {
    var o = { refs: $('o-refs').checked, notes: $('o-notes').checked, heads: $('o-heads').checked, cites: $('o-cites').checked, quotes: $('o-quotes').checked };
    var paras = doc ? doc.paras : $('text').value.split(/\n/).map(function (t) { return { text: t, heading: false }; });
    var notes = doc ? doc.notes : [];
    var r = { total: 0, refs: 0, notes: 0, heads: 0, cites: 0, quotes: 0 };
    paras.forEach(function (p) { r.total += words(p.text); });
    notes.forEach(function (t) { r.total += words(t); });

    // Reference list: from the last matching heading onwards
    var cut = paras.length;
    if (o.refs) {
      for (var i = paras.length - 1; i >= 0; i--) {
        if (REF_HEAD.test(paras[i].text)) { cut = i; break; }
      }
      for (var j = cut; j < paras.length; j++) r.refs += words(paras[j].text);
    }
    var body = paras.slice(0, cut);
    if (o.notes) notes.forEach(function (t) { r.notes += words(t); });
    else body = body.concat(notes.map(function (t) { return { text: t, heading: false }; }));
    if (o.heads) body = body.filter(function (p) { if (p.heading) { r.heads += words(p.text); return false; } return true; });

    var text = body.map(function (p) { return p.text; }).join('\n');
    if (o.cites) { var c = sumMatches(text, CITE); r.cites = c.removed; text = c.rest; }
    if (o.quotes) { var q = sumMatches(text, QUOTE); r.quotes = q.removed; text = q.rest; }
    r.counted = words(text);
    r.chars = text.replace(/\s/g, '').length;
    return r;
  }

  var fmt = function (n) { return n.toLocaleString('en-GB'); };
  var w = function (n) { return fmt(n) + (n === 1 ? ' word' : ' words'); };

  function update() {
    var r = analyse();
    $('count').textContent = fmt(r.counted);
    var limit = parseInt($('limit').value, 10);
    var state = $('state'), bar = $('bar'), band = $('band');
    if (limit > 0) {
      var pct = r.counted / limit;
      bar.style.width = Math.min(100, pct * 100) + '%';
      var lo = Math.round(limit * 0.9), hi = Math.round(limit * 1.1);
      band.textContent = '10% either side is ' + fmt(lo) + ' to ' + fmt(hi) + ' words.';
      if (r.counted > hi) { state.textContent = w(r.counted - hi) + ' over the 10% margin'; state.className = 'pill bad'; bar.style.background = '#f87171'; }
      else if (r.counted > limit) { state.textContent = w(r.counted - limit) + ' over, within 10%'; state.className = 'pill warn'; bar.style.background = '#fbbf24'; }
      else if (r.counted < lo) { state.textContent = w(limit - r.counted) + ' to go'; state.className = 'pill'; bar.style.background = ''; }
      else { state.textContent = 'Within the limit'; state.className = 'pill good'; bar.style.background = '#4ade80'; }
    } else {
      bar.style.width = '0'; state.textContent = 'No limit set'; state.className = 'pill';
      band.textContent = 'Many departments allow 10% either side of the limit.';
    }
    var rows = [['Total words', r.total, '']];
    [['refs', 'Reference list'], ['notes', 'Footnotes and endnotes'], ['heads', 'Headings'], ['cites', 'In-text citations'], ['quotes', 'Quotations']].forEach(function (k) {
      if (r[k[0]]) rows.push([k[1], r[k[0]], 'minus']);
    });
    $('breakdown').innerHTML = rows.map(function (x) {
      return '<div class="kv ' + x[2] + '"><span>' + x[0] + '</span><b>' + (x[2] ? '&minus; ' : '') + fmt(x[1]) + '</b></div>';
    }).join('') + '<div class="kv total"><span>Counted</span><b>' + fmt(r.counted) + '</b></div>' +
      '<div class="kv"><span>Characters (no spaces)</span><b>' + fmt(r.chars) + '</b></div>';
    try { localStorage.setItem(KEY, JSON.stringify({ limit: $('limit').value, o: ['o-refs', 'o-notes', 'o-heads', 'o-cites', 'o-quotes'].map(function (id) { return $(id).checked; }) })); } catch (e) {}
  }

  // Word document reading
  function loadJSZip() {
    if (window.JSZip) return Promise.resolve();
    return new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = ok; s.onerror = function () { fail(new Error('Could not load the document reader.')); };
      document.head.appendChild(s);
    });
  }
  var W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  function paraText(p) {
    var out = '';
    p.querySelectorAll('*').forEach(function (n) {
      if (n.namespaceURI !== W) return;
      if (n.localName === 't') out += n.textContent;
      else if (n.localName === 'tab') out += ' ';
      else if (n.localName === 'br' || n.localName === 'cr') out += '\n';
    });
    return out;
  }
  function xml(s) { return new DOMParser().parseFromString(s, 'application/xml'); }

  function readDocx(file) {
    $('chip-name').textContent = 'Reading ' + file.name + '...';
    $('chip').classList.add('on');
    return loadJSZip().then(function () { return JSZip.loadAsync(file); }).then(function (z) {
      var get = function (p) { return z.file(p) ? z.file(p).async('string') : Promise.resolve(''); };
      return Promise.all([get('word/document.xml'), get('word/styles.xml'), get('word/footnotes.xml'), get('word/endnotes.xml')]);
    }).then(function (files) {
      if (!files[0]) throw new Error('This does not look like a Word document.');
      var names = {};
      if (files[1]) {
        var styles = xml(files[1]).getElementsByTagNameNS(W, 'style');
        for (var i = 0; i < styles.length; i++) {
          var nm = styles[i].getElementsByTagNameNS(W, 'name')[0];
          names[styles[i].getAttributeNS(W, 'styleId')] = nm ? nm.getAttributeNS(W, 'val') : '';
        }
      }
      var body = xml(files[0]).getElementsByTagNameNS(W, 'body')[0];
      var ps = body.getElementsByTagNameNS(W, 'p');
      var paras = [];
      for (var k = 0; k < ps.length; k++) {
        var p = ps[k];
        var st = p.getElementsByTagNameNS(W, 'pStyle')[0];
        var id = st ? st.getAttributeNS(W, 'val') : '';
        var name = (names[id] || id || '').toLowerCase();
        paras.push({ text: paraText(p), heading: /^(heading \d|heading\d|title|subtitle)$/.test(name) });
      }
      var notes = [];
      [files[2], files[3]].forEach(function (f, idx) {
        if (!f) return;
        var tag = idx === 0 ? 'footnote' : 'endnote';
        var list = xml(f).getElementsByTagNameNS(W, tag);
        for (var m = 0; m < list.length; m++) {
          var type = list[m].getAttributeNS(W, 'type');
          if (type && type !== 'normal') continue;
          var ps2 = list[m].getElementsByTagNameNS(W, 'p'), t = [];
          for (var q = 0; q < ps2.length; q++) t.push(paraText(ps2[q]));
          notes.push(t.join('\n'));
        }
      });
      doc = { name: file.name, paras: paras, notes: notes };
      $('text').value = paras.map(function (p) { return p.text; }).join('\n');
      $('text').readOnly = true;
      $('chip-name').textContent = file.name + ' · ' + notes.length + ' note' + (notes.length === 1 ? '' : 's');
      update();
    }).catch(function (e) {
      doc = null;
      $('chip-name').textContent = e.message || 'Could not read that file.';
    });
  }

  function clearDoc() { doc = null; $('text').readOnly = false; $('text').value = ''; $('chip').classList.remove('on'); $('file').value = ''; update(); $('text').focus(); }

  // Wiring
  ['text', 'limit'].forEach(function (id) { $(id).addEventListener('input', update); });
  ['o-refs', 'o-notes', 'o-heads', 'o-cites', 'o-quotes'].forEach(function (id) { $(id).addEventListener('change', update); });
  $('file').addEventListener('change', function () { if (this.files[0]) readDocx(this.files[0]); });
  $('chip-clear').onclick = clearDoc;
  var drop = $('drop');
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { var f = e.dataTransfer.files[0]; if (f) readDocx(f); });

  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) {
      $('limit').value = saved.limit || '';
      ['o-refs', 'o-notes', 'o-heads', 'o-cites', 'o-quotes'].forEach(function (id, i) { if (saved.o && typeof saved.o[i] === 'boolean') $(id).checked = saved.o[i]; });
    }
  } catch (e) {}
  update();
})();
