'use client';
import React, { useEffect, useState } from 'react';
import { FormInput, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadBlob } from '@/lib/utils';
import s from './pdf-tools.module.css';

interface FieldEntry { name: string; type: string; value: string }
interface PDFFormFillerProps { data: ArrayBuffer; filename: string }

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
      } catch { setHasForm(false); }
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
            if (f.constructor.name === 'PDFTextField') (f as import('pdf-lib').PDFTextField).setText(field.value);
            else if (f.constructor.name === 'PDFCheckBox' && (field.value.toLowerCase() === 'true' || field.value === '1'))
              (f as import('pdf-lib').PDFCheckBox).check();
          }
        } catch { /* skip */ }
      }
      const bytes = await doc.save();
      downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), filename.replace(/\.pdf$/i, '_filled.pdf'));
    } finally { setBusy(false); }
  }

  if (!loaded) return (
    <Card><CardContent style={{ padding: 32, textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>Loading form fields…</CardContent></Card>
  );
  if (!hasForm || fields.length === 0) return (
    <Card>
      <CardHeader><CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FormInput size={14} color="var(--accent-light)" /> Form Filler</CardTitle></CardHeader>
      <CardContent><p style={{ fontSize: 13, color: 'var(--text-faint)' }}>This PDF has no interactive form fields.</p></CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader><CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FormInput size={14} color="var(--accent-light)" /> Form Filler</CardTitle></CardHeader>
      <CardContent>
        <p className={s.hint} style={{ marginBottom: 10 }}>{fields.length} field(s) detected.</p>
        <div className={s.fieldList}>
          {fields.map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className={s.fieldLabel}>{f.name}<span className={s.fieldType}>({f.type})</span></label>
              <Input value={f.value} onChange={(e) => update(i, e.target.value)}
                placeholder={f.type === 'CheckBox' ? 'true / false' : 'Enter value…'} />
            </div>
          ))}
        </div>
        <Button onClick={fill} disabled={busy} style={{ width: '100%', marginTop: 12 }}>
          <Download size={14} />{busy ? 'Filling…' : 'Fill & Download'}
        </Button>
      </CardContent>
    </Card>
  );
}
