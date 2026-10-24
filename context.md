# Contexto de trabajo — C&C Servicios Integrales

---

## Sesión 2026-10-23 — Grid de Servicios, contenido/OG, Proyectos y Deploy

> Pusheado a `origin/main` (commits `316a5be` + `732459e`) — ver "Estado git" al final.

### 1. Rediseño de Servicios: carrusel → grid 3+2 (bordes rectos)

Se descartó el carrusel marquee (intento de esta misma sesión, nunca commiteado como
final) y Servicios volvió a ser un **grid**, ahora con layout 3+2, tarjetas del mismo
tamaño y bordes rectos.

- **Estructura (`index.html`)**: las 5 `.service-card` quedaron en un único
  `.servicios-grid` (se eliminó el doble wrapper `.servicios-marquee`/`.servicios-track`).
  Orden: 1) Media y Baja Tensión · 2) Alumbrado Público y Mantenimiento ·
  3) Construcción y Movimiento de Suelo · 4) Redes Cloacales e Hídricas ·
  5) Obras Viales y Ciclovías con Cordón Cuneta.
- **CSS (`sections.css`)**, mobile-first:
  - Mobile (<640px): 1 columna.
  - Tablet (640–1023px): `repeat(2, 1fr)`; la 5ª card sola y centrada
    (`justify-self: center; width: 100%`).
  - Desktop (≥1024px): `repeat(6, 1fr)`, cada card `grid-column: span 2` (3 arriba),
    y `nth-child(4) → 2 / 4` + `nth-child(5) → 4 / 6` centradas en la fila 2.
  - `.service-card`: sin `flex/width/margin-right`, `border-radius: 0` (bordes rectos),
    `gap: --space-6`, sin `overflow: hidden` en el contenedor. Se conservó el hover
    (elevación + sombra) y la estructura interna de la card.
- **JS**: se **eliminó** `initServiciosMarquee()` de `main.js` (clonado de cards +
  `--servicios-scroll-duration`). En `animations.js` la entrada al scroll pasó a
  **stagger real** sobre `.section--servicios .service-card` (trigger `.servicios-grid`),
  con `clearProps: "transform"` para no pisar el hover.

#### Imágenes de Servicios (nombre = servicio)
- Renombradas a su servicio: `media-baja-tension.jpeg`, `alumbrado-mantenimiento.jpeg`,
  `movimiento-suelo.jpeg`, `obras-viales.jpeg`. `ducto2.jpeg` se mantiene para "Redes
  Cloacales e Hídricas" (sin imagen propia aún). Borradas `transformador.jpg`,
  `servicio2.jpg`, `tendidos-subterraneos.jpeg`.
- La 5ª card ("Obras Viales") pasó de **placeholder "Imagen próximamente"** a foto real
  (`obras-viales.jpeg`); se eliminó el CSS del placeholder.
- Pendiente: `movimiento-suelo.jpeg` pesa ~730 KB; servicios siguen en JPEG (no WebP).

#### Textos — tagline unificado
Frase única **"Obras viales, civiles, eléctricas y servicios urbanos e industriales."**
en: subtítulo del hero, `.footer-tagline`, `meta[name="description"]` y `og:description`
(estas dos prefijadas con "Desarrollo de Infraestructura Integral —").

#### Open Graph / preview de WhatsApp
- Agregados `og:url` (`https://cycservicios.com.ar/`), `og:image`
  (`https://cycservicios.com.ar/assets/img/og-image.png`, URL absoluta),
  `og:image:width`/`height` (1200×630) y `og:image:alt`.
- Generada `assets/img/og-image.png` (1200×630, "C&C" blanco sobre `#0d0d0d`, réplica
  del logo del header; Bebas Neue bajada de `google/fonts`). El preview recién funciona
  **tras deployar**; WhatsApp cachea → refrescar con el debugger de Facebook.

