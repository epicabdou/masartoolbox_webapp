'use client';

import React from 'react';
import { Search, SortAsc, SortDesc, Pin, FolderPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExplorerStore } from '@/lib/store';
import { FileType, SortField } from '@/types';
import s from './explorer.module.css';

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
    <div className={s.toolbar}>
      <div className={s.searchRow}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}><Search size={14} /></span>
          <Input
            style={{ paddingLeft: 32, height: 32, fontSize: 11 }}
            placeholder="Search files and folders…"
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
          />
          {filter.search && (
            <button className={s.searchClear} onClick={() => setFilter({ search: '' })}>
              <X size={14} />
            </button>
          )}
        </div>
        <Button size="icon" variant="ghost" style={{ height: 32, width: 32, flexShrink: 0 }} onClick={onNewFolder}>
          <FolderPlus size={16} />
        </Button>
        <Button
          size="icon"
          variant={filter.showPinnedOnly ? 'default' : 'ghost'}
          style={{ height: 32, width: 32, flexShrink: 0 }}
          onClick={() => setFilter({ showPinnedOnly: !filter.showPinnedOnly })}
          title="Show pinned only"
        >
          <Pin size={14} />
        </Button>
      </div>
      <div className={s.sortRow}>
        <Select value={filter.sortField} onValueChange={(v) => setFilter({ sortField: v as SortField })}>
          <SelectTrigger style={{ height: 28, fontSize: 11, flex: 1 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_FIELDS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="ghost" style={{ height: 28, width: 28 }} onClick={toggleSortDir}>
          {filter.sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
        </Button>
      </div>
      <div className={s.filterRow}>
        {FILE_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => toggleType(t.value)}
            className={[s.filterPill, filter.types.includes(t.value) ? s.active : s.inactive].join(' ')}
          >
            {t.label}
          </button>
        ))}
        {filter.types.length > 0 && (
          <button className={s.filterClear} onClick={() => setFilter({ types: [] })}>Clear</button>
        )}
      </div>
    </div>
  );
}
