import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FileType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getFileType(filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, FileType> = {
    pdf: 'pdf',
    docx: 'docx',
    doc: 'doc',
    md: 'markdown',
    markdown: 'markdown',
    xlsx: 'xlsx',
    xls: 'xls',
    csv: 'csv',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
  };
  return map[ext] ?? 'unknown';
}

export function fileTypeColor(type: FileType): string {
  const colors: Record<FileType, string> = {
    pdf: 'text-red-400',
    docx: 'text-blue-400',
    doc: 'text-blue-400',
    markdown: 'text-purple-400',
    xlsx: 'text-green-400',
    xls: 'text-green-400',
    csv: 'text-emerald-400',
    image: 'text-yellow-400',
    folder: 'text-amber-400',
    unknown: 'text-zinc-400',
  };
  return colors[type];
}

export function fileTypeBg(type: FileType): string {
  const colors: Record<FileType, string> = {
    pdf: 'bg-red-500/10 border-red-500/20',
    docx: 'bg-blue-500/10 border-blue-500/20',
    doc: 'bg-blue-500/10 border-blue-500/20',
    markdown: 'bg-purple-500/10 border-purple-500/20',
    xlsx: 'bg-green-500/10 border-green-500/20',
    xls: 'bg-green-500/10 border-green-500/20',
    csv: 'bg-emerald-500/10 border-emerald-500/20',
    image: 'bg-yellow-500/10 border-yellow-500/20',
    folder: 'bg-amber-500/10 border-amber-500/20',
    unknown: 'bg-zinc-500/10 border-zinc-500/20',
  };
  return colors[type];
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function humanDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
