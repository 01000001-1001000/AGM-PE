/* =========================================================
   contact.js — formulario de contacto REAL con 3 canales
   ---------------------------------------------------------
   RECORRIDO DEL DATO (para explicarlo en la defensa):
     1. La persona escribe → validamos en el navegador.
     2. Canal A (principal): fetch POST (JSON) a Formspree
        → Formspree valida, filtra spam y REENVÍA a mi correo.
     3. Canal B: abre un ISSUE de GitHub prellenado y etiquetado
        "contacto" en mi repositorio → me llega notificación.
     4. Canal C (plan B sin servidor): abre el cliente de correo
        (mailto) con el mensaje ya redactado.
     5. La persona ve un panel de éxito con una REFERENCIA
        (AH-XXXX) como acuse de recibo, y puede copiar el mensaje.
   Seguridad: campo trampa (honeypot) anti-bots, límite de tiempo
   (10 s) y borrador guardado en sessionStorage.
   ========================================================= */
import { CONFIG, GH } from "./config.js";

const DRAFT = "ah-contact-draft";

export function initContact() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const success = $("formSuccess"), successMsg = $("successMsg");
  const status = $("formStatus"), submitBtn = $("submitBtn"), issueBtn = $("issueBtn");
  const msgField = $("fMessage"), charCount = $("charCount");
  const mailTo = form.dataset.mail || CONFIG.MAIL;
  let lastPayload = "";

  /* ---------- Contador de caracteres ---------- */
  const updCount = () => { charCount.textContent = msgField.value.length; };
  msgField.addEventListener("input", updCount);

  /* ---------- Reglas de validación (un objeto por campo) ---------- */
  const rules = {
    fName:    { el: $("fName"),    err: $("errName"),    ok: (v) => v.trim().length >= 2, msg: "Escribe al menos 2 caracteres." },
    fEmail:   { el: $("fEmail"),   err: $("errEmail"),   ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: "Introduce un correo válido." },
    fSubject: { el: $("fSubject"), err: $("errSubject"), ok: (v) => v !== "", msg: "Elige un motivo." },
    fMessage: { el: msgField,      err: $("errMessage"), ok: (v) => v.trim().length >= 15, msg: "Cuéntame un poco más (mín. 15 caracteres)." },
    fConsent: { el: $("fConsent"), err: $("errConsent"), ok: (_, el) => el.checked, msg: "Debes aceptar para continuar." },
  };

  /** Marca/limpia el error de un campo (aria-invalid + texto). */
  function paint(f, ok) {
    f.el.setAttribute("aria-invalid", String(!ok));
    f.err.textContent = ok ? "" : f.msg;
    f.err.classList.toggle("show", !ok);
  }
  function check(name) {
    const f = rules[name];
    const ok = f.ok(f.el.type === "checkbox" ? "" : f.el.value, f.el);
    paint(f, ok);
    return ok;
  }
  // Validación al salir de cada campo (feedback inmediato).
  Object.keys(rules).forEach((n) => {
    const ev = rules[n].el.type === "checkbox" ? "change" : "blur";
    rules[n].el.addEventListener(ev, () => check(n));
  });

  /** Valida todo y devuelve los datos (o null si hay errores). */
  function collect() {
    if ($("fSite").value !== "") return null;            // honeypot: un bot rellenó el campo oculto
    let first = null;
    Object.keys(rules).forEach((n) => { if (!check(n) && !first) first = rules[n].el; });
    if (first) { setStatus("Revisa los campos marcados.", "bad"); first.focus(); return null; }
    return {
      nombre: $("fName").value.trim(), email: $("fEmail").value.trim(),
      motivo: $("fSubject").value, mensaje: msgField.value.trim(),
      ref: "AH-" + Math.random().toString(36).slice(2, 6).toUpperCase(),  // acuse de recibo
    };
  }

  function setStatus(text, kind) { status.textContent = text || ""; status.className = "form-status" + (kind ? " " + kind : ""); }
  const asText = (d) => `Ref: ${d.ref}\nNombre: ${d.nombre}\nCorreo: ${d.email}\nMotivo: ${d.motivo}\n\n${d.mensaje}`;

  /** Muestra el panel de éxito y limpia el borrador. */
  function finish(text, data) {
    lastPayload = asText(data);
    sessionStorage.removeItem(DRAFT);
    submitBtn.disabled = false; issueBtn.disabled = false; setStatus("");
    form.hidden = true;
    successMsg.textContent = text + " Referencia: " + data.ref + ".";
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- Canal A: Formspree (fetch + timeout) ---------- */
  /*async function sendAjax(data) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(CONFIG.FORM_ENDPOINT, {
        method: "POST", signal: ctrl.signal,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        // _replyto y _subject son campos especiales que Formspree entiende.
        body: JSON.stringify({ ...data, _replyto: data.email, _subject: `[Web AH] ${data.motivo} — ${data.nombre}` }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
    } finally { clearTimeout(timer); }
  }*/

    /* ---------- Canal A: Formspree (fetch + timeout) ---------- */
  async function sendAjax(data) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      // AQUÍ ESTÁ EL CAMBIO: Usamos form.action en lugar de CONFIG.FORM_ENDPOINT
      const res = await fetch(form.action, {
        method: "POST", signal: ctrl.signal,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, _replyto: data.email, _subject: `[Web AH] ${data.motivo} — ${data.nombre}` }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
    } finally { clearTimeout(timer); }
  }

  /* ---------- Canal C: mailto ---------- */
  function mailtoUrl(d) {
    const subject = `[Web AH] ${d.motivo} — ${d.nombre}`;
    return `mailto:${mailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(asText(d))}`;
  }

  /* ---------- Envío principal ---------- */
  /*form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = collect(); if (!data) return;
    submitBtn.disabled = true; issueBtn.disabled = true; setStatus("Enviando…");
    if (CONFIG.FORM_ENDPOINT) {
      try { await sendAjax(data); finish("Tu mensaje se ha enviado correctamente. Te responderé pronto.", data); }
      catch (err) {
        submitBtn.disabled = false; issueBtn.disabled = false;
        setStatus("No se pudo enviar. Reinténtalo o usa el botón de GitHub / correo.", "bad");
      }
    } else {
      // Sin endpoint configurado: plan B (mailto).
      window.location.href = mailtoUrl(data);
      finish("Se ha abierto tu cliente de correo con el mensaje redactado. Si no se abrió, cópialo abajo.", data);
    }
  });*/

  /* ---------- Envío principal ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = collect(); if (!data) return;
    submitBtn.disabled = true; issueBtn.disabled = true; setStatus("Enviando…");
    
    // CAMBIO AQUÍ: comprobamos si el form tiene action
    if (form.action) {
      try { await sendAjax(data); finish("Tu mensaje se ha enviado correctamente. Te responderé pronto.", data); }
      catch (err) {
        submitBtn.disabled = false; issueBtn.disabled = false;
        setStatus("No se pudo enviar. Reinténtalo o usa el botón de GitHub / correo.", "bad");
      }
    } else {

  /* ---------- Canal B: issue de GitHub etiquetado ---------- */
  issueBtn.addEventListener("click", () => {
    const data = collect(); if (!data) return;
    const url = `${GH.repo}/issues/new?labels=${encodeURIComponent("contacto")}` +
      `&title=${encodeURIComponent(`[${data.motivo}] ${data.nombre} (${data.ref})`)}` +
      `&body=${encodeURIComponent(data.mensaje + "\n\n— " + data.nombre)}`;   // NO incluimos el email: los issues son públicos
    window.open(url, "_blank", "noopener");
    finish("Se abrió GitHub con tu mensaje prellenado; pulsa 'Submit new issue' allí.", data);
  });

  /* ---------- Borrador en sessionStorage ---------- */
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT) || "null");
    if (d) { $("fName").value ||= d.n || ""; $("fEmail").value ||= d.e || ""; msgField.value ||= d.m || ""; }
  } catch (e) {}
  updCount();
  form.addEventListener("input", () => {
    try { sessionStorage.setItem(DRAFT, JSON.stringify({ n: $("fName").value, e: $("fEmail").value, m: msgField.value })); } catch (e) {}
  });

  /* ---------- Copiar mensaje / reiniciar ---------- */
  $("copyMessage").addEventListener("click", async (ev) => {
    try { await navigator.clipboard.writeText(lastPayload); ev.target.textContent = "Copiado"; }
    catch (e) { ev.target.textContent = "Copia manual"; }
    setTimeout(() => (ev.target.textContent = "Copiar mensaje"), 2500);
  });
  $("resetForm").addEventListener("click", () => {
    form.reset(); Object.keys(rules).forEach((n) => paint(rules[n], true)); updCount();
    success.hidden = true; form.hidden = false; $("fName").focus();
  });
}
