'use client';

import React, { useEffect, useState } from 'react';
import { Download, TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { downloadBlob } from '@/lib/utils';
import s from './documents.module.css';

interface SheetData {
  name: string;
  headers: string[];
  rows: (string | number | boolean | null)[][];
}

interface SpreadsheetViewerProps {
  buffer: ArrayBuffer;
  filename: string;
}

export function SpreadsheetViewer({ buffer, filename }: SpreadsheetViewerProps) {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const loaded: SheetData[] = workbook.SheetNames.map((name) => {
        const ws = workbook.Sheets[name];
        const data: (string | number | boolean | null)[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
        const headers = (data[0] ?? []).map(String);
        const rows = data.slice(1);
        return { name, headers, rows };
      });
      setSheets(loaded);
      setLoading(false);
    }
    load();
  }, [buffer]);

  const exportCsv = () => {
    const sheet = sheets[activeSheet];
    if (!sheet) return;
    const lines = [sheet.headers.join(','), ...sheet.rows.map((r) => r.map((v) => JSON.stringify(v ?? '')).join(','))];
    downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv' }), filename.replace(/\.(xlsx?|ods)$/i, `_${sheet.name}.csv`));
  };

  if (loading) return (
    <div className={s.spinner}>
      <div className={s.spinIcon} />
      Parsing spreadsheet…
    </div>
  );

  const sheet = sheets[activeSheet];

  return (
    <div className={s.sheetRoot}>
      <div className={s.sheetToolbar}>
        <TableIcon size={16} color="var(--clr-green)" style={{ flexShrink: 0 }} />
        {sheets.map((sh, i) => (
          <button
            key={i}
            onClick={() => setActiveSheet(i)}
            className={[s.sheetTab, i === activeSheet ? s.active : s.inactive].join(' ')}
          >
            {sh.name}
          </button>
        ))}
        <div className={s.sheetSpacer} />
        <Button size="sm" variant="outline" onClick={exportCsv}>
          <Download size={14} /> CSV
        </Button>
      </div>
      <ScrollArea style={{ flex: 1 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className={s.sheetTable}>
            <thead className={s.sheetThead}>
              <tr>
                <th className={s.sheetThRowNum}>#</th>
                {sheet?.headers.map((h, i) => (
                  <th key={i} className={s.sheetTh}>
                    {h || <span style={{ color: 'var(--text-faint)' }}>{String.fromCharCode(65 + i)}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet?.rows.map((row, ri) => (
                <tr key={ri} className={s.sheetTr}>
                  <td className={s.sheetTdRowNum}>{ri + 1}</td>
                  {sheet.headers.map((_, ci) => (
                    <td key={ci} className={s.sheetTd}>
                      {row[ci] !== null && row[ci] !== undefined ? String(row[ci]) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!sheet?.rows.length && (
            <p className={s.sheetEmpty}>Empty sheet</p>
          )}
        </div>
      </ScrollArea>
      {sheet && (
        <div className={s.sheetFooter}>
          {sheet.rows.length} rows · {sheet.headers.length} columns
        </div>
      )}
    </div>
  );
}
