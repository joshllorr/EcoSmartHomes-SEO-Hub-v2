import React, { useEffect, useState } from "react";
import { hubCommands } from "../services/hubCommands";

interface FleetMetrics {
  [domain: string]: {
    drafts: number;
    rewrites: number;
    expansions: number;
    backlinks: number;
    status: string;
  };
}

export type AutonomyMode = "passive" | "assisted" | "full_autonomous";

export default function FleetManager() {
  const [fleetData, setFleetData] = useState<FleetMetrics | null>(null);
  const [autonomyModes, setAutonomyModes] = useState<Record<string, AutonomyMode>>({
    "ecosmarthomes.ie": "full_autonomous",
    "future-site-1.ie": "assisted"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFleetData = async () => {
    try {
      const res = await fetch("/api/unified-analytics");
      if (!res.ok) throw new Error("Failed to fetch fleet metrics");
      const json = await res.json();
      setFleetData(json.fleet);
      if (json.autonomousState?.domainAutonomyModes) {
        setAutonomyModes(json.autonomousState.domainAutonomyModes);
      }
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleModeChange = async (domain: string, mode: AutonomyMode) => {
    setAutonomyModes(prev => ({ ...prev, [domain]: mode }));
    await hubCommands.setDomainAutonomyMode(domain, mode);
    await fetchFleetData();
  };

  const handleGlobalOptimization = () => {
    if (!fleetData) return;
    const domains = Object.keys(fleetData);
    hubCommands.optimizeAll(domains);
    alert(`Triggered global optimization pipeline for ${domains.length} domains.`);
  };

  if (loading && !fleetData) {
    return <div style={{ color: "#94a3b8", padding: "20px" }}>Loading Fleet Data...</div>;
  }

  if (error) {
    return <div style={{ color: "#ef4444", padding: "20px" }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: "24px", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px 0" }}>Multi-Domain Fleet Manager</h2>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
            Configure Per-Domain Autonomy Modes (Passive, Assisted, Full Autonomous) & orchestrate SEO engines across properties.
          </p>
        </div>
        <button
          onClick={handleGlobalOptimization}
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
          }}
        >
          Run Global Optimization ⚡
        </button>
      </div>

      <div style={{
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={{ padding: "16px", color: "#94a3b8", fontWeight: 600 }}>Domain</th>
              <th style={{ padding: "16px", color: "#94a3b8", fontWeight: 600 }}>Autonomy Mode</th>
              <th style={{ padding: "16px", color: "#94a3b8", fontWeight: 600 }}>Drafts</th>
              <th style={{ padding: "16px", color: "#94a3b8", fontWeight: 600 }}>Rewrites</th>
              <th style={{ padding: "16px", color: "#94a3b8", fontWeight: 600 }}>Expansions</th>
              <th style={{ padding: "16px", color: "#94a3b8", fontWeight: 600 }}>Backlinks</th>
              <th style={{ padding: "16px", color: "#94a3b8", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "16px", color: "#94a3b8", fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fleetData && Object.entries(fleetData).map(([domain, metrics]) => {
              const currentMode = autonomyModes[domain] || "assisted";

              return (
                <tr key={domain} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "16px", fontWeight: 600, color: "#38bdf8" }}>{domain}</td>
                  <td style={{ padding: "16px" }}>
                    <select
                      value={currentMode}
                      onChange={(e) => handleModeChange(domain, e.target.value as AutonomyMode)}
                      style={{
                        background: currentMode === "full_autonomous" ? "rgba(16, 185, 129, 0.2)" : currentMode === "assisted" ? "rgba(59, 130, 246, 0.2)" : "rgba(148, 163, 184, 0.2)",
                        color: currentMode === "full_autonomous" ? "#34d399" : currentMode === "assisted" ? "#60a5fa" : "#cbd5e1",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      <option value="passive" style={{ background: "#0f172a", color: "#f8fafc" }}>1. Passive (Suggestions Only)</option>
                      <option value="assisted" style={{ background: "#0f172a", color: "#f8fafc" }}>2. Assisted (Waits Approval)</option>
                      <option value="full_autonomous" style={{ background: "#0f172a", color: "#f8fafc" }}>3. Full Autonomous (Auto-Executes)</option>
                    </select>
                  </td>
                  <td style={{ padding: "16px" }}>{metrics.drafts}</td>
                  <td style={{ padding: "16px" }}>{metrics.rewrites}</td>
                  <td style={{ padding: "16px" }}>{metrics.expansions}</td>
                  <td style={{ padding: "16px" }}>{metrics.backlinks}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "6px",
                      color: metrics.status === "online" ? "#10b981" : "#ef4444",
                      background: metrics.status === "online" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600
                    }}>
                      <span style={{
                        width: "6px", height: "6px", borderRadius: "50%", 
                        background: metrics.status === "online" ? "#10b981" : "#ef4444",
                        boxShadow: `0 0 6px ${metrics.status === "online" ? "#10b981" : "#ef4444"}`
                      }} />
                      {metrics.status === "online" ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => hubCommands.generateDraft("auto-fleet", { siteId: domain })} style={actionBtnStyle}>
                        Draft
                      </button>
                      <button onClick={() => hubCommands.rewriteArticle("auto-fleet", { siteId: domain })} style={actionBtnStyle}>
                        Rewrite
                      </button>
                      <button onClick={() => hubCommands.queueExpansion("auto-fleet", { siteId: domain })} style={actionBtnStyle}>
                        Expand
                      </button>
                      <button onClick={() => hubCommands.publishToGitHub("auto-fleet", { siteId: domain })} style={actionBtnStyle}>
                        Publish
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  background: "#1e293b",
  color: "#e2e8f0",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  padding: "6px 12px",
  fontSize: "12px",
  cursor: "pointer",
  transition: "all 0.2s"
};