#### Proyectos — filtros, imágenes limpias y altas/bajas
- Filtros renombrados (solo etiqueta; `data-category` intactos, no rompe el filtrado):
  "Cordones y Veredas" → **"Cordon Cuneta y Ciclovía"**, "Cableado Subterráneo" → **"Cloacas"**.
- **Imágenes limpias**: se quitaron los 64 `.project-card__badge` (etiqueta sobre la foto)
  + su CSS. Queda solo el overlay con ícono de lupa al hover.
- Altas/bajas: borradas `industrial-12` y `vialidad-06` (cards quitadas); `media-tension-09`
  reemplazada por foto nueva + agregada `media-tension-10`; agregadas `vialidad-18`…`23`.
  Conversión a WebP con ImageMagick (full ≤1280 q80 + thumb ≤800); JPEG crudos de WhatsApp borrados.
- **Conteos nuevos**: vialidad **22** (hueco en el `06` → 01-05, 07-23), media-tension **10**,
  subterraneo **26**, industrial **11**.

#### Empresa — métricas
Reducidas a **3** y centradas: `10+` años de experiencia · `100+` proyectos realizados ·
`100%` confiabilidad. CSS de 4 → 3 columnas (desktop `repeat(3, 1fr)`, mobile 1 col apilada;
divisores con `:not(:last-child)`). El manifiesto pasó de "Más de 5 años" a
"Más de 10 años" (commit `732459e`).

### 2. Despliegue a Hostinger (rsync sobre SSH)

Se armó el flujo de deploy para el sitio estático. Verificado por SSH.

- **`deploy.sh`** (nuevo, ejecutable): rsync incremental sobre SSH. Flags
  `--dry-run`, `--delete` (espejo, opt-in), `-y/--yes`, `--help`. Pide confirmación
  antes de publicar. Excluye todo lo de desarrollo (`.git`, `*.md`, `deploy.*`,
  `.gitkeep`, `.gstack`, `.claude`, PSD/AI/FIG, etc.). **No borra** por defecto.
- **`deploy.env.example`** (nuevo, versionado): plantilla de config.
- **`deploy.env`** (nuevo, **gitignored**): datos reales de conexión.
- **`.gitignore`**: se agregó `deploy.env` / `deploy.env.local`.

**Datos de Hostinger:** host, usuario, puerto SSH, web root y clave SSH viven en
`deploy.env` (gitignored, **no sube a git**); plantilla con instrucciones en
`deploy.env.example`. Notas operativas (sin exponer la conexión):
- Cuenta **compartida** con otros proyectos del mismo servidor Hostinger.
- La autenticación va por clave SSH ya configurada (ver `deploy.env`). Si algún alias
  de `~/.ssh/config` pide contraseña, es porque esa clave no está autorizada en el server.
- Estado del server (al 2026-10-23): la carpeta del dominio existe pero su `public_html`
  solo tenía `default.php` (placeholder de Hostinger) → **el sitio aún no se desplegó**.

Deploy: `./deploy.sh --dry-run` para simular, `./deploy.sh` para publicar.

### 3. Estado git

Todo lo de esta sesión (incluido el setup de deploy) quedó en `316a5be`
("modificacion de servicios, galeria de proyectos"), con un follow-up `732459e`
("10años": manifiesto de Empresa "Más de 5 años" → "Más de 10 años"). Ambos
**pusheados** a `origin/main`. (`deploy.env` sigue gitignored.)

---

## Sesión 2026-10-14 — Sección Proyectos (commit `c5073fe`, pusheado a `origin/main`)

### 1. Sección "Proyectos Realizados" (#proyectos)
Se reemplazó el placeholder por la sección real, **dentro de `index.html`** (single-page,
se descartó la idea de una página aparte).

- **Grid filtrable** por categoría con pills:
  `Todos · Cordones y Veredas (vialidad) · Media Tensión (media-tension) ·
  Cableado Subterráneo (subterraneo) · Infraestructura Industrial (industrial)`.
  El filtrado lee `data-category` en cada `.project-card`.
