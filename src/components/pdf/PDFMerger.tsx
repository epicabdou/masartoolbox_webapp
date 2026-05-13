'use client';
import React, { useState, useCallback } from 'react';
import { Layers, Download, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropZone } from '@/components/ui/dropzone';
import { Progress } from '@/components/ui/progress';
import { formatBytes, downloadBlob } from '@/lib/utils';
import s from './pdf-tools.module.css';

interface MergeFile { name: string; size: number; buffer: ArrayBuffer }

export function PDFMerger() {
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const onFiles = useCallback(async (dropped: File[]) => {
    const pdfs = dropped.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    const loaded = await Promise.all(pdfs.map(async (f) => ({ name: f.name, size: f.size, buffer: await f.arrayBuffer() })));
    setFiles((prev) => [...prev, ...loaded]);
  }, []);

  const remove = (i: number) => setFiles((f) => f.filter((_, idx) => idx !== i));
  const handleDragStart = (i: number) => setDragging(i);
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
  const handleDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragging === null || dragging === i) return;
    const arr = [...files]; const [item] = arr.splice(dragging, 1); arr.splice(i, 0, item);
    setFiles(arr); setDragging(null); setDragOver(null);
  };

  async function merge() {
    if (files.length < 2) return;
    setBusy(true); setProgress(0);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const dst = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const src = await PDFDocument.load(files[i].buffer);
        const copied = await dst.copyPages(src, src.getPageIndices());
        copied.forEach((p) => dst.addPage(p));
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      const bytes = await dst.save();
      downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), 'merged.pdf');
    } finally { setBusy(false); }
  }

  return (
    <Card>
      <CardHeader><CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Layers size={14} color="var(--accent-light)" /> Merge PDFs
      </CardTitle></CardHeader>
      <CardContent>
        <DropZone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple compact label="Add PDF files" />
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {files.map((f, i) => (
              <div key={i} draggable
                onDragStart={() => handleDragStart(i)} onDragOver={(e) => handleDragOver(e, i)}
                onDrop={(e) => handleDrop(e, i)} onDragEnd={() => { setDragging(null); setDragOver(null); }}
                className={[s.fileItem, dragOver === i ? s.dragOver : s.normal].join(' ')}
              >
                <GripVertical size={14} className={s.grip} />
                <span className={s.fileName}>{f.name}</span>
                <span className={s.fileSize}>{formatBytes(f.size)}</span>
                <Button size="icon" variant="ghost" onClick={() => remove(i)}><Trash2 size={13} /></Button>
              </div>
            ))}
          </div>
        )}
        {busy && <div style={{ marginTop: 10 }}><Progress value={progress} /></div>}
        <Button onClick={merge} disabled={files.length < 2 || busy} style={{ width: '100%', marginTop: 12 }}>
          <Download size={14} />{busy ? 'Merging…' : `Merge ${files.length} PDFs`}
        </Button>
      </CardContent>
    </Card>
  );
}
