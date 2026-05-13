'use client';

import React, { useRef, useState } from 'react';
import { Download, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrgNode } from '@/types';
import { downloadBlob } from '@/lib/utils';
import s from './documents.module.css';

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
    { id: 'cfo', label: 'CFO', title: 'Chris Doe', color: '#d97706' },
  ],
};

interface NodeBoxProps { node: OrgNode; x: number; y: number; width: number; height: number }

function getLayout(
  node: OrgNode, x: number, y: number, nodeW: number, nodeH: number, hGap: number, vGap: number
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
    const totalChildW = n.children.reduce((sum, c) => sum + subtreeWidth(c), 0) + hGap * (n.children.length - 1);
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
  return { boxes, edges, totalWidth: subtreeWidth(node) };
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
      setOrgData(JSON.parse(jsonInput));
      setJsonError('');
      setEditMode(false);
    } catch (e) {
      setJsonError(String(e));
    }
  };

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const svgStr = new XMLSerializer().serializeToString(svgRef.current);
    downloadBlob(new Blob([svgStr], { type: 'image/svg+xml' }), 'orgchart.svg');
  };

  const downloadPng = async () => {
    if (!svgRef.current) return;
    const svgStr = new XMLSerializer().serializeToString(svgRef.current);
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
    <div className={s.orgRoot}>
      <div className={s.orgToolbar}>
        <Button size="sm" variant={editMode ? 'default' : 'outline'} onClick={() => setEditMode((e) => !e)}>
          <ChevronRight size={14} style={{ transform: editMode ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
          Edit JSON Data
        </Button>
        <div className={s.orgSpacer} />
        <Button size="sm" variant="outline" onClick={downloadSvg}><Download size={14} /> SVG</Button>
        <Button size="sm" variant="outline" onClick={downloadPng}><Download size={14} /> PNG</Button>
      </div>

      {editMode && (
        <div className={s.orgJsonArea}>
          <textarea
            className={s.orgTextarea}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            spellCheck={false}
          />
          {jsonError && <p className={s.orgError}>{jsonError}</p>}
          <div className={s.orgJsonActions}>
            <Button size="sm" onClick={applyJson}>Apply</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
          </div>
          <p className={s.orgHint}>
            JSON schema: <code style={{ color: 'var(--accent-light)' }}>{'{ id, label, title?, color?, children?: [...] }'}</code>
          </p>
        </div>
      )}

      <div className={s.orgSvgWrap}>
        <svg ref={svgRef} viewBox={viewBox} style={{ width: '100%', minHeight: 300 }} xmlns="http://www.w3.org/2000/svg">
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
              stroke="#3f3f46" strokeWidth="1.5" fill="none"
            />
          ))}
          {layoutBoxes.map((b) => (
            <g key={b.id}>
              <rect x={b.x} y={b.y} width={b.width} height={b.height} rx={8}
                fill={b.node.color ?? '#3f3f46'} fillOpacity={0.18}
                stroke={b.node.color ?? '#52525b'} strokeWidth={1.5} />
              <text x={b.x + b.width / 2} y={b.y + (b.node.title ? 22 : 30)}
                textAnchor="middle" fill="#f4f4f5" fontSize="12" fontWeight="600" fontFamily="system-ui,sans-serif">
                {b.node.label}
              </text>
              {b.node.title && (
                <text x={b.x + b.width / 2} y={b.y + 38}
                  textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="system-ui,sans-serif">
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
