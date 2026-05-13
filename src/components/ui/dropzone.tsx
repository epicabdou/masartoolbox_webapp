'use client';
import React, { useCallback } from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import s from './dropzone.module.css';

interface DropZoneProps extends Omit<DropzoneOptions, 'onDrop'> {
  onFiles: (files: File[]) => void;
  label?: string;
  sublabel?: string;
  className?: string;
  compact?: boolean;
}

export function DropZone({
  onFiles, label = 'Drop files here or click to browse',
  sublabel, className = '', compact = false, ...opts
}: DropZoneProps) {
  const onDrop = useCallback((accepted: File[]) => onFiles(accepted), [onFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, ...opts });

  const zoneClass = [
    s.zone,
    compact ? s.compact : s.normal,
    isDragActive ? s.active : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div {...getRootProps()} className={zoneClass}>
      <input {...getInputProps()} />
      <UploadCloud size={compact ? 18 : 36} className={s.icon} />
      <p className={[s.label, compact ? s.compact : s.normal].join(' ')}>
        {isDragActive ? 'Release to upload' : label}
      </p>
      {sublabel && !compact && <p className={s.sub}>{sublabel}</p>}
    </div>
  );
}
