import { Site } from '@/components/Site';
import { metadataFor, site, t } from '@/lib/content';
export const metadata = metadataFor(`${site.name} | ${t(site.tagline, site.defaultLang)}`, t(site.intro, site.defaultLang), '/');
export default function Home() { return <Site />; }
