'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Code2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { downloadBlob } from '@/lib/utils';

interface MarkdownEditorProps {
  initialContent?: string;
  filename?: string;
  onChange?: (content: string) => void;
}

export function MarkdownEditor({ initialContent = '', filename = 'document.md', onChange }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState('');

  useEffect(() => { setContent(initialContent); }, [initialContent]);

  useEffect(() => {
    if (!preview) return;
    async function render() {
      const { marked } = await import('marked');
      const result = await marked(content);
      setRenderedHtml(result as string);
    }
    render();
  }, [preview, content]);

  const handleChange = (val: string) => {
    setContent(val);
    onChange?.(val);
  };

  const downloadMd = () => downloadBlob(new Blob([content], { type: 'text/markdown' }), filename);
  const downloadHtml = async () => {
    const { marked } = await import('marked');
    const body = await marked(content);
    const full = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${filename}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.7;color:#374151}h1,h2,h3{color:#111827}code{background:#f3f4f6;padding:.2em .4em;border-radius:4px}pre{background:#f3f4f6;padding:1em;border-radius:8px;overflow:auto}</style></head><body>${body}</body></html>`;
    downloadBlob(new Blob([full], { type: 'text/html' }), filename.replace(/\.md$/, '.html'));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-950/60">
        <Button size="sm" variant={!preview ? 'default' : 'ghost'} onClick={() => setPreview(false)}>
          <Code2 className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button size="sm" variant={preview ? 'default' : 'ghost'} onClick={() => setPreview(true)}>
          <Eye className="h-3.5 w-3.5" /> Preview
        </Button>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={downloadMd}>
          <Download className="h-3.5 w-3.5" /> .md
        </Button>
        <Button size="sm" variant="outline" onClick={downloadHtml}>
          <Download className="h-3.5 w-3.5" /> .html
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        {preview ? (
          <ScrollArea className="h-full">
            <div
              className="prose prose-invert prose-sm max-w-none p-6"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              style={{ fontSize: '14px', lineHeight: 1.7 }}
            />
          </ScrollArea>
        ) : (
          <textarea
            className="w-full h-full bg-transparent text-zinc-200 font-mono text-sm resize-none outline-none p-5 leading-relaxed"
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            spellCheck={false}
            placeholder="# Start writing Markdown…"
          />
        )}
      </div>
    </div>
  );
}
