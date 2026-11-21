'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { activeArticles, activeRooms, pick, site, t, type Entry, type Lang } from '@/lib/content';

function subscribePreferences(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('personal-preferences', callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener('personal-preferences', callback); };
}
function preferencesSnapshot() {
  let lang = document.documentElement.dataset.personalLang || site.defaultLang;
  let night = document.documentElement.classList.contains('night');
  try { lang = localStorage.getItem('personal-lang') || lang; night = (localStorage.getItem('personal-theme') || (night ? 'night' : 'light')) === 'night'; } catch { /* Optional storage. */ }
  return `${lang === 'en' ? 'en' : 'zh'}:${night}`;
}
const serverPreferences = () => `${site.defaultLang}:false`;

export function Site({ view = 'home', slug = '' }: { view?: string; slug?: string }) {
  const preferences = useSyncExternalStore(subscribePreferences, preferencesSnapshot, serverPreferences);
  const [savedLang, savedNight] = preferences.split(':');
  const lang = savedLang as Lang;
  const night = savedNight === 'true';
  const [selected, setSelected] = useState<Entry | null>(null);
  const [filter, setFilter] = useState('all');
  useEffect(() => { document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'; document.documentElement.classList.toggle('night', night); }, [lang, night]);
  const label = (zh: string, en: string) => pick(lang, zh, en);
  const room = activeRooms.find(r => r.id === view);
  const articles = activeArticles.filter(a => (view === 'writing' || a.room === view) && (filter === 'all' || t(a.category, lang) === filter));
  const categories = [...new Set(activeArticles.filter(a => view === 'writing' || a.room === view).map(a => t(a.category, lang)))];
  const entry = activeArticles.find(a => a.slug === slug);
  function toggleLang() {
    const next = lang === 'zh' ? 'en' : 'zh';
    document.documentElement.dataset.personalLang = next; setFilter('all');
    try { localStorage.setItem('personal-lang', next); } catch { /* Optional persistence. */ }
    window.dispatchEvent(new Event('personal-preferences'));
  }
  function toggleTheme() {
    const next = !night;
    document.documentElement.classList.toggle('night', next);
    try { localStorage.setItem('personal-theme', next ? 'night' : 'light'); } catch { /* Optional persistence. */ }
    window.dispatchEvent(new Event('personal-preferences'));
  }
  const showProjects = activeRooms.some(r => r.id === 'artifact');
  const showWriting = activeArticles.length > 0;

  return <div className="site" data-lang={lang} style={{ '--accent': site.accent } as CSSProperties}>
    <a className="skip" href="#main">{label('跳到正文', 'Skip to content')}</a>
    <header className="nav">
      <Link className="brand" href="/" aria-label={label('回到首页', 'Home')}>{site.initials}<span aria-hidden="true">✦</span></Link>
      <nav aria-label={label('主导航', 'Main navigation')}>
        <Link href="/" aria-current={view === 'home' ? 'page' : undefined}>{label('首页', 'Home')}</Link>
        <Link href="/#about">{label('关于', 'About')}</Link>
        {showProjects && <Link href="/works" aria-current={view === 'works' ? 'page' : undefined}>{label('作品', 'Works')}</Link>}
        {showWriting && <Link href="/writing" aria-current={view === 'writing' ? 'page' : undefined}>{label('文字', 'Writing')}</Link>}
        <Link href="/#contact">{label('联系', 'Contact')}</Link>
      </nav>
      <div className="nav-actions">
        <button type="button" onClick={toggleLang} aria-label={label('切换为英文', 'Switch to Chinese')}>{lang === 'zh' ? 'EN' : '中文'}</button>
        <button type="button" onClick={toggleTheme} aria-pressed={night} aria-label={label('切换深色模式', 'Toggle dark mode')}>{night ? '☀' : '☾'}</button>
      </div>
    </header>
    <main id="main">
      {site.demo && <div className="demo-note">{label('示例网站 · 请替换为你自己的真实资料', 'SAMPLE WEBSITE · Replace with your own real material')}</div>}
      {view === 'home' ? <>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">A PERSONAL ARCHIVE / ALWAYS IN PROGRESS</p>
            <h1>{lang === 'zh' ? site.name : site.nameEn}<span className="hero-star" aria-hidden="true">✦</span></h1>
            <p className="hero-tagline">{t(site.tagline, lang)}</p>
            <p className="muted">{t(site.intro, lang)}</p>
            <div className="hero-tags">{site.roles.map((r, i) => <span key={i}>{t(r, lang)}</span>)}<Link href={showProjects ? '#building' : '#about'}>{label('向内探索', 'Explore the archive')} ↗</Link></div>
          </div>
          <figure className="hero-art">
            {site.portrait ? <Image src={site.portrait} alt={t(site.portraitAlt, lang)} fill sizes="(max-width: 700px) 90vw, 42vw" priority /> : <div className="orbit-art" role="img" aria-label={label('代表探索与成长的抽象轨道', 'Abstract orbits representing growth and exploration')}><i /><i /><i /><span>✦</span><small>IDEAS INTO ORBIT</small></div>}
            <figcaption>{label('一个持续生长的小宇宙', 'A small universe, always growing')}</figcaption>
          </figure>
          <div className="hero-foot"><span>{site.nameEn} / PERSONAL FIELD NOTES</span><span>SCROLL TO EXPLORE ↓</span></div>
        </section>
        <section className="section about" id="about">
          <div><Heading kicker="01 / THE PERSON BEHIND THE WORK" title={label('我是谁，正在成为谁。', 'The person behind the work.')} /><p className="about-text">{t(site.about, lang)}</p></div>
          <div className="room-grid">{activeRooms.map(r => <Link className="room-gate" href={`/universe/${r.id}`} key={r.id}><span className="room-letter">{r.letter}</span><div><h3>{t(r.title, lang)} <span aria-hidden="true">↗</span></h3><p>{t(r.description, lang)}</p></div></Link>)}</div>
        </section>
        {showProjects && <section className="section" id="building"><Heading kicker="02 / IDEAS MADE TANGIBLE" title={label('正在创造', 'What I am making')} link="/works" more={label('查看全部作品', 'All projects')} /><Projects lang={lang} /></section>}
        {showWriting && <section className="section"><Heading kicker="03 / THINKING IN PUBLIC" title={label('表达与实践', 'Thoughts & practice')} link="/writing" more={label('进入文字档案', 'Browse the archive')} /><ArticleList entries={activeArticles.slice(0, 3)} lang={lang} open={setSelected} /></section>}
        <section className="section contact" id="contact"><div><p className="eyebrow">KEEP THE CONVERSATION GOING</p><h2>Let’s talk<span aria-hidden="true">✳</span></h2><p>{label('从一个好问题，一件想做的事开始。', 'Start with a good question, or something worth making.')}</p></div><div className="contact-links">{site.email && <a href={`mailto:${site.email}`}>{site.email} ↗</a>}{site.socials.map(s => <a href={s.url} target="_blank" rel="noopener noreferrer" key={s.url}>{s.label} ↗</a>)}{!site.email && site.socials.length === 0 && <p className="muted">{label('联系方式待本人补充', 'Contact details to be added by the owner')}</p>}</div></section>
      </> : <section className="section archive">
        <Link className="back" href="/">← {label('回到首页', 'Back home')}</Link>
        <Heading primary kicker={room ? `${room.letter} / PERSONAL UNIVERSE` : 'THE ARCHIVE'} title={view === 'article' && entry ? t(entry.title, lang) : room ? t(room.title, lang) : view === 'works' ? label('作品与项目', 'Works & projects') : label('文字档案', 'Writing archive')} />
        {room && <p className="archive-intro">{t(room.description, lang)}</p>}
        <nav className="room-nav" aria-label={label('档案房间', 'Archive rooms')}>{activeRooms.map(r => <Link href={`/universe/${r.id}`} aria-current={view === r.id ? 'page' : undefined} key={r.id}>{r.letter} · {t(r.title, lang)}</Link>)}</nav>
        {(view === 'works' || view === 'artifact') && <Projects lang={lang} />}
        {view === 'story' && <div className="story-list">{site.chapters.map((c, i) => <section key={i}><p className="eyebrow">{c.period}</p><h2>{t(c.title, lang)}</h2><p>{t(c.body, lang)}</p></section>)}{site.chapters.length === 0 && <Empty lang={lang} />}</div>}
        {['writing', 'orbit', 'digest'].includes(view) && <><div className="filters" role="group" aria-label={label('按主题筛选', 'Filter by topic')}><button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>{label('全部', 'All')}</button>{categories.map(c => <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)}>{c}</button>)}</div><ArticleList entries={articles} lang={lang} open={setSelected} /></>}
        {view === 'article' && entry && <div className="reading"><p className="deck">{t(entry.summary, lang)}</p><ArticleBody entry={entry} lang={lang} /></div>}
      </section>}
    </main>
    <footer className="footer"><span>© {new Date().getFullYear()} {site.nameEn}</span><span>{label('持续记录，慢慢生长。', 'Keep noticing. Keep making.')}</span></footer>
    {selected && <Reader entry={selected} lang={lang} close={() => setSelected(null)} />}
  </div>;
}

