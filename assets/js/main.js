/* ==========================================================================
   main.js — Inicialización principal
   C&C Servicios Integrales S.R.L
   ========================================================================== */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initContact();
  initServicios();

  if (!prefersReducedMotion) {
    initAnimations();
  }
});

/* ==========================================================================
   Modal de servicios — abre el contenido de la tarjeta al centro (tipo modal)
   ========================================================================== */
function initServicios() {
  const modal = document.getElementById("servicio-modal");
  if (!modal) return;

  const dialog   = modal.querySelector(".servicio-modal__dialog");
  const mediaImg = modal.querySelector(".servicio-modal__media img");
  const titleEl  = modal.querySelector(".servicio-modal__title");
  const descEl   = modal.querySelector(".servicio-modal__desc");
  const closeEl  = modal.querySelector(".servicio-modal__close");
  const closers  = modal.querySelectorAll("[data-close]");
  const triggers = document.querySelectorAll(".service-card__trigger");

  let isOpen = false;
  let lastTrigger = null;

  function openModal(card, trigger) {
    lastTrigger = trigger;

    const img   = card.querySelector(".service-card__media img");
    const title = card.querySelector(".service-card__title").textContent;
    const desc  = card.querySelector(".service-card__desc").textContent;

    mediaImg.src       = img.currentSrc || img.src;
    mediaImg.alt       = img.alt || "";
    titleEl.textContent = title;
    descEl.textContent  = desc;

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    isOpen = true;
    closeEl.focus();

    if (prefersReducedMotion) {
      gsap.set(modal, { opacity: 1 });
      gsap.set(dialog, { scale: 1, opacity: 1, y: 0 });
      return;
    }

    gsap.killTweensOf([modal, dialog]);
    gsap.to(modal, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(dialog,
      { scale: 0.92, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
    );
  }

  function closeModal() {
    isOpen = false;
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus();

    if (prefersReducedMotion) {
      gsap.set(modal, { opacity: 0 });
      modal.hidden = true;
      return;
    }

    gsap.killTweensOf([modal, dialog]);
    gsap.to(dialog, { scale: 0.96, opacity: 0, duration: 0.2, ease: "power2.in" });
    gsap.to(modal, {
      opacity: 0,
      duration: 0.25,
      delay: 0.05,
      ease: "power2.in",
      onComplete() { modal.hidden = true; },
    });
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openModal(trigger.closest(".service-card"), trigger);
    });
  });

  closers.forEach((el) => el.addEventListener("click", closeModal));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closeModal();
  });
}

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
