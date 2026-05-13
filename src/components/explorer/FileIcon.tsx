import React from 'react';
import { FileText, FileSpreadsheet, FileCode, Image, Folder, FolderOpen, File } from 'lucide-react';
import { FileType } from '@/types';
import { fileTypeColor } from '@/lib/utils';

interface FileIconProps {
  type: FileType;
  isOpen?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function FileIcon({ type, isOpen, size = 16, className, style }: FileIconProps) {
  const color = fileTypeColor(type);
  const props = { size, className, style: { color, flexShrink: 0, ...style } };

  if (type === 'folder') return isOpen ? <FolderOpen {...props} /> : <Folder {...props} />;
  if (type === 'pdf') return <FileText {...props} />;
  if (type === 'docx' || type === 'doc') return <FileText {...props} />;
  if (type === 'markdown') return <FileCode {...props} />;
  if (type === 'xlsx' || type === 'xls' || type === 'csv') return <FileSpreadsheet {...props} />;
  if (type === 'image') return <Image {...props} />;
  return <File {...props} />;
}
