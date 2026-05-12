'use client';

import React from 'react';
import { Search, SortAsc, SortDesc, Pin, FolderPlus, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExplorerStore } from '@/lib/store';
import { FileType, SortField } from '@/types';

const FILE_TYPES: { value: FileType; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'DOCX' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'xlsx', label: 'Spreadsheet' },
  { value: 'image', label: 'Image' },
];

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'modifiedAt', label: 'Modified' },
  { value: 'createdAt', label: 'Created' },
  { value: 'size', label: 'Size' },
  { value: 'type', label: 'Type' },
];

export function ExplorerToolbar({ onNewFolder }: { onNewFolder: () => void }) {
  const { filter, setFilter } = useExplorerStore();

  const toggleType = (type: FileType) => {
    const types = filter.types.includes(type)
      ? filter.types.filter((t) => t !== type)
      : [...filter.types, type];
    setFilter({ types });
  };

  const toggleSortDir = () =>
    setFilter({ sortDirection: filter.sortDirection === 'asc' ? 'desc' : 'asc' });

  return (
    <div className="flex flex-col gap-2 p-3 border-b border-zinc-800 bg-zinc-950/60">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            className="pl-8 h-8 text-xs"
            placeholder="Search files and folders…"
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
          />
          {filter.search && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setFilter({ search: '' })}>
              <X className="h-3.5 w-3.5 text-zinc-500" />
            </button>
          )}
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={onNewFolder}>
          <FolderPlus className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={filter.showPinnedOnly ? 'default' : 'ghost'}
          className="h-8 w-8 shrink-0"
          onClick={() => setFilter({ showPinnedOnly: !filter.showPinnedOnly })}
          title="Show pinned only"
        >
          <Pin className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={filter.sortField}
          onValueChange={(v) => setFilter({ sortField: v as SortField })}
        >
          <SelectTrigger className="h-7 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_FIELDS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={toggleSortDir}>
          {filter.sortDirection === 'asc' ? <SortAsc className="h-3.5 w-3.5" /> : <SortDesc className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {FILE_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => toggleType(t.value)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors border ${
              filter.types.includes(t.value)
                ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
        {filter.types.length > 0 && (
          <button
            onClick={() => setFilter({ types: [] })}
            className="px-2 py-0.5 rounded-full text-[10px] text-zinc-600 hover:text-zinc-400"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
