'use client';
import React, { useState } from 'react';
import { RotateCw, Trash2, ArrowUp, ArrowDown, Download, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { downloadBlob } from '@/lib/utils';
import s from './pdf-tools.module.css';

interface PageInfo { index: number; rotation: number; deleted: boolean }
interface PDFPageManipulatorProps { data: ArrayBuffer; filename: string; totalPages: number }

export function PDFPageManipulator({ data, filename, totalPages }: PDFPageManipulatorProps) {
  const [pages, setPages] = useState<PageInfo[]>(() =>
    Array.from({ length: totalPages }, (_, i) => ({ index: i, rotation: 0, deleted: false })));
  const [busy, setBusy] = useState(false);
  const active = pages.filter((p) => !p.deleted);

  const rotate = (i: number) => setPages((p) => p.map((pg) => pg.index === i ? { ...pg, rotation: (pg.rotation + 90) % 360 } : pg));
  const del = (i: number) => setPages((p) => p.map((pg) => pg.index === i ? { ...pg, deleted: true } : pg));
  const restore = (i: number) => setPages((p) => p.map((pg) => pg.index === i ? { ...pg, deleted: false } : pg));
  const move = (arrIdx: number, dir: -1 | 1) => {
    const arr = [...pages];
    const activeIndices = arr.map((p, i) => (!p.deleted ? i : -1)).filter((x) => x !== -1);
    const pos = activeIndices.indexOf(arrIdx);
    const newPos = pos + dir;
    if (newPos < 0 || newPos >= activeIndices.length) return;
    [arr[activeIndices[pos]], arr[activeIndices[newPos]]] = [arr[activeIndices[newPos]], arr[activeIndices[pos]]];
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
      copied.forEach((page, i) => { if (kept[i].rotation !== 0) page.setRotation(degrees(kept[i].rotation)); dst.addPage(page); });
      const bytes = await dst.save();
      downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), filename.replace(/\.pdf$/i, '_edited.pdf'));
    } finally { setBusy(false); }
  }

  return (
    <Card>
      <CardHeader><CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <RotateCw size={14} color="var(--accent-light)" /> Page Manipulation
      </CardTitle></CardHeader>
      <CardContent>
        <p className={s.hint} style={{ marginBottom: 10 }}>Reorder, rotate, or delete pages.</p>
        <div className={s.scrollList}>
          {pages.map((pg, arrIdx) => {
            const activeIdx = active.findIndex((p) => p.index === pg.index);
            return (
              <div key={pg.index} className={[s.pageRow, pg.deleted ? s.deleted : s.normal].join(' ')}>
                <GripVertical size={14} className={s.grip} />
                <span className={s.pageNum}>{pg.index + 1}</span>
                <span className={s.pageName}>Page {pg.index + 1}</span>
                {pg.rotation !== 0 && <Badge variant="secondary">{pg.rotation}°</Badge>}
                {pg.deleted ? (
                  <Button size="sm" variant="ghost" onClick={() => restore(pg.index)} style={{ fontSize: 11, height: 24, padding: '0 8px' }}>Restore</Button>
                ) : (
                  <div className={s.pageActions}>
                    <Button size="icon" variant="ghost" style={{ height: 24, width: 24 }} onClick={() => move(arrIdx, -1)} disabled={activeIdx === 0}><ArrowUp size={11} /></Button>
                    <Button size="icon" variant="ghost" style={{ height: 24, width: 24 }} onClick={() => move(arrIdx, 1)} disabled={activeIdx === active.length - 1}><ArrowDown size={11} /></Button>
                    <Button size="icon" variant="ghost" style={{ height: 24, width: 24 }} onClick={() => rotate(pg.index)}><RotateCw size={11} /></Button>
                    <Button size="icon" variant="ghost" style={{ height: 24, width: 24 }} onClick={() => del(pg.index)}><Trash2 size={11} color="var(--clr-red)" /></Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Button onClick={applyAndDownload} disabled={busy || active.length === 0} style={{ width: '100%', marginTop: 12 }}>
          <Download size={14} />{busy ? 'Processing…' : `Save (${active.length} pages)`}
        </Button>
      </CardContent>
    </Card>
  );
}
