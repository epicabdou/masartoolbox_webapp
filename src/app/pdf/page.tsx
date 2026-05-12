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
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-full max-w-lg space-y-4">
          <div className="text-center mb-6">
            <FileText className="h-12 w-12 text-violet-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-zinc-100">PDF Manager</h2>
            <p className="text-sm text-zinc-400 mt-1">Upload a PDF to get started with all tools</p>
          </div>
          <DropZone
            onFiles={onFiles}
            accept={{ 'application/pdf': ['.pdf'] }}
            label="Drop a PDF file here or click to browse"
            sublabel="Supports all PDF versions · Processing happens locally in your browser"
          />
        </div>
        <div className="mt-8 w-full max-w-lg">
          <p className="text-xs text-zinc-600 text-center mb-4">Or use the Merger tool without uploading first</p>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <PDFMerger />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col border-r border-zinc-800 min-w-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/40">
          <FileText className="h-4 w-4 text-violet-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">{file.name}</p>
            <p className="text-xs text-zinc-500">{formatBytes(file.size)} · {totalPages || '…'} pages</p>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setFile(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <PDFViewer data={file.buffer} onPageCount={setTotalPages} className="h-full" />
        </div>
      </div>

      <div className="w-80 shrink-0 overflow-y-auto bg-zinc-950 border-l border-zinc-800">
        <div className="p-4">
          <Tabs defaultValue="split">
            <TabsList className="w-full flex flex-wrap gap-1 h-auto">
              <TabsTrigger value="split" className="flex-1 text-xs">Split</TabsTrigger>
              <TabsTrigger value="merge" className="flex-1 text-xs">Merge</TabsTrigger>
              <TabsTrigger value="pages" className="flex-1 text-xs">Pages</TabsTrigger>
              <TabsTrigger value="forms" className="flex-1 text-xs">Forms</TabsTrigger>
              <TabsTrigger value="annotate" className="flex-1 text-xs">Annotate</TabsTrigger>
            </TabsList>
            <TabsContent value="split">
              {totalPages > 0 ? (
                <PDFSplitter data={file.buffer} filename={file.name} totalPages={totalPages} />
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">Loading page count…</p>
              )}
            </TabsContent>
            <TabsContent value="merge">
              <PDFMerger />
            </TabsContent>
            <TabsContent value="pages">
              {totalPages > 0 ? (
                <PDFPageManipulator data={file.buffer} filename={file.name} totalPages={totalPages} />
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">Loading page count…</p>
              )}
            </TabsContent>
            <TabsContent value="forms">
              <PDFFormFiller data={file.buffer} filename={file.name} />
            </TabsContent>
            <TabsContent value="annotate">
              {totalPages > 0 ? (
                <PDFAnnotator data={file.buffer} filename={file.name} totalPages={totalPages} />
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">Loading…</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
