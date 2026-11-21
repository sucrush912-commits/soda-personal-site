import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Site } from '@/components/Site';
import { activeArticles, activeRooms, metadataFor, site, t, type Lang } from '@/lib/content';
const sections = [ ...(activeRooms.some(r => r.id === 'artifact') ? ['works'] : []), ...(activeArticles.length ? ['writing'] : []) ];
export function generateStaticParams() { return sections.map(section => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const title = section === 'works' ? { zh: '作品与项目', en: 'Works & projects' } : { zh: '文字档案', en: 'Writing archive' };
  return metadataFor(title[site.defaultLang as Lang], t(site.intro, site.defaultLang), `/${section}`);
}
export default async function Archive({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <Site view={section} />;
}
