import type { Metadata } from 'next';
import Script from 'next/script';
import { site, t, type Lang } from '@/lib/content';
import './globals.css';

const lang = site.defaultLang as Lang;
export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl || 'http://localhost:3000'),
  title: { default: `${site.name} | ${t(site.tagline, lang)}`, template: `%s | ${site.name}` },
  description: t(site.intro, lang),
  robots: { index: site.publish, follow: site.publish },
  openGraph: { type: 'website', siteName: site.name, title: site.name, description: t(site.intro, lang), images: ['/opengraph-image'] },
  twitter: { card: 'summary_large_image', title: site.name, description: t(site.intro, lang), images: ['/opengraph-image'] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang={lang === 'zh' ? 'zh-CN' : 'en'} suppressHydrationWarning><head><Script id="theme-init" strategy="beforeInteractive">{`try{document.documentElement.classList.toggle('night',localStorage.getItem('personal-theme')==='night')}catch(e){}`}</Script></head><body>{children}</body></html>;
}
