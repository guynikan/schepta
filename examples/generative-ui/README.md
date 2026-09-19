# Schepta Generative UI demo

This Vite demo is the first runnable proof of the experimental semantic Generative UI branch. It accepts a natural-language prompt, generates one validated and canonical `UiSpec`, and renders that exact JSON contract side by side through `@schepta/renderer-react-mui` and `@schepta/renderer-vue-vuetify`.

## Run from the repository root

```bash
pnpm install
pnpm demo:dev
```

Open <http://127.0.0.1:4173>. The command builds the workspace renderer dependencies first, then starts the Vite development server with the server-side generation endpoint.

The default **Offline / deterministic** mode requires no credentials and is the source of truth for local testing. The **OpenAI / structured** mode uses `OPENAI_API_KEY` only inside the Vite server process:

```bash
OPENAI_API_KEY=sk-... pnpm demo:dev
```

If `TYPESAFE_API_KEY` is also present, the corrected TypeSafe System One adapter is used to select between model and fallback candidates. JEV is a typed decision/routing/validation signal; it is not a string generator. Neither key is sent to the browser, logged, placed in a URL, or included in the API response.

The browser endpoint is `POST /api/generate` and returns only the accepted `spec`, `validation`, and safe `trace` fields. It never returns a provider candidate, request headers, or raw provider response.

## Verification

```bash
pnpm demo:build
pnpm demo:type-check
pnpm demo:e2e
```

The Playwright test covers both renderer panels, required prompt rejection, offline generation, semantic validation trace, and a declarative submit action that rejects an empty renderer input and succeeds with a valid value. CI integration is intentionally out of scope for this demo.
