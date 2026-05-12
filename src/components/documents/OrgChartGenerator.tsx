'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Download, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrgNode } from '@/types';
import { downloadBlob } from '@/lib/utils';

const SAMPLE_ORG: OrgNode = {
  id: 'root',
  label: 'CEO',
  title: 'Jane Smith',
  color: '#7c3aed',
  children: [
    {
      id: 'cto', label: 'CTO', title: 'Bob Lee', color: '#2563eb',
      children: [
        { id: 'eng1', label: 'Engineering', title: 'Team Lead', color: '#0891b2' },
        { id: 'eng2', label: 'DevOps', title: 'Team Lead', color: '#0891b2' },
      ],
    },
    {
      id: 'cmo', label: 'CMO', title: 'Alice Wang', color: '#059669',
      children: [
        { id: 'mkt1', label: 'Marketing', title: 'Manager', color: '#16a34a' },
        { id: 'mkt2', label: 'Design', title: 'Manager', color: '#16a34a' },
      ],
    },
    {
      id: 'cfo', label: 'CFO', title: 'Chris Doe', color: '#d97706',
    },
  ],
};

interface NodeBoxProps {
  node: OrgNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

function getLayout(
  node: OrgNode,
  x: number,
  y: number,
  nodeW: number,
  nodeH: number,
  hGap: number,
  vGap: number
): { boxes: (NodeBoxProps & { id: string })[]; edges: { x1: number; y1: number; x2: number; y2: number }[]; totalWidth: number } {
  const boxes: (NodeBoxProps & { id: string })[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];

  function subtreeWidth(n: OrgNode): number {
    if (!n.children?.length) return nodeW;
    return Math.max(nodeW, n.children.reduce((sum, c) => sum + subtreeWidth(c), 0) + hGap * (n.children.length - 1));
  }

  function layout(n: OrgNode, cx: number, cy: number) {
    boxes.push({ id: n.id, node: n, x: cx - nodeW / 2, y: cy, width: nodeW, height: nodeH });
    if (!n.children?.length) return;
    const childY = cy + nodeH + vGap;
    const totalChildW = n.children.reduce((s, c) => s + subtreeWidth(c), 0) + hGap * (n.children.length - 1);
    let childX = cx - totalChildW / 2;
    for (const child of n.children) {
      const cw = subtreeWidth(child);
      const childCx = childX + cw / 2;
      edges.push({ x1: cx, y1: cy + nodeH, x2: childCx, y2: childY });
      layout(child, childCx, childY);
      childX += cw + hGap;
    }
  }

  layout(node, x, y);
  const totalWidth = subtreeWidth(node);
  return { boxes, edges, totalWidth };
}

export function OrgChartGenerator() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [orgData, setOrgData] = useState<OrgNode>(SAMPLE_ORG);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SAMPLE_ORG, null, 2));
  const [jsonError, setJsonError] = useState('');
  const [editMode, setEditMode] = useState(false);

  const NODE_W = 140, NODE_H = 56, H_GAP = 28, V_GAP = 60;

  const { boxes: layoutBoxes, edges: layoutEdges, totalWidth: svgW } = getLayout(orgData, 0, 40, NODE_W, NODE_H, H_GAP, V_GAP);
  const maxY = Math.max(...layoutBoxes.map((b) => b.y + b.height), 200);
  const svgH = maxY + 60;
  const pad = 30;
  const viewBox = `${-svgW / 2 - pad} 0 ${svgW + pad * 2} ${svgH}`;

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setOrgData(parsed);
      setJsonError('');
      setEditMode(false);
    } catch (e) {
      setJsonError(String(e));
    }
  };

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    downloadBlob(new Blob([svgStr], { type: 'image/svg+xml' }), 'orgchart.svg');
  };

  const downloadPng = async () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const img = new window.Image();
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgRef.current!.viewBox.baseVal.width * 2;
      canvas.height = svgRef.current!.viewBox.baseVal.height * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((b) => b && downloadBlob(b, 'orgchart.png'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant={editMode ? 'default' : 'outline'} onClick={() => setEditMode((e) => !e)}>
          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${editMode ? 'rotate-90' : ''}`} />
          Edit JSON Data
        </Button>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={downloadSvg}>
          <Download className="h-3.5 w-3.5" /> SVG
        </Button>
        <Button size="sm" variant="outline" onClick={downloadPng}>
          <Download className="h-3.5 w-3.5" /> PNG
        </Button>
      </div>

      {editMode && (
        <div className="space-y-2">
          <textarea
            className="w-full h-52 font-mono text-xs bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-zinc-200 outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            spellCheck={false}
          />
          {jsonError && <p className="text-red-400 text-xs">{jsonError}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={applyJson}>Apply</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
          </div>
          <p className="text-xs text-zinc-500">
            JSON schema: <code className="text-violet-400">{'{ id, label, title?, color?, children?: [...] }'}</code>
          </p>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-zinc-900/40 rounded-xl border border-zinc-800">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full"
          style={{ minHeight: '300px' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x={-9999} y={-9999} width={99999} height={99999} fill="#0d0d0f" />
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L0,8 L8,4 z" fill="#52525b" />
            </marker>
          </defs>
          {layoutEdges.map((e, i) => (
            <path
              key={i}
              d={`M${e.x1},${e.y1} C${e.x1},${(e.y1 + e.y2) / 2} ${e.x2},${(e.y1 + e.y2) / 2} ${e.x2},${e.y2}`}
              stroke="#3f3f46"
              strokeWidth="1.5"
              fill="none"
            />
          ))}
          {layoutBoxes.map((b) => (
            <g key={b.id}>
              <rect
                x={b.x}
                y={b.y}
                width={b.width}
                height={b.height}
                rx={8}
                fill={b.node.color ?? '#3f3f46'}
                fillOpacity={0.18}
                stroke={b.node.color ?? '#52525b'}
                strokeWidth={1.5}
              />
              <text
                x={b.x + b.width / 2}
                y={b.y + (b.node.title ? 22 : 30)}
                textAnchor="middle"
                fill="#f4f4f5"
                fontSize="12"
                fontWeight="600"
                fontFamily="system-ui,sans-serif"
              >
                {b.node.label}
              </text>
              {b.node.title && (
                <text
                  x={b.x + b.width / 2}
                  y={b.y + 38}
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize="10"
                  fontFamily="system-ui,sans-serif"
                >
                  {b.node.title}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
