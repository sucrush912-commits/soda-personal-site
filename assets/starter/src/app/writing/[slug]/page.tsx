import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Site } from '@/components/Site';
import { activeArticles, metadataFor, site, t, type Lang } from '@/lib/content';
export function generateStaticParams() { return activeArticles.map(a => ({ slug: a.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = activeArticles.find(a => a.slug === slug);
  if (!a) return {};
  return metadataFor(t(a.title, site.defaultLang as Lang), t(a.summary, site.defaultLang as Lang), `/writing/${slug}`);
}
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!activeArticles.some(a => a.slug === slug)) notFound();
  return <Site view="article" slug={slug} />;
}
