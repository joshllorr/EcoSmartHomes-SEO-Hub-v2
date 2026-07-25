import { useState } from "react";
import { generateInternalLinks } from "../utils/generateInternalLinks";
import { useDashboardStore } from "../store/useDashboardStore";
import InternalLinks from "./Linker/InternalLinks";

export default function Writer() {
  const [localContent, setLocalContent] = useState("Raising BER rating from G to A requires a strategic fabric-first retrofit sequence...");
  const [loading, setLoading] = useState(false);

  const pillarPages = useDashboardStore((s) => s.pillarPages);
  const linkBaitIdeas = useDashboardStore((s) => s.linkBaitIdeas);
  const setInternalLinks = useDashboardStore((s) => s.setInternalLinks);

  const handleGenerateInternalLinks = async () => {
    setLoading(true);
    try {
      const pillar = pillarPages[0] || { title: "BER Rating Ireland & Retrofit Master Guide" };
      const writerDraft = { title: "Draft Article", content: localContent };

      const links = await generateInternalLinks({
        pillarPage: pillar,
        linkBaitIdeas,
        articleDraft: writerDraft
      });

      setInternalLinks(Array.isArray(links) ? links : links.links || []);
    } catch (e) {
      console.error("Internal link error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 text-left bg-white rounded-xl shadow border border-slate-200">
      <h1 className="text-2xl font-bold text-slate-900">Content Writer & Editor</h1>

      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        rows={8}
        className="w-full border border-slate-300 rounded-lg p-3 text-slate-900 font-sans text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
      />

      <div>
        <button
          onClick={handleGenerateInternalLinks}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition cursor-pointer disabled:opacity-50"
        >
          {loading ? "Generating Links..." : "Generate Internal Links"}
        </button>
      </div>

      <InternalLinks />
    </div>
  );
}
