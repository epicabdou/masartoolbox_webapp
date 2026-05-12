'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VirtualFile, VirtualFolder, ExplorerFilter } from '@/types';
import { generateId, getFileType } from './utils';

interface ExplorerStore {
  files: VirtualFile[];
  folders: VirtualFolder[];
  filter: ExplorerFilter;
  selectedIds: string[];
  currentFolderId: string | null;

  addFile: (file: Omit<VirtualFile, 'id'>) => string;
  updateFile: (id: string, updates: Partial<VirtualFile>) => void;
  removeFile: (id: string) => void;
  addFolder: (name: string, parentId?: string | null) => string;
  updateFolder: (id: string, updates: Partial<VirtualFolder>) => void;
  removeFolder: (id: string) => void;
  togglePin: (id: string, isFolder?: boolean) => void;
  moveFile: (fileId: string, targetFolderId: string | null) => void;
  moveFolder: (folderId: string, targetFolderId: string | null) => void;
  setFilter: (filter: Partial<ExplorerFilter>) => void;
  setSelectedIds: (ids: string[]) => void;
  setCurrentFolder: (id: string | null) => void;
  importFile: (file: File, arrayBuffer: ArrayBuffer, dataUrl?: string, content?: string) => Promise<string>;
}

const defaultFilter: ExplorerFilter = {
  search: '',
  types: [],
  sortField: 'modifiedAt',
  sortDirection: 'desc',
  showPinnedOnly: false,
};

export const useExplorerStore = create<ExplorerStore>()(
  persist(
    (set, get) => ({
      files: [],
      folders: [],
      filter: defaultFilter,
      selectedIds: [],
      currentFolderId: null,

      addFile: (file) => {
        const id = generateId();
        set((s) => ({ files: [...s.files, { ...file, id }] }));
        return id;
      },

      updateFile: (id, updates) =>
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id ? { ...f, ...updates, modifiedAt: Date.now() } : f
          ),
        })),

      removeFile: (id) =>
        set((s) => ({ files: s.files.filter((f) => f.id !== id) })),

      addFolder: (name, parentId = null) => {
        const id = generateId();
        const now = Date.now();
        set((s) => ({
          folders: [
            ...s.folders,
            { id, name, parentId, pinned: false, createdAt: now, modifiedAt: now },
          ],
        }));
        return id;
      },

      updateFolder: (id, updates) =>
        set((s) => ({
          folders: s.folders.map((f) =>
            f.id === id ? { ...f, ...updates, modifiedAt: Date.now() } : f
          ),
        })),

      removeFolder: (id) => {
        const { files, folders } = get();
        const allChildren = getAllDescendantIds(id, folders);
        set({
          folders: folders.filter((f) => f.id !== id && !allChildren.has(f.id)),
          files: files.filter(
            (f) => f.parentId !== id && !allChildren.has(f.parentId ?? '')
          ),
        });
      },

      togglePin: (id, isFolder = false) => {
        if (isFolder) {
          set((s) => ({
            folders: s.folders.map((f) =>
              f.id === id ? { ...f, pinned: !f.pinned } : f
            ),
          }));
        } else {
          set((s) => ({
            files: s.files.map((f) =>
              f.id === id ? { ...f, pinned: !f.pinned } : f
            ),
          }));
        }
      },

      moveFile: (fileId, targetFolderId) =>
        set((s) => ({
          files: s.files.map((f) =>
            f.id === fileId ? { ...f, parentId: targetFolderId } : f
          ),
        })),

      moveFolder: (folderId, targetFolderId) =>
        set((s) => ({
          folders: s.folders.map((f) =>
            f.id === folderId ? { ...f, parentId: targetFolderId } : f
          ),
        })),

      setFilter: (filter) =>
        set((s) => ({ filter: { ...s.filter, ...filter } })),

      setSelectedIds: (ids) => set({ selectedIds: ids }),

      setCurrentFolder: (id) => set({ currentFolderId: id }),

      importFile: async (file, arrayBuffer, dataUrl, content) => {
        const now = Date.now();
        const type = getFileType(file.name);
        const id = generateId();
        const virtualFile: VirtualFile = {
          id,
          name: file.name,
          type,
          size: file.size,
          createdAt: now,
          modifiedAt: now,
          parentId: get().currentFolderId,
          pinned: false,
          tags: [],
          dataUrl,
          content,
        };
        set((s) => ({ files: [...s.files, virtualFile] }));
        return id;
      },
    }),
    {
      name: 'masartoolbox-explorer',
      partialize: (state) => ({
        files: state.files.map((f) => ({
          ...f,
          arrayBuffer: undefined,
        })),
        folders: state.folders,
        filter: state.filter,
        currentFolderId: state.currentFolderId,
      }),
    }
  )
);

function getAllDescendantIds(
  folderId: string,
  folders: VirtualFolder[]
): Set<string> {
  const result = new Set<string>();
  const queue = [folderId];
  while (queue.length) {
    const id = queue.shift()!;
    folders.forEach((f) => {
      if (f.parentId === id) {
        result.add(f.id);
        queue.push(f.id);
      }
    });
  }
  return result;
}
