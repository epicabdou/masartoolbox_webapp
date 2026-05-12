'use client';

import React, { useState, useCallback } from 'react';
import { DropZone } from '@/components/ui/dropzone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocxViewer } from '@/components/documents/DocxViewer';
import { MarkdownEditor } from '@/components/documents/MarkdownEditor';
import { SpreadsheetViewer } from '@/components/documents/SpreadsheetViewer';
import { DocumentConverter } from '@/components/documents/DocumentConverter';
import { OrgChartGenerator } from '@/components/documents/OrgChartGenerator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Files, FileText, ChevronRight } from 'lucide-react';
import { formatBytes, getFileType, fileTypeColor } from '@/lib/utils';
import { FileType } from '@/types';

interface LoadedDoc {
  id: string;
  name: string;
  type: FileType;
  size: number;
  buffer: ArrayBuffer;
  content?: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<LoadedDoc[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState('view');

  const onFiles = useCallback(async (files: File[]) => {
    const loaded: LoadedDoc[] = await Promise.all(
      files.map(async (f) => {
        const buffer = await f.arrayBuffer();
        const type = getFileType(f.name);
        let content: string | undefined;
        if (type === 'markdown' || type === 'csv') {
          content = await f.text();
        }
        return {
          id: Math.random().toString(36).slice(2),
          name: f.name,
          type,
          size: f.size,
          buffer,
          content,
        };
      })
    );
    setDocs((prev) => {
      const updated = [...prev, ...loaded];
      if (!activeDocId && updated.length) setActiveDocId(updated[0].id);
      return updated;
    });
    if (!activeDocId && loaded.length) setActiveDocId(loaded[0].id);
  }, [activeDocId]);

  const removeDoc = (id: string) => {
    setDocs((d) => {
      const remaining = d.filter((x) => x.id !== id);
      if (activeDocId === id) setActiveDocId(remaining[0]?.id ?? null);
      return remaining;
    });
  };

  const activeDoc = docs.find((d) => d.id === activeDocId);

  function renderViewer() {
    if (!activeDoc) return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        No document selected
      </div>
    );
    if (activeDoc.type === 'docx' || activeDoc.type === 'doc') {
      return <DocxViewer buffer={activeDoc.buffer} />;
    }
    if (activeDoc.type === 'markdown') {
      return <MarkdownEditor initialContent={activeDoc.content ?? ''} filename={activeDoc.name} />;
    }
    if (activeDoc.type === 'xlsx' || activeDoc.type === 'xls' || activeDoc.type === 'csv') {
      return <SpreadsheetViewer buffer={activeDoc.buffer} filename={activeDoc.name} />;
    }
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Preview not available for this file type.
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left sidebar - file list */}
      <div className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="p-3 border-b border-zinc-800">
          <DropZone
            onFiles={onFiles}
            multiple
            compact
            label="Add documents"
            accept={{
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'application/msword': ['.doc'],
              'text/markdown': ['.md', '.markdown'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
              'application/vnd.ms-excel': ['.xls'],
              'text/csv': ['.csv'],
            }}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {docs.length === 0 && (
            <p className="text-xs text-zinc-600 text-center py-6">No documents yet</p>
          )}
          {docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveDocId(doc.id)}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors group ${activeDocId === doc.id ? 'bg-zinc-800 text-zinc-100' : 'hover:bg-zinc-800/50 text-zinc-400'}`}
            >
              <FileText className={`h-3.5 w-3.5 shrink-0 ${fileTypeColor(doc.type)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">{doc.name}</p>
                <p className="text-[10px] text-zinc-600">{formatBytes(doc.size)}</p>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); removeDoc(doc.id); }}
              >
                <X className="h-3 w-3 text-zinc-500 hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 text-center">{docs.length} document(s) loaded</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <Files className="h-12 w-12 text-violet-400" />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-zinc-100">Document Studio</h2>
              <p className="text-sm text-zinc-400 mt-1">View, edit, convert DOCX, Markdown, and spreadsheets</p>
            </div>
            <DropZone
              onFiles={onFiles}
              multiple
              className="w-full max-w-lg"
              label="Drop documents here or click to browse"
              sublabel="Supports DOCX, DOC, Markdown, XLSX, XLS, CSV"
            />
          </div>
        ) : (
          <Tabs value={viewTab} onValueChange={setViewTab} className="flex flex-col h-full">
            <div className="border-b border-zinc-800 px-4 py-2 bg-zinc-950/60 flex items-center gap-4">
              {activeDoc && (
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="secondary" className="uppercase text-[10px] tracking-wide shrink-0">{activeDoc.type}</Badge>
                  <span className="text-sm text-zinc-300 truncate">{activeDoc.name}</span>
                </div>
              )}
              <div className="flex-1" />
              <TabsList>
                <TabsTrigger value="view">View</TabsTrigger>
                <TabsTrigger value="convert">Convert</TabsTrigger>
                <TabsTrigger value="orgchart">Org Chart</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="view" className="flex-1 mt-0 min-h-0 overflow-hidden">
              {renderViewer()}
            </TabsContent>
            <TabsContent value="convert" className="flex-1 mt-0 overflow-auto p-4">
              <DocumentConverter files={docs.map((d) => ({ name: d.name, type: d.type, buffer: d.buffer, content: d.content }))} />
            </TabsContent>
            <TabsContent value="orgchart" className="flex-1 mt-0 overflow-hidden">
              <OrgChartGenerator />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
