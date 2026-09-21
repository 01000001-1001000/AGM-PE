/* =========================================================
   AH — interacciones (robusto: módulos aislados + fallbacks)
   ========================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ejecuta cada módulo de forma aislada: si uno falla, el resto sigue vivo.
  function safe(fn) { try { fn(); } catch (e) { console.error('[AH]', e); } }

  /* ---------- 1. Barra de progreso ---------- */
  function initProgress() {
    var bar = document.getElementById('progressBar');
    var header = document.getElementById('siteHeader');
    if (!bar) return;
    function onScroll() {
      var h = doc.scrollHeight - window.innerHeight;
      var y = window.scrollY;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      if (header) header.classList.toggle('is-scrolled', y > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 2. Menú móvil ---------- */
  function initMenu() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', false); }
    });
  }

  /* ---------- 3. TÍTULOS: máquina de escribir (defensivo) ----------
     El texto del HTML se conserva intacto hasta que el título entra
     en pantalla; solo entonces se limpia y se escribe. Si algo falla,
     se restaura. Con "reducir movimiento" el efecto corre igualmente. */
  function initTypewriter() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-lines]'));
    if (!els.length) return;
    els.forEach(function (el) { el._txt = el.textContent.trim().replace(/\s+/g, ' '); });

    function write(el) {
      var full = el._txt;
      if (!full) return;
      // Reservar altura ANTES de limpiar → el título no “salta” al escribirse.
      el.style.minHeight = el.getBoundingClientRect().height + 'px';
      el.textContent = '';
      var tn = document.createTextNode('');
      var caret = document.createElement('span');
      caret.className = 'caret';
      if (reduce) caret.style.animation = 'none';   // cursor fijo, sin parpadeo
      el.appendChild(tn);
      el.appendChild(caret);
      var i = 0;
      (function step() {
        try {
          i++;
          tn.textContent = full.slice(0, i);
          if (i < full.length) {
            var ch = full[i - 1], w = 30 + Math.random() * 40;
            if (ch === ' ') w = 18;
            else if (ch === ',') w = 150;
            else if (ch === '.' || ch === ':' || ch === '…') w = 280;
            setTimeout(step, w);
          } else {
            setTimeout(function () { if (caret.parentNode) caret.parentNode.removeChild(caret); }, 900);
          }
        } catch (err) {                       // rescate: nunca dejar el título vacío
          el.textContent = full;
          el.style.minHeight = '';
        }
      })();
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        write(en.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -3% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 4. Revelados genéricos ---------- */
  function initReveal() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal],.mem,.stack-card,.tile').forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. Eyebrow decodificado ---------- */
  function initScramble() {
    var GLYPHS = '01ABCDEF#%$&/<>*+-_@!';
    function scramble(el, text, dur) {
      if (reduce) { el.textContent = text; return; }
      var start = performance.now();
      (function frame(now) {
        var p = Math.min((now - start) / dur, 1);
        var keep = Math.floor(p * text.length);
        var out = text.slice(0, keep);
        for (var k = keep; k < text.length; k++) out += text[k] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        el.textContent = out;
        if (p < 1) requestAnimationFrame(frame);
      })(start);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        scramble(en.target, en.target.textContent.trim(), 780);
        io.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-scramble]').forEach(function (el) { io.observe(el); });
  }

  /* ---------- 6. Consola del hero ---------- */
  function initConsole() {
    var consoleEl = document.getElementById('console');
    if (!consoleEl) return;
    var LINES = [
      { t: 'cmd', v: 'whoami' },
      { t: 'out', v: 'AH · estudiante · 1º DAM · IES Simarro' },
      { t: 'cmd', v: 'cat /etc/motd' },
      { t: 'out', v: '"Entender la máquina, no solo usarla."' },
      { t: 'cmd', v: 'python3 --version' },
      { t: 'out', v: 'Python 3.12 · entorno listo' },
      { t: 'cmd', v: './curiosidad --nivel=bajo' },
      { t: 'ok',  v: '[ OK ] mapa de memoria del proceso' },
      { t: 'ok',  v: '[ OK ] 3 años de informática revisados' },
      { t: 'ok',  v: '[ OK ] web, CLI y prácticas cargadas' }
    ];
    var li = 0;
    (function nextLine() {
      if (li >= LINES.length) {
        var c = document.createElement('span');
        c.className = 'caret';
        consoleEl.appendChild(c);
        return;
      }
      var line = LINES[li];
      var p = document.createElement('p');
      p.className = line.t === 'cmd' ? 'ln-cmd' : (line.t === 'ok' ? 'ln-ok' : 'ln-out');
      consoleEl.appendChild(p);
      if (reduce) { p.textContent = line.v; li++; nextLine(); return; }
      var ci = 0;
      (function type() {
        p.textContent = line.v.slice(0, ci++);
        if (ci <= line.v.length) setTimeout(type, 16 + Math.random() * 26);
        else { li++; setTimeout(nextLine, 190); }
      })();
    })();
  }

  /* ---------- 7. Contadores ---------- */
  function initCounters() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = parseInt(el.dataset.count, 10);
        var suffix = el.dataset.suffix || '';
        if (reduce) { el.textContent = target + suffix; io.unobserve(el); return; }
        var t0 = performance.now(), dur = 1400;
        (function tick(now) {
          var p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        io.unobserve(el);
      });
    }, { threshold: 0.8 });
    document.querySelectorAll('[data-count]').forEach(function (el) { io.observe(el); });
  }

  /* ---------- 8. Navegación activa ---------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    var sections = links.map(function (l) { return document.querySelector(l.getAttribute('href')); }).filter(Boolean);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- 9. MARQUESINA (se mueve siempre, con fallback CSS) ---------- */
  function initTicker() {
    var track = document.querySelector('.ticker-track');
    if (!track) return;
    var units = 2, guard = 0;
    var target = window.innerWidth * 3;
    while (track.scrollWidth < target && guard < 6) {
      track.innerHTML += track.innerHTML;
      units *= 2; guard++;
    }
    var copyW = track.scrollWidth / units;
    if (!copyW || copyW <= 0) return;        // si algo va mal, deja la animación CSS
    track.style.animation = 'none';
    track.style.willChange = 'transform';
    var x = 0, paused = false, speed = 0.7;
    (function frame() {
      if (!paused) {
        x -= speed;
        if (x <= -copyW) x += copyW;
        track.style.transform = 'translateX(' + x + 'px)';
      }
      requestAnimationFrame(frame);
    })();
    var ticker = track.closest('.ticker');
    if (ticker) {
      ticker.addEventListener('mouseenter', function () { paused = true; });
      ticker.addEventListener('mouseleave', function () { paused = false; });
    }
  }

  /* ---------- 10. Conversor “bajo el capó” ---------- */
  function initLab() {
    var input = document.getElementById('numInput');
    if (!input) return;
    var out = {
      dec: document.getElementById('oDec'),
      hex: document.getElementById('oHex'),
      bin: document.getElementById('oBin'),
      oct: document.getElementById('oOct'),
      bytes: document.getElementById('oBytes'),
      char: document.getElementById('oChar')
    };
    var note = document.getElementById('labNote');
    function group(str, size) { return str.replace(new RegExp('.{' + size + '}(?=.)', 'g'), '$& '); }
    function render() {
      var raw = (input.value || '').replace(/[^0-9]/g, '');
      if (raw === '') { Object.keys(out).forEach(function (k) { out[k].textContent = '—'; }); note.textContent = 'Sin entrada'; return; }
      var n = parseInt(raw, 10);
      if (isNaN(n) || n > 4294967295) { note.textContent = 'Fuera de rango (máx. 4294967295)'; return; }
      var hex = n.toString(16).toUpperCase().padStart(8, '0');
      var bin = n.toString(2).padStart(32, '0');
      var bytes = [];
      for (var i = 32; i > 0; i -= 8) bytes.push(bin.slice(i - 8, i));
      var ascii = n >= 32 && n <= 126 ? String.fromCharCode(n) : (n === 0 ? 'NUL' : 'no imprimible');
      out.dec.textContent = n.toLocaleString('es-ES');
      out.hex.textContent = '0x' + hex.match(/../g).join(' ');
      out.bin.textContent = group(bin, 4);
      out.oct.textContent = '0o' + n.toString(8);
      out.bytes.textContent = bytes.map(function (b) { return '0x' + parseInt(b, 2).toString(16).toUpperCase().padStart(2, '0'); }).join(' · ');
      out.char.textContent = ascii;
      note.textContent = 'Base 10 · 32 bits sin signo · ' + Math.max(1, n.toString(2).length) + ' bits significativos';
      Object.keys(out).forEach(function (k) {
        out[k].classList.add('flash');
        setTimeout(function () { out[k].classList.remove('flash'); }, 320);
      });
    }
    input.addEventListener('input', render);
    input.addEventListener('focus', function () { input.select(); });
    document.querySelectorAll('.preset').forEach(function (b) {
      b.addEventListener('click', function () { input.value = b.dataset.val; render(); });
    });
    render();
  }

  /* ---------- 11. Copiar correo ---------- */
  function initCopy() {
    var copyBtn = document.getElementById('copyMail');
    var feedback = document.getElementById('copyFeedback');
    if (!copyBtn) return;
    copyBtn.addEventListener('click', function () {
      var mail = copyBtn.dataset.mail;
      function done(ok) {
        feedback.textContent = ok ? '✓ Correo copiado al portapapeles' : '✗ No se pudo copiar, escríbelo a mano';
        feedback.style.color = ok ? '#1a8f4c' : '#c0392b';
        copyBtn.textContent = ok ? 'Copiado' : 'Copiar';
        setTimeout(function () { feedback.textContent = ''; copyBtn.textContent = 'Copiar'; }, 3200);
      }
      if (navigator.clipboard) navigator.clipboard.writeText(mail).then(function () { done(true); }, function () { done(false); });
      else done(false);
    });
  }

  /* ---------- 12. Año en el pie ---------- */
  function initYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Arranque aislado ---------- */
  safe(initProgress);
  safe(initMenu);
  safe(initTypewriter);
  safe(initReveal);
  safe(initScramble);
  safe(initConsole);
  safe(initCounters);
  safe(initScrollSpy);
  safe(initTicker);
  safe(initLab);
  safe(initCopy);
  safe(initYear);
})();
