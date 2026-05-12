'use client';

import { usePathname } from 'next/navigation';

const titles: Record<string, { title: string; desc: string }> = {
  '/': { title: 'Dashboard', desc: 'Overview and quick access to all tools' },
  '/pdf': { title: 'PDF Manager', desc: 'Split, merge, annotate, and manipulate PDF files' },
  '/documents': { title: 'Document Studio', desc: 'View, edit, convert, and generate documents' },
  '/explorer': { title: 'File Explorer', desc: 'Browse, organize, and manage your files' },
};

export function Header() {
  const pathname = usePathname();
  const key = Object.keys(titles)
    .filter((k) => k !== '/')
    .find((k) => pathname.startsWith(k)) ?? '/';
  const { title, desc } = titles[key] ?? titles['/'];

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="text-base font-semibold text-zinc-100 leading-none">{title}</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
      </div>
    </header>
  );
}
