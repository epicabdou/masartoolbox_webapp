'use client';

import React, { useState, useCallback } from 'react';
import { Layers, Download, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropZone } from '@/components/ui/dropzone';
import { Progress } from '@/components/ui/progress';
import { formatBytes, downloadBlob } from '@/lib/utils';

interface MergeFile { name: string; size: number; buffer: ArrayBuffer }

export function PDFMerger() {
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const onFiles = useCallback(async (dropped: File[]) => {
    const pdfs = dropped.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    const loaded = await Promise.all(
      pdfs.map(async (f) => ({ name: f.name, size: f.size, buffer: await f.arrayBuffer() }))
    );
    setFiles((prev) => [...prev, ...loaded]);
  }, []);

  const remove = (i: number) => setFiles((f) => f.filter((_, idx) => idx !== i));

  const handleDragStart = (i: number) => setDragging(i);
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
  const handleDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragging === null || dragging === i) return;
    const reordered = [...files];
    const [item] = reordered.splice(dragging, 1);
    reordered.splice(i, 0, item);
    setFiles(reordered);
    setDragging(null);
    setDragOver(null);
  };

  async function merge() {
    if (files.length < 2) return;
    setBusy(true);
    setProgress(0);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const dst = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const src = await PDFDocument.load(files[i].buffer);
        const indices = src.getPageIndices();
        const copied = await dst.copyPages(src, indices);
        copied.forEach((p) => dst.addPage(p));
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      const bytes = await dst.save();
      downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), 'merged.pdf');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-violet-400" /> Merge PDFs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DropZone
          onFiles={onFiles}
          accept={{ 'application/pdf': ['.pdf'] }}
          multiple
          compact
          label="Add PDF files"
        />
        {files.length > 0 && (
          <div className="space-y-1.5">
            {files.map((f, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={() => { setDragging(null); setDragOver(null); }}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors cursor-grab active:cursor-grabbing ${
                  dragOver === i ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-800 bg-zinc-900/50'
                }`}
              >
                <GripVertical className="h-4 w-4 text-zinc-600 shrink-0" />
                <span className="flex-1 truncate text-zinc-300">{f.name}</span>
                <span className="text-xs text-zinc-500 shrink-0">{formatBytes(f.size)}</span>
                <Button size="icon" variant="ghost" onClick={() => remove(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
        {busy && <Progress value={progress} />}
        <Button onClick={merge} disabled={files.length < 2 || busy} className="w-full">
          <Download className="h-4 w-4" />
          {busy ? 'Merging…' : `Merge ${files.length} PDFs`}
        </Button>
      </CardContent>
    </Card>
  );
}
