#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const pkg = readJson('package.json');
const registry = readJson('server.json');
const manifest = readJson('tools.manifest.json');
const runtimePath = fs.existsSync(path.join(root, 'dist', 'index.js'))
  ? path.join(root, 'dist', 'index.js')
  : path.join(root, 'src', 'index.ts');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const expectedName = 'io.github.ReplenishRadar/MCP';
const expectedRepository = 'https://github.com/ReplenishRadar/MCP';
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

expect(pkg.mcpName === expectedName, `package mcpName is ${pkg.mcpName}`);
expect(registry.name === expectedName, `server name is ${registry.name}`);
expect(registry.version === pkg.version, `server version ${registry.version} != package ${pkg.version}`);
expect(registry.packages?.[0]?.version === pkg.version,
  `registry package version ${registry.packages?.[0]?.version} != package ${pkg.version}`);
expect(registry.repository?.url === expectedRepository,
  `registry repository is ${registry.repository?.url}`);
expect(manifest.server?.serverInfo?.repository === expectedRepository,
  `manifest server repository is ${manifest.server?.serverInfo?.repository}`);
expect(manifest.smithery?.repository === expectedRepository,
  `manifest Smithery repository is ${manifest.smithery?.repository}`);
expect(manifest.tools?.length === 50, `manifest tool count is ${manifest.tools?.length}`);
expect(registry.description?.includes(`(${manifest.tools.length} tools)`),
  'server description tool count does not match manifest');
expect(runtime.includes(`version: '${pkg.version}'`),
  `${path.relative(root, runtimePath)} does not report package version ${pkg.version}`);

if (errors.length) {
  console.error(`Public MCP package parity failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Public MCP package parity OK: ${pkg.version}, ${manifest.tools.length} tools, ${expectedName}`);
