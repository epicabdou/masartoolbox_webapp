'use client';
import React, { useState } from 'react';
import { Scissors, Download, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { downloadBlob } from '@/lib/utils';
import s from './pdf-tools.module.css';

interface Range { from: number; to: number }
interface PDFSplitterProps { data: ArrayBuffer; filename: string; totalPages: number }

export function PDFSplitter({ data, filename, totalPages }: PDFSplitterProps) {
  const [ranges, setRanges] = useState<Range[]>([{ from: 1, to: totalPages }]);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const addRange = () => setRanges((r) => [...r, { from: 1, to: totalPages }]);
  const removeRange = (i: number) => setRanges((r) => r.filter((_, idx) => idx !== i));
  const updateRange = (i: number, key: 'from' | 'to', val: number) =>
    setRanges((r) => r.map((rng, idx) => (idx === i ? { ...rng, [key]: val } : rng)));

  async function split() {
    setBusy(true); setProgress(0);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const src = await PDFDocument.load(data);
      const blobs: Blob[] = [];
      for (let i = 0; i < ranges.length; i++) {
        const { from, to } = ranges[i];
        const dst = await PDFDocument.create();
        const pageIndices = Array.from({ length: Math.max(0, to - from + 1) }, (_, k) => from - 1 + k)
          .filter((idx) => idx >= 0 && idx < src.getPageCount());
        const copied = await dst.copyPages(src, pageIndices);
        copied.forEach((p) => dst.addPage(p));
        const bytes = await dst.save();
        blobs.push(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }));
        setProgress(Math.round(((i + 1) / ranges.length) * 100));
      }
      blobs.forEach((blob, i) => downloadBlob(blob, `${filename.replace(/\.pdf$/i, '')}_part${i + 1}.pdf`));
    } finally { setBusy(false); }
  }

  return (
    <Card>
      <CardHeader><CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Scissors size={14} color="var(--accent-light)" /> Split PDF
      </CardTitle></CardHeader>
      <CardContent>
        <p className={s.hint} style={{ marginBottom: 12 }}>{totalPages} pages · Define page ranges to extract.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ranges.map((rng, i) => (
            <div key={i} className={s.rangeRow}>
              <span className={s.rangeLabel}>Part {i + 1}</span>
              <Input type="number" min={1} max={totalPages} value={rng.from}
                onChange={(e) => updateRange(i, 'from', Number(e.target.value))} style={{ width: 72 }} />
              <span className={s.rangeSep}>—</span>
              <Input type="number" min={1} max={totalPages} value={rng.to}
                onChange={(e) => updateRange(i, 'to', Number(e.target.value))} style={{ width: 72 }} />
              <span className={s.rangePages}>{Math.max(0, rng.to - rng.from + 1)}p</span>
              <Button size="icon" variant="ghost" onClick={() => removeRange(i)} disabled={ranges.length === 1}>
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addRange} style={{ marginTop: 10 }}>
          <Plus size={13} /> Add Range
        </Button>
        {busy && <div style={{ marginTop: 10 }}><Progress value={progress} /></div>}
        <Button onClick={split} disabled={busy} style={{ width: '100%', marginTop: 12 }}>
          <Download size={14} />{busy ? 'Splitting…' : `Split into ${ranges.length} file(s)`}
        </Button>
      </CardContent>
    </Card>
  );
}
