/* ==========================================================================
   nav.js — Navbar fija + overlay menu fullscreen (GSAP)
   C&C Servicios Integrales S.R.L
   ========================================================================== */

function initNav() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header    = document.querySelector(".site-header");
  const toggle    = document.querySelector(".navbar__toggle");
  const overlay   = document.getElementById("nav-overlay");
  const navLinks  = overlay.querySelectorAll(".nav-overlay__link");
  const contactEl = overlay.querySelector(".nav-overlay__contact");

  let isOpen = false;

  /* --- Apertura ----------------------------------------------------------- */
  function openMenu() {
    isOpen = true;

    overlay.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar menú de navegación");
    document.body.style.overflow = "hidden";

    /* Foco al primer link (accesibilidad) */
    navLinks[0].focus();

    if (reducedMotion) {
      gsap.set(overlay,   { opacity: 1 });
      gsap.set(navLinks,  { x: 0, opacity: 1 });
      gsap.set(contactEl, { opacity: 1 });
      return;
    }

    gsap.killTweensOf([overlay, navLinks, contactEl]);

    gsap.to(overlay, {
      opacity: 1,
      duration: 0.35,
      ease: "power2.out",
    });

    gsap.fromTo(navLinks,
      { x: -35, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: "power3.out", delay: 0.1 }
    );

    gsap.fromTo(contactEl,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", delay: 0.52 }
    );
  }

  /* --- Cierre ------------------------------------------------------------- */
  function closeMenu() {
    isOpen = false;

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú de navegación");
    document.body.style.overflow = "";

    /* Foco de vuelta al botón toggle */
    toggle.focus();

    if (reducedMotion) {
      gsap.set(overlay, { opacity: 0 });
      overlay.hidden = true;
      return;
    }

    gsap.killTweensOf([overlay, navLinks, contactEl]);

    gsap.to(navLinks,  { opacity: 0, x: -15, duration: 0.2, stagger: 0.04, ease: "power2.in" });
    gsap.to(contactEl, { opacity: 0, duration: 0.2, ease: "power2.in" });

    gsap.to(overlay, {
      opacity: 0,
      duration: 0.3,
      delay: 0.12,
      ease: "power2.in",
      onComplete() {
        overlay.hidden = true;
      },
    });
  }

  /* --- Eventos ------------------------------------------------------------ */
  toggle.addEventListener("click", () => {
    if (isOpen) closeMenu();
    else openMenu();
  });

  /* Cerrar al hacer click en cualquier link del overlay */
  navLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  /* Cerrar con tecla Escape */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closeMenu();
  });

  /* --- Scroll: estado de la navbar --------------------------------------- */
  const SCROLL_THRESHOLD = 50;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add("site-header--scrolled");
    } else {
      header.classList.remove("site-header--scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); /* estado inicial */
}
