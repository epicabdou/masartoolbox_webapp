'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PDFViewerProps {
  data: ArrayBuffer;
  className?: string;
  onPageCount?: (n: number) => void;
}

export function PDFViewer({ data, className, onPageCount }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const pdfDocRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        const loadingTask = pdfjsLib.getDocument({ data: data.slice(0) });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
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
        if (!cancelled) {
          setPages(canvases);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [data, scale, rotation, onPageCount]);

  const pageCanvas = pages[currentPage - 1];

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-950/60">
        <Button size="icon" variant="ghost" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs text-zinc-400 min-w-[80px] text-center">
          {loading ? '…' : `${currentPage} / ${totalPages}`}
        </span>
        <Button size="icon" variant="ghost" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button size="icon" variant="ghost" onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-zinc-400 w-12 text-center">{Math.round(scale * 100)}%</span>
        <Button size="icon" variant="ghost" onClick={() => setScale((s) => Math.min(3, s + 0.2))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setRotation((r) => (r + 90) % 360)}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto flex items-start justify-center p-4 bg-zinc-900/30">
        {loading ? (
          <div className="flex items-center gap-2 mt-20 text-zinc-500 text-sm">
            <div className="h-4 w-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            Rendering PDF…
          </div>
        ) : pageCanvas ? (
          <div className="shadow-2xl rounded overflow-hidden pdf-page">
            <canvas
              width={pageCanvas.width}
              height={pageCanvas.height}
              ref={(el) => { if (el) { el.width = pageCanvas.width; el.height = pageCanvas.height; el.getContext('2d')?.drawImage(pageCanvas, 0, 0); } }}
              className="block max-w-full"
            />
          </div>
        ) : (
          <p className="text-zinc-500 text-sm mt-20">No pages rendered.</p>
        )}
      </div>
    </div>
  );
}
