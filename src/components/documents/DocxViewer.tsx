'use client';

import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="flex items-center justify-center h-40 text-zinc-500 text-sm gap-2">
      <div className="h-4 w-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      Converting document…
    </div>
  );

  if (error) return (
    <div className="text-red-400 text-sm p-4 bg-red-500/10 rounded-lg border border-red-500/20">
      Failed to render: {error}
    </div>
  );

  return (
    <ScrollArea className="h-full">
      <div
        className="prose prose-invert prose-sm max-w-none p-6"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ fontSize: '14px', lineHeight: 1.7 }}
      />
    </ScrollArea>
  );
}
