import profile from '../../site.config.json';
import type { Metadata } from 'next';
export type Lang = 'zh' | 'en';
export type Copy = { zh: string; en: string };
export type Entry = { slug: string; room: string; category: Copy; title: Copy; summary: Copy; sections: { heading: Copy; paragraphs: Copy[] }[] };
type SiteProfile = {
  name: string; nameEn: string; initials: string; defaultLang: Lang;
  demo: boolean; publish: boolean; siteUrl: string; accent: string;
  tagline: Copy; intro: Copy; about: Copy; roles: Copy[];
  portrait: string; portraitAlt: Copy; email: string; socials: { label: string; url: string }[];
  rooms: { id: string; letter: string; title: Copy; description: Copy; enabled: boolean }[];
  chapters: { period: string; title: Copy; body: Copy }[];
  projects: { id: string; title: Copy; summary: Copy; audience: Copy; evidence: Copy; status: Copy; url: string; image: string }[];
  articles: Entry[];
};
// The build's prebuild command validates the JSON before Next.js compiles it.
export const site = profile as SiteProfile;
export const t = (copy: Copy, lang: Lang) => copy[lang] || copy[site.defaultLang as Lang];
export const pick = (lang: Lang, zh: string, en: string) => lang === 'zh' ? zh : en;
export const activeRooms = site.rooms.filter(room => room.enabled);
// 普通文章独立于可选档案。只有显式禁用的档案才隐藏其关联内容。
export const activeArticles = site.articles.filter(article => !site.rooms.some(room => room.id === article.room && !room.enabled));
export function metadataFor(title: string, description: string, route: string): Metadata {
  const url = site.siteUrl ? site.siteUrl.replace(/\/$/, '') + route : undefined;
  return {
    title: route === '/' ? { absolute: title } : title, description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: { type: 'website', siteName: site.name, title, description, images: ['/opengraph-image'], ...(url ? { url } : {}) },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  };
}
