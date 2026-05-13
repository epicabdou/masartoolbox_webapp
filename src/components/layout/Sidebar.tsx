'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Files, FolderOpen, LayoutDashboard, Zap } from 'lucide-react';
import s from './Sidebar.module.css';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pdf', label: 'PDF Manager', icon: FileText },
  { href: '/documents', label: 'Documents', icon: Files },
  { href: '/explorer', label: 'File Explorer', icon: FolderOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className={s.sidebar}>
      <div className={s.brand}>
        <div className={s.logo}><Zap size={16} color="#fff" /></div>
        <div>
          <p className={s.brandName}>Masar</p>
          <p className={s.brandSub}>Toolbox</p>
        </div>
      </div>
      <nav className={s.nav}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={[s.link, active ? s.active : ''].join(' ')}>
              <Icon size={16} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className={s.footer}>
        <p className={s.footerText}>v1.0.0 · All processing local</p>
      </div>
    </aside>
  );
}
