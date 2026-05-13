'use client';

import React, { useState, useCallback } from 'react';
import { FolderTree } from '@/components/explorer/FolderTree';
import { FileGrid } from '@/components/explorer/FileGrid';
import { ExplorerToolbar } from '@/components/explorer/ExplorerToolbar';
import { DropZone } from '@/components/ui/dropzone';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useExplorerStore } from '@/lib/store';
import { VirtualFile } from '@/types';
import { FileIcon } from '@/components/explorer/FileIcon';
import { formatBytes, humanDate, getFileType, fileToArrayBuffer, fileToDataUrl, fileToText } from '@/lib/utils';
import { X, ChevronRight, Home, Upload } from 'lucide-react';
import { MarkdownEditor } from '@/components/documents/MarkdownEditor';

export default function ExplorerPage() {
  const { folders, currentFolderId, setCurrentFolder, addFolder, importFile } = useExplorerStore();
  const [previewFile, setPreviewFile] = useState<VirtualFile | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const breadcrumbs = (() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'All Files' }];
    let fid = currentFolderId;
    while (fid) {
      const folder = folders.find((f) => f.id === fid);
      if (!folder) break;
      crumbs.splice(1, 0, { id: folder.id, name: folder.name });
      fid = folder.parentId;
    }
    return crumbs;
  })();

  const handleNewFolder = () => addFolder('New Folder', currentFolderId);

  const onFiles = useCallback(async (files: File[]) => {
    for (const f of files) {
      const buffer = await fileToArrayBuffer(f);
      const type = getFileType(f.name);
      let dataUrl: string | undefined;
      let content: string | undefined;
      if (type === 'image') dataUrl = await fileToDataUrl(f);
      if (type === 'markdown' || type === 'csv') content = await fileToText(f);
      await importFile(f, buffer, dataUrl, content);
    }
    setShowUpload(false);
  }, [importFile]);

  function renderPreview(file: VirtualFile) {
    if (file.type === 'image' && file.dataUrl) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, height: '100%', background: 'rgba(24,24,27,0.4)' }}>
          <img src={file.dataUrl} alt={file.name} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 'var(--radius-lg)', objectFit: 'contain' }} />
        </div>
      );
    }
    if (file.type === 'markdown' && file.content) {
      return <MarkdownEditor initialContent={file.content} filename={file.name} />;
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)', fontSize: 13 }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <FileIcon type={file.type} size={48} />
          <p>{file.name}</p>
          <p style={{ fontSize: 11 }}>{formatBytes(file.size)}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Folder tree sidebar */}
      <div style={{ width: 208, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', fontWeight: 500 }}>Folders</p>
        </div>
        <ScrollArea style={{ flex: 1 }}>
          <FolderTree />
        </ScrollArea>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ExplorerToolbar onNewFolder={handleNewFolder} />

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(9,9,11,0.4)', fontSize: 11, color: 'var(--text-faint)' }}>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.id ?? 'root'}>
              {i > 0 && <ChevronRight size={12} color="var(--text-faint)" />}
              <button
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: i === breadcrumbs.length - 1 ? 'var(--text-secondary)' : 'var(--text-faint)',
                  fontWeight: i === breadcrumbs.length - 1 ? 500 : 400,
                  fontSize: 11, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
                onClick={() => setCurrentFolder(crumb.id)}
              >
                {i === 0 ? <><Home size={12} />{crumb.name}</> : crumb.name}
              </button>
            </React.Fragment>
          ))}
          <div style={{ flex: 1 }} />
          <Button size="sm" variant="ghost" style={{ height: 24, fontSize: 11 }} onClick={() => setShowUpload((v) => !v)}>
            <Upload size={12} /> Upload
          </Button>
        </div>

        {showUpload && (
          <div style={{ padding: 12, borderBottom: '1px solid var(--border)', background: 'rgba(9,9,11,0.4)' }}>
            <DropZone onFiles={onFiles} multiple compact label="Drop files to import" />
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', borderRight: previewFile ? '1px solid var(--border)' : 'none' }}>
            <FileGrid onOpenFile={setPreviewFile} />
          </div>

          {previewFile && (
            <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                <FileIcon type={previewFile.type} size={16} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{previewFile.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>{formatBytes(previewFile.size)}</p>
                </div>
                <Button size="icon" variant="ghost" style={{ height: 24, width: 24 }} onClick={() => setPreviewFile(null)}>
                  <X size={14} />
                </Button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>{renderPreview(previewFile)}</div>
              <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: 'var(--text-faint)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Type</span>
                  <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>{previewFile.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Size</span>
                  <span style={{ color: 'var(--text-muted)' }}>{formatBytes(previewFile.size)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Modified</span>
                  <span style={{ color: 'var(--text-muted)' }}>{humanDate(previewFile.modifiedAt)}</span>
                </div>
                {previewFile.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', paddingTop: 4 }}>
                    {previewFile.tags.map((t) => (
                      <Badge key={t} variant="secondary" style={{ fontSize: 9 }}>{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
