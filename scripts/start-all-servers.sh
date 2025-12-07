#!/bin/bash

# Script para iniciar todos os servidores de exemplo para testes E2E

echo "🚀 Iniciando todos os servidores de exemplo..."

# Iniciar React vanilla (porta 3000)
echo "📦 Iniciando React vanilla na porta 3000..."
pnpm --filter examples-react dev &
REACT_PID=$!

# Iniciar Material UI (porta 3001)
echo "📦 Iniciando Material UI na porta 3001..."
pnpm --filter examples-react-material-ui dev &
MATERIAL_PID=$!

# Iniciar Chakra UI (porta 3002)
echo "📦 Iniciando Chakra UI na porta 3002..."
pnpm --filter examples-react-chakra-ui dev &
CHAKRA_PID=$!

# Aguardar servidores iniciarem
echo "⏳ Aguardando servidores iniciarem..."
sleep 5

# Verificar se os servidores estão rodando
check_server() {
  local port=$1
  local name=$2
  if curl -s http://localhost:$port > /dev/null 2>&1; then
    echo "✅ $name está rodando na porta $port"
  else
    echo "❌ $name não está respondendo na porta $port"
  fi
}

check_server 3000 "React vanilla"
check_server 3001 "Material UI"
check_server 3002 "Chakra UI"

echo ""
echo "✅ Todos os servidores iniciados!"
echo "📝 PIDs: React=$REACT_PID, Material=$MATERIAL_PID, Chakra=$CHAKRA_PID"
echo ""
echo "Para parar os servidores, execute:"
echo "  kill $REACT_PID $MATERIAL_PID $CHAKRA_PID"
echo ""
echo "Ou pressione Ctrl+C para parar este script"

# Manter o script rodando
wait

