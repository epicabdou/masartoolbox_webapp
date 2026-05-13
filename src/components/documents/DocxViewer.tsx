'use client';

import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import s from './documents.module.css';

interface DocxViewerProps {
  buffer: ArrayBuffer;
}

export function DocxViewer({ buffer }: DocxViewerProps) {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function convert() {
      setLoading(true);
      setError('');
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        setHtml(result.value);
      } catch (e) {
        setError(String(e));
      }
      setLoading(false);
    }
    convert();
  }, [buffer]);

  if (loading) return (
    <div className={s.spinner}>
      <div className={s.spinIcon} />
      Converting document…
    </div>
  );

  if (error) return (
    <div className={s.errorBox}>Failed to render: {error}</div>
  );

  return (
    <ScrollArea style={{ height: '100%' }}>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ padding: 24, fontSize: 14, lineHeight: 1.7 }}
      />
    </ScrollArea>
  );
}
