'use client';

import React, { useState } from 'react';
import { ArrowRight, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { downloadBlob } from '@/lib/utils';
import { FileType } from '@/types';
import s from './documents.module.css';

interface ConversionFile {
  name: string;
  type: FileType;
  buffer: ArrayBuffer;
  content?: string;
}

interface DocumentConverterProps {
  files: ConversionFile[];
}

type OutputFormat = 'html' | 'txt' | 'md' | 'csv' | 'json';

const CONVERSIONS: Record<FileType, OutputFormat[]> = {
  docx: ['html', 'txt', 'md'],
  doc: ['html', 'txt'],
  markdown: ['html', 'txt'],
  xlsx: ['csv', 'json', 'html'],
  xls: ['csv', 'json'],
  csv: ['json', 'html'],
  pdf: ['txt'],
  image: [],
  folder: [],
  unknown: [],
};

export function DocumentConverter({ files }: DocumentConverterProps) {
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('html');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ name: string; blob: Blob }[]>([]);

  const validFiles = files.filter((f) => CONVERSIONS[f.type]?.length > 0);

  async function convertAll() {
    if (!validFiles.length) return;
    setBusy(true);
    setProgress(0);
    const out: { name: string; blob: Blob }[] = [];
    for (let i = 0; i < validFiles.length; i++) {
      const f = validFiles[i];
      try {
        const blob = await convertFile(f, outputFormat);
        if (blob) {
          const baseName = f.name.replace(/\.[^.]+$/, '');
          out.push({ name: `${baseName}.${outputFormat}`, blob });
        }
      } catch { /* skip failed */ }
      setProgress(Math.round(((i + 1) / validFiles.length) * 100));
    }
    setResults(out);
    setBusy(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={14} color="var(--accent-light)" /> Batch Convert
        </CardTitle>
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>{validFiles.length} convertible file(s) loaded</p>
        <div className={s.convRow}>
          <div className={s.convLabel}>Source files</div>
          <ArrowRight size={16} color="var(--text-faint)" />
          <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
            <SelectTrigger style={{ width: 112 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="txt">Plain Text</SelectItem>
              <SelectItem value="md">Markdown</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {busy && <Progress value={progress} />}
        <Button onClick={convertAll} disabled={busy || !validFiles.length} style={{ width: '100%' }}>
          <RefreshCw size={14} />
          {busy ? 'Converting…' : `Convert ${validFiles.length} file(s) to .${outputFormat}`}
        </Button>
        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            <p className={s.convResultsLabel}>Results</p>
            {results.map((r, i) => (
              <div key={i} className={s.convResultItem}>
                <span className={s.convResultName}>{r.name}</span>
                <Button size="sm" variant="outline" onClick={() => downloadBlob(r.blob, r.name)}>
                  <Download size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function convertFile(file: ConversionFile, to: OutputFormat): Promise<Blob | null> {
  if (file.type === 'docx' || file.type === 'doc') {
    const mammoth = await import('mammoth');
    if (to === 'html') {
      const result = await mammoth.convertToHtml({ arrayBuffer: file.buffer });
      return new Blob([result.value], { type: 'text/html' });
    }
    if (to === 'txt' || to === 'md') {
      const result = await mammoth.extractRawText({ arrayBuffer: file.buffer });
      return new Blob([result.value], { type: 'text/plain' });
    }
  }
  if (file.type === 'markdown') {
    if (to === 'html') {
      const { marked } = await import('marked');
      const html = await marked(file.content ?? '');
      return new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`], { type: 'text/html' });
    }
    if (to === 'txt') return new Blob([file.content ?? ''], { type: 'text/plain' });
  }
  if (file.type === 'xlsx' || file.type === 'xls' || file.type === 'csv') {
    const XLSX = await import('xlsx');
    const wb = XLSX.read(file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (to === 'csv') return new Blob([XLSX.utils.sheet_to_csv(ws)], { type: 'text/csv' });
    if (to === 'json') return new Blob([JSON.stringify(XLSX.utils.sheet_to_json(ws), null, 2)], { type: 'application/json' });
    if (to === 'html') return new Blob([XLSX.utils.sheet_to_html(ws)], { type: 'text/html' });
  }
  return null;
}
