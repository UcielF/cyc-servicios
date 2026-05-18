# C&C Servicios Integrales S.R.L — Sitio Institucional

## Contexto del cliente

Empresa argentina de servicios eléctricos e infraestructura (Santa Fe).
Trabajan en alta/media tensión, luminarias viales, postes, transformadores,
tendidos subterráneos, infraestructura industrial/rural. Maquinaria propia.

**Datos:**
- Razón social: C&C Servicios Integrales S.R.L
- Teléfonos: +54 9 3497 65-7453 / +54 9 11 6799-5686
- Dirección: [calle] 55, 1° piso, Santa Fe
- Instagram: @hernan_calvi

## Stack

- HTML5 semántico + CSS3 custom properties + JavaScript vanilla
- GSAP 3.12.5 + ScrollTrigger — CDN jsDelivr, versión fija
- Sin build tools, sin npm en producción
- Deploy: Hostinger vía FTP/rsync desde Fedora Linux

## Design System

**Patrón:** Hero-Centric + Trust & Authority
**Estilo:** Dark Mode OLED + Motion-Driven

### Paleta
| Variable              | Valor                      | Uso                       |
|-----------------------|----------------------------|---------------------------|
| `--color-bg`          | `#0d0d0d`                  | Fondo base (OLED black)   |
| `--color-bg-alt`      | `#1a1a1a`                  | Cards, secciones alternas |
| `--color-accent`      | `#F5C400`                  | CTA, hover, glow          |
| `--color-accent-dim`  | `rgba(245,196,0,0.12)`     | Glow sutil de fondo       |
| `--color-text`        | `#FFFFFF`                  | Texto principal           |
| `--color-text-muted`  | `#B3B3B3`                  | Texto secundario          |
| `--color-border`      | `rgba(255,255,255,0.08)`   | Bordes sutiles            |

### Tipografía
- Títulos: `Bebas Neue` (Google Fonts)
- Cuerpo: `Inter` (Google Fonts, opsz variable)

### Z-Index (no usar valores fuera de esta escala)
| Variable          | Valor | Uso                         |
|-------------------|-------|-----------------------------|
| `--z-base`        | 10    | Cards con elevación         |
| `--z-sticky`      | 20    | (reservado)                 |
| `--z-overlay-bg`  | 30    | Overlay menu background     |
| `--z-overlay`     | 50    | Header navbar (siempre top) |
| `--z-toast`       | 100   | Notificaciones              |

### Animaciones — reglas obligatorias
- Solo animar `transform` y `opacity` — nunca `width/height/top/left`
- `ease-out` al entrar, `ease-in` al salir
- `prefers-reduced-motion`: siempre verificar antes de iniciar animaciones
- La detección se hace con `window.matchMedia("(prefers-reduced-motion: reduce)")`

## Estructura de archivos

```
cyc-servicios/
├── index.html                  single page (todas las secciones)
├── assets/
│   ├── css/
│   │   ├── variables.css       custom properties del design system
│   │   ├── base.css            reset moderno + estilos globales
│   │   ├── components.css      navbar, overlay, botones, cards, etc.
│   │   └── sections.css        estilos por sección (#hero, #servicios, etc.)
│   ├── js/
│   │   ├── main.js             init + detección prefers-reduced-motion
│   │   ├── nav.js              navbar fija + overlay fullscreen GSAP
│   │   └── animations.js       ScrollTrigger + animaciones por sección
│   ├── img/
│   │   ├── hero/               fotografía real del cliente
│   │   ├── servicios/
│   │   └── proyectos/
│   └── icons/                  SVGs inline o archivos .svg
```

## Secciones del single page

| ID          | Contenido                                      | Estado   |
|-------------|------------------------------------------------|----------|
| `#inicio`   | Hero fullscreen, tagline, CTA, parallax        | Etapa 3  |
| `#servicios`| Grid 4 cards, hover glow amarillo, stagger     | Etapa 4  |
| `#proyectos`| Galería filtrable, lightbox, lazy loading      | Etapa 5  |
| `#nosotros` | Stats animados, texto institucional            | Etapa 6  |
| `#contacto` | Formulario (Formspree/Web3Forms), datos, mapa  | Etapa 6  |
| `footer`    | Logo, legal, links, redes                      | Etapa 7  |

## Flujo de trabajo

**Trabajamos etapa por etapa. Revisar diffs antes de aplicar. Sin commits automáticos.**

| Etapa | Contenido                              | Estado     |
|-------|----------------------------------------|------------|
| 1     | HTML base + variables CSS + reset      | ✅ Completa |
| 2     | Navbar + overlay menu (GSAP)           | ✅ Completa |
| 3     | Hero section                           | Pendiente  |
| 4     | Sección Servicios                      | Pendiente  |
| 5     | Sección Proyectos                      | Pendiente  |
| 6     | Contacto + Footer                      | Pendiente  |
| 7     | Responsive polish + a11y + performance | Pendiente  |

## Convenciones de código

- Indentación: 2 espacios
- JS: comillas dobles
- Nombres: camelCase (variables/funciones), kebab-case (archivos/clases CSS)
- Metodología CSS: BEM para componentes
- Comentarios: en español
- Sin emojis — iconos solo como SVG (Lucide o Heroicons)
- Commits: mensajes en español

## Notas técnicas importantes

- El `<header class="site-header">` tiene `z-index: var(--z-overlay)` (50) para quedar
  siempre encima del overlay (z-index 30). No reducir ese valor.
- La barra hamburger → X usa `translateY(8px)` exacto porque `gap: 6px` + `height: 2px` = 8px.
- El overlay usa atributo `hidden` en HTML. JS lo gestiona con `overlay.hidden = true/false`.
- El `body` recibe `overflow: hidden` mientras el overlay está abierto.
- Formulario de contacto: integrar con Formspree o Web3Forms (sin backend).
- Imágenes: WebP con `<picture>` y `loading="lazy"` para secciones bajo el fold.
