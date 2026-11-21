import type { MetadataRoute } from 'next';
import { activeArticles, activeRooms, site } from '@/lib/content';
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.publish || !site.siteUrl) return [];
  const routes = ['/', '/works', ...(activeArticles.length ? ['/writing'] : []), ...activeRooms.map(r => `/universe/${r.id}`), ...activeArticles.map(a => `/writing/${a.slug}`)];
  return routes.map(route => ({ url: site.siteUrl.replace(/\/$/, '') + route }));
}
