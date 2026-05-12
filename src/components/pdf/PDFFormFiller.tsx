'use client';

import React, { useEffect, useState } from 'react';
import { FormInput, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadBlob } from '@/lib/utils';

interface FieldEntry { name: string; type: string; value: string }

interface PDFFormFillerProps {
  data: ArrayBuffer;
  filename: string;
}

export function PDFFormFiller({ data, filename }: PDFFormFillerProps) {
  const [fields, setFields] = useState<FieldEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hasForm, setHasForm] = useState(true);

  useEffect(() => {
    async function detectFields() {
      try {
        const { PDFDocument } = await import('pdf-lib');
        const doc = await PDFDocument.load(data, { ignoreEncryption: true });
        const form = doc.getForm();
        const rawFields = form.getFields();
        if (rawFields.length === 0) { setHasForm(false); setLoaded(true); return; }
        setFields(rawFields.map((f) => ({ name: f.getName(), type: f.constructor.name.replace('PDF', ''), value: '' })));
      } catch {
        setHasForm(false);
      }
      setLoaded(true);
    }
    detectFields();
  }, [data]);

  const update = (i: number, value: string) =>
    setFields((fs) => fs.map((f, idx) => (idx === i ? { ...f, value } : f)));

  async function fill() {
    setBusy(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(data, { ignoreEncryption: true });
      const form = doc.getForm();
      for (const field of fields) {
        try {
          if (field.value) {
            const f = form.getField(field.name);
            if (f.constructor.name === 'PDFTextField') {
              (f as import('pdf-lib').PDFTextField).setText(field.value);
            } else if (f.constructor.name === 'PDFCheckBox') {
              if (field.value.toLowerCase() === 'true' || field.value === '1') {
                (f as import('pdf-lib').PDFCheckBox).check();
              }
            }
          }
        } catch { /* skip unfillable fields */ }
      }
      const bytes = await doc.save();
      downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), filename.replace(/\.pdf$/i, '_filled.pdf'));
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return (
    <Card><CardContent className="py-8 text-center text-zinc-500 text-sm">Loading form fields…</CardContent></Card>
  );

  if (!hasForm || fields.length === 0) return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><FormInput className="h-4 w-4 text-violet-400" /> Form Filler</CardTitle></CardHeader>
      <CardContent><p className="text-sm text-zinc-500">This PDF has no interactive form fields.</p></CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FormInput className="h-4 w-4 text-violet-400" /> Form Filler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-zinc-500">{fields.length} field(s) detected.</p>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {fields.map((f, i) => (
            <div key={i} className="space-y-1">
              <label className="text-xs text-zinc-400 flex items-center gap-1.5">
                {f.name}
                <span className="text-zinc-600 text-[10px]">({f.type})</span>
              </label>
              <Input
                value={f.value}
                onChange={(e) => update(i, e.target.value)}
                placeholder={f.type === 'CheckBox' ? 'true / false' : 'Enter value…'}
              />
            </div>
          ))}
        </div>
        <Button onClick={fill} disabled={busy} className="w-full">
          <Download className="h-4 w-4" />
          {busy ? 'Filling…' : 'Fill & Download'}
        </Button>
      </CardContent>
    </Card>
  );
}
