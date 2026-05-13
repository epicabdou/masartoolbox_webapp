'use client';

import React, { useState, useCallback } from 'react';
import { DropZone } from '@/components/ui/dropzone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { PDFSplitter } from '@/components/pdf/PDFSplitter';
import { PDFMerger } from '@/components/pdf/PDFMerger';
import { PDFPageManipulator } from '@/components/pdf/PDFPageManipulator';
import { PDFFormFiller } from '@/components/pdf/PDFFormFiller';
import { PDFAnnotator } from '@/components/pdf/PDFAnnotator';
import { Button } from '@/components/ui/button';
import { X, FileText } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

export default function PDFPage() {
  const [file, setFile] = useState<{ name: string; size: number; buffer: ArrayBuffer } | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const onFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const buffer = await f.arrayBuffer();
    setFile({ name: f.name, size: f.size, buffer });
    setTotalPages(0);
  }, []);

  if (!file) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <FileText size={48} color="var(--accent-light)" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>PDF Manager</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Upload a PDF to get started with all tools</p>
          </div>
          <DropZone
            onFiles={onFiles}
            accept={{ 'application/pdf': ['.pdf'] }}
            label="Drop a PDF file here or click to browse"
            sublabel="Supports all PDF versions · Processing happens locally in your browser"
          />
        </div>
        <div style={{ marginTop: 32, width: '100%', maxWidth: 480 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', marginBottom: 16 }}>Or use the Merger tool without uploading first</p>
          <div style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', background: 'rgba(24,24,27,0.4)', padding: 20 }}>
            <PDFMerger />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(24,24,27,0.4)' }}>
          <FileText size={16} color="var(--accent-light)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
            <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>{formatBytes(file.size)} · {totalPages || '…'} pages</p>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setFile(null)}><X size={16} /></Button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <PDFViewer data={file.buffer} onPageCount={setTotalPages} className="h-full" />
        </div>
      </div>

      <div style={{ width: 320, flexShrink: 0, overflowY: 'auto', background: 'var(--bg-base)', borderLeft: '1px solid var(--border)' }}>
        <div style={{ padding: 16 }}>
          <Tabs defaultValue="split">
            <TabsList style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 4, height: 'auto' }}>
              <TabsTrigger value="split" style={{ flex: 1, fontSize: 11 }}>Split</TabsTrigger>
              <TabsTrigger value="merge" style={{ flex: 1, fontSize: 11 }}>Merge</TabsTrigger>
              <TabsTrigger value="pages" style={{ flex: 1, fontSize: 11 }}>Pages</TabsTrigger>
              <TabsTrigger value="forms" style={{ flex: 1, fontSize: 11 }}>Forms</TabsTrigger>
              <TabsTrigger value="annotate" style={{ flex: 1, fontSize: 11 }}>Annotate</TabsTrigger>
            </TabsList>
            <TabsContent value="split">
              {totalPages > 0 ? (
                <PDFSplitter data={file.buffer} filename={file.name} totalPages={totalPages} />
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-faint)', textAlign: 'center', padding: 32 }}>Loading page count…</p>
              )}
            </TabsContent>
            <TabsContent value="merge">
              <PDFMerger />
            </TabsContent>
            <TabsContent value="pages">
              {totalPages > 0 ? (
                <PDFPageManipulator data={file.buffer} filename={file.name} totalPages={totalPages} />
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-faint)', textAlign: 'center', padding: 32 }}>Loading page count…</p>
              )}
            </TabsContent>
            <TabsContent value="forms">
              <PDFFormFiller data={file.buffer} filename={file.name} />
            </TabsContent>
            <TabsContent value="annotate">
              {totalPages > 0 ? (
                <PDFAnnotator data={file.buffer} filename={file.name} totalPages={totalPages} />
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-faint)', textAlign: 'center', padding: 32 }}>Loading…</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
