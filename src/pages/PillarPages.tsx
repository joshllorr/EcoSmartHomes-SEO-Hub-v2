// src/pages/PillarPages.tsx
import { useState } from 'react';
import { buildPillarPage } from '../utils/buildPillarPage';
import { useDashboardStore } from '../store/useDashboardStore';

export default function PillarPages() {
  const [topic, setTopic] = useState('BER Rating Ireland');
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('Irish homeowners');
  const [loading, setLoading] = useState(false);

  const pillarPages = useDashboardStore((s) => s.pillarPages);
  const addPillarPage = useDashboardStore((s) => s.addPillarPage);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const output = await buildPillarPage(topic, tone, audience);
      let meta: any = {
        pillar_topic: topic,
        slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        meta_description: `Complete guide to ${topic} for ${audience}.`,
        support_pages: [
          'Heat Pump Readiness Assessment',
          'SEAI Grant Calculator',
        ],
      };
      let markdown = output;

      if (typeof output === 'string' && output.includes('\n\n')) {
        const parts = output.split('\n\n');
        if (parts[0].startsWith('{') && parts[0].endsWith('}')) {
          try {
            meta = JSON.parse(parts[0]);
            markdown = parts.slice(1).join('\n\n');
          } catch (e) {
            // Use defaults
          }
        }
      }

      addPillarPage({ ...meta, content: markdown });
    } catch (err) {
      console.error('Generate pillar error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 text-left" id="pillar-pages-view">
      <h1 className="text-3xl font-bold text-white tracking-tight">
        Pillar Page Builder
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 text-slate-900 border border-slate-200">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-800">
            Pillar topic
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="border border-slate-300 rounded-lg p-2.5 w-full text-slate-900 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-slate-800">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="border border-slate-300 rounded-lg p-2.5 w-full text-slate-900 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
              <option value="expert">Expert / Technical</option>
              <option value="warm-irish">Warm Irish Homely</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-slate-800">
              Audience
            </label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="border border-slate-300 rounded-lg p-2.5 w-full text-slate-900 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer disabled:opacity-50 shadow-md"
        >
          {loading ? 'Building pillar...' : 'Build Pillar Page'}
        </button>
      </div>

      <div className="space-y-4">
        {pillarPages.map((p: any, i: number) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow-lg space-y-2 text-slate-900 border border-slate-200"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {p.pillar_topic}
            </h2>
            <p className="text-gray-600 text-sm">{p.meta_description}</p>
            <p className="text-xs text-blue-600 font-mono">Slug: {p.slug}</p>
            {p.support_pages && Array.isArray(p.support_pages) && (
              <p className="text-xs text-gray-500">
                Support pages: {p.support_pages.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
