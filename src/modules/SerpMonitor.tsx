import React from "react";

export default function SerpMonitor() {
  return (
    <div style={{ background: "#141c33", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "24px" }}>
      <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 700 }}>SERP Monitor</h2>
      <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "14px" }}>
        Volatility, competitor surges, predictive ranking trends.
      </p>
      <div style={{ background: "#0b1020", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div>
            <strong>"heat pump costs ireland"</strong>
            <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>Rank: #2 (Slope: -0.8 • Likely Rise 📈)</div>
          </div>
          <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>Auto-Strengthening</span>
        </div>
      </div>
    </div>
  );
}
