#!/bin/bash

# Script de publicação dos pacotes @schepta/* no npm
# Usa pnpm publish que automaticamente resolve workspace:* para versões
# Uso: ./publish.sh [--dry-run]

set -e

DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "Uso: $0 [--dry-run]"
      exit 1
      ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "📦 Publicando pacotes @schepta/* no npm"
if [ "$DRY_RUN" = true ]; then
  echo "🔍 Modo dry-run (não publicará de fato)"
fi
echo ""

# Verificar se NPM_TOKEN está configurado
if [ -z "$NPM_TOKEN" ]; then
  echo "❌ Erro: NPM_TOKEN não está configurado"
  echo "   Execute: source ~/.zshrc ou export NPM_TOKEN=..."
  exit 1
fi

# Verificar se está logado no npm
if ! npm whoami &>/dev/null; then
  echo "⚠️  Não está logado no npm. Tentando autenticar..."
  echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc
fi

# Função para publicar um package usando pnpm
publish_package() {
  local PACKAGE_FILTER=$1
  local PACKAGE_NAME=$2
  
  echo "📤 Publicando $PACKAGE_NAME..."
  
  # pnpm publish --filter automaticamente resolve workspace:* para versões
  if [ "$DRY_RUN" = true ]; then
    echo "  🔍 [DRY-RUN] pnpm publish --filter $PACKAGE_FILTER --access public --no-git-checks"
    pnpm publish --filter "$PACKAGE_FILTER" --access public --no-git-checks --dry-run || true
  else
    pnpm publish --filter "$PACKAGE_FILTER" --access public --no-git-checks
    echo "  ✅ $PACKAGE_NAME publicado com sucesso!"
  fi
}

# Verificar se está pronto para publicar
check_ready() {
  echo "🔍 Verificando se está pronto para publicar..."
  
  # Fazer build apenas dos packages @schepta/* (não docs/showcases)
  echo "🔨 Fazendo build dos packages @schepta/*..."
  pnpm --filter "@schepta/*" build
  
  # Verificar se todos os packages têm build
  local MISSING_BUILDS=0
  for PACKAGE_DIR in packages/*/*; do
    if [ -d "$PACKAGE_DIR" ] && [ -f "$PACKAGE_DIR/package.json" ]; then
      if [ ! -d "$PACKAGE_DIR/dist" ]; then
        echo "  ⚠️  $PACKAGE_DIR não tem dist/"
        MISSING_BUILDS=$((MISSING_BUILDS + 1))
      fi
    fi
  done
  
  if [ $MISSING_BUILDS -gt 0 ]; then
    echo "  ❌ Alguns packages não têm build. Execute: pnpm build"
    exit 1
  else
    echo "  ✅ Todos os packages têm build"
  fi
  
  echo ""
}

# Verificar se está pronto (sem fazer build de docs)
check_ready

# Ordem de publicação (pnpm resolve workspace:* automaticamente)
echo "🚀 Iniciando publicação na ordem correta..."
echo ""

# 1. Core (deve ser publicado primeiro)
publish_package "@schepta/core" "@schepta/core"

# 2. Adapters (podem ser publicados em paralelo, mas vamos fazer sequencialmente)
publish_package "@schepta/adapter-react" "@schepta/adapter-react"
publish_package "@schepta/adapter-vue" "@schepta/adapter-vue"
publish_package "@schepta/adapter-vanilla" "@schepta/adapter-vanilla"

# 3. Factories (dependem dos adapters)
publish_package "@schepta/factory-react" "@schepta/factory-react"
publish_package "@schepta/factory-vue" "@schepta/factory-vue"
publish_package "@schepta/factory-vanilla" "@schepta/factory-vanilla"

echo ""
echo "🎉 Publicação concluída!"
echo ""
echo "💡 Nota: O pnpm automaticamente resolve workspace:* para versões durante a publicação."
echo "   Não é necessário substituir manualmente as dependências."
