import React, { useEffect, useState, useCallback } from "react";

type HubOnlineStatus = "checking" | "online" | "offline";

interface HealthPayload {
  status: string;
  service: string;
  version: string;
  uptime: number;
  totalEventsSynced: number;
  lastSyncAt: number | null;
  timestamp: number;
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function HubStatus() {
  const [status, setStatus] = useState<HubOnlineStatus>("checking");
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const checkHubStatus = useCallback(async () => {
    try {
      const res = await fetch("/health", { cache: "no-store" });
      if (res.ok) {
        const data: HealthPayload = await res.json();
        setHealth(data);
        setStatus("online");
      } else {
        setStatus("offline");
      }
    } catch {
      setStatus("offline");
    }
  }, []);

  // Check immediately on mount, then every 15 seconds
  useEffect(() => {
    checkHubStatus();
    const interval = setInterval(checkHubStatus, 15000);
    return () => clearInterval(interval);
  }, [checkHubStatus]);

  const dotColor =
    status === "online"   ? "#10b981" :
    status === "offline"  ? "#ef4444" :
                            "#f59e0b";

  const labelColor =
    status === "online"   ? "#10b981" :
    status === "offline"  ? "#ef4444" :
                            "#f59e0b";

  const label =
    status === "online"   ? "Hub Online" :
    status === "offline"  ? "Hub Offline" :
                            "Checking…";

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      {/* Pill button */}
      <button
        id="hubStatusPill"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={checkHubStatus}
        title="Click to re-check Hub status"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(0,0,0,0.25)",
          border: `1px solid ${dotColor}44`,
          borderRadius: "20px",
          padding: "5px 12px",
          cursor: "pointer",
          color: labelColor,
          fontSize: "12px",
          fontWeight: 700,
          whiteSpace: "nowrap",
          transition: "all 0.2s ease"
        }}
      >
        {/* Animated pulse dot */}
        <span style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: dotColor,
          boxShadow: status === "online" ? `0 0 8px ${dotColor}` : "none",
          display: "inline-block",
          flexShrink: 0,
          animation: status === "online" ? "hubPulse 2s ease-in-out infinite" : "none"
        }} />
        {label}
      </button>

      {/* Tooltip — detailed health info */}
      {showTooltip && health && status === "online" && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 10px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#0d1427",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "8px",
          padding: "12px 16px",
          minWidth: "220px",
          zIndex: 999,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
        }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ● Hub Health
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <tbody>
              {[
                ["Service", health.service],
                ["Version", health.version],
                ["Uptime", formatUptime(health.uptime)],
                ["Events Synced", health.totalEventsSynced.toString()],
                ["Last Sync", health.lastSyncAt
                  ? new Date(health.lastSyncAt).toLocaleTimeString()
                  : "—"]
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: "#64748b", paddingBottom: "4px", paddingRight: "12px" }}>{k}</td>
                  <td style={{ color: "#f1f5f9", fontWeight: 600 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Tooltip arrow */}
          <div style={{
            position: "absolute",
            top: "-5px",
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: "10px",
            height: "10px",
            background: "#0d1427",
            borderLeft: "1px solid rgba(16,185,129,0.3)",
            borderTop: "1px solid rgba(16,185,129,0.3)"
          }} />
        </div>
      )}

      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes hubPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
