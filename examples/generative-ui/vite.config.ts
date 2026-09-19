import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import { generateForPrompt } from './src/server/generate';

function apiPlugin(): Plugin {
  return {
    name: 'schepta-generative-ui-api',
    configureServer(server) {
      server.middlewares.use('/api/generate', async (request, response, next) => {
        if (request.method !== 'POST') {
          response.statusCode = 405;
          response.setHeader('allow', 'POST');
          response.end();
          return;
        }

        try {
          const body = await new Promise<string>((resolve, reject) => {
            let content = '';
            request.setEncoding('utf8');
            request.on('data', (chunk: string) => {
              content += chunk;
              if (content.length > 20_000) reject(new Error('Request body is too large.'));
            });
            request.on('end', () => resolve(content));
            request.on('error', reject);
          });
          const input = JSON.parse(body) as { prompt?: unknown; mode?: unknown };
          const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : '';
          if (prompt.length === 0) {
            response.statusCode = 400;
            response.setHeader('content-type', 'application/json');
            response.end(JSON.stringify({ message: 'A prompt is required.' }));
            return;
          }
          const mode = input.mode === 'openai' ? 'openai' : 'offline';
          const result = await generateForPrompt(prompt, mode);
          response.statusCode = 200;
          response.setHeader('cache-control', 'no-store');
          response.setHeader('content-type', 'application/json');
          response.end(JSON.stringify(result));
        } catch (error) {
          response.statusCode = 500;
          response.setHeader('content-type', 'application/json');
          response.end(JSON.stringify({ message: error instanceof Error ? error.message : 'Generation failed.' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), vue(), apiPlugin()],
  server: { port: 4173, strictPort: true },
  build: { sourcemap: true },
});
