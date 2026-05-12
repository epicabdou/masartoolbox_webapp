'use client';

import React, { useCallback } from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneProps extends Omit<DropzoneOptions, 'onDrop'> {
  onFiles: (files: File[]) => void;
  label?: string;
  sublabel?: string;
  className?: string;
  compact?: boolean;
}

export function DropZone({
  onFiles,
  label = 'Drop files here or click to browse',
  sublabel,
  className,
  compact = false,
  ...opts
}: DropZoneProps) {
  const onDrop = useCallback((accepted: File[]) => onFiles(accepted), [onFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, ...opts });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/40 transition-colors hover:border-violet-500/50 hover:bg-zinc-900/70',
        isDragActive && 'dropzone-active',
        compact ? 'p-4 gap-1' : 'p-10 gap-3',
        className
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className={cn('text-zinc-500', compact ? 'h-5 w-5' : 'h-9 w-9', isDragActive && 'text-violet-400')} />
      <p className={cn('text-center font-medium', compact ? 'text-xs text-zinc-400' : 'text-sm text-zinc-300')}>
        {isDragActive ? 'Release to upload' : label}
      </p>
      {sublabel && !compact && (
        <p className="text-xs text-zinc-500 text-center">{sublabel}</p>
      )}
    </div>
  );
}
