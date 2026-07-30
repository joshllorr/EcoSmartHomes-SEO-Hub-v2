// RankingStabilityMap.tsx
import React, { useState } from "react";
import "./RankingStabilityMap.css";

type StabilityItem = {
  keyword: string;
  rank: number;
  slope: number;
  volatility: number;
};

const data: StabilityItem[] = [
  {
    keyword: "heat pump costs ireland",
    rank: 2,
    slope: -0.8,
    volatility: 0.22
  },
  {
    keyword: "solar pv grants ireland",
    rank: 4,
    slope: 0.6,
    volatility: 0.58
  },
  {
    keyword: "seai grants limerick",
    rank: 7,
    slope: 0.2,
    volatility: 0.41
  },
  {
    keyword: "attic insulation cost dublin",
    rank: 3,
    slope: -0.5,
    volatility: 0.18
  },
  {
    keyword: "ber rating upgrade steps",
    rank: 9,
    slope: 0.7,
    volatility: 0.74
  }
];

function getColor(slope: number, volatility: number): "green" | "yellow" | "red" {
  if (slope < 0 && volatility < 0.3) return "green";
  if (slope > 0.5 && volatility > 0.5) return "red";
  return "yellow";
}

function getMessage(slope: number, volatility: number): string {
  const color = getColor(slope, volatility);
  if (color === "green") {
    return "Upward trend. Automation strengthening active.";
  }
  if (color === "red") {
    return "Predicted drop. Manual SERP audit recommended.";
  }
  return "Mild decline / SERP shifts. Monitor next cycle.";
}

export const RankingStabilityMap: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);

  const handleAuditClick = (keyword: string) => {
    setNotice(`SERP Analyzer initiated for "${keyword}". Refreshing SERP competitor diff...`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="ranking-stability-map" id="ranking-stability-map">
      <h2>Ranking Stability Map</h2>
      <p className="subtitle">
        Slope + volatility → green/yellow/red stability zones for each keyword.
      </p>

      {notice && (
        <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono rounded-lg flex items-center gap-2">
          <span>⚡ {notice}</span>
        </div>
      )}

      <div className="stability-grid">
        {data.map((item) => {
          const color = getColor(item.slope, item.volatility);
          const message = getMessage(item.slope, item.volatility);
          const slopeArrow =
            item.slope < 0 ? "↑" : item.slope > 0 ? "↓" : "→";

          return (
            <div
              key={item.keyword}
              className={`stability-card ${color}`}
            >
              <div className="card-header">
                <span className="keyword">{item.keyword}</span>
                <span className="rank">#{item.rank}</span>
              </div>

              <div className="metrics-row">
                <div className="metric">
                  <span className="label">Slope</span>
                  <span className="value">
                    {item.slope.toFixed(2)} {slopeArrow}
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Volatility</span>
                  <span className="value">
                    {item.volatility.toFixed(2)}
                  </span>
                  <div className="vol-bar">
                    <div
                      className="vol-fill"
                      style={{ width: `${item.volatility * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="status-row">
                <span className="status-pill">{color.toUpperCase()}</span>
                <span className="status-text">{message}</span>
              </div>

              <div className="actions-row">
                {color === "red" && (
                  <button 
                    onClick={() => handleAuditClick(item.keyword)}
                    className="btn audit"
                  >
                    Audit Now (SERP Analyzer)
                  </button>
                )}
                {color !== "red" && (
                  <button className="btn auto" disabled>
                    Automation Active
                  </button>
                )}
              </div>

              <div className="tooltip">
                <div className="tooltip-title">Decision Logic</div>
                <div className="tooltip-body">
                  <p>
                    <strong>Green:</strong> slope &lt; 0 and volatility &lt; 0.3 → let automation strengthen.
                  </p>
                  <p>
                    <strong>Yellow:</strong> mild decline or SERP shifts → monitor next cycle.
                  </p>
                  <p>
                    <strong>Red:</strong> slope &gt; 0.5 and volatility &gt; 0.5 → trigger manual SERP audit.
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RankingStabilityMap;
