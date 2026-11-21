import type { MetadataRoute } from 'next';
import { site } from '@/lib/content';
export default function robots(): MetadataRoute.Robots {
  return site.publish ? { rules: { userAgent: '*', allow: '/' }, sitemap: `${site.siteUrl.replace(/\/$/, '')}/sitemap.xml` } : { rules: { userAgent: '*', disallow: '/' } };
}
