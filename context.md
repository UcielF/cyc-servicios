# Contexto de trabajo — C&C Servicios Integrales

---

## Sesión 2026-10-23 — Carrusel de Servicios + Deploy a Hostinger

> Trabajo **sin commitear** todavía (ver "Estado git" al final).

### 1. Sección Servicios: grid → carrusel horizontal infinito

La grilla estática de tarjetas pasó a ser un **marquee** (auto-scroll horizontal
continuo) que se pausa al pasar el cursor. Imágenes más grandes y mejor distribución.

- **Estructura (`index.html`)**: las 5 `.service-card` quedaron envueltas en
  `.servicios-marquee` (viewport con `overflow: hidden`) → `.servicios-track`
  (la pista que se desplaza).
- **CSS (`sections.css`)**: se reemplazó todo el `grid` + las reglas de bordes por
  `nth-child` por:
  - `.servicios-track`: `display: flex` + animación `servicios-scroll`
    (`translateX` de 0 a `-50%`), `linear infinite`.
  - Pausa con `.servicios-marquee:hover` **y** `:focus-within` (también teclado).
  - `.service-card`: slide de ancho fijo `clamp(280px, 82vw, 420px)`, `margin-right`
    como separación (clave para el loop sin salto), `border-radius: --radius-lg`,
    `overflow: hidden`.
  - Máscara de difuminado en los bordes izq/der; `padding-block` para que no se
    recorte la sombra del hover.
  - Bloque `prefers-reduced-motion`: sin animación, pista desplazable a mano
    (`overflow-x: auto`).
- **JS (`main.js`)**: nueva `initServiciosMarquee()` que **clona el set de tarjetas
  una vez** (copias con `aria-hidden` + `tabindex="-1"`) para el loop perfecto al
  desplazar `-50%`, y fija `--servicios-scroll-duration` según el ancho real
  (~70 px/s, recalcula en `resize`). No clona ni anima si hay movimiento reducido.
  Se llama **antes** de `initServicios()`.
- **Animación de entrada (`animations.js`)**: el trigger `.servicios-grid` ya no
  existe; ahora la entrada al scroll anima `.servicios-marquee` entero (antes era
  stagger por card, que chocaba con la pista en movimiento).

> Nota: el contenido de las 5 tarjetas (incluida la 5ª, "Obras Viales y Ciclovías
> con Cordón Cuneta", con **placeholder** "Imagen próximamente" porque falta la foto)
> ya venía del árbol de trabajo de una sesión previa, también sin commitear.

### 2. Despliegue a Hostinger (rsync sobre SSH)

Se armó el flujo de deploy para el sitio estático. Verificado por SSH.

- **`deploy.sh`** (nuevo, ejecutable): rsync incremental sobre SSH. Flags
  `--dry-run`, `--delete` (espejo, opt-in), `-y/--yes`, `--help`. Pide confirmación
  antes de publicar. Excluye todo lo de desarrollo (`.git`, `*.md`, `deploy.*`,
  `.gitkeep`, `.gstack`, `.claude`, PSD/AI/FIG, etc.). **No borra** por defecto.
- **`deploy.env.example`** (nuevo, versionado): plantilla de config.
- **`deploy.env`** (nuevo, **gitignored**): datos reales de conexión.
- **`.gitignore`**: se agregó `deploy.env` / `deploy.env.local`.

**Datos de Hostinger (verificados por SSH el 2026-10-23):**
- Cuenta **compartida** con ovidec y perez-carrazco: `u919661691@147.93.39.28`,
  puerto SSH `65002`.
- Clave autorizada por el server: **`~/.ssh/id_ed25519`** (fijada en `deploy.env`).
  OJO: `~/.ssh/id_ed25519_hostinger` **no** está autorizada, por eso los alias
  `hostinger-perez` / `hostinger-panel` de `~/.ssh/config` caen a pedir contraseña.
- Web root: `/home/u919661691/domains/cycservicios.com.ar/public_html`
- Estado del server: la carpeta del dominio existe pero su `public_html` solo tenía
  `default.php` (placeholder de Hostinger) → **el sitio aún no se desplegó**.

Deploy: `./deploy.sh --dry-run` para simular, `./deploy.sh` para publicar.

### 3. Estado git (todo sin commitear)

```
 M .gitignore
 M assets/css/sections.css
 M assets/js/animations.js
 M assets/js/main.js
 M index.html
?? context.md
?? deploy.env.example
?? deploy.sh
(deploy.env está gitignored — no aparece)
```

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
- **Publicar el sitio** a Hostinger (`./deploy.sh`) y decidir si limpiar el `default.php`
  del server (una corrida con `--delete` lo elimina; esa carpeta es exclusiva de cyc).
- **Commitear** el carrusel de Servicios + el setup de deploy (hoy está todo sin commitear).
- Conseguir la **foto real** de la 5ª tarjeta (Obras Viales y Ciclovías) y reemplazar el placeholder.
- Optimizar el resto de imágenes: hero `construction.jpeg` (~3.3 MB) y empresa/servicios (Etapa 7).
- (Opcional) Unificar el número de WhatsApp del botón de Contacto si se quiere el mismo.
- (Opcional) Fallback `<picture>` jpeg si apareciera algún navegador sin soporte webp.
