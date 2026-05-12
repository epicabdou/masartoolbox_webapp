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
        <div className="flex items-center justify-center p-4 h-full bg-zinc-900/40">
          <img src={file.dataUrl} alt={file.name} className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" />
        </div>
      );
    }
    if ((file.type === 'docx' || file.type === 'doc') && file.dataUrl) {
      return <p className="text-zinc-500 text-sm p-6">Re-import file to view DOCX content in preview.</p>;
    }
    if (file.type === 'markdown' && file.content) {
      return <MarkdownEditor initialContent={file.content} filename={file.name} />;
    }
    return (
      <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
        <div className="text-center space-y-2">
          <FileIcon type={file.type} className="h-12 w-12 mx-auto" />
          <p>{file.name}</p>
          <p className="text-xs">{formatBytes(file.size)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Folder tree sidebar */}
      <div className="w-52 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="px-3 py-2 border-b border-zinc-800">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium">Folders</p>
        </div>
        <ScrollArea className="flex-1">
          <FolderTree />
        </ScrollArea>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ExplorerToolbar onNewFolder={handleNewFolder} />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-800 bg-zinc-950/40 text-xs text-zinc-500">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.id ?? 'root'}>
              {i > 0 && <ChevronRight className="h-3 w-3 text-zinc-700" />}
              <button
                className={`hover:text-zinc-300 transition-colors ${i === breadcrumbs.length - 1 ? 'text-zinc-300 font-medium' : ''}`}
                onClick={() => setCurrentFolder(crumb.id)}
              >
                {i === 0 ? <span className="flex items-center gap-1"><Home className="h-3 w-3" />{crumb.name}</span> : crumb.name}
              </button>
            </React.Fragment>
          ))}
          <div className="flex-1" />
          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setShowUpload((v) => !v)}>
            <Upload className="h-3 w-3" /> Upload
          </Button>
        </div>

        {showUpload && (
          <div className="p-3 border-b border-zinc-800 bg-zinc-950/40">
            <DropZone onFiles={onFiles} multiple compact label="Drop files to import" />
          </div>
        )}

        <div className="flex-1 flex min-h-0">
          <div className={`flex-1 flex flex-col min-w-0 relative ${previewFile ? 'border-r border-zinc-800' : ''}`}>
            <FileGrid onOpenFile={setPreviewFile} />
          </div>

          {previewFile && (
            <div className="w-80 shrink-0 flex flex-col bg-zinc-950">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-800">
                <FileIcon type={previewFile.type} className="h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">{previewFile.name}</p>
                  <p className="text-[10px] text-zinc-600">{formatBytes(previewFile.size)}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setPreviewFile(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">{renderPreview(previewFile)}</div>
              <div className="p-3 border-t border-zinc-800 space-y-1 text-[10px] text-zinc-600">
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="text-zinc-400 uppercase">{previewFile.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size</span>
                  <span className="text-zinc-400">{formatBytes(previewFile.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Modified</span>
                  <span className="text-zinc-400">{humanDate(previewFile.modifiedAt)}</span>
                </div>
                {previewFile.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap pt-1">
                    {previewFile.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>
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
