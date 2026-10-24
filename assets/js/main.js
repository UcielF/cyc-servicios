/* ==========================================================================
   main.js — Inicialización principal
   C&C Servicios Integrales S.R.L
   ========================================================================== */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initContact();
  initServicios();
  initProyectos();

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

  const dialog     = modal.querySelector(".servicio-modal__dialog");
  const mediaFigure = modal.querySelector(".servicio-modal__media");
  const mediaImg   = modal.querySelector(".servicio-modal__media img");
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

    // La tarjeta puede no tener imagen todavía (espacio reservado): ocultar el media del modal
    if (img) {
      mediaImg.src = img.currentSrc || img.src;
      mediaImg.alt = img.alt || "";
      mediaFigure.hidden = false;
    } else {
      mediaImg.removeAttribute("src");
      mediaImg.alt = "";
      mediaFigure.hidden = true;
    }

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

/* ==========================================================================
   Formulario de contacto — arma un mensaje y abre WhatsApp
   ========================================================================== */
function initContact() {
  const form = document.querySelector(".contacto-form");
  if (!form) return;

  const whatsappNumber = "5491167995686";

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre  = form.nombre.value.trim();
    const email   = form.email.value.trim();
    const mensaje = form.mensaje.value.trim();

    const lineas = ["Hola, los contacto desde el sitio web.", `Nombre: ${nombre}`];
    if (email) lineas.push(`Email: ${email}`);
    lineas.push(`Mensaje: ${mensaje}`);

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lineas.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });
}
