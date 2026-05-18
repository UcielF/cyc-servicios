/* ==========================================================================
   main.js — Inicialización principal
   C&C Servicios Integrales S.R.L
   ========================================================================== */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initContact();

  if (!prefersReducedMotion) {
    initAnimations();
  }
});

function initContact() {
  const form = document.querySelector(".contacto-form");
  if (!form) return;

  const statusEl  = form.querySelector(".form-status");
  const submitBtn = form.querySelector(".contacto-form__submit");
  const originalLabel = submitBtn.textContent;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";
    statusEl.hidden = true;

    try {
      const res  = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(form),
      });
      const data = await res.json();

      if (data.success) {
        statusEl.textContent = "¡Mensaje enviado! Te contactamos a la brevedad.";
        statusEl.className   = "form-status form-status--success";
        form.reset();
      } else {
        throw new Error(data.message);
      }
    } catch {
      statusEl.textContent = "Hubo un error al enviar. Intentá de nuevo o escribinos por WhatsApp.";
      statusEl.className   = "form-status form-status--error";
    } finally {
      statusEl.hidden      = false;
      submitBtn.disabled   = false;
      submitBtn.textContent = originalLabel;
    }
  });
}
