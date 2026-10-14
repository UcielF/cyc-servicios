/* ==========================================================================
   proyectos.js — Galería filtrable + lightbox (vanilla, sin librerías)
   C&C Servicios Integrales S.R.L
   Regla crítica: solo animar transform y opacity, nunca width/height/top/left
   ========================================================================== */

function initProyectos() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Si GSAP no cargó (CDN caído), se degrada igual que con movimiento reducido */
  const animate = !reducedMotion && typeof gsap !== "undefined";

  /* ======================================================================
     FILTRADO por categoría + colapso "Ver más" (3 filas)
     ====================================================================== */
  const grid      = document.querySelector(".proyectos-grid");
  const gridWrap  = document.querySelector(".proyectos-grid-wrap");
  const filters   = document.querySelectorAll(".proyectos-filter");
  const cards     = document.querySelectorAll(".project-card");
  const moreBtn   = document.querySelector(".proyectos-more__btn");
  const moreLabel = moreBtn && moreBtn.querySelector(".proyectos-more__label");

  const ROWS = 3;
  let activeCategory = "todos";
  let expanded = false;

  /* Columnas activas, leídas del grid-template-columns resuelto */
  function columns() {
    return getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
  }

  /* Muestra u oculta una card (con fade si animar === true) */
  function setShown(card, show, animar) {
    if (!animar) {
      card.style.display = show ? "" : "none";
      if (show) card.style.opacity = "";
      return;
    }
    gsap.killTweensOf(card);
    if (show) {
      card.style.display = "";
      gsap.fromTo(card,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", clearProps: "transform" }
      );
    } else {
      gsap.to(card, {
        opacity: 0, duration: 0.2, ease: "power2.in",
        onComplete() { card.style.display = "none"; },
      });
    }
  }

  /* Recalcula visibilidad combinando filtro + colapso a 3 filas */
  function update(animar) {
    const perView = columns() * ROWS;
    const limit = expanded ? Infinity : perView;
    let matchCount = 0;

    cards.forEach((card) => {
      const match = activeCategory === "todos" || card.dataset.category === activeCategory;
      const show = match && matchCount < limit;
      if (match) matchCount++;
      setShown(card, show, animar);
    });

    const hasMore = matchCount > perView;
    if (moreBtn) {
      moreBtn.hidden = !hasMore;
      moreBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      if (moreLabel) moreLabel.textContent = expanded ? "Ver menos" : "Ver más";
    }
    if (gridWrap) gridWrap.classList.toggle("is-collapsed", hasMore && !expanded);
  }

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((f) => {
        const active = f === btn;
        f.classList.toggle("proyectos-filter--active", active);
        f.setAttribute("aria-pressed", active ? "true" : "false");
      });
      activeCategory = btn.dataset.category;
      expanded = false;
      update(animate);
    });
  });

  if (moreBtn) {
    moreBtn.addEventListener("click", () => {
      expanded = !expanded;
      update(animate);
      /* Al colapsar, volver al inicio de la sección para no quedar colgado abajo */
      if (!expanded) {
        const section = document.getElementById("proyectos");
        if (section) section.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    });
  }

  /* Re-clampea cuando cambian las columnas (resize), sin animar */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => update(false), 150);
  }, { passive: true });

  /* Estado inicial: colapsado a 3 filas (la entrada la anima animations.js) */
  update(false);

  /* ======================================================================
     LIGHTBOX
     ====================================================================== */
  const lightbox = document.getElementById("proyecto-lightbox");
  if (!lightbox) return;

  const imgEl     = lightbox.querySelector(".lightbox__img");
  const figureEl  = lightbox.querySelector(".lightbox__figure");
  const counterEl = lightbox.querySelector(".lightbox__counter");
  const prevBtn   = lightbox.querySelector(".lightbox__nav--prev");
  const nextBtn   = lightbox.querySelector(".lightbox__nav--next");
  const closeBtn  = lightbox.querySelector(".lightbox__close");
  const closers   = lightbox.querySelectorAll("[data-close]");
  const triggers  = document.querySelectorAll(".project-card__trigger");

  let gallery     = [];
  let index       = 0;
  let isOpen      = false;
  let lastTrigger = null;

  /* Vuelca el estado actual (imagen, alt, contador) al DOM */
  function render() {
    const total = gallery.length;
    const item  = gallery[index];
    imgEl.src = item.src;
    imgEl.alt = item.alt;
    counterEl.textContent = `${index + 1} / ${total}`;
    lightbox.classList.toggle("lightbox--single", total <= 1);
  }

  function openLightbox(card, trigger) {
    lastTrigger = trigger;

    /* La galería recorre toda la categoría activa (aunque esté colapsada),
       una entrada por foto, arrancando en la card clickeada */
    const inCat = [...cards].filter((c) => activeCategory === "todos" || c.dataset.category === activeCategory);
    gallery = inCat.map((c) => {
      const im = c.querySelector(".project-card__media img");
      /* data-full = webp grande para el visor; si falta, cae a la miniatura */
      return { src: c.dataset.full || im.currentSrc || im.src, alt: im.alt || "Proyecto" };
    });
    index = Math.max(0, inCat.indexOf(card));
    render();

    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    isOpen = true;
    closeBtn.focus();

    if (!animate) {
      lightbox.style.opacity = "1";
      return;
    }
    gsap.killTweensOf(lightbox);
    gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
  }

  function closeLightbox() {
    isOpen = false;
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus();

    if (!animate) {
      lightbox.hidden = true;
      lightbox.style.opacity = "0";
      return;
    }
    gsap.killTweensOf(lightbox);
    gsap.to(lightbox, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete() { lightbox.hidden = true; },
    });
  }

  /* Navega step posiciones (cíclico) con cross-fade de la imagen */
  function go(step) {
    const total = gallery.length;
    if (total < 2) return;
    index = (index + step + total) % total;

    if (!animate) {
      render();
      return;
    }
    gsap.killTweensOf(imgEl);
    gsap.to(imgEl, {
      opacity: 0,
      duration: 0.12,
      ease: "power1.in",
      onComplete() {
        render();
        gsap.fromTo(imgEl, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power1.out" });
      },
    });
  }

  /* Focus-trap: mantiene el tabulado dentro de los controles visibles */
  function trapFocus(e) {
    const focusables = [closeBtn, prevBtn, nextBtn].filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;

    const first = focusables[0];
    const last  = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* --- Eventos ------------------------------------------------------------ */
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openLightbox(trigger.closest(".project-card"), trigger);
    });
  });

  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));
  closers.forEach((el) => el.addEventListener("click", closeLightbox));

  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    switch (e.key) {
      case "Escape":     closeLightbox(); break;
      case "ArrowLeft":  go(-1); break;
      case "ArrowRight": go(1); break;
      case "Tab":        trapFocus(e); break;
    }
  });

  /* Swipe táctil sobre la imagen (mobile) */
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 50;

  figureEl.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  figureEl.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);   /* arrastrar a la izquierda → siguiente */
    }
  }, { passive: true });
}
