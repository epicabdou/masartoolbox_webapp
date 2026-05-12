'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Pin, Trash2, Download, MoreVertical, Tag, X, FolderOpen as FolderInput
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useExplorerStore } from '@/lib/store';
import { VirtualFile } from '@/types';
import { cn, formatBytes, humanDate, downloadBlob, fileToArrayBuffer, fileToDataUrl, fileToText, getFileType } from '@/lib/utils';
import { FileIcon } from './FileIcon';

interface FileCardProps {
  file: VirtualFile;
  selected: boolean;
  onSelect: (id: string, multi: boolean) => void;
  onOpen: (file: VirtualFile) => void;
}

function FileCard({ file, selected, onSelect, onOpen }: FileCardProps) {
  const { togglePin, removeFile, updateFile, folders } = useExplorerStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !file.tags.includes(tag)) {
      updateFile(file.id, { tags: [...file.tags, tag] });
    }
    setTagInput('');
    setTagging(false);
  };

  const removeTag = (t: string) => updateFile(file.id, { tags: file.tags.filter((x) => x !== t) });

  const download = () => {
    if (file.dataUrl) {
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.name;
      a.click();
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border p-3 cursor-pointer transition-all select-none',
        selected
          ? 'border-violet-500 bg-violet-500/8 shadow-[0_0_0_2px_rgba(124,58,237,0.3)]'
          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
      )}
      onClick={(e) => onSelect(file.id, e.metaKey || e.ctrlKey || e.shiftKey)}
      onDoubleClick={() => onOpen(file)}
    >
      <div className="flex items-start justify-between mb-3">
        <FileIcon type={file.type} className="h-8 w-8" />
        <div className="flex items-center gap-1">
          {file.pinned && <Pin className="h-3 w-3 text-yellow-500" />}
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
            {menuOpen && (
              <div
                className="absolute right-0 top-7 z-20 min-w-[140px] rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl py-1"
                onMouseLeave={() => setMenuOpen(false)}
              >
                {[
                  { icon: <Pin className="h-3.5 w-3.5" />, label: file.pinned ? 'Unpin' : 'Pin', onClick: () => togglePin(file.id) },
                  { icon: <Tag className="h-3.5 w-3.5" />, label: 'Add tag', onClick: () => { setTagging(true); setMenuOpen(false); } },
                  { icon: <Download className="h-3.5 w-3.5" />, label: 'Download', onClick: download },
                  { icon: <Trash2 className="h-3.5 w-3.5 text-red-400" />, label: 'Delete', onClick: () => removeFile(file.id) },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                    onClick={(e) => { e.stopPropagation(); item.onClick(); }}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs font-medium text-zinc-200 truncate mb-1">{file.name}</p>
      <p className="text-[10px] text-zinc-600 mb-2">{formatBytes(file.size)}</p>
      <p className="text-[10px] text-zinc-700 mt-auto">{humanDate(file.modifiedAt)}</p>
      {(file.tags.length > 0 || tagging) && (
        <div className="flex flex-wrap gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
          {file.tags.map((t) => (
            <span key={t} className="flex items-center gap-0.5 bg-zinc-800 text-zinc-400 rounded-full px-1.5 py-0.5 text-[9px]">
              {t}
              <button onClick={() => removeTag(t)}><X className="h-2 w-2" /></button>
            </span>
          ))}
          {tagging ? (
            <input
              autoFocus
              className="bg-zinc-800 text-zinc-200 rounded-full px-1.5 py-0.5 text-[9px] outline-none w-20"
              placeholder="tag…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') setTagging(false); }}
              onBlur={() => setTagging(false)}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

interface FileGridProps {
  onOpenFile: (file: VirtualFile) => void;
}

export function FileGrid({ onOpenFile }: FileGridProps) {
  const {
    files, folders, filter, selectedIds, setSelectedIds, currentFolderId, importFile, addFolder
  } = useExplorerStore();

  const onDrop = useCallback(async (dropped: File[]) => {
    for (const f of dropped) {
      const buffer = await fileToArrayBuffer(f);
      const type = getFileType(f.name);
      let dataUrl: string | undefined;
      let content: string | undefined;
      if (type === 'image') dataUrl = await fileToDataUrl(f);
      if (type === 'markdown' || type === 'csv') content = await fileToText(f);
      await importFile(f, buffer, dataUrl, content);
    }
  }, [importFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const visibleFiles = useMemo(() => {
    let list = currentFolderId === null
      ? files
      : files.filter((f) => f.parentId === currentFolderId);

    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q)));
    }
    if (filter.types.length > 0) {
      list = list.filter((f) => filter.types.includes(f.type));
    }
    if (filter.showPinnedOnly) {
      list = list.filter((f) => f.pinned);
    }
    list = [...list].sort((a, b) => {
      let av: string | number = a[filter.sortField as keyof VirtualFile] as string | number ?? '';
      let bv: string | number = b[filter.sortField as keyof VirtualFile] as string | number ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return filter.sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return filter.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [files, currentFolderId, filter]);

  const visibleFolders = useMemo(() => {
    return folders.filter((f) =>
      f.parentId === (currentFolderId ?? null) &&
      (!filter.search || f.name.toLowerCase().includes(filter.search.toLowerCase())) &&
      (!filter.showPinnedOnly || f.pinned)
    );
  }, [folders, currentFolderId, filter]);

  const handleSelect = (id: string, multi: boolean) => {
    if (multi) {
      setSelectedIds(
        selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
      );
    } else {
      setSelectedIds(selectedIds.length === 1 && selectedIds[0] === id ? [] : [id]);
    }
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex-1 p-4 overflow-auto transition-colors',
        isDragActive && 'bg-violet-500/5 ring-2 ring-violet-500/30 ring-inset'
      )}
    >
      <input {...getInputProps()} />
      {isDragActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-zinc-900/90 rounded-2xl border-2 border-violet-500 px-8 py-6 text-violet-300 font-medium text-sm shadow-2xl">
            Drop files to add to current folder
          </div>
        </div>
      )}

      {visibleFolders.length === 0 && visibleFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-zinc-600 text-sm gap-3">
          <FolderInput className="h-10 w-10" />
          <p>Drag files here or use the toolbar to add them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleFolders.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2 font-medium">Folders</p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                {visibleFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-3 cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/70 transition-colors"
                    onDoubleClick={() => useExplorerStore.getState().setCurrentFolder(folder.id)}
                  >
                    <FileIcon type="folder" className="h-5 w-5" />
                    <span className="text-xs text-zinc-300 truncate">{folder.name}</span>
                    {folder.pinned && <Pin className="h-2.5 w-2.5 text-yellow-500 shrink-0 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          )}
          {visibleFiles.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2 font-medium">
                Files ({visibleFiles.length})
              </p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
                {visibleFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    selected={selectedIds.includes(file.id)}
                    onSelect={handleSelect}
                    onOpen={onOpenFile}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
