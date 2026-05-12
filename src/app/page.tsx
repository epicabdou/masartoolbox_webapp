import Link from 'next/link';
import {
  FileText, Files, FolderOpen, Scissors, Layers, RotateCw,
  Highlighter, FormInput, Eye, RefreshCw, Network, Search,
  Pin, Filter, ArrowRight, Zap
} from 'lucide-react';

const modules = [
  {
    href: '/pdf',
    icon: FileText,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
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
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
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
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
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
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 flex items-center gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-600/25">
          <Zap className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Masar Toolbox</h1>
          <p className="text-zinc-400 mt-1 text-sm max-w-xl">
            A high-intensity document and media manipulation suite. Everything runs locally in your
            browser — your files never leave your device.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-3xl font-bold text-violet-400">{s.value}</p>
            <p className="text-sm font-medium text-zinc-300 mt-1">{s.label}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col gap-4 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${mod.bg}`}>
                <mod.icon className={`h-5 w-5 ${mod.color}`} />
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">{mod.title}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{mod.desc}</p>
            </div>
            <ul className="space-y-1.5 mt-auto">
              {mod.features.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-xs text-zinc-500">
                  <f.icon className="h-3 w-3 text-zinc-600 shrink-0" />
                  {f.label}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>

      {/* Quick start */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Quick Start</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-500">
          <div className="space-y-1">
            <p className="font-medium text-zinc-400">PDF Manager</p>
            <p>Upload any PDF → use the right-side panel to split by page range, merge multiple PDFs, rotate/reorder pages, fill forms, or draw annotations.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-zinc-400">Document Studio</p>
            <p>Drop DOCX, Markdown, or spreadsheet files to view them instantly. Switch to Convert tab for batch format conversion. Use Org Chart to build SVG org trees from JSON.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-zinc-400">File Explorer</p>
            <p>Create folders, drag-and-drop files in, pin important folders for quick access. Filter by type, search by name or tag, and sort any way you like.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
