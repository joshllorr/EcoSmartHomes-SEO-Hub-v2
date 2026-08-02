import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Globe,
  Eye,
  FileText,
  CheckCircle,
} from 'lucide-react';
import {
  TitleMetaData,
  useDashboardStore,
} from '../../store/useDashboardStore';

interface TitleMetaViewerProps {
  data: TitleMetaData | null;
}

export default function TitleMetaViewer({ data }: TitleMetaViewerProps) {
  const targetDomain = useDashboardStore((s) => s.targetDomain);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!data) {
    return (
      <div className="bg-[#0f172a]/40 border-2 border-dashed border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-14 h-14 rounded-full bg-white/5 text-[#34d399] flex items-center justify-center mb-4 border border-white/10 shadow-lg">
          <Sparkles size={22} className="animate-pulse" />
        </div>
        <h4 className="font-display font-bold text-slate-200 text-sm">
          No SEO Metadata Generated
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
          Select or enter an article topic in the dashboard quick actions to
          generate perfectly optimized, high-impact titles, slugs, and
          click-optimized meta descriptions.
        </p>
      </div>
    );
  }

  const metaLength = data.meta_description ? data.meta_description.length : 0;
  const isOptimalMeta = metaLength >= 150 && metaLength <= 160;

  return (
    <div className="space-y-6 text-left" id="title-meta-viewer">
      {/* Header */}
      <div className="flex justify-between items-center pb-2">
        <div>
          <h2 className="text-lg md:text-xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="text-[#34d399]" size={18} />
            <span>SEO Metadata Audit & Generator</span>
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Verified SEO-optimized credentials for your Irish retrofit content.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
          <CheckCircle size={11} />
          <span>SEO Validated</span>
        </div>
      </div>

      {/* Google Search engine preview simulator */}
      <div className="glass-card p-5 border border-white/10 rounded-2xl bg-[#0f172a]/80 space-y-3">
        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/5 pb-2">
          <Eye size={12} className="text-[#34d399]" />
          <span>Google Search SERP Preview (Desktop)</span>
        </div>

        <div className="space-y-1 font-sans">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Globe size={11} className="text-slate-500" />
            <span className="text-slate-300 font-medium">{targetDomain}</span>
            <span className="text-slate-500">
              › blog › {data.slug || 'raising-ber-from-g-to-a'}
            </span>
          </div>
          <h3 className="text-[18px] md:text-[20px] text-[#3b82f6] hover:underline cursor-pointer font-medium leading-tight">
            {data.title ||
              'Raising Your BER from G to A: The Ultimate Irish Home Retrofit Guide'}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-normal max-w-2xl">
            {data.meta_description ||
              'Ready to transform your cold Irish home? Learn how to raise your BER rating from G to A with SEAI retrofit grants, heat pumps, and wall insulation today!'}
          </p>
        </div>
      </div>

      {/* Split details card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Core elements (Title, Slug, Meta) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Title */}
          <div className="glass-card p-5 border border-white/5 rounded-2xl bg-white/[0.02] space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText size={12} className="text-[#34d399]" />
                <span>Optimal Article Title</span>
              </label>
              <button
                onClick={() => handleCopy(data.title, 'title')}
                className="text-slate-400 hover:text-[#34d399] transition flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
              >
                {copiedField === 'title' ? (
                  <>
                    <Check size={11} className="text-[#34d399]" />
                    <span className="text-[#34d399]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {data.title}
            </p>
          </div>

          {/* Slug */}
          <div className="glass-card p-5 border border-white/5 rounded-2xl bg-white/[0.02] space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe size={12} className="text-[#34d399]" />
                <span>URL Slug (Lowercase, safe)</span>
              </label>
              <button
                onClick={() => handleCopy(data.slug, 'slug')}
                className="text-slate-400 hover:text-[#34d399] transition flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
              >
                {copiedField === 'slug' ? (
                  <>
                    <Check size={11} className="text-[#34d399]" />
                    <span className="text-[#34d399]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs font-mono font-bold bg-black/20 border border-white/5 text-[#34d399] px-3 py-1.5 rounded-lg inline-block">
              {data.slug}
            </p>
          </div>

          {/* Meta Description */}
          <div className="glass-card p-5 border border-white/5 rounded-2xl bg-white/[0.02] space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe size={12} className="text-[#34d399]" />
                <span>Meta Description</span>
              </label>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-mono font-bold ${isOptimalMeta ? 'text-[#34d399]' : 'text-amber-400'}`}
                >
                  {metaLength} / 160 chars
                </span>
                <button
                  onClick={() => handleCopy(data.meta_description, 'meta')}
                  className="text-slate-400 hover:text-[#34d399] transition flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                >
                  {copiedField === 'meta' ? (
                    <>
                      <Check size={11} className="text-[#34d399]" />
                      <span className="text-[#34d399]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {data.meta_description}
            </p>
          </div>
        </div>

        {/* Alternative Variations */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5 border border-white/5 rounded-2xl bg-white/[0.02] h-full flex flex-col justify-between">
            <div className="space-y-4">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block border-b border-white/5 pb-2">
                Alternative Title Variations
              </label>

              <div className="space-y-2">
                {data.alternatives &&
                  data.alternatives.map((alt, i) => (
                    <div
                      key={i}
                      className="group flex items-start justify-between gap-3 p-2.5 rounded-xl bg-black/10 border border-white/5 hover:border-white/10 transition"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-[10px] font-mono font-bold bg-white/5 text-[#34d399] px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-xs font-semibold text-slate-300 leading-normal">
                          {alt}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(alt, `alt_${i}`)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#34d399] transition shrink-0 self-center cursor-pointer"
                        title="Copy Variation"
                      >
                        {copiedField === `alt_${i}` ? (
                          <Check size={12} className="text-[#34d399]" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 pt-4 leading-normal">
              💡 **SEO Tip**: Copy any alternative title variant if you wish to
              run localized A/B testing on social media channels or newsletters
              for raising click efficiency in Irish property segments.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
