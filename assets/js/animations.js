/* ==========================================================================
   animations.js — Animaciones GSAP + ScrollTrigger
   C&C Servicios Integrales S.R.L
   Regla crítica: solo animar transform y opacity, nunca width/height/top/left
   ========================================================================== */

function initAnimations() {
  /* La guardia prefers-reduced-motion se maneja en main.js antes de llamar
     esta función, por lo que aquí se puede asumir que el usuario acepta movimiento */

  gsap.registerPlugin(ScrollTrigger);

  /* --- Hero: fade-in escalonado al cargar ---------------------------------- */
  gsap.fromTo(
    [".hero__eyebrow", ".hero__title", ".hero__subtitle", ".hero__actions"],
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, stagger: 0.14, ease: "power3.out", delay: 0.2 }
  );

  /* --- Hero: parallax del fondo -------------------------------------------- */
  gsap.to(".hero__bg-img", {
    y: "10%",
    ease: "none",
    scrollTrigger: {
      trigger: ".section--hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  /* --- Hero: ocultar scroll indicator al bajar ----------------------------- */
  gsap.to(".hero__scroll", {
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".section--hero",
      start: "20% top",
      end: "40% top",
      scrub: true,
    },
  });

  /* --- Servicios: header + cards stagger desde abajo --------------------- */
  gsap.fromTo(".section--servicios .section-header",
    { y: 30, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: ".section--servicios", start: "top 80%" },
    }
  );

  gsap.fromTo(".service-card",
    { y: 50, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".servicios-grid", start: "top 82%" },
    }
  );
  /* --- La Empresa: parallax fondo ----------------------------------------- */
  /* yPercent: -15 → +15 (simétrico): imagen se desplaza ±15% de su propia
     altura mientras pasa por el viewport. Con height:150% en CSS la imagen
     siempre cubre la sección sin dejar huecos en ningún extremo. */
  gsap.fromTo(".empresa__bg-img",
    { yPercent: -15 },
    {
      yPercent: 15,
      ease: "none",
      scrollTrigger: {
        trigger: ".section--empresa",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );

  /* --- La Empresa: intro -------------------------------------------------- */
  gsap.fromTo(
    [".empresa__intro .section-header", ".empresa__manifesto"],
    { y: 35, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: "power3.out",
      scrollTrigger: { trigger: ".section--empresa", start: "top 78%" },
    }
  );

  /* --- La Empresa: stats counters ----------------------------------------- */
  document.querySelectorAll(".empresa-stat__number[data-target]").forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";
    const proxy  = { val: 0 };

    gsap.to(proxy, {
      val: target,
      duration: 2.2,
      ease: "power2.out",
      onUpdate() { el.textContent = Math.round(proxy.val) + suffix; },
      scrollTrigger: {
        trigger: ".empresa__stats",
        start: "top 82%",
        once: true,
      },
    });
  });

  /* Stats fila: fade-in escalonado */
  gsap.fromTo(".empresa-stat",
    { y: 30, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".empresa__stats", start: "top 82%" },
    }
  );

  /* --- La Empresa: split — cuerpo de texto --------------------------------- */
  gsap.fromTo(".empresa__split-body",
    { x: 40, opacity: 0 },
    {
      x: 0, opacity: 1, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: ".empresa__split", start: "top 75%" },
    }
  );

  gsap.fromTo(".empresa__valor",
    { y: 20, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out",
      scrollTrigger: { trigger: ".empresa__valores", start: "top 85%" },
    }
  );

  /* --- Contacto ------------------------------------------------------------ */
  gsap.fromTo(".section--contacto .section-header",
    { y: 30, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: ".section--contacto", start: "top 80%" },
    }
  );

  gsap.fromTo(".contacto-form-wrap",
    { x: -40, opacity: 0 },
    {
      x: 0, opacity: 1, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: ".contacto-grid", start: "top 80%" },
    }
  );

  gsap.fromTo(".contacto-info",
    { x: 40, opacity: 0 },
    {
      x: 0, opacity: 1, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: ".contacto-grid", start: "top 80%" },
    }
  );

  /* --- Footer -------------------------------------------------------------- */
  gsap.fromTo(
    [".footer-brand", ".footer-nav", ".footer-contact"],
    { y: 24, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".site-footer", start: "top 90%" },
    }
  );
}
