export interface LinkBaitIdeaInput {
  title: string;
  area?: string;
  type?: string;
  desc?: string;
}

export async function buildLinkBaitPage(
  idea: LinkBaitIdeaInput,
  apiKey: string = '',
): Promise<string> {
  const title = idea?.title || 'Irish Home Energy Retrofit Guide';
  const area = idea?.area || 'Limerick';
  const type = idea?.type || 'Infographic';
  const desc = idea?.desc || 'A comprehensive resource for Irish homeowners.';

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `
Build a full link bait page.

title: ${title}
area: ${area}
type: ${type}
description: ${desc}

Return:
1. JSON metadata
2. Full HTML page
`,
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch('/api/seo/build-link-bait-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, body }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.result) {
        return data.result;
      }
    }

    if (apiKey && apiKey !== 'YOUR_API_KEY') {
      const directRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );

      const data = await directRes.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    }
  } catch (err) {
    console.warn('buildLinkBaitPage error:', err);
  }

  return `<!-- JSON METADATA
{
  "title": "${title}",
  "area": "${area}",
  "type": "${type}",
  "targetKeywords": ["SEAI grants ${area.toLowerCase()}", "heat pump retrofit ${area.toLowerCase()}", "BER rating upgrade"],
  "estimatedBacklinks": "15-25 high-DA links/mo"
}
-->
<article className="link-bait-page max-w-4xl mx-auto space-y-6">
  <header className="border-b border-white/10 pb-4">
    <span className="badge bg-[#34d399]/20 text-[#34d399] px-3 py-1 rounded text-xs font-mono font-bold">${type.toUpperCase()} · ${area}</span>
    <h1 className="text-3xl font-bold text-white mt-2">${title}</h1>
    <p className="text-slate-300 text-sm mt-1">${desc}</p>
  </header>

  <section className="bg-slate-900/80 p-6 rounded-xl border border-white/10 space-y-4">
    <h2 className="text-xl font-bold text-[#34d399]">Interactive 2026 SEAI Grant Breakdown (${area})</h2>
    <p className="text-slate-300 text-xs leading-relaxed">
      Homeowners in ${area} upgrading their BER rating to A0 or B2 can access up to €50,000 in SEAI One-Stop-Shop grant subsidies. Below is the localized cost breakdown:
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono pt-2">
      <div className="bg-black/40 p-3 rounded border border-white/10">
        <span className="text-slate-400 block">Heat Pump Subsidies</span>
        <span className="text-emerald-400 font-bold text-base">Up to €12,500</span>
      </div>
      <div className="bg-black/40 p-3 rounded border border-white/10">
        <span className="text-slate-400 block">External Insulation</span>
        <span className="text-emerald-400 font-bold text-base">Up to €8,000</span>
      </div>
      <div className="bg-black/40 p-3 rounded border border-white/10">
        <span className="text-slate-400 block">Solar PV & Battery</span>
        <span className="text-emerald-400 font-bold text-base">Up to €1,800</span>
      </div>
    </div>
  </section>

  <section className="space-y-3 text-xs text-slate-300">
    <h3 className="text-lg font-bold text-white">Why This Resource Earns Backlinks</h3>
    <p className="leading-relaxed">
      This page provides authoritative, unbiased data points for local estate agents, mortgage brokers, and property journalists writing about energy efficiency in ${area}.
    </p>
  </section>
</article>`;
}

export default buildLinkBaitPage;
