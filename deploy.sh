#!/usr/bin/env bash
# ==========================================================================
# deploy.sh — Despliegue de C&C Servicios a Hostinger (rsync vía SSH)
# --------------------------------------------------------------------------
# Sincroniza el sitio estático (index.html + assets/) con la raíz web del
# hosting. Incremental: solo sube lo que cambió.
#
# Uso:
#   ./deploy.sh                 Sube cambios (pide confirmación)
#   ./deploy.sh --dry-run       Simula: muestra qué subiría, sin tocar el server
#   ./deploy.sh --delete        Espejo: borra del server lo que no esté local (!)
#   ./deploy.sh -y              No pide confirmación
#   ./deploy.sh --help          Ayuda
#
# Configuración: completá deploy.env (ver deploy.env.example).
# ==========================================================================

set -euo pipefail

# Raíz del proyecto = carpeta donde vive este script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/deploy.env"

# --- Colores (solo si la salida es una terminal) --------------------------
if [[ -t 1 ]]; then
  C_BOLD="$(tput bold)"; C_RED="$(tput setaf 1)"; C_GREEN="$(tput setaf 2)"
  C_YELLOW="$(tput setaf 3)"; C_RESET="$(tput sgr0)"
else
  C_BOLD=""; C_RED=""; C_GREEN=""; C_YELLOW=""; C_RESET=""
fi

info()  { echo "${C_BOLD}==>${C_RESET} $*"; }
ok()    { echo "${C_GREEN}✔${C_RESET} $*"; }
warn()  { echo "${C_YELLOW}!${C_RESET} $*"; }
die()   { echo "${C_RED}✖ $*${C_RESET}" >&2; exit 1; }

# --- Argumentos ------------------------------------------------------------
DRY_RUN=false
DELETE=false
ASSUME_YES=false

for arg in "$@"; do
  case "$arg" in
    --dry-run|-n) DRY_RUN=true ;;
    --delete)     DELETE=true ;;
    -y|--yes)     ASSUME_YES=true ;;
    -h|--help)
      sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) die "Opción desconocida: $arg (usá --help)" ;;
  esac
done

# --- Verificaciones previas ------------------------------------------------
command -v rsync >/dev/null || die "rsync no está instalado (sudo dnf install rsync)."
command -v ssh   >/dev/null || die "ssh no está instalado (sudo dnf install openssh-clients)."

[[ -f "$ENV_FILE" ]] || die "Falta deploy.env. Copialo: cp deploy.env.example deploy.env y completalo."

# Cargar configuración
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${SSH_HOST:?Falta SSH_HOST en deploy.env}"
: "${SSH_USER:?Falta SSH_USER en deploy.env}"
: "${REMOTE_PATH:?Falta REMOTE_PATH en deploy.env}"
SSH_PORT="${SSH_PORT:-65002}"
SSH_KEY="${SSH_KEY:-}"
SITE_URL="${SITE_URL:-}"

# Transporte SSH (con o sin clave)
SSH_CMD="ssh -p $SSH_PORT -o StrictHostKeyChecking=accept-new"
if [[ -n "$SSH_KEY" ]]; then
  [[ -f "$SSH_KEY" ]] || die "No existe la clave SSH indicada: $SSH_KEY"
  SSH_CMD="$SSH_CMD -i $SSH_KEY"
fi

# --- Exclusiones (todo lo que NO debe llegar al servidor) ------------------
EXCLUDES=(
  ".git/"
  ".gitignore"
  ".gstack/"
  ".claude/"
  ".gitkeep"
  "deploy.sh"
  "deploy.env"
  "deploy.env.example"
  "deploy.env.local"
  "*.md"            # CLAUDE.md, context.md, etc. — docs internas
  ".DS_Store"
  "*.swp"
  "*.swo"
  "*~"
  "assets/img/raw/"
  "assets/img/original/"
  "*.psd"
  "*.ai"
  "*.fig"
)

RSYNC_OPTS=(-rltvz --human-readable --progress)
$DELETE  && RSYNC_OPTS+=(--delete)
$DRY_RUN && RSYNC_OPTS+=(--dry-run)
for e in "${EXCLUDES[@]}"; do RSYNC_OPTS+=(--exclude "$e"); done

DEST="${SSH_USER}@${SSH_HOST}:${REMOTE_PATH%/}/"

# --- Resumen ---------------------------------------------------------------
echo
info "Despliegue a Hostinger"
echo "    Origen : $SCRIPT_DIR/"
echo "    Destino: $DEST"
echo "    SSH    : $SSH_USER@$SSH_HOST:$SSH_PORT${SSH_KEY:+  (clave: $SSH_KEY)}"
$DELETE  && warn "ESPEJO activado: se borrarán del server los archivos ausentes en local."
$DRY_RUN && info "Modo simulación (--dry-run): no se modifica nada en el servidor."
echo

# --- Confirmación ----------------------------------------------------------
if ! $DRY_RUN && ! $ASSUME_YES; then
  read -r -p "¿Publicar estos cambios en producción? [s/N] " resp
  [[ "$resp" =~ ^[sSyY]$ ]] || die "Cancelado."
fi

# --- Subida ----------------------------------------------------------------
info "Sincronizando..."
rsync "${RSYNC_OPTS[@]}" -e "$SSH_CMD" "$SCRIPT_DIR/" "$DEST"

echo
if $DRY_RUN; then
  ok "Simulación terminada. Volvé a correr sin --dry-run para publicar."
else
  ok "Despliegue completado."
  [[ -n "$SITE_URL" ]] && echo "   Sitio: $SITE_URL"
fi
