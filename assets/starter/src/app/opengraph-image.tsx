import { ImageResponse } from 'next/og';
import { site } from '@/lib/content';
export const alt = `${site.nameEn} / Personal archive`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', background: '#f3efe5', color: '#12110f', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72 }}><div style={{ display: 'flex', fontSize: 24, letterSpacing: 5 }}>PERSONAL ARCHIVE / ALWAYS IN PROGRESS</div><div style={{ display: 'flex', fontSize: 106, fontWeight: 700, color: site.accent }}>{site.nameEn}</div><div style={{ display: 'flex', fontSize: 30 }}>STORY / IDEAS / PRACTICE / WORK</div></div>, size);
}
