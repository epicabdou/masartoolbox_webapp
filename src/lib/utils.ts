import { clsx, type ClassValue } from 'clsx';
import { FileType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
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
    pdf: 'pdf', docx: 'docx', doc: 'doc',
    md: 'markdown', markdown: 'markdown',
    xlsx: 'xlsx', xls: 'xls', csv: 'csv',
    png: 'image', jpg: 'image', jpeg: 'image',
    gif: 'image', webp: 'image', svg: 'image',
  };
  return map[ext] ?? 'unknown';
}

export function fileTypeColor(type: FileType): string {
  const colors: Record<FileType, string> = {
    pdf: 'var(--clr-red)', docx: 'var(--clr-blue)', doc: 'var(--clr-blue)',
    markdown: 'var(--clr-purple)', xlsx: 'var(--clr-green)', xls: 'var(--clr-green)',
    csv: 'var(--clr-emerald)', image: 'var(--clr-amber)', folder: 'var(--clr-amber)',
    unknown: 'var(--text-muted)',
  };
  return colors[type];
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function humanDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
