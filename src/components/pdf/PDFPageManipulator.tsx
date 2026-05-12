'use client';

import React, { useState } from 'react';
import { RotateCw, Trash2, ArrowUp, ArrowDown, Download, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { downloadBlob } from '@/lib/utils';

interface PageInfo { index: number; rotation: number; deleted: boolean }

interface PDFPageManipulatorProps {
  data: ArrayBuffer;
  filename: string;
  totalPages: number;
}

export function PDFPageManipulator({ data, filename, totalPages }: PDFPageManipulatorProps) {
  const [pages, setPages] = useState<PageInfo[]>(() =>
    Array.from({ length: totalPages }, (_, i) => ({ index: i, rotation: 0, deleted: false }))
  );
  const [busy, setBusy] = useState(false);

  const active = pages.filter((p) => !p.deleted);

  const rotate = (i: number) =>
    setPages((p) => p.map((pg) => (pg.index === i ? { ...pg, rotation: (pg.rotation + 90) % 360 } : pg)));
  const del = (i: number) =>
    setPages((p) => p.map((pg) => (pg.index === i ? { ...pg, deleted: true } : pg)));
  const restore = (i: number) =>
    setPages((p) => p.map((pg) => (pg.index === i ? { ...pg, deleted: false } : pg)));
  const move = (idx: number, dir: -1 | 1) => {
    const arr = [...pages];
    const activeIndices = arr.map((p, i) => (!p.deleted ? i : -1)).filter((x) => x !== -1);
    const pos = activeIndices.indexOf(idx);
    const newPos = pos + dir;
    if (newPos < 0 || newPos >= activeIndices.length) return;
    const a = activeIndices[pos];
    const b = activeIndices[newPos];
    [arr[a], arr[b]] = [arr[b], arr[a]];
    setPages(arr);
  };

  async function applyAndDownload() {
    setBusy(true);
    try {
      const { PDFDocument, degrees } = await import('pdf-lib');
      const src = await PDFDocument.load(data);
      const dst = await PDFDocument.create();
      const kept = pages.filter((p) => !p.deleted);
      const copied = await dst.copyPages(src, kept.map((p) => p.index));
      copied.forEach((page, i) => {
        if (kept[i].rotation !== 0) page.setRotation(degrees(kept[i].rotation));
        dst.addPage(page);
      });
      const bytes = await dst.save();
      downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), filename.replace(/\.pdf$/i, '_edited.pdf'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCw className="h-4 w-4 text-violet-400" /> Page Manipulation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-zinc-500">Reorder, rotate, or delete pages. Drag to reorder.</p>
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {pages.map((pg, arrIdx) => {
            const activeIdx = active.findIndex((p) => p.index === pg.index);
            return (
              <div
                key={pg.index}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  pg.deleted ? 'opacity-40 border-zinc-800' : 'border-zinc-800 bg-zinc-900/40'
                }`}
              >
                <GripVertical className="h-4 w-4 text-zinc-600 shrink-0" />
                <span className="text-zinc-400 w-6 text-xs">{pg.index + 1}</span>
                <span className="flex-1 text-zinc-300 text-xs">Page {pg.index + 1}</span>
                {pg.rotation !== 0 && (
                  <Badge variant="secondary">{pg.rotation}°</Badge>
                )}
                {pg.deleted ? (
                  <Button size="sm" variant="ghost" onClick={() => restore(pg.index)} className="text-xs h-6 px-2">Restore</Button>
                ) : (
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(arrIdx, -1)} disabled={activeIdx === 0}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(arrIdx, 1)} disabled={activeIdx === active.length - 1}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => rotate(pg.index)}>
                      <RotateCw className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => del(pg.index)}>
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Button onClick={applyAndDownload} disabled={busy || active.length === 0} className="w-full">
          <Download className="h-4 w-4" />
          {busy ? 'Processing…' : `Save (${active.length} pages)`}
        </Button>
      </CardContent>
    </Card>
  );
}
