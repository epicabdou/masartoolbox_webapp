export type FileType =
  | 'pdf'
  | 'docx'
  | 'doc'
  | 'markdown'
  | 'xlsx'
  | 'xls'
  | 'csv'
  | 'image'
  | 'folder'
  | 'unknown';

export interface VirtualFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  createdAt: number;
  modifiedAt: number;
  parentId: string | null;
  pinned: boolean;
  tags: string[];
  dataUrl?: string;
  arrayBuffer?: ArrayBuffer;
  content?: string;
}

export interface VirtualFolder {
  id: string;
  name: string;
  parentId: string | null;
  pinned: boolean;
  createdAt: number;
  modifiedAt: number;
  color?: string;
}

export interface PDFOperation {
  type: 'split' | 'merge' | 'extract' | 'rotate' | 'delete' | 'reorder';
  params: Record<string, unknown>;
}

export interface OrgNode {
  id: string;
  label: string;
  title?: string;
  children?: OrgNode[];
  color?: string;
}

export interface AnnotationMark {
  id: string;
  page: number;
  type: 'highlight' | 'underline' | 'comment' | 'rectangle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  text?: string;
  comment?: string;
}

export interface FormField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  value: string;
  options?: string[];
}

export type SortField = 'name' | 'size' | 'type' | 'modifiedAt' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface ExplorerFilter {
  search: string;
  types: FileType[];
  sortField: SortField;
  sortDirection: SortDirection;
  showPinnedOnly: boolean;
}
