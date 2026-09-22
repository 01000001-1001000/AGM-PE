/* ========================================================= MAIU
   AH — interacciones (multi-página, robusto)
   ========================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     CONFIGURACIÓN DEL FORMULARIO
     Deja FORM_ENDPOINT vacío ("") para enviar por correo (abre el
     cliente con el mensaje redactado). Para envío AJAX real, pega
     la URL de Formspree / Web3Forms, p.ej.:
       var FORM_ENDPOINT = "https://formspree.io/f/xxxxxxx";
       var FORM_METHOD   = "POST";
     ------------------------------------------------------------ */
  var FORM_ENDPOINT = "";
  var FORM_METHOD = "POST";

  // Aísla cada módulo: un fallo no tumba el resto.
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

  /* ---------- 3. Enlace activo de navegación (por página) ---------- */
  function initActiveNav() {
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav .nav-link').forEach(function (l) {
      var href = (l.getAttribute('href') || '').split('#')[0] || 'index.html';
      if (href === here) l.classList.add('is-active');
    });
  }

  /* ---------- 4. Scrollspy (solo anclas de la misma página) ---------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.main-nav .nav-link'))
      .filter(function (l) { return (l.getAttribute('href') || '').indexOf('#') !== -1; });
    if (!links.length) return;
    var map = {};
    var sections = [];
    links.forEach(function (l) {
      var id = l.getAttribute('href').split('#')[1];
      var el = id && document.getElementById(id);
      if (el) { map[id] = l; sections.push(el); }
    });
    if (!sections.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        if (map[en.target.id]) map[en.target.id].classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- 5. TÍTULOS: máquina de escribir ---------- */
  function initTypewriter() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-lines]'));
    if (!els.length) return;
    els.forEach(function (el) { el._txt = el.textContent.trim().replace(/\s+/g, ' '); });

    function write(el) {
      var full = el._txt;
      if (!full) return;
      el.style.minHeight = el.getBoundingClientRect().height + 'px';
      el.textContent = '';
      var tn = document.createTextNode('');
      var caret = document.createElement('span');
      caret.className = 'caret';
      if (reduce) caret.style.animation = 'none';
      el.appendChild(tn); el.appendChild(caret);
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
        } catch (err) { el.textContent = full; el.style.minHeight = ''; }
      })();
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target); write(en.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -3% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 6. Revelados genéricos ---------- */
  function initReveal() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in'); io.unobserve(en.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal],.mem,.stack-card,.tile').forEach(function (el) { io.observe(el); });
  }

  /* ---------- 7. Eyebrow decodificado ---------- */
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
        scramble(en.target, en.target.textContent.trim(), 780); io.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-scramble]').forEach(function (el) { io.observe(el); });
  }

  /* ---------- 8. Consola del hero ---------- */
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
      if (li >= LINES.length) { var c = document.createElement('span'); c.className = 'caret'; consoleEl.appendChild(c); return; }
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

  /* ---------- 9. Contadores ---------- */
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

  /* ---------- 10. Ticker ---------- */
  function initTicker() {
    var track = document.querySelector('.ticker-track');
    if (!track) return;
    var units = 2, guard = 0, target = window.innerWidth * 3;
    while (track.scrollWidth < target && guard < 6) { track.innerHTML += track.innerHTML; units *= 2; guard++; }
    var copyW = track.scrollWidth / units;
    if (!copyW || copyW <= 0) return;
    track.style.animation = 'none'; track.style.willChange = 'transform';
    var x = 0, paused = false, speed = 0.7;
    (function frame() {
      if (!paused) { x -= speed; if (x <= -copyW) x += copyW; track.style.transform = 'translateX(' + x + 'px)'; }
      requestAnimationFrame(frame);
    })();
    var ticker = track.closest('.ticker');
    if (ticker) {
      ticker.addEventListener('mouseenter', function () { paused = true; });
      ticker.addEventListener('mouseleave', function () { paused = false; });
    }
  }

  /* ---------- 11. Conversor bajo el capó ---------- */
  function initLab() {
    var input = document.getElementById('numInput');
    if (!input) return;
    var out = {
      dec: document.getElementById('oDec'), hex: document.getElementById('oHex'),
      bin: document.getElementById('oBin'), oct: document.getElementById('oOct'),
      bytes: document.getElementById('oBytes'), char: document.getElementById('oChar')
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
      Object.keys(out).forEach(function (k) { out[k].classList.add('flash'); setTimeout(function () { out[k].classList.remove('flash'); }, 320); });
    }
    input.addEventListener('input', render);
    input.addEventListener('focus', function () { input.select(); });
    document.querySelectorAll('.preset').forEach(function (b) { b.addEventListener('click', function () { input.value = b.dataset.val; render(); }); });
    render();
  }

  /* ---------- 12. Copiar correo ---------- */
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

  /* ---------- 13. FORMULARIO de contacto (funcional) ---------- */
  function initForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var success = document.getElementById('formSuccess');
    var successMsg = document.getElementById('successMsg');
    var status = document.getElementById('formStatus');
    var submitBtn = document.getElementById('submitBtn');
    var msgField = document.getElementById('fMessage');
    var charCount = document.getElementById('charCount');
    var lastPayload = '';

    // Contador en vivo del mensaje
    if (msgField && charCount) {
      var upd = function () { charCount.textContent = msgField.value.length; };
      msgField.addEventListener('input', upd); upd();
    }

    // Reglas de validación por campo
    var rules = {
      fName:    { el: document.getElementById('fName'),    err: document.getElementById('errName'),    test: function (v) { return v.trim().length >= 2; }, msg: 'Escribe al menos 2 caracteres.' },
      fEmail:   { el: document.getElementById('fEmail'),   err: document.getElementById('errEmail'),   test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, msg: 'Introduce un correo válido.' },
      fSubject: { el: document.getElementById('fSubject'), err: document.getElementById('errSubject'), test: function (v) { return v !== ''; }, msg: 'Elige un motivo.' },
      fMessage: { el: msgField,                            err: document.getElementById('errMessage'), test: function (v) { return v.trim().length >= 15; }, msg: 'Cuéntame un poco más (mín. 15 caracteres).' },
      fConsent: { el: document.getElementById('fConsent'), err: document.getElementById('errConsent'), test: function (v, f) { return f.checked; }, msg: 'Debes aceptar para continuar.' }
    };

    function show(field, ok, message) {
      field.el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      field.err.textContent = ok ? '' : message;
      field.err.classList.toggle('show', !ok);
    }

    function validateOne(name) {
      var f = rules[name];
      var val = f.el.type === 'checkbox' ? '' : f.el.value;
      var ok = f.test(val, f.el);
      show(f, ok, f.msg);
      return ok;
    }

    // Validación al salir de cada campo (feedback inmediato)
    Object.keys(rules).forEach(function (name) {
      var ev = rules[name].el.type === 'checkbox' ? 'change' : 'blur';
      rules[name].el.addEventListener(ev, function () { validateOne(name); });
    });

    function setStatus(text, kind) {
      status.textContent = text || '';
      status.className = 'form-status' + (kind ? ' ' + kind : '');
    }

    function buildMailto(mail, data) {
      var subject = '[Web AH] ' + data.motivo + ' — ' + data.nombre;
      var body = 'Nombre: ' + data.nombre +
                 '\nCorreo: ' + data.email +
                 '\nMotivo: ' + data.motivo +
                 '\n\n--- Mensaje ---\n' + data.mensaje;
      return 'mailto:' + mail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Trampa anti-spam: si el campo oculto tiene valor, es un bot.
      var hp = document.getElementById('fSite');
      if (hp && hp.value !== '') { setStatus('No se pudo enviar.', 'bad'); return; }

      // Validar todo; enfocar el primer error.
      var allOk = true, firstBad = null;
      Object.keys(rules).forEach(function (name) {
        var ok = validateOne(name);
        if (!ok && !firstBad) firstBad = rules[name].el;
        if (!ok) allOk = false;
      });
      if (!allOk) { setStatus('Revisa los campos marcados.', 'bad'); if (firstBad) firstBad.focus(); return; }

      var data = {
        nombre: document.getElementById('fName').value.trim(),
        email: document.getElementById('fEmail').value.trim(),
        motivo: document.getElementById('fSubject').value,
        mensaje: msgField.value.trim()
      };
      lastPayload = 'Nombre: ' + data.nombre + '\nCorreo: ' + data.email + '\nMotivo: ' + data.motivo + '\n\n' + data.mensaje;

      submitBtn.disabled = true;
      setStatus('Enviando…', '');

      // --- Envío AJAX real si hay endpoint configurado ---
      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: FORM_METHOD,
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          finish('Tu mensaje se ha enviado correctamente. Te responderé pronto.');
        }).catch(function () {
          submitBtn.disabled = false;
          setStatus('No se pudo enviar. Inténtalo de nuevo o escribe a mano.', 'bad');
        });
        return;
      }

      // --- Envío por correo (sin backend): abre el cliente con el mensaje redactado ---
      var mail = form.getAttribute('data-mail') || 'ah.correo@ejemplo.com';
      try {
        window.location.href = buildMailto(mail, data);
        finish('Se ha abierto tu cliente de correo con el mensaje redactado. Si no se abrió, cópialo con el botón de abajo.');
      } catch (err) {
        finish('Prepara tu mensaje: usa “Copiar mensaje” y pégalo en un correo a ' + mail + '.');
      }
    });

    function finish(text) {
      submitBtn.disabled = false;
      setStatus('', '');
      form.hidden = true;
      successMsg.textContent = text;
      success.hidden = false;
      success.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }

    // Copiar el mensaje redactado (respaldo)
    var copyMsg = document.getElementById('copyMessage');
    if (copyMsg) copyMsg.addEventListener('click', function () {
      if (!navigator.clipboard) { copyMsg.textContent = 'Copia manual'; return; }
      navigator.clipboard.writeText(lastPayload).then(function () {
        copyMsg.textContent = 'Copiado';
        setTimeout(function () { copyMsg.textContent = 'Copiar mensaje'; }, 2500);
      });
    });

    // Reiniciar
    var reset = document.getElementById('resetForm');
    if (reset) reset.addEventListener('click', function () {
      form.reset();
      Object.keys(rules).forEach(function (n) { show(rules[n], true, ''); });
      if (charCount) charCount.textContent = '0';
      success.hidden = true; form.hidden = false;
      document.getElementById('fName').focus();
    });
  }

  /* ---------- 14. Año en el pie ---------- */
  function initYear() { var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear(); }

  /* ---------- Arranque aislado ---------- */
  safe(initProgress);
  safe(initMenu);
  safe(initActiveNav);
  safe(initScrollSpy);
  safe(initTypewriter);
  safe(initReveal);
  safe(initScramble);
  safe(initConsole);
  safe(initCounters);
  safe(initTicker);
  safe(initLab);
  safe(initCopy);
  safe(initForm);
  safe(initYear);
})();