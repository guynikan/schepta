# Single-SPA + Vite Experiment

Boilerplate experimental demonstrando como usar single-spa com Vite para criar microfrontends com diferentes frameworks em um único servidor.

## Estrutura

```
single-spa-vite-experiment/
├── shell/          # Shell principal (single-spa root config)
├── react-app/      # Microfrontend React
├── vue-app/        # Microfrontend Vue
├── vanilla-app/    # Microfrontend Vanilla JS
└── shared/         # Dependências compartilhadas
```

## Características

- **Single-SPA**: Orquestração de microfrontends
- **Vite**: Build tool rápido para desenvolvimento
- **Importação Local**: Microfrontends como módulos ES locais (não Module Federation)
- **Múltiplos Frameworks**: React, Vue 3, Vanilla JS
- **Schepta Integration**: Preparado para demonstrações do Schepta

## Como usar

1. **Instalar dependências**:
   ```bash
   cd shell && npm install
   ```

2. **Executar em desenvolvimento**:
   ```bash
   cd shell && npm run dev
   ```

3. **Acessar**:
   - Home: http://localhost:3000/
   - React: http://localhost:3000/react
   - Vue: http://localhost:3000/vue
   - Vanilla: http://localhost:3000/vanilla

## Configuração

### Shell Principal
- Configura o single-spa e registra os microfrontends
- Gerencia navegação e roteamento
- Serve como container principal

### Microfrontends
- **React**: Usa single-spa-react + Material-UI
- **Vue**: Usa single-spa-vue + Vue 3 Composition API
- **Vanilla**: Lifecycle functions manuais

## Vantagens desta abordagem

1. **Desenvolvimento simples**: Todos os microfrontends no mesmo repositório
2. **Build unificado**: Vite gerencia todos os frameworks
3. **Hot reload**: Funciona para todos os microfrontends
4. **Shared dependencies**: Otimização automática de dependências
5. **Deploy único**: Uma única aplicação para deploy

## Próximos passos

- [ ] Integrar Schepta em cada microfrontend
- [ ] Adicionar testes
- [ ] Configurar CI/CD
- [ ] Otimizar build para produção