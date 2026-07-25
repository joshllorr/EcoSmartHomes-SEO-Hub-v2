import React, { useState } from "react";
import { useDashboardStore } from "../store/useDashboardStore";

export default function PillarPages() {
  const [pillarTopic, setPillarTopic] = useState("");
  const [url, setUrl] = useState("https://ecosmarthomes.ie");
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateContentGraph = useDashboardStore((s) => s.updateContentGraph);

  const generatePillarIdeas = async () => {
    if (!pillarTopic || !url) {
      setError("Please enter both a pillar topic and your website URL.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/generatePillarIdeas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillarTopic,
          url
        })
      });

      const data = await response.json();
      const returnedIdeas = data.ideas || data.pillars;

      if (!returnedIdeas || !Array.isArray(returnedIdeas) || returnedIdeas.length === 0) {
        setError("No ideas returned. Check your Gemini API route.");
        setLoading(false);
        return;
      }

      setIdeas(returnedIdeas);
      if (updateContentGraph) {
        updateContentGraph({ pillars: returnedIdeas });
      }
    } catch (err) {
      console.error(err);
      setError("Error generating ideas. Check console.");
    }

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 text-left" id="pillar-pages-view">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">Pillar Pages & Hubs</h1>
        <p className="text-slate-400 text-sm">
          Generate comprehensive SEO authority pillar topics and hub ideas tailored for your domain.
        </p>
      </div>

      {/* Input Fields */}
      <div className="space-y-6 bg-white p-6 rounded-xl shadow-xl border border-slate-200 text-slate-900">

        {/* Pillar Topic */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-800">Pillar Topic</label>
          <input
            type="text"
            placeholder="e.g. Raising BER from G to A"
            value={pillarTopic}
            onChange={(e) => setPillarTopic(e.target.value)}
            className="border border-slate-300 rounded-lg p-3 w-full text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-medium"
          />
        </div>

        {/* Website URL */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-800">Website URL *</label>
          <input
            type="text"
            placeholder="https://ecosmarthomes.ie"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border border-slate-300 rounded-lg p-3 w-full text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-mono font-medium"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePillarIdeas}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-semibold cursor-pointer transition shadow-md disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Generating ideas…</span>
            </>
          ) : (
            <span>Generate Pillar Page Ideas</span>
          )}
        </button>

        {/* Error */}
        {error && (
          <p className="text-red-600 font-medium text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
        )}

        {/* Loading State */}
        {loading && (
          <p className="text-slate-600 text-sm italic">Generating ideas via Gemini AI...</p>
        )}
      </div>

      {/* Ideas List */}
      <div className="mt-10">
        {ideas.length > 0 && (
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <span>Generated Pillar Ideas</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-mono font-bold">
              {ideas.length} Ideas
            </span>
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ideas.map((idea, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-slate-900 space-y-3">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{idea.title}</h3>
              <p className="text-slate-700 text-sm leading-relaxed">{idea.description || idea.summary}</p>

              {(idea.keywords || idea.subtopicClusters) && (
                <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-1">
                  <div>
                    <strong className="text-slate-900">Keywords / Clusters:</strong>{" "}
                    {Array.isArray(idea.keywords)
                      ? idea.keywords.join(", ")
                      : Array.isArray(idea.subtopicClusters)
                      ? idea.subtopicClusters.join(", ")
                      : String(idea.keywords || idea.subtopicClusters || "")}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
