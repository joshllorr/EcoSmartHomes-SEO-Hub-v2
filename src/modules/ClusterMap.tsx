import React from "react";

export default function ClusterMap() {
  return (
    <div style={{ background: "#141c33", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "24px" }}>
      <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 700 }}>Topic Clusters</h2>
      <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "14px" }}>
        Cluster graph, pillar pages, child nodes, semantic relationships.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        <div style={{ background: "#0b1020", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "16px" }}>
          <div style={{ marginBottom: "12px" }}>
            <span style={{ background: "#f59e0b", color: "#000", fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>PILLAR</span>
            <h3 style={{ margin: "6px 0 4px 0", fontSize: "16px", fontWeight: 700 }}>Heat Pump Retrofit Guide</h3>
            <code style={{ color: "#38bdf8", fontSize: "13px" }}>heat-pump-guide.html</code>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ padding: "6px 0", fontSize: "13px", borderBottom: "1px dashed rgba(255, 255, 255, 0.05)" }}>🔗 <code>heat-pump-costs.html</code> (SEAI Grants & Payback)</li>
            <li style={{ padding: "6px 0", fontSize: "13px", borderBottom: "1px dashed rgba(255, 255, 255, 0.05)" }}>🔗 <code>heat-pump-grants.html</code> (2026 Eligibility Criteria)</li>
            <li style={{ padding: "6px 0", fontSize: "13px", borderBottom: "1px dashed rgba(255, 255, 255, 0.05)" }}>🔗 <code>heat-pump-maintenance-schedule.html</code> [Auto-Expanded]</li>
          </ul>
        </div>

        <div style={{ background: "#0b1020", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "16px" }}>
          <div style={{ marginBottom: "12px" }}>
            <span style={{ background: "#f59e0b", color: "#000", fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>PILLAR</span>
            <h3 style={{ margin: "6px 0 4px 0", fontSize: "16px", fontWeight: 700 }}>Solar PV & Battery Storage Hub</h3>
            <code style={{ color: "#38bdf8", fontSize: "13px" }}>solar-pv-guide.html</code>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ padding: "6px 0", fontSize: "13px", borderBottom: "1px dashed rgba(255, 255, 255, 0.05)" }}>🔗 <code>solar-pv-grants-2026.html</code> (€2,100 Subsidy)</li>
            <li style={{ padding: "6px 0", fontSize: "13px", borderBottom: "1px dashed rgba(255, 255, 255, 0.05)" }}>🔗 <code>solar-panel-payback-period.html</code> (ROI Calculations)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
