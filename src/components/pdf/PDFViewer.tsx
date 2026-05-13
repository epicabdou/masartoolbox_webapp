'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import s from './PDFViewer.module.css';

interface PDFViewerProps {
  data: ArrayBuffer;
  className?: string;
  onPageCount?: (n: number) => void;
}

export function PDFViewer({ data, className = '', onPageCount }: PDFViewerProps) {
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
        if (cancelled) return;
        setTotalPages(pdf.numPages);
        onPageCount?.(pdf.numPages);
        const canvases: HTMLCanvasElement[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale, rotation });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await page.render({ canvasContext: ctx as any, viewport, canvas } as any).promise;
          canvases.push(canvas);
        }
        if (!cancelled) { setPages(canvases); setLoading(false); }
      } catch { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [data, scale, rotation, onPageCount]);

  const pageCanvas = pages[currentPage - 1];

  return (
    <div className={[s.root, className].join(' ')}>
      <div className={s.toolbar}>
        <Button size="icon" variant="ghost" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
          <ChevronLeft size={14} />
        </Button>
        <span className={s.pageInfo}>{loading ? '…' : `${currentPage} / ${totalPages}`}</span>
        <Button size="icon" variant="ghost" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
          <ChevronRight size={14} />
        </Button>
        <div className={s.spacer} />
        <Button size="icon" variant="ghost" onClick={() => setScale((sc) => Math.max(0.5, sc - 0.2))}><ZoomOut size={14} /></Button>
        <span className={s.scaleInfo}>{Math.round(scale * 100)}%</span>
        <Button size="icon" variant="ghost" onClick={() => setScale((sc) => Math.min(3, sc + 0.2))}><ZoomIn size={14} /></Button>
        <Button size="icon" variant="ghost" onClick={() => setRotation((r) => (r + 90) % 360)}><RotateCw size={14} /></Button>
      </div>
      <div className={s.body}>
        {loading ? (
          <div className={s.loading}><div className={s.spinner} /> Rendering PDF…</div>
        ) : pageCanvas ? (
          <div className={s.pageWrapper}>
            <canvas
              width={pageCanvas.width}
              height={pageCanvas.height}
              ref={(el) => { if (el) el.getContext('2d')?.drawImage(pageCanvas, 0, 0); }}
            />
          </div>
        ) : (
          <p className={s.empty}>No pages rendered.</p>
        )}
      </div>
    </div>
  );
}
