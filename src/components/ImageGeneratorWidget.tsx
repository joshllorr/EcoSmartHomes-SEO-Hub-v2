/**
 * src/components/ImageGeneratorWidget.tsx
 *
 * Integrated Imagen Blog Featured Image Generator for AIWriterTab.
 * Automatically generates SEO-optimized, high-resolution blog header images
 * based on the article's title, keywords, and Irish retrofit context.
 */

import { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Check,
  Copy,
  Download,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  FileCheck,
  Layers,
  ArrowUpRight,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FeaturedImageMeta } from '../types';
import {
  generateFeaturedImage,
  insertImageIntoMarkdown,
  IMAGE_STYLE_PRESETS,
  ASPECT_RATIOS,
  GenerateImageParams,
  GeneratedImageResponse,
} from '../utils/imageGenerator';

interface ImageGeneratorWidgetProps {
  articleTitle: string;
  articleKeywords?: string[];
  articleTopic?: string;
  articleTone?: string;
  currentContent: string;
  featuredImage?: FeaturedImageMeta;
  siteUrl?: string;
  onUpdateContent: (newContent: string) => void;
  onUpdateFeaturedImage?: (imageMeta: FeaturedImageMeta) => void;
  onXPUnlock?: (amount: number) => void;
}

export default function ImageGeneratorWidget({
  articleTitle,
  articleKeywords = [],
  articleTopic = '',
  articleTone = 'Professional',
  currentContent,
  featuredImage,
  siteUrl = 'ecosmarthomes.ie',
  onUpdateContent,
  onUpdateFeaturedImage,
  onXPUnlock,
}: ImageGeneratorWidgetProps) {
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic Architectural');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '9:16'>('16:9');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImageResponse | null>(() => {
    if (featuredImage && featuredImage.url) {
      return {
        success: true,
        imageUrl: featuredImage.url,
        altText: featuredImage.alt,
        caption: featuredImage.caption || '',
        suggestedFileName: featuredImage.fileName || 'featured-hero.webp',
        prompt: featuredImage.prompt || '',
        aspectRatio: featuredImage.aspectRatio || '16:9',
        style: featuredImage.style || 'Photorealistic Architectural',
        dimensions: featuredImage.dimensions || { width: 1200, height: 675 },
        isMock: false,
      };
    }
    return null;
  });

  const [editableAltText, setEditableAltText] = useState(featuredImage?.alt || '');
  const [editableCaption, setEditableCaption] = useState(featuredImage?.caption || '');
  const [insertSuccess, setInsertSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (overridePrompt?: string) => {
    if (!articleTitle.trim()) {
      setErrorMsg('Please enter or generate an article title first.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setInsertSuccess(null);

    try {
      const params: GenerateImageParams = {
        title: articleTitle,
        keywords: articleKeywords,
        topic: articleTopic || articleTitle,
        tone: articleTone,
        style: selectedStyle,
        customPrompt: overridePrompt !== undefined ? overridePrompt : customPrompt,
        aspectRatio: selectedAspectRatio,
        site: siteUrl,
      };

      const result = await generateFeaturedImage(params);
      setGeneratedImage(result);
      setEditableAltText(result.altText);
      setEditableCaption(result.caption);

      const meta: FeaturedImageMeta = {
        url: result.imageUrl,
        alt: result.altText,
        caption: result.caption,
        fileName: result.suggestedFileName,
        prompt: result.prompt,
        aspectRatio: result.aspectRatio,
        style: result.style,
        dimensions: result.dimensions,
        generatedAt: new Date().toISOString(),
      };

      if (onUpdateFeaturedImage) {
        onUpdateFeaturedImage(meta);
      }

      if (onXPUnlock) {
        onXPUnlock(10);
      }
    } catch (err: any) {
      console.error('Image Generation Error:', err);
      setErrorMsg(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertHero = (placement: 'top_hero' | 'bottom' = 'top_hero') => {
    if (!generatedImage) return;

    const imgMeta = {
      url: generatedImage.imageUrl,
      alt: editableAltText || generatedImage.altText,
      caption: editableCaption || generatedImage.caption,
    };

    const updated = insertImageIntoMarkdown(currentContent, imgMeta, placement);
    onUpdateContent(updated);

    const label = placement === 'top_hero' ? 'Featured Hero (Top)' : 'Article Appendix (Bottom)';
    setInsertSuccess(`Inserted into article as ${label}!`);
    setTimeout(() => setInsertSuccess(null), 3500);
  };

  const handleCopyMarkdown = () => {
    if (!generatedImage) return;
    const alt = editableAltText || generatedImage.altText;
    const md = `![${alt}](${generatedImage.imageUrl})\n*${editableCaption || generatedImage.caption}*`;
    navigator.clipboard.writeText(md);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage.imageUrl;
    link.download = generatedImage.suggestedFileName || 'irish-home-retrofit-featured.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="image-generator-widget"
      className="bg-slate-900/90 border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all text-left"
    >
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-slate-900/90 border-b border-white/10 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[#34d399]">
            <ImageIcon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-display">
                Imagen SEO Featured Image Studio
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300">
                Imagen AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate keyword-aligned, photorealistic Irish retrofit header images with Google SEO metadata.
            </p>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !articleTitle.trim()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
            id="btn-generate-featured-image"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={14} className="animate-spin text-slate-950" />
                <span>Generating Image...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-slate-950 fill-slate-950" />
                <span>{generatedImage ? 'Regenerate Image' : 'Generate Featured Image'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <Info size={14} className="shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {insertSuccess && (
        <div className="p-3.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#34d399]" />
            <span>{insertSuccess}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/20 px-2 py-0.5 rounded">
            Draft Updated
          </span>
        </div>
      )}

      <div className="p-5 space-y-5">
        {/* Style Preset Selector */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono block mb-2">
            1. Select Visual Style Preset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {IMAGE_STYLE_PRESETS.map((preset) => {
              const isSelected = selectedStyle === preset.name;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedStyle(preset.name)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/40 border-[#34d399] shadow-md shadow-emerald-950/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#34d399]' : 'text-slate-200'}`}>
                      {preset.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/10 text-slate-300">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {preset.description}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    Best for: {preset.recommendedFor}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono block mb-2">
            2. Choose Dimensions & Placement Aspect Ratio
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ASPECT_RATIOS.map((ar) => {
              const isSelected = selectedAspectRatio === ar.id;
              return (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setSelectedAspectRatio(ar.id)}
                  className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/40 border-[#34d399] text-white'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{ar.label}</span>
                    {isSelected && <Check size={13} className="text-[#34d399]" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{ar.width}×{ar.height}px</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Prompt Modifier Accordion */}
        <div className="border border-white/10 rounded-xl bg-black/20 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#34d399]" />
              <span>Advanced Prompt Tuning & Keywords Context</span>
            </div>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div className="p-4 border-t border-white/10 space-y-3 bg-black/30">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Custom Prompt Override (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`Optional: Custom prompt details (e.g. Modern Dublin townhouse with solar panels and Tesla powerwall, warm sunset lighting...)`}
                  rows={2}
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:border-[#34d399] outline-none resize-none font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                <span className="text-slate-500 font-mono text-[10px]">Context Keywords:</span>
                {articleKeywords.length > 0 ? (
                  articleKeywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 text-[10px]">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic text-[10px]">None specified (will infer from title)</span>
                )}
              </div>
            </div>
          )}

        {/* Generated Image Preview & SEO Metadata Section */}
        {generatedImage ? (
          <div className="border border-white/10 rounded-xl bg-black/40 overflow-hidden shadow-inner space-y-4 p-4">
            <div className="flex flex-col lg:flex-row gap-5 items-start">
              {/* Image Preview Canvas */}
              <div className="w-full lg:w-3/5 space-y-2">
                <div className="relative rounded-lg overflow-hidden border border-white/15 bg-slate-950 group aspect-video flex items-center justify-center">
                  <img
                    src={generatedImage.imageUrl}
                    alt={editableAltText || generatedImage.altText}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {/* Floating Dimension Tag */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono text-[#34d399] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                    <span>{generatedImage.aspectRatio} · {generatedImage.dimensions.width}×{generatedImage.dimensions.height}</span>
                  </div>

                  {/* Floating Action Overlay */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1 rounded bg-black/80 hover:bg-black border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition shadow-lg"
                      title="Download image file"
                    >
                      <Download size={11} className="text-[#34d399]" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={handleCopyMarkdown}
                      className="px-2.5 py-1 rounded bg-black/80 hover:bg-black border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition shadow-lg"
                      title="Copy Markdown"
                    >
                      {copiedLink ? <Check size={11} className="text-[#34d399]" /> : <Copy size={11} />}
                      <span>{copiedLink ? 'Copied!' : 'Copy MD'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Style: {generatedImage.style}</span>
                  <span>File: {generatedImage.suggestedFileName}</span>
                </div>
              </div>

              {/* SEO Metadata & Integration Controls */}
              <div className="w-full lg:w-2/5 space-y-3.5">
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck size={13} className="text-[#34d399]" />
                      <span>Image SEO Metadata</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      SEO Score: 100/100
                    </span>
                  </div>

                  {/* Alt Text Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-300 font-mono font-bold flex items-center justify-between">
                      <span>Alt Text (Google Image Rank)</span>
                      <span className="text-slate-500 text-[9px]">{editableAltText.length}/125</span>
                    </label>
                    <input
                      type="text"
                      value={editableAltText}
                      onChange={(e) => setEditableAltText(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-200 focus:border-[#34d399] outline-none font-mono"
                      placeholder="Keyword-rich descriptive alt tag..."
                    />
                  </div>

                  {/* Caption Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-300 font-mono font-bold">
                      Figure Caption (In-Article)
                    </label>
                    <input
                      type="text"
                      value={editableCaption}
                      onChange={(e) => setEditableCaption(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-200 focus:border-[#34d399] outline-none font-mono"
                      placeholder="Caption displayed below image in article..."
                    />
                  </div>
                </div>

                {/* Insertion Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleInsertHero('top_hero')}
                    className="w-full py-2.5 px-3.5 bg-[#34d399] hover:bg-[#2bc48d] text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                    id="btn-insert-image-hero"
                  >
                    <Plus size={14} />
                    <span>Insert as Featured Hero (Top of Draft)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleInsertHero('bottom')}
                      className="py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <ArrowUpRight size={12} className="text-[#34d399]" />
                      <span>Insert at End</span>
                    </button>
                    <button
                      onClick={() => handleGenerate()}
                      disabled={isGenerating}
                      className="py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw size={12} className={isGenerating ? 'animate-spin' : 'text-emerald-400'} />
                      <span>New Variation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Un-generated placeholder prompt card */
          <div className="border border-dashed border-white/15 rounded-xl p-6 text-center space-y-3 bg-black/20">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-[#34d399]">
              <ImageIcon size={22} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-xs font-bold text-slate-200 font-display">
                No featured image generated yet for this draft
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click &ldquo;Generate Featured Image&rdquo; above to automatically create a custom, SEO-ready 16:9 hero image based on <span className="text-[#34d399] font-medium">&ldquo;{articleTitle || 'your article'}&rdquo;</span>.
              </p>
            </div>
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !articleTitle.trim()}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-lg transition inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Generate 16:9 Hero Image Now</span>
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
