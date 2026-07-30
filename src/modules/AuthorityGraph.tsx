import React from "react";

export default function AuthorityGraph() {
  return (
    <div style={{ background: "#141c33", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "24px" }}>
      <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 700 }}>Authority Graph</h2>
      <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "14px" }}>
        Nodes, edges, entity relationships, weak node detection.
      </p>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <div style={{ background: "#0b1020", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "8px 16px", borderRadius: "20px", fontSize: "13px" }}>Total Graph Nodes: <strong>38</strong></div>
        <div style={{ background: "#0b1020", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "8px 16px", borderRadius: "20px", fontSize: "13px" }}>Connected Edges: <strong>142</strong></div>
        <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", padding: "8px 16px", borderRadius: "20px", fontSize: "13px" }}>Weak Nodes Detected: <strong>0 (Auto-boosted)</strong></div>
      </div>
    </div>
  );
}