function Heading({ kicker, title, link, more, primary = false }: { kicker: string; title: string; link?: string; more?: string; primary?: boolean }) {
  const Tag = primary ? 'h1' : 'h2';
  return <div className="section-heading"><div><p className="eyebrow">{kicker}</p><Tag>{title}</Tag></div>{link && <Link href={link}>{more} ↗</Link>}</div>;
}
function Empty({ lang }: { lang: Lang }) { return <p className="empty">{pick(lang, '这里留给下一次真实的记录。', 'Room for the next real entry.')}</p>; }
function Projects({ lang }: { lang: Lang }) {
  return <div className="projects">{site.projects.map((p, i) => <article className="project" key={p.id}><div className="project-cover">{p.image ? <Image src={p.image} alt={t(p.title, lang)} fill sizes="(max-width: 700px) 90vw, 28vw" /> : <div className="project-placeholder" aria-hidden="true"><span>{String(i + 1).padStart(2, '0')}</span><i>↗</i></div>}</div><div className="project-body"><p className="eyebrow">{t(p.status, lang)}</p><h3>{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer">{t(p.title, lang)} ↗</a> : t(p.title, lang)}</h3><p>{t(p.summary, lang)}</p><dl><dt>{pick(lang, '为谁而做', 'For whom')}</dt><dd>{t(p.audience, lang)}</dd><dt>{pick(lang, '可见成果', 'Evidence')}</dt><dd>{t(p.evidence, lang)}</dd></dl></div></article>)}{site.projects.length === 0 && <Empty lang={lang} />}</div>;
}
function ArticleList({ entries, lang, open }: { entries: Entry[]; lang: Lang; open: (entry: Entry) => void }) {
  return <div className="article-list">{entries.map((a, i) => <article key={a.slug}><span className="article-index">{String(i + 1).padStart(2, '0')}</span><div><p className="eyebrow">{t(a.category, lang)}</p><h3><button type="button" onClick={() => open(a)}>{t(a.title, lang)}</button></h3><p className="muted">{t(a.summary, lang)}</p></div><Link href={`/writing/${a.slug}`} aria-label={`${pick(lang, '打开独立文章', 'Open article')}: ${t(a.title, lang)}`}>↗</Link></article>)}{entries.length === 0 && <Empty lang={lang} />}</div>;
}
function ArticleBody({ entry, lang }: { entry: Entry; lang: Lang }) {
  return <>{entry.sections.map((section, i) => <section key={i}><h2>{t(section.heading, lang)}</h2>{section.paragraphs.map((p, j) => <p key={j}>{t(p, lang)}</p>)}</section>)}</>;
}
function Reader({ entry, lang, close }: { entry: Entry; lang: Lang; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const node = dialog.current;
    const previousOverflow = document.body.style.overflow;
    node?.showModal(); document.body.style.overflow = 'hidden';
    return () => { node?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, []);
  return <dialog ref={dialog} className={`reader ${expanded ? 'expanded' : ''}`} aria-labelledby="reader-title" onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }}><div className="reader-inner"><header><span>PERSONAL NOTE / {entry.room.toUpperCase()}</span><div><button type="button" onClick={() => setExpanded(!expanded)} aria-label={pick(lang, expanded ? '退出全屏阅读' : '展开全屏阅读', expanded ? 'Exit full-screen reading' : 'Expand reading')}>{expanded ? '↙' : '↗'}</button><button type="button" autoFocus onClick={close} aria-label={pick(lang, '关闭文章', 'Close article')}>×</button></div></header><div className="reader-scroll"><article className="reading"><h1 id="reader-title">{t(entry.title, lang)}</h1><p className="deck">{t(entry.summary, lang)}</p><ArticleBody entry={entry} lang={lang} /><Link href={`/writing/${entry.slug}`}>{pick(lang, '独立文章链接', 'Article permalink')} ↗</Link></article></div></div></dialog>;
}
