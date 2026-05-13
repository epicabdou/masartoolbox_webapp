import Link from 'next/link';
import {
  FileText, Files, FolderOpen, Scissors, Layers, RotateCw,
  Highlighter, FormInput, Eye, RefreshCw, Network, Search,
  Pin, Filter, ArrowRight, Zap
} from 'lucide-react';
import s from './home.module.css';

const modules = [
  {
    href: '/pdf',
    icon: FileText,
    color: 'var(--clr-red)',
    iconBg: 'rgba(239,68,68,0.1)',
    iconBd: 'rgba(239,68,68,0.2)',
    title: 'PDF Manager',
    desc: 'Complete PDF manipulation suite',
    features: [
      { icon: Scissors, label: 'Split by page ranges' },
      { icon: Layers, label: 'Merge multiple PDFs' },
      { icon: RotateCw, label: 'Reorder & rotate pages' },
      { icon: FormInput, label: 'Fill interactive forms' },
      { icon: Highlighter, label: 'Annotate & highlight' },
    ],
  },
  {
    href: '/documents',
    icon: Files,
    color: 'var(--clr-blue)',
    iconBg: 'var(--clr-blue-bg)',
    iconBd: 'rgba(59,130,246,0.2)',
    title: 'Document Studio',
    desc: 'Full document management toolkit',
    features: [
      { icon: Eye, label: 'View DOCX, Markdown, Sheets' },
      { icon: RefreshCw, label: 'Batch format conversion' },
      { icon: FileText, label: 'Markdown editor & preview' },
      { icon: Network, label: 'Org chart from JSON data' },
      { icon: Files, label: 'Multi-document workspace' },
    ],
  },
  {
    href: '/explorer',
    icon: FolderOpen,
    color: 'var(--clr-amber)',
    iconBg: 'var(--clr-amber-bg)',
    iconBd: 'rgba(245,158,11,0.2)',
    title: 'File Explorer',
    desc: 'Persistent file organization system',
    features: [
      { icon: FolderOpen, label: 'Nested folder structure' },
      { icon: Pin, label: 'Folder & file pinning' },
      { icon: Search, label: 'Full-text search & filters' },
      { icon: Filter, label: 'Sort by type, date, size' },
      { icon: Files, label: 'Drag-and-drop upload' },
    ],
  },
];

const stats = [
  { label: 'PDF Operations', value: '5', sub: 'split, merge, pages, forms, annotate' },
  { label: 'Document Formats', value: '6+', sub: 'DOCX, DOC, MD, XLSX, XLS, CSV' },
  { label: 'File Processing', value: '100%', sub: 'local — no uploads to servers' },
];

export default function HomePage() {
  return (
    <div className={s.page}>
      <div className={s.hero}>
        <div className={s.heroIcon}>
          <Zap size={28} color="#fff" />
        </div>
        <div>
          <h1 className={s.heroTitle}>Masar Toolbox</h1>
          <p className={s.heroDesc}>
            A high-intensity document and media manipulation suite. Everything runs locally in your
            browser — your files never leave your device.
          </p>
        </div>
      </div>

      <div className={s.stats}>
        {stats.map((st) => (
          <div key={st.label} className={s.statCard}>
            <p className={s.statValue}>{st.value}</p>
            <p className={s.statLabel}>{st.label}</p>
            <p className={s.statSub}>{st.sub}</p>
          </div>
        ))}
      </div>

      <div className={s.modules}>
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href} className={s.moduleCard}>
            <div className={s.moduleCardTop}>
              <div className={s.moduleIcon} style={{ background: mod.iconBg, borderColor: mod.iconBd }}>
                <mod.icon size={20} color={mod.color} />
              </div>
              <ArrowRight size={16} className={s.moduleArrow} />
            </div>
            <div>
              <h2 className={s.moduleTitle}>{mod.title}</h2>
              <p className={s.moduleDesc}>{mod.desc}</p>
            </div>
            <ul className={s.featureList}>
              {mod.features.map((f) => (
                <li key={f.label} className={s.featureItem}>
                  <f.icon size={12} color="var(--text-faint)" style={{ flexShrink: 0 }} />
                  {f.label}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>

      <div className={s.quickStart}>
        <h3 className={s.quickTitle}>Quick Start</h3>
        <div className={s.quickGrid}>
          <div className={s.quickSection}>
            <p className={s.quickSectionTitle}>PDF Manager</p>
            <p>Upload any PDF → use the right-side panel to split by page range, merge multiple PDFs, rotate/reorder pages, fill forms, or draw annotations.</p>
          </div>
          <div className={s.quickSection}>
            <p className={s.quickSectionTitle}>Document Studio</p>
            <p>Drop DOCX, Markdown, or spreadsheet files to view them instantly. Switch to Convert tab for batch format conversion. Use Org Chart to build SVG org trees from JSON.</p>
          </div>
          <div className={s.quickSection}>
            <p className={s.quickSectionTitle}>File Explorer</p>
            <p>Create folders, drag-and-drop files in, pin important folders for quick access. Filter by type, search by name or tag, and sort any way you like.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
