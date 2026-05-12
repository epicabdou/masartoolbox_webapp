'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Files,
  FolderOpen,
  LayoutDashboard,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pdf', label: 'PDF Manager', icon: FileText },
  { href: '/documents', label: 'Documents', icon: Files },
  { href: '/explorer', label: 'File Explorer', icon: FolderOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-100 leading-none">Masar</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Toolbox</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-600/15 text-violet-300'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-violet-400' : '')} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <p className="text-[10px] text-zinc-600 text-center">v1.0.0 · All processing local</p>
      </div>
    </aside>
  );
}
