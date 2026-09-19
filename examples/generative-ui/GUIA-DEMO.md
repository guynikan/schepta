# Guia rápido do demo

Na raiz do repositório, execute:

```bash
pnpm demo:dev
```

Abra <http://127.0.0.1:4173>. O modo **Offline / deterministic** funciona imediatamente e não exige chaves. Digite um prompt, gere a interface e compare os painéis React/MUI e Vue/Vuetify: ambos recebem o mesmo `UiSpec` validado.

Para usar geração estruturada real, configure `OPENAI_API_KEY` no processo do servidor. `TYPESAFE_API_KEY` é opcional e habilita a decisão/routing/validação tipada do JEV. As chaves nunca chegam ao navegador.
