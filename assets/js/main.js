/* ==========================================================================
   main.js — Inicialización principal
   C&C Servicios Integrales S.R.L
   ========================================================================== */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  initNav();

  if (!prefersReducedMotion) {
    initAnimations();
  }
});
