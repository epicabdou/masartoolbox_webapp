'use client';

import React, { useState } from 'react';
import { ChevronRight, Pin, Trash2, FolderPlus, Edit2, Check, X } from 'lucide-react';
import { useExplorerStore } from '@/lib/store';
import { VirtualFolder } from '@/types';
import { FileIcon } from './FileIcon';
import s from './explorer.module.css';

interface FolderNodeProps {
  folder: VirtualFolder;
  level: number;
  allFolders: VirtualFolder[];
}

function FolderNode({ folder, level, allFolders }: FolderNodeProps) {
  const { currentFolderId, setCurrentFolder, togglePin, removeFolder, addFolder, updateFolder } = useExplorerStore();
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const children = allFolders.filter((f) => f.parentId === folder.id);
  const isActive = currentFolderId === folder.id;

  const saveEdit = () => {
    if (editName.trim()) updateFolder(folder.id, { name: editName.trim() });
    setEditing(false);
  };

  return (
    <div>
      <div
        className={[s.treeItem, isActive ? s.active : s.inactive].join(' ')}
        style={{ paddingLeft: level * 12 + 4 }}
        onClick={() => setCurrentFolder(folder.id)}
      >
        <button
          className={s.treeExpandBtn}
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        >
          <ChevronRight size={12} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>
        <FileIcon type="folder" isOpen={expanded && isActive} size={16} />
        {editing ? (
          <input
            autoFocus
            className={s.treeEditInput}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={s.treeLabel}>{folder.name}</span>
        )}
        {folder.pinned && <Pin size={10} color="var(--clr-yellow)" style={{ flexShrink: 0 }} />}
        <div className={s.treeActions}>
          {editing ? (
            <>
              <button className={s.treeActionBtn} onClick={(e) => { e.stopPropagation(); saveEdit(); }}>
                <Check size={12} color="var(--clr-green)" />
              </button>
              <button className={s.treeActionBtn} onClick={(e) => { e.stopPropagation(); setEditing(false); }}>
                <X size={12} color="var(--text-faint)" />
              </button>
            </>
          ) : (
            <>
              <button className={s.treeActionBtn} onClick={(e) => { e.stopPropagation(); setEditing(true); setEditName(folder.name); }}>
                <Edit2 size={12} />
              </button>
              <button className={s.treeActionBtn} onClick={(e) => { e.stopPropagation(); addFolder('New Folder', folder.id); }}>
                <FolderPlus size={12} />
              </button>
              <button className={s.treeActionBtn} onClick={(e) => { e.stopPropagation(); togglePin(folder.id, true); }}>
                <Pin size={12} color={folder.pinned ? 'var(--clr-yellow)' : undefined} />
              </button>
              <button className={s.treeActionBtn} onClick={(e) => { e.stopPropagation(); removeFolder(folder.id); }}>
                <Trash2 size={12} color="var(--clr-red)" />
              </button>
            </>
          )}
        </div>
      </div>
      {expanded && children.map((child) => (
        <FolderNode key={child.id} folder={child} level={level + 1} allFolders={allFolders} />
      ))}
    </div>
  );
}

export function FolderTree() {
  const { folders, currentFolderId, setCurrentFolder, addFolder } = useExplorerStore();
  const roots = folders.filter((f) => f.parentId === null);
  const pinnedFolders = folders.filter((f) => f.pinned);

  return (
    <div className={s.treeRoot}>
      {pinnedFolders.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p className={s.pinnedLabel}>Pinned</p>
          {pinnedFolders.map((f) => (
            <button
              key={f.id}
              onClick={() => setCurrentFolder(f.id)}
              className={[s.treePinnedBtn, currentFolderId === f.id ? s.active : s.inactive].join(' ')}
            >
              <Pin size={12} color="var(--clr-yellow)" style={{ flexShrink: 0 }} />
              {f.name}
            </button>
          ))}
          <hr className={s.pinnedDivider} />
        </div>
      )}
      <button
        onClick={() => setCurrentFolder(null)}
        className={[s.treeAllFiles, currentFolderId === null ? s.active : s.inactive].join(' ')}
      >
        <FileIcon type="folder" size={16} />
        All Files
      </button>
      {roots.map((f) => (
        <FolderNode key={f.id} folder={f} level={0} allFolders={folders} />
      ))}
      <button onClick={() => addFolder('New Folder', null)} className={s.treeNewFolder}>
        <FolderPlus size={14} />
        New Folder
      </button>
    </div>
  );
}
