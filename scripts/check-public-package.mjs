#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const pkg = readJson('package.json');
const registry = readJson('server.json');
const manifest = readJson('tools.manifest.json');
// Which runtime file carries the version claim is declared, never discovered
// (#11680). This used to prefer dist/index.js and silently fall back to src,
// so the same gate answered differently depending on whether a concurrently
// running build had written dist yet: pre-push runs mcp-server-build and
// mcp-parity in unordered parallel lanes, and dist/ is untracked, so a fresh
// clone had no build output at all. Callers now say which artifact they mean:
//   --runtime src   the tracked source, the only input a push can change
//   --runtime dist  the built output, valid only after a build in the same
//                   sequence (prepublishOnly), and a hard error when absent
const runtimeArg = process.argv.slice(2)
  .find((arg) => arg.startsWith('--runtime='))?.split('=')[1]
  ?? (process.argv.includes('--runtime') ? process.argv[process.argv.indexOf('--runtime') + 1] : undefined)
  ?? 'dist';
if (!['src', 'dist'].includes(runtimeArg)) {
  console.error(`Unknown --runtime ${runtimeArg}; expected "src" or "dist".`);
  process.exit(2);
}
const runtimePath = runtimeArg === 'dist'
  ? path.join(root, 'dist', 'index.js')
  : path.join(root, 'src', 'index.ts');
if (!fs.existsSync(runtimePath)) {
  console.error(
    `Public MCP package parity cannot run: --runtime ${runtimeArg} expects ` +
    `${path.relative(root, runtimePath)}, which does not exist. ` +
    (runtimeArg === 'dist' ? 'Run `npm run build` first.' : ''),
  );
  process.exit(1);
}
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
// The count is read from the manifest, never restated here, so a new tool cannot leave a stale literal.
expect(manifest.tools?.length > 0, 'manifest has no tools');
expect((registry.description ?? '').match(/\((\d+) tools[,)]/)?.[1] === String(manifest.tools.length),
  'server description tool count does not match manifest');
expect(runtime.includes(`version: '${pkg.version}'`),
  `${path.relative(root, runtimePath)} does not report package version ${pkg.version}`);

if (errors.length) {
  console.error(`Public MCP package parity failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Public MCP package parity OK: ${pkg.version}, ${manifest.tools.length} tools, ${expectedName}`);
