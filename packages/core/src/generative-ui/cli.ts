#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { reactMuiCatalog } from './builtins';
import { acceptUiSpec } from './repair';
import { stringifyCanonicalUiSpec } from './canonicalize';
import { validateUiSpec } from './validator';

function usage(): never {
  console.error('Usage: schepta-ui-spec <catalog|schema|validate|normalize> [file]');
  process.exit(2);
}

async function readJson(file: string | undefined): Promise<unknown> {
  if (!file) usage();
  return JSON.parse(await readFile(file, 'utf8'));
}

async function main(): Promise<void> {
  const [command, file] = process.argv.slice(2);
  if (command === 'catalog') return void process.stdout.write(`${JSON.stringify(reactMuiCatalog, null, 2)}\n`);
  if (command === 'schema') return void process.stdout.write(`${JSON.stringify({ version: '1.0', catalog: reactMuiCatalog, required: ['version', 'root', 'elements'] }, null, 2)}\n`);
  const input = await readJson(file);
  if (command === 'validate') {
    const report = validateUiSpec(input, { catalog: reactMuiCatalog });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exitCode = report.valid ? 0 : 1;
    return;
  }
  if (command === 'normalize') {
    const result = acceptUiSpec(input, { catalog: reactMuiCatalog });
    process.stdout.write(result.accepted && result.spec ? `${stringifyCanonicalUiSpec(result.spec)}\n` : `${JSON.stringify(result.report, null, 2)}\n`);
    process.exitCode = result.accepted ? 0 : 1;
    return;
  }
  usage();
}

void main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
