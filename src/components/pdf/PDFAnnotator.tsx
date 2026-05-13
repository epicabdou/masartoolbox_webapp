'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Highlighter, MessageSquare, Square, Underline, Download, Trash2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadBlob } from '@/lib/utils';
import { AnnotationMark } from '@/types';
import { generateId } from '@/lib/utils';
import s from './pdf-tools.module.css';

type Tool = 'highlight' | 'underline' | 'rectangle' | 'comment';

const COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#f472b6'];

interface PDFAnnotatorProps {
  data: ArrayBuffer;
  filename: string;
  totalPages: number;
}

export function PDFAnnotator({ data, filename, totalPages }: PDFAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<unknown>(null);
  const [annotations, setAnnotations] = useState<AnnotationMark[]>([]);
  const [tool, setTool] = useState<Tool>('highlight');
  const [color, setColor] = useState('#fbbf24');
  const [drawing, setDrawing] = useState(false);
  const [startPt, setStartPt] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    async function load() {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const doc = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
      setPdfDoc(doc);
    }
    load();
  }, [data]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    async function render() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page = await (pdfDoc as any).getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.3 });
      const canvas = canvasRef.current!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx as any, viewport, canvas } as any).promise;
      drawAnnotations(ctx);
    }
    render();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, currentPage, annotations]);

  const drawAnnotations = (ctx: CanvasRenderingContext2D) => {
    annotations.filter((a) => a.page === currentPage).forEach((a) => {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = a.color;
      ctx.strokeStyle = a.color;
      if (a.type === 'highlight' || a.type === 'rectangle') {
        ctx.fillRect(a.x, a.y, a.width ?? 80, a.height ?? 20);
      } else if (a.type === 'underline') {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y + (a.height ?? 20));
        ctx.lineTo(a.x + (a.width ?? 80), a.y + (a.height ?? 20));
        ctx.stroke();
      } else if (a.type === 'comment') {
        ctx.globalAlpha = 1;
        ctx.fillStyle = a.color;
        ctx.fillRect(a.x, a.y, 20, 20);
        ctx.fillStyle = '#000';
        ctx.font = '11px sans-serif';
        ctx.fillText('✎', a.x + 3, a.y + 14);
      }
      ctx.restore();
    });
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => { setDrawing(true); setStartPt(getPos(e)); };
  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    setDrawing(false);
    const end = getPos(e);
    const ann: AnnotationMark = {
      id: generateId(),
      page: currentPage,
      type: tool,
      x: Math.min(startPt.x, end.x),
      y: Math.min(startPt.y, end.y),
      width: Math.abs(end.x - startPt.x) || 80,
      height: Math.abs(end.y - startPt.y) || 20,
      color,
      comment: tool === 'comment' ? comment : undefined,
    };
    setAnnotations((a) => [...a, ann]);
  };

  const removeAnnotation = (id: string) => setAnnotations((a) => a.filter((x) => x.id !== id));

  async function exportAnnotated() {
    setBusy(true);
    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      const doc = await PDFDocument.load(data);
      const pages = doc.getPages();
      for (const ann of annotations) {
        const pg = pages[ann.page - 1];
        if (!pg) continue;
        const { height } = pg.getSize();
        const hexToRgb = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16) / 255;
          const g = parseInt(hex.slice(3, 5), 16) / 255;
          const b = parseInt(hex.slice(5, 7), 16) / 255;
          return rgb(r, g, b);
        };
        if (ann.type === 'rectangle' || ann.type === 'highlight') {
          pg.drawRectangle({
            x: ann.x * 0.77,
            y: height - (ann.y + (ann.height ?? 20)) * 0.77,
            width: (ann.width ?? 80) * 0.77,
            height: (ann.height ?? 20) * 0.77,
            color: hexToRgb(ann.color),
            opacity: 0.35,
          });
        }
      }
      const bytes = await doc.save();
      downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), filename.replace(/\.pdf$/i, '_annotated.pdf'));
    } finally {
      setBusy(false);
    }
  }

  const pageAnnotations = annotations.filter((a) => a.page === currentPage);

  const toolButtons: { tool: Tool; icon: React.ReactNode; label: string }[] = [
    { tool: 'highlight', icon: <Highlighter size={14} />, label: 'Highlight' },
    { tool: 'underline', icon: <Underline size={14} />, label: 'Underline' },
    { tool: 'rectangle', icon: <Square size={14} />, label: 'Rectangle' },
    { tool: 'comment', icon: <MessageSquare size={14} />, label: 'Comment' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Highlighter size={14} color="var(--accent-light)" /> Annotate PDF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={s.annoTools} style={{ marginBottom: 10 }}>
            {toolButtons.map((tb) => (
              <Button key={tb.tool} size="sm" variant={tool === tb.tool ? 'default' : 'outline'} onClick={() => setTool(tb.tool)}>
                {tb.icon} {tb.label}
              </Button>
            ))}
            <div className={s.colorRow}>
              <Palette size={14} color="var(--text-faint)" />
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={[s.colorDot, color === c ? s.selected : ''].join(' ')}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {tool === 'comment' && (
            <input
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '6px 12px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', marginBottom: 10, boxSizing: 'border-box' }}
              placeholder="Comment text…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          )}

          <div className={s.pageNumbers} style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Page:</span>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={[s.pageNum2, currentPage === p ? s.active : s.inactive].join(' ')}
              >
                {p}
              </button>
            ))}
            {totalPages > 10 && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>+{totalPages - 10} more</span>}
          </div>

          <div className={s['annoCanvas-wrap']}>
            <canvas ref={canvasRef} className={s.annoCanvas} onMouseDown={onMouseDown} onMouseUp={onMouseUp} />
          </div>

          {pageAnnotations.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 6 }}>
                {pageAnnotations.length} annotation(s) on page {currentPage}
              </p>
              <div className={s.annoList}>
                {pageAnnotations.map((a) => (
                  <div key={a.id} className={s.annoItem}>
                    <div className={s.annoDot} style={{ background: a.color }} />
                    <span className={s.annoType}>{a.type}</span>
                    {a.comment && <span className={s.annoComment}>· {a.comment}</span>}
                    <span className={s.annoSpacer} />
                    <Button size="icon" variant="ghost" style={{ height: 20, width: 20 }} onClick={() => removeAnnotation(a.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={exportAnnotated}
            disabled={busy || annotations.length === 0}
            style={{ width: '100%', marginTop: 12 }}
          >
            <Download size={14} />
            {busy ? 'Exporting…' : `Export with ${annotations.length} annotation(s)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
