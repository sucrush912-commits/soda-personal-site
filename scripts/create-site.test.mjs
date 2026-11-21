import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts/create-site.mjs'), ...args], { encoding: 'utf8' });
const example = () => readFile(path.join(root, 'assets/starter/site.config.json'), 'utf8').then(JSON.parse);

test('default profile does not impose the source author’s four branded rooms', async () => {
  const profile = await example();
  assert.deepEqual(profile.rooms, []);
  assert.ok(profile.projects.length > 0);
  assert.ok(profile.articles.length > 0);
});

test('supports one optional archive without requiring four rooms', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'soda-site-one-room-'));
  const profile = await example();
  profile.rooms = [{ id: 'story', letter: '', title: { zh: '经历', en: 'Experience' }, description: { zh: '我的经历', en: 'My experience' }, enabled: true }];
  const input = path.join(temp, 'profile.json');
  await writeFile(input, JSON.stringify(profile));
  const result = run('--profile', input, '--output', path.join(temp, 'site'));
  assert.equal(result.status, 0, result.stderr);
});

test('creates a standalone site from a profile in a new directory', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'soda-site-test-'));
  const profile = await example();
  profile.name = '林间 / Lin';
  profile.tagline.zh = '用观察记录城市与生活';
  const input = path.join(temp, 'profile.json');
  await writeFile(input, JSON.stringify(profile));
  const output = path.join(temp, 'my-site');
  const result = run('--profile', input, '--output', output);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(await readFile(path.join(output, 'site.config.json'))).name, profile.name);
  assert.ok((await readFile(path.join(output, 'package.json'), 'utf8')).includes('next'));
  assert.ok((await readFile(path.join(output, 'src/app/page.tsx'), 'utf8')).includes('Home'));
});

test('refuses an existing directory without altering its contents', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'soda-site-existing-'));
  const marker = path.join(temp, 'keep.txt');
  await writeFile(marker, 'existing user work');
  const result = run('--output', temp);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /已存在|exists/);
  assert.equal(await readFile(marker, 'utf8'), 'existing user work');
});

test('rejects executable link protocols before creating files', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'soda-site-invalid-'));
  const profile = await example();
  profile.socials = [{ label: 'Click', url: 'javascript:alert(1)' }];
  const input = path.join(temp, 'profile.json');
  await writeFile(input, JSON.stringify(profile));
  const result = run('--profile', input, '--output', path.join(temp, 'site'));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /https/);
});

test('rejects a publishing profile with demo content or no real domain', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'soda-site-publish-'));
  const profile = await example();
  profile.publish = true;
  const input = path.join(temp, 'profile.json');
  await writeFile(input, JSON.stringify(profile));
  const result = run('--profile', input, '--output', path.join(temp, 'site'));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /发布|示例|域名/);
});

test('supports an empty archive without inventing projects or articles', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'soda-site-empty-'));
  const profile = await example();
  profile.projects = [];
  profile.articles = [];
  profile.chapters = [];
  profile.socials = [];
  const input = path.join(temp, 'profile.json');
  await writeFile(input, JSON.stringify(profile));
  const output = path.join(temp, 'site');
  const result = run('--profile', input, '--output', output);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(await readFile(path.join(output, 'site.config.json'))).projects, []);
});
