'use client';

import React, { useEffect, useState } from 'react';
import { Download, TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { downloadBlob } from '@/lib/utils';

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
    <div className="flex items-center justify-center h-40 text-zinc-500 text-sm gap-2">
      <div className="h-4 w-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      Parsing spreadsheet…
    </div>
  );

  const sheet = sheets[activeSheet];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-950/60 flex-wrap">
        <TableIcon className="h-4 w-4 text-green-400 shrink-0" />
        {sheets.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSheet(i)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${i === activeSheet ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {s.name}
          </button>
        ))}
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={exportCsv}>
          <Download className="h-3.5 w-3.5" /> CSV
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-900/80 sticky top-0">
                <th className="w-10 px-2 py-2 text-zinc-600 font-mono border-b border-r border-zinc-800 text-right">#</th>
                {sheet?.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left text-zinc-400 font-medium border-b border-r border-zinc-800 min-w-[100px] max-w-[240px] truncate">
                    {h || <span className="text-zinc-700">{String.fromCharCode(65 + i)}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet?.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-2 py-1.5 text-zinc-700 font-mono border-r border-zinc-800/50 text-right">{ri + 1}</td>
                  {sheet.headers.map((_, ci) => (
                    <td key={ci} className="px-3 py-1.5 text-zinc-300 border-r border-zinc-800/30 max-w-[240px] truncate">
                      {row[ci] !== null && row[ci] !== undefined ? String(row[ci]) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!sheet?.rows.length && (
            <p className="text-center text-zinc-600 text-sm py-12">Empty sheet</p>
          )}
        </div>
      </ScrollArea>
      {sheet && (
        <div className="px-4 py-2 border-t border-zinc-800 text-xs text-zinc-600">
          {sheet.rows.length} rows · {sheet.headers.length} columns
        </div>
      )}
    </div>
  );
}
