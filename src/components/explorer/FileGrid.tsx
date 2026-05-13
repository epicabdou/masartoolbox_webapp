'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Pin, Trash2, Download, MoreVertical, Tag, X, FolderOpen as FolderInput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExplorerStore } from '@/lib/store';
import { VirtualFile } from '@/types';
import { formatBytes, humanDate, downloadBlob, fileToArrayBuffer, fileToDataUrl, fileToText, getFileType } from '@/lib/utils';
import { FileIcon } from './FileIcon';
import s from './explorer.module.css';

interface FileCardProps {
  file: VirtualFile;
  selected: boolean;
  onSelect: (id: string, multi: boolean) => void;
  onOpen: (file: VirtualFile) => void;
}

function FileCard({ file, selected, onSelect, onOpen }: FileCardProps) {
  const { togglePin, removeFile, updateFile } = useExplorerStore();
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
      className={[s.fileCard, selected ? s.selected : ''].join(' ')}
      onClick={(e) => onSelect(file.id, e.metaKey || e.ctrlKey || e.shiftKey)}
      onDoubleClick={() => onOpen(file)}
    >
      <div className={s.fileCardHeader}>
        <FileIcon type={file.type} size={32} />
        <div className={s.fileCardMeta}>
          {file.pinned && <Pin size={12} color="var(--clr-yellow)" />}
          <div className={s.fileMenuWrap}>
            <Button
              size="icon"
              variant="ghost"
              style={{ height: 24, width: 24 }}
              className={s.fileMenuBtn}
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            >
              <MoreVertical size={14} />
            </Button>
            {menuOpen && (
              <div className={s.fileMenu} onMouseLeave={() => setMenuOpen(false)}>
                {[
                  { icon: <Pin size={14} />, label: file.pinned ? 'Unpin' : 'Pin', onClick: () => togglePin(file.id) },
                  { icon: <Tag size={14} />, label: 'Add tag', onClick: () => { setTagging(true); setMenuOpen(false); } },
                  { icon: <Download size={14} />, label: 'Download', onClick: download },
                  { icon: <Trash2 size={14} color="var(--clr-red)" />, label: 'Delete', onClick: () => removeFile(file.id) },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={s.fileMenuItem}
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
      <p className={s.fileName}>{file.name}</p>
      <p className={s.fileSize}>{formatBytes(file.size)}</p>
      <p className={s.fileDate}>{humanDate(file.modifiedAt)}</p>
      {(file.tags.length > 0 || tagging) && (
        <div className={s.fileTags} onClick={(e) => e.stopPropagation()}>
          {file.tags.map((t) => (
            <span key={t} className={s.fileTag}>
              {t}
              <button className={s.fileTagRemove} onClick={() => removeTag(t)}><X size={8} /></button>
            </span>
          ))}
          {tagging && (
            <input
              autoFocus
              className={s.fileTagInput}
              placeholder="tag…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') setTagging(false); }}
              onBlur={() => setTagging(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface FileGridProps {
  onOpenFile: (file: VirtualFile) => void;
}

export function FileGrid({ onOpenFile }: FileGridProps) {
  const { files, folders, filter, selectedIds, setSelectedIds, currentFolderId, importFile } = useExplorerStore();

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  const visibleFiles = useMemo(() => {
    let list = currentFolderId === null ? files : files.filter((f) => f.parentId === currentFolderId);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q)));
    }
    if (filter.types.length > 0) list = list.filter((f) => filter.types.includes(f.type));
    if (filter.showPinnedOnly) list = list.filter((f) => f.pinned);
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
      setSelectedIds(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.length === 1 && selectedIds[0] === id ? [] : [id]);
    }
  };

  return (
    <div
      {...getRootProps()}
      className={[s.grid, isDragActive ? s.dragActive : ''].join(' ')}
    >
      <input {...getInputProps()} />
      {isDragActive && (
        <div className={s.dropOverlay}>
          <div className={s.dropOverlayInner}>Drop files to add to current folder</div>
        </div>
      )}

      {visibleFolders.length === 0 && visibleFiles.length === 0 ? (
        <div className={s.gridEmpty}>
          <FolderInput size={40} />
          <p>Drag files here or use the toolbar to add them</p>
        </div>
      ) : (
        <div>
          {visibleFolders.length > 0 && (
            <div className={s.gridSection}>
              <p className={s.gridLabel}>Folders</p>
              <div className={s.folderGrid}>
                {visibleFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className={s.folderItem}
                    onDoubleClick={() => useExplorerStore.getState().setCurrentFolder(folder.id)}
                  >
                    <FileIcon type="folder" size={20} />
                    <span className={s.folderName}>{folder.name}</span>
                    {folder.pinned && <Pin size={10} color="var(--clr-yellow)" style={{ flexShrink: 0, marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>
            </div>
          )}
          {visibleFiles.length > 0 && (
            <div className={s.gridSection}>
              <p className={s.gridLabel}>Files ({visibleFiles.length})</p>
              <div className={s.fileGrid}>
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
