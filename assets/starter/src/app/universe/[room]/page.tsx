import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Site } from '@/components/Site';
import { activeRooms, metadataFor, site, t, type Lang } from '@/lib/content';
export function generateStaticParams() { return activeRooms.map(r => ({ room: r.id })); }
export async function generateMetadata({ params }: { params: Promise<{ room: string }> }): Promise<Metadata> {
  const { room } = await params;
  const r = activeRooms.find(r => r.id === room);
  if (!r) return {};
  return metadataFor(t(r.title, site.defaultLang as Lang), t(r.description, site.defaultLang as Lang), `/universe/${room}`);
}
export default async function Room({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  if (!activeRooms.some(r => r.id === room)) notFound();
  return <Site view={room} />;
}
