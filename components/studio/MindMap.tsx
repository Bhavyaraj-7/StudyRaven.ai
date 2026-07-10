"use client";

import { useMemo } from "react";
import ReactFlow, { Background, type Node, type Edge } from "reactflow";
import "reactflow/dist/style.css";

interface MindMapData {
  root: string;
  branches: { label: string; children: string[] }[];
}

export default function MindMap({ data }: { data: MindMapData }) {
  const { nodes, edges } = useMemo(() => buildGraph(data), [data]);

  return (
    <div className="w-full h-[520px] rounded-xl border border-grayline overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
      >
        <Background gap={16} color="#E5E5E5" />
      </ReactFlow>
    </div>
  );
}

function buildGraph(d: MindMapData) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const cx = 400;
  const cy = 260;

  nodes.push({
    id: "root",
    position: { x: cx, y: cy },
    data: { label: d.root },
    style: {
      background: "#0A0A0A",
      color: "#fff",
      border: "none",
      padding: 12,
      borderRadius: 10,
      fontWeight: 600,
    },
  });

  const n = d.branches.length;
  d.branches.forEach((b, i) => {
    const angle = (i / n) * Math.PI * 2;
    const bx = cx + Math.cos(angle) * 260;
    const by = cy + Math.sin(angle) * 220;
    const bid = `b-${i}`;
    nodes.push({
      id: bid,
      position: { x: bx, y: by },
      data: { label: b.label },
      style: {
        background: "#fff",
        border: "1px solid #0A0A0A",
        padding: 8,
        borderRadius: 8,
        fontWeight: 500,
      },
    });
    edges.push({ id: `e-root-${bid}`, source: "root", target: bid, animated: false });

    b.children?.forEach((c, j) => {
      const m = b.children.length;
      const childAngle = angle + (j - (m - 1) / 2) * 0.35;
      const cxp = bx + Math.cos(childAngle) * 160;
      const cyp = by + Math.sin(childAngle) * 130;
      const cid = `b-${i}-c-${j}`;
      nodes.push({
        id: cid,
        position: { x: cxp, y: cyp },
        data: { label: c },
        style: {
          background: "#F4F4F5",
          border: "1px solid #E5E5E5",
          padding: 6,
          borderRadius: 6,
          fontSize: 12,
        },
      });
      edges.push({ id: `e-${bid}-${cid}`, source: bid, target: cid });
    });
  });

  return { nodes, edges };
}
