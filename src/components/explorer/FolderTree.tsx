'use client';

import React, { useState } from 'react';
import { ChevronRight, Pin, Trash2, FolderPlus, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExplorerStore } from '@/lib/store';
import { VirtualFolder } from '@/types';
import { cn } from '@/lib/utils';
import { FileIcon } from './FileIcon';

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
        className={cn(
          'group flex items-center gap-1 rounded-md px-1 py-1 cursor-pointer transition-colors',
          isActive ? 'bg-violet-600/15 text-violet-300' : 'hover:bg-zinc-800/60 text-zinc-400'
        )}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
        onClick={() => setCurrentFolder(folder.id)}
      >
        <button
          className="p-0.5 hover:text-zinc-200"
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        >
          <ChevronRight className={cn('h-3 w-3 transition-transform', expanded && 'rotate-90')} />
        </button>
        <FileIcon type="folder" isOpen={expanded && isActive} className="h-4 w-4" />
        {editing ? (
          <input
            autoFocus
            className="flex-1 bg-zinc-800 text-zinc-100 text-xs rounded px-1 py-0.5 outline-none"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-xs truncate">{folder.name}</span>
        )}
        {folder.pinned && <Pin className="h-2.5 w-2.5 text-yellow-500 shrink-0" />}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
          {editing ? (
            <>
              <button onClick={(e) => { e.stopPropagation(); saveEdit(); }}><Check className="h-3 w-3 text-green-400" /></button>
              <button onClick={(e) => { e.stopPropagation(); setEditing(false); }}><X className="h-3 w-3 text-zinc-500" /></button>
            </>
          ) : (
            <>
              <button onClick={(e) => { e.stopPropagation(); setEditing(true); setEditName(folder.name); }}>
                <Edit2 className="h-3 w-3" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); addFolder('New Folder', folder.id); }}>
                <FolderPlus className="h-3 w-3" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); togglePin(folder.id, true); }}>
                <Pin className={cn('h-3 w-3', folder.pinned && 'text-yellow-500')} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); removeFolder(folder.id); }}>
                <Trash2 className="h-3 w-3 text-red-400" />
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
    <div className="p-2 space-y-1">
      {pinnedFolders.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 px-2 py-1 font-medium">Pinned</p>
          {pinnedFolders.map((f) => (
            <button
              key={f.id}
              onClick={() => setCurrentFolder(f.id)}
              className={cn(
                'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors',
                currentFolderId === f.id ? 'bg-violet-600/15 text-violet-300' : 'text-zinc-400 hover:bg-zinc-800/60'
              )}
            >
              <Pin className="h-3 w-3 text-yellow-500 shrink-0" />
              {f.name}
            </button>
          ))}
          <div className="border-t border-zinc-800 my-2" />
        </div>
      )}
      <button
        onClick={() => setCurrentFolder(null)}
        className={cn(
          'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors',
          currentFolderId === null ? 'bg-violet-600/15 text-violet-300' : 'text-zinc-400 hover:bg-zinc-800/60'
        )}
      >
        <FileIcon type="folder" className="h-4 w-4" />
        All Files
      </button>
      {roots.map((f) => (
        <FolderNode key={f.id} folder={f} level={0} allFolders={folders} />
      ))}
      <button
        onClick={() => addFolder('New Folder', null)}
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40 transition-colors mt-2"
      >
        <FolderPlus className="h-3.5 w-3.5" />
        New Folder
      </button>
    </div>
  );
}
