'use client';
import { usePathname } from 'next/navigation';
import s from './Header.module.css';

const titles: Record<string, { title: string; desc: string }> = {
  '/': { title: 'Dashboard', desc: 'Overview and quick access to all tools' },
  '/pdf': { title: 'PDF Manager', desc: 'Split, merge, annotate, and manipulate PDF files' },
  '/documents': { title: 'Document Studio', desc: 'View, edit, convert, and generate documents' },
  '/explorer': { title: 'File Explorer', desc: 'Browse, organize, and manage your files' },
};

export function Header() {
  const pathname = usePathname();
  const key = Object.keys(titles).filter((k) => k !== '/').find((k) => pathname.startsWith(k)) ?? '/';
  const { title, desc } = titles[key] ?? titles['/'];
  return (
    <header className={s.header}>
      <div>
        <h1 className={s.title}>{title}</h1>
        <p className={s.desc}>{desc}</p>
      </div>
    </header>
  );
}
