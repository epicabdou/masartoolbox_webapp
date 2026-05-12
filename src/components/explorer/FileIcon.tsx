import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image,
  Folder,
  FolderOpen,
  File,
} from 'lucide-react';
import { FileType } from '@/types';
import { cn, fileTypeColor } from '@/lib/utils';

interface FileIconProps {
  type: FileType;
  isOpen?: boolean;
  className?: string;
}

export function FileIcon({ type, isOpen, className }: FileIconProps) {
  const color = fileTypeColor(type);
  const props = { className: cn('shrink-0', color, className) };

  if (type === 'folder') {
    return isOpen ? <FolderOpen {...props} /> : <Folder {...props} />;
  }
  if (type === 'pdf') return <FileText {...props} />;
  if (type === 'docx' || type === 'doc') return <FileText {...props} />;
  if (type === 'markdown') return <FileCode {...props} />;
  if (type === 'xlsx' || type === 'xls' || type === 'csv') return <FileSpreadsheet {...props} />;
  if (type === 'image') return <Image {...props} />;
  return <File {...props} />;
}
