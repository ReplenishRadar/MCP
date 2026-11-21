// Regression guard for #11680: the public-package check must read the runtime
// artifact its caller names, and must never quietly substitute a different one.
// The old behaviour preferred dist/index.js and fell back to src/index.ts when
// dist was missing, which made a pre-push gate answer differently depending on
// whether an unordered parallel lane had finished writing dist.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// A fixture that mirrors the real package but has no dist/, which is the state
// of a fresh clone and of any pre-push run whose build lane has not landed yet.
function fixtureWithoutDist() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-public-check-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.mkdirSync(path.join(dir, 'src'));
  for (const file of ['package.json', 'server.json', 'tools.manifest.json']) {
    fs.copyFileSync(path.join(packageRoot, file), path.join(dir, file));
  }
  fs.copyFileSync(path.join(packageRoot, 'src', 'index.ts'), path.join(dir, 'src', 'index.ts'));
  fs.copyFileSync(
    path.join(packageRoot, 'scripts', 'check-public-package.mjs'),
    path.join(dir, 'scripts', 'check-public-package.mjs'),
  );
  return dir;
}

function run(dir, args) {
  return spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-public-package.mjs'), ...args], {
    encoding: 'utf8',
  });
}

test('--runtime src passes without any build output present', () => {
  const dir = fixtureWithoutDist();
  try {
    const result = run(dir, ['--runtime', 'src']);
    assert.equal(result.status, 0, `expected pass, got:\n${result.stdout}${result.stderr}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('--runtime dist fails loudly when the build output is missing', () => {
  const dir = fixtureWithoutDist();
  try {
    const result = run(dir, ['--runtime', 'dist']);
    assert.equal(result.status, 1, 'a missing dist must fail, not silently fall back to src');
    assert.match(result.stderr, /dist[\\/]index\.js.*does not exist/s);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// Writes a description of exactly `length` characters that still carries the tool count.
function runWithDescriptionOfLength(length) {
  const dir = fixtureWithoutDist();
  try {
    const serverPath = path.join(dir, 'server.json');
    const server = JSON.parse(fs.readFileSync(serverPath, 'utf8'));
    const count = JSON.parse(fs.readFileSync(path.join(dir, 'tools.manifest.json'), 'utf8')).tools.length;
    const suffix = ` (${count} tools)`;
    server.description = `${'x'.repeat(length - suffix.length)}${suffix}`;
    fs.writeFileSync(serverPath, JSON.stringify(server, null, 2));
    return run(dir, ['--runtime', 'src']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('a description the MCP Registry would refuse fails before anything is staged', () => {
  const result = runWithDescriptionOfLength(101);
  assert.equal(result.status, 1, `expected fail, got:\n${result.stdout}${result.stderr}`);
  assert.match(result.stderr, /101 characters; the MCP Registry allows 100/);
});

test('a description at exactly the Registry limit passes', () => {
  const result = runWithDescriptionOfLength(100);
  assert.equal(result.status, 0, `expected pass, got:\n${result.stdout}${result.stderr}`);
});

test('an unknown --runtime value is rejected rather than guessed', () => {
  const dir = fixtureWithoutDist();
  try {
    const result = run(dir, ['--runtime', 'whatever']);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /expected "src" or "dist"/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
