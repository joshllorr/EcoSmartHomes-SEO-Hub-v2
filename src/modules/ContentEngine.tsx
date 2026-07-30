import React, { useState } from "react";

export default function ContentEngine() {
  const [topicInput, setTopicInput] = useState("Heat Pump Maintenance Ireland 2026");
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const runEngineAction = (actionName: string) => {
    setActionStatus(`Executing ${actionName}...`);
    setTimeout(() => {
      setActionStatus(`Completed ${actionName} for "${topicInput}"`);
    }, 1000);
  };

  return (
    <div style={{ background: "#141c33", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "24px" }}>
      <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 700 }}>Content Engine</h2>
      <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "14px" }}>
        SEO Brief Generator, Outline Engine, Draft Generator, Link-Bait, Rewrite Engine, Competitor Diff, Autonomous Expansion.
      </p>

      {actionStatus && (
        <div style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, marginBottom: "16px", display: "inline-block" }}>
          ⚡ {actionStatus}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          placeholder="Enter target topic or keyword..."
          style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.15)", background: "#0b1020", color: "#ffffff", fontSize: "14px", width: "100%", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        <div style={{ background: "#0b1020", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "16px" }}>
          <h3 style={{ margin: "6px 0 4px 0", fontSize: "16px", fontWeight: 700 }}>1. Generation & Outlining</h3>
          <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5" }}>Create SEO briefs, structured headings, and initial drafts.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            <button onClick={() => runEngineAction("Generate SEO Brief")} style={{ background: "#3b82f6", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>Generate SEO Brief</button>
            <button onClick={() => runEngineAction("Generate Outline")} style={{ background: "#3b82f6", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>Generate Outline</button>
            <button onClick={() => runEngineAction("Generate Draft")} style={{ background: "#3b82f6", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>Generate Draft</button>
          </div>
        </div>

        <div style={{ background: "#0b1020", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "16px" }}>
          <h3 style={{ margin: "6px 0 4px 0", fontSize: "16px", fontWeight: 700 }}>2. Optimization & Patches</h3>
          <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5" }}>Rewrite grade updates, competitor diff patches, and link-bait hooks.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            <button onClick={() => runEngineAction("Rewrite Engine")} style={{ background: "#1e293b", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>Rewrite Engine</button>
            <button onClick={() => runEngineAction("Competitor Diff")} style={{ background: "#1e293b", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>Competitor Diff</button>
            <button onClick={() => runEngineAction("Link-Bait Generator")} style={{ background: "#1e293b", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>Link-Bait Generator</button>
          </div>
        </div>

        <div style={{ background: "#0b1020", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "16px" }}>
          <h3 style={{ margin: "6px 0 4px 0", fontSize: "16px", fontWeight: 700 }}>3. Enrichment & Publishing</h3>
          <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5" }}>Inject JSON-LD schemas, contextual links, and deploy to GitHub.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            <button onClick={() => runEngineAction("Schema Injection")} style={{ background: "#1e293b", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>Schema Injection</button>
            <button onClick={() => runEngineAction("Internal Linking")} style={{ background: "#1e293b", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>Internal Linking</button>
            <button onClick={() => runEngineAction("Publish to GitHub")} style={{ background: "#3b82f6", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>Publish to GitHub</button>
          </div>
        </div>
      </div>
    </div>
  );
}
