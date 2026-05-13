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
import { X, Files, FileText } from 'lucide-react';
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
        if (type === 'markdown' || type === 'csv') content = await f.text();
        return { id: Math.random().toString(36).slice(2), name: f.name, type, size: f.size, buffer, content };
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)', fontSize: 13 }}>
        No document selected
      </div>
    );
    if (activeDoc.type === 'docx' || activeDoc.type === 'doc') return <DocxViewer buffer={activeDoc.buffer} />;
    if (activeDoc.type === 'markdown') return <MarkdownEditor initialContent={activeDoc.content ?? ''} filename={activeDoc.name} />;
    if (activeDoc.type === 'xlsx' || activeDoc.type === 'xls' || activeDoc.type === 'csv') return <SpreadsheetViewer buffer={activeDoc.buffer} filename={activeDoc.name} />;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)', fontSize: 13 }}>
        Preview not available for this file type.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Left sidebar */}
      <div style={{ width: 224, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {docs.length === 0 && (
            <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', padding: '24px 0' }}>No documents yet</p>
          )}
          {docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveDocId(doc.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                borderRadius: 'var(--radius-lg)', padding: '8px', cursor: 'pointer',
                transition: 'background 0.1s',
                background: activeDocId === doc.id ? 'var(--bg-raised)' : 'transparent',
                color: activeDocId === doc.id ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <FileText size={14} style={{ flexShrink: 0, color: fileTypeColor(doc.type) }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>{formatBytes(doc.size)}</p>
              </div>
              <button
                style={{ opacity: 0, transition: 'opacity 0.15s', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-faint)', display: 'flex' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                onClick={(e) => { e.stopPropagation(); removeDoc(doc.id); }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ padding: 8, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center' }}>{docs.length} document(s) loaded</p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {docs.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 32 }}>
            <Files size={48} color="var(--accent-light)" />
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>Document Studio</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>View, edit, convert DOCX, Markdown, and spreadsheets</p>
            </div>
            <div style={{ width: '100%', maxWidth: 480 }}>
              <DropZone
                onFiles={onFiles}
                multiple
                label="Drop documents here or click to browse"
                sublabel="Supports DOCX, DOC, Markdown, XLSX, XLS, CSV"
              />
            </div>
          </div>
        ) : (
          <Tabs value={viewTab} onValueChange={setViewTab} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ borderBottom: '1px solid var(--border)', padding: '8px 16px', background: 'rgba(9,9,11,0.6)', display: 'flex', alignItems: 'center', gap: 16 }}>
              {activeDoc && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Badge variant="secondary" style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em', flexShrink: 0 }}>{activeDoc.type}</Badge>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeDoc.name}</span>
                </div>
              )}
              <div style={{ flex: 1 }} />
              <TabsList>
                <TabsTrigger value="view">View</TabsTrigger>
                <TabsTrigger value="convert">Convert</TabsTrigger>
                <TabsTrigger value="orgchart">Org Chart</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="view" style={{ flex: 1, marginTop: 0, minHeight: 0, overflow: 'hidden' }}>
              {renderViewer()}
            </TabsContent>
            <TabsContent value="convert" style={{ flex: 1, marginTop: 0, overflow: 'auto', padding: 16 }}>
              <DocumentConverter files={docs.map((d) => ({ name: d.name, type: d.type, buffer: d.buffer, content: d.content }))} />
            </TabsContent>
            <TabsContent value="orgchart" style={{ flex: 1, marginTop: 0, overflow: 'hidden' }}>
              <OrgChartGenerator />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
