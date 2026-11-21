import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const fail = (message) => { throw new Error(message); };
function text(value, field, limit = 6000) {
  if (typeof value !== 'string' || value.length > limit) fail(`${field} 必须是长度不超过 ${limit} 的字符串`);
}
function translated(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${field} 需要 zh / en 文案`);
  for (const lang of ['zh', 'en']) text(value[lang], `${field}.${lang}`);
}
function list(value, field, limit = 200) {
  if (!Array.isArray(value) || value.length > limit) fail(`${field} 必须是数组，最多 ${limit} 项`);
}
function link(value, field) {
  text(value, field, 2048);
  if (!value) return;
  let url;
  try { url = new URL(value); } catch { fail(`${field} 需要完整 https URL`); }
  if (url.protocol !== 'https:' || url.username || url.password) fail(`${field} 仅接受无凭据的 https URL`);
}
function image(value, field) {
  text(value, field, 200);
  if (value && !/^\/images\/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp|avif)$/.test(value)) fail(`${field} 只支持 /images/ 下的本地 png/jpg/webp/avif 图片`);
  if (value.includes('..') || value.includes('//')) fail(`${field} 不允许路径穿越`);
}

export function validateProfile(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) fail('资料必须是 JSON 对象');
  const fields = ['name', 'nameEn', 'initials', 'defaultLang', 'demo', 'publish', 'siteUrl', 'accent', 'tagline', 'intro', 'roles', 'about', 'portrait', 'portraitAlt', 'email', 'socials', 'rooms', 'chapters', 'projects', 'articles'];
  for (const key of Object.keys(p)) if (!fields.includes(key)) fail(`未知配置字段：${key}`);
  for (const key of ['name', 'nameEn', 'initials']) { text(p[key], key, 80); if (!p[key].trim()) fail(`${key} 不能为空`); }
  if (!['zh', 'en'].includes(p.defaultLang)) fail('defaultLang 只能是 zh 或 en');
  if (typeof p.demo !== 'boolean' || typeof p.publish !== 'boolean') fail('demo 和 publish 必须是布尔值');
  if (!/^#[a-fA-F0-9]{6}$/.test(p.accent)) fail('accent 需要六位十六进制颜色');
  link(p.siteUrl, 'siteUrl');
  if (p.siteUrl && new URL(p.siteUrl).pathname !== '/') fail('siteUrl 只填域名，不带路径');
  if (p.publish && (p.demo || !p.siteUrl || /(^|\.)(example\.(com|org|net)|localhost|invalid|test)$/.test(new URL(p.siteUrl).hostname))) fail('发布前请替换示例内容、设置 demo=false，并填写自己的真实域名');
  for (const key of ['tagline', 'intro', 'about', 'portraitAlt']) translated(p[key], key);
  image(p.portrait, 'portrait');
  text(p.email, 'email', 254);
  if (p.email && !/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(p.email)) fail('email 格式无效');
  list(p.roles, 'roles', 8); p.roles.forEach((x) => translated(x, 'roles'));
  list(p.socials, 'socials', 20); p.socials.forEach((x) => { text(x.label, 'social label', 80); link(x.url, 'social URL'); if (!x.url) fail('social URL 不能为空'); });
  list(p.rooms, 'rooms', 4);
  if (p.rooms.length !== 4 || new Set(p.rooms.map(x => x.id)).size !== 4) fail('rooms 需要四个不同房间；不需要的房间设置 enabled=false');
  p.rooms.forEach((r) => {
    if (!['story', 'orbit', 'digest', 'artifact'].includes(r.id) || typeof r.enabled !== 'boolean') fail('房间 id 或 enabled 无效');
    text(r.letter, 'room letter', 2); translated(r.title, 'room title'); translated(r.description, 'room description');
  });
  list(p.chapters, 'chapters'); p.chapters.forEach((x) => { text(x.period, 'period', 80); translated(x.title, 'chapter title'); translated(x.body, 'chapter body'); });
  list(p.projects, 'projects');
  const projectIds = new Set();
  p.projects.forEach((x) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.id) || projectIds.has(x.id)) fail('项目 id 需要唯一的英文短横线标识');
    projectIds.add(x.id);
    for (const k of ['title', 'summary', 'audience', 'evidence', 'status']) translated(x[k], `project ${k}`);
    link(x.url, 'project URL'); image(x.image, 'project image');
  });
  list(p.articles, 'articles');
  const slugs = new Set();
  p.articles.forEach((x) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.slug) || slugs.has(x.slug)) fail('文章 slug 需要唯一的英文短横线标识');
    slugs.add(x.slug);
    if (!['orbit', 'digest'].includes(x.room)) fail('文章 room 需要 orbit 或 digest');
    for (const k of ['title', 'summary', 'category']) translated(x[k], `article ${k}`);
    list(x.sections, 'sections', 50);
    x.sections.forEach((s) => { translated(s.heading, 'section heading'); list(s.paragraphs, 'paragraphs', 100); s.paragraphs.forEach(v => translated(v, 'paragraph')); });
  });
  return p;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const filename = path.resolve(process.argv[2] || 'site.config.json');
    const p = validateProfile(JSON.parse(await readFile(filename, 'utf8')));
    for (const asset of [p.portrait, ...p.projects.map(x => x.image)].filter(Boolean)) await access(path.join(path.dirname(filename), 'public', asset));
    console.log(`资料校验通过；${p.demo ? '示例模式' : '个人资料'}；${p.publish ? '允许索引' : '禁止索引'}`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
