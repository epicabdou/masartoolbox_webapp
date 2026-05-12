'use client';

import React, { useState } from 'react';
import { ArrowRight, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { downloadBlob } from '@/lib/utils';
import { FileType } from '@/types';

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
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-violet-400" /> Batch Convert
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-zinc-500">{validFiles.length} convertible file(s) loaded</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-sm text-zinc-400">Source files</div>
          <ArrowRight className="h-4 w-4 text-zinc-600" />
          <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
            <SelectTrigger className="w-28">
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
        <Button onClick={convertAll} disabled={busy || !validFiles.length} className="w-full">
          <RefreshCw className="h-4 w-4" />
          {busy ? 'Converting…' : `Convert ${validFiles.length} file(s) to .${outputFormat}`}
        </Button>
        {results.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-zinc-500 font-medium">Results</p>
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm">
                <span className="flex-1 truncate text-zinc-300">{r.name}</span>
                <Button size="sm" variant="outline" onClick={() => downloadBlob(r.blob, r.name)}>
                  <Download className="h-3.5 w-3.5" />
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
      const full = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
      return new Blob([full], { type: 'text/html' });
    }
    if (to === 'txt') {
      return new Blob([file.content ?? ''], { type: 'text/plain' });
    }
  }
  if (file.type === 'xlsx' || file.type === 'xls' || file.type === 'csv') {
    const XLSX = await import('xlsx');
    const wb = XLSX.read(file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (to === 'csv') {
      return new Blob([XLSX.utils.sheet_to_csv(ws)], { type: 'text/csv' });
    }
    if (to === 'json') {
      const data = XLSX.utils.sheet_to_json(ws);
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }
    if (to === 'html') {
      return new Blob([XLSX.utils.sheet_to_html(ws)], { type: 'text/html' });
    }
  }
  return null;
}
