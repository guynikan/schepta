import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', 'ui-spec': 'src/generative-ui/cli.ts' },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