- **Modelo "una card por foto"**: cada foto es una card (foto + badge de categoría +
  overlay con ícono expand al hover). Sin título/meta porque no hay datos reales por obra.
- **Lightbox vanilla** (sin librerías): prev/next cíclico, contador "n / N", cierre con
  Escape / backdrop / botón, flechas de teclado, swipe táctil y focus-trap. Recorre toda la
  categoría activa (aunque esté colapsada).

### 2. Colapso a 3 filas + "Ver más"
- La grilla arranca mostrando **3 filas** (9 desktop / 6 tablet / 3 mobile, según columnas).
- Botón **"Ver más" / "Ver menos"** que expande/colapsa todo.
- **Difuminado inferior** (`.proyectos-grid-fade`): gradiente al fondo + blur creciente
  hacia el borde, visible solo cuando está colapsado.
- Toda la lógica (filtro + colapso) vive en `update(animar)` dentro de `initProyectos()`;
  recalcula en click de filtro, click de "Ver más" y `resize` (debounce).

### 3. Fotos reales + optimización a WebP
- 64 fotos del cliente en `assets/img/proyectos/{vialidad,media-tension,subterraneo,industrial}/`
  (vialidad 17, media-tension 9, subterraneo 26, industrial 12), nombradas `<cat>-NN`.
- Convertidas a WebP con ImageMagick (`magick`; no hay `cwebp`):
  - `<cat>-NN-thumb.webp` (≤800px, q78) → lo usa el `<img>` del grid.
  - `<cat>-NN.webp` (≤1600px, q82) → lo usa el lightbox vía `data-full` en el `<article>`.
- Los jpeg originales se **borraron** (ya no se referenciaban; el cliente los tiene en WhatsApp).
- Impacto: el grid pasó de ~19 MB (jpeg) a ~4.8 MB (thumbs), lazy-loaded y colapsado →
  el arranque carga ~9 thumbs (~700 KB). El lightbox baja el webp grande de a uno.

### 4. Botón flotante de WhatsApp
- El `.whatsapp-btn` flotante ahora apunta a **+54 9 11 6799-5686** (`wa.me/5491167995686`).
- El botón de la sección Contacto quedó con el número original (+54 9 3497 65-7453).

### Decisiones técnicas (proyectos)
- Se respeta `prefers-reduced-motion` en todas las animaciones (filtro, colapso, lightbox).
- z-index del lightbox: `--z-modal` (90), sobre el header (50).
- Se usa `<img>` webp directo, **sin** `<picture>`/fallback jpeg (soporte webp universal);
  desviación intencional de la guía de CLAUDE.md para poder eliminar los jpeg pesados.
- El grid de 64 `<article>` se generó con un script de Python (regex sobre `.proyectos-grid`).

---

## Pendientes / próximos pasos
- **Publicar** a Hostinger (`./deploy.sh`); decidir si limpiar el `default.php` del
  server (`--delete` lo elimina; esa carpeta es exclusiva de cyc).
- Convertir a WebP las imágenes de Servicios y **optimizar `movimiento-suelo.jpeg`** (~730 KB).
- (Opcional) Imagen propia para "Redes Cloacales e Hídricas" (hoy usa `ducto2.jpeg`).
- (Opcional) Renombrar `vialidad-07..23` para cerrar el hueco del `06`.
- (Opcional) Unificar "Cordon" (filtro, sin tilde) vs "Cordón" (card de Servicios).
- Optimizar el resto de imágenes: hero `construction.jpeg` (~3.3 MB) y empresa (Etapa 7).
- (Opcional) Unificar el número de WhatsApp del botón de Contacto si se quiere el mismo.
- (Opcional) Fallback `<picture>` jpeg si apareciera algún navegador sin soporte webp.
