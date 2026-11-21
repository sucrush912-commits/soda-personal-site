#!/usr/bin/env node
import { cp, mkdir, readFile, writeFile, lstat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProfile } from '../assets/starter/scripts/validate-profile.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const starter = path.join(root, 'assets/starter');

try {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('node create-site.mjs --output <新目录> [--profile <profile.json>]\n只生成本地代码，不安装依赖、不发布、不覆盖目录。');
  } else {
    const options = {};
    for (let i = 0; i < args.length; i += 2) {
      if (!['--output', '--profile'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--') || options[args[i]]) throw new Error('参数无效；使用 --help 查看用法');
      options[args[i]] = args[i + 1];
    }
    if (!options['--output']) throw new Error('需要 --output 指定新目录');
    const output = path.resolve(options['--output']);
    if (output === path.resolve(root) || output.startsWith(path.resolve(root) + path.sep)) throw new Error('输出目录必须在 Skill 目录之外');
    try { await lstat(output); throw new Error(`目标已存在，拒绝覆盖：${output}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const input = options['--profile'] ? path.resolve(options['--profile']) : path.join(starter, 'site.config.json');
    const raw = await readFile(input, 'utf8');
    if (Buffer.byteLength(raw) > 1024 * 1024) throw new Error('资料文件超过 1 MB');
    const profile = validateProfile(JSON.parse(raw));
    await mkdir(path.dirname(output), { recursive: true });
    await mkdir(output);
    for (const entry of await readdir(starter)) {
      await cp(path.join(starter, entry), path.join(output, entry), { recursive: true, force: false, errorOnExist: true });
    }
    await writeFile(path.join(output, 'site.config.json'), JSON.stringify(profile, null, 2) + '\n');
    console.log(`已生成：${output}\n接下来在该目录运行 npm install，再运行 npm run dev。\n如配置了 /images/ 图片，请先把自己的文件放入 public/images/。`);
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
