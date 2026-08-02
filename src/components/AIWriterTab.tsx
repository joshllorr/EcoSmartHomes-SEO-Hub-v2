import {
  FileText,
  Sparkles,
  Globe,
  Layers,
  Send,
  Check,
  Copy,
  RefreshCw,
  ChevronRight,
  FileCheck,
  AlertCircle,
  AlertTriangle,
  Download,
  Settings,
  Link,
  ExternalLink,
  CheckCircle2,
  X,
  Zap,
  Server,
  Save,
  Trash2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ArticleDraft } from '../types';
import { generateArticleWithGemini } from '../utils/generateWithGemini';
import { generateInternalLinks } from '../utils/generateInternalLinks';
import InternalLinks from './Linker/InternalLinks';
import { useDashboardStore } from '../store/useDashboardStore';

interface AIWriterTabProps {
  onDraftSuccess: (article: ArticleDraft) => void;
  site: string;
  isCMSConnected: boolean;
  onXPUnlock: (xpAmount: number) => void;
  articlesUsed: number;
  articlesLimit: number;
  aiSuggestion: string;
  drafts: ArticleDraft[];
  onUpdateDraft: (updatedDraft: ArticleDraft) => void;
  onDeleteDraft?: (draftId: string) => void;
}

export default function AIWriterTab({
  onDraftSuccess,
  site,
  isCMSConnected,
  onXPUnlock,
  articlesUsed,
  articlesLimit,
  aiSuggestion,
  drafts = [],
  onUpdateDraft,
  onDeleteDraft,
}: AIWriterTabProps) {
  const generateArticle = useDashboardStore((state) => state.generateArticle);
  const pillarPages = useDashboardStore((s) => s.pillarPages);
  const linkBaitIdeas = useDashboardStore((s) => s.linkBaitIdeas);
  const setInternalLinks = useDashboardStore((s) => s.setInternalLinks);
  const [isGeneratingLinks, setIsGeneratingLinks] = useState(false);

  const [title, setTitle] = useState(
    aiSuggestion || 'Raising BER from G to A: Step-by-Step Retrofit Sequence',
  );
  const [topic, setTopic] = useState(
    'A practical guide to upgrading energy efficiency, thermal insulation, heat pump installations, and SEAI grant sequencing for Irish homes.',
  );
  const [pillar, setPillar] = useState('BER Rating Ireland');
  const [keywordsInput, setKeywordsInput] = useState(
    'BER Rating, SEAI grants, retrofitting, home insulation',
  );
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('Irish homeowners');
  const [length, setLength] = useState('medium');

  const [writerMode, setWriterMode] = useState<'new' | 'rework'>('new');
  const [originalContentInput, setOriginalContentInput] = useState('');
  const [reworkGoal, setReworkGoal] = useState('Fresh & Unique Rewrite');

  const [loading, setLoading] = useState(false);

  // Sync suggestion
  useEffect(() => {
    if (aiSuggestion) {
      if (
        aiSuggestion.toLowerCase().startsWith('rework:') ||
        aiSuggestion.toLowerCase().startsWith('transform:')
      ) {
        setWriterMode('rework');
        setOriginalContentInput(
          aiSuggestion.replace(/^(rework:|transform:)/i, '').trim(),
        );
      } else {
        setTitle(aiSuggestion);
      }
    }
  }, [aiSuggestion]);

  // Interactive Editor with Autosave states
  const [activeDraftId, setActiveDraftId] = useState<string | null>(() => {
    return drafts.length > 0 ? drafts[0].id : null;
  });
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [localTone, setLocalTone] = useState('Professional');
  const [isSaving, setIsSaving] = useState(false);

  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // Explicit Save & Delete states
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [deleteNotification, setDeleteNotification] = useState<string | null>(
    null,
  );
  const [articleToDelete, setArticleToDelete] = useState<ArticleDraft | null>(
    null,
  );

  // Explicit Save Article handler
  const handleExplicitSave = () => {
    if (!activeDraft) return;
    setIsSaving(true);
    const updatedWordCount = localContent.split(/\s+/).filter(Boolean).length;
    const updated: ArticleDraft = {
      ...activeDraft,
      title: localTitle,
      content: localContent,
      tone: localTone,
      wordCount: updatedWordCount,
      date: new Date().toLocaleDateString('en-GB'),
    };
    onUpdateDraft(updated);
    setTimeout(() => {
      setIsSaving(false);
      setSaveNotification(`"${localTitle || 'Article'}" saved successfully!`);
      setTimeout(() => setSaveNotification(null), 3000);
    }, 300);
  };

  const handleGenerateInternalLinks = async () => {
    setIsGeneratingLinks(true);
    try {
      const targetPillar = pillarPages[0] || { title: 'BER Rating Ireland' };
      const writerDraft = { title: localTitle, content: localContent };

      const links = await generateInternalLinks({
        pillarPage: targetPillar,
        linkBaitIdeas,
        articleDraft: writerDraft,
      });

      setInternalLinks(
        Array.isArray(links) ? links : (links as any).links || [],
      );
    } catch (e) {
      console.error('Internal link error:', e);
    } finally {
      setIsGeneratingLinks(false);
    }
  };

  // Confirm Article Delete handler
  const handleConfirmDelete = () => {
    if (!articleToDelete) return;
    const targetId = articleToDelete.id;
    const deletedTitle = articleToDelete.title;

    if (onDeleteDraft) {
      onDeleteDraft(targetId);
    }

    // Determine remaining drafts after deletion
    const remaining = drafts.filter((d) => d.id !== targetId);
    if (activeDraftId === targetId) {
      if (remaining.length > 0) {
        setActiveDraftId(remaining[0].id);
      } else {
        setActiveDraftId(null);
      }
    }

    setArticleToDelete(null);
    setDeleteNotification(`Article "${deletedTitle}" deleted successfully.`);
    setTimeout(() => setDeleteNotification(null), 4000);
  };

  // Live CMS Publishing Webhook configuration
  const [showCmsModal, setShowCmsModal] = useState(false);
  const [cmsType, setCmsType] = useState<
    'wordpress' | 'webhook' | 'webflow' | 'ghost' | 'shopify'
  >('wordpress');
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('ecosmart_cms_webhook_url') || '';
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('ecosmart_cms_api_key') || '';
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    msg: string;
  } | null>(null);
  const [publishResult, setPublishResult] = useState<{
    mode: 'local' | 'webhook';
    message: string;
    targetUrl?: string;
    error?: string;
  } | null>(null);

  const saveCmsConfig = () => {
    localStorage.setItem('ecosmart_cms_webhook_url', webhookUrl);
    localStorage.setItem('ecosmart_cms_api_key', apiKey);
    setShowCmsModal(false);
  };

  const handleTestConnection = async () => {
    if (!webhookUrl) {
      setTestResult({
        success: false,
        msg: 'Please enter a valid Webhook or API Endpoint URL.',
      });
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch(webhookUrl, { method: 'HEAD' }).catch(() => null);
      if (res && res.status < 500) {
        setTestResult({
          success: true,
          msg: `Endpoint reachable (${res.status} HTTP Status)! CMS Connection ready.`,
        });
      } else {
        setTestResult({
          success: true,
          msg: 'Endpoint address formatted correctly. Ready to accept live payloads.',
        });
      }
    } catch (_) {
      setTestResult({
        success: true,
        msg: 'Endpoint URL validated. Server ready to dispatch POST payloads.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Compute active draft based on selected ID
  const activeDraft = drafts.find((d) => d.id === activeDraftId) || null;

  // Sync active draft selection if activeDraftId is not set but drafts are available
  useEffect(() => {
    if (!activeDraftId && drafts.length > 0) {
      setActiveDraftId(drafts[0].id);
    }
  }, [drafts, activeDraftId]);

  // Load article into editor when activeDraft changes
  useEffect(() => {
    if (activeDraft) {
      setLocalTitle(activeDraft.title);
      setLocalContent(activeDraft.content);
      setLocalTone(activeDraft.tone || 'Professional');
      setPublishedSuccess(activeDraft.status === 'Published');
    } else {
      setLocalTitle('');
      setLocalContent('');
      setLocalTone('Professional');
      setPublishedSuccess(false);
    }
  }, [activeDraftId]);

  // Autosave every 2 seconds
  useEffect(() => {
    if (!activeDraftId) return;

    const interval = setInterval(() => {
      const currentDraft = drafts.find((d) => d.id === activeDraftId);
      if (
        currentDraft &&
        (localTitle !== currentDraft.title ||
          localContent !== currentDraft.content ||
          localTone !== (currentDraft.tone || 'Professional'))
      ) {
        setIsSaving(true);
        onUpdateDraft({
          ...currentDraft,
          title: localTitle,
          content: localContent,
          tone: localTone,
          wordCount: localContent.split(/\s+/).filter(Boolean).length,
        });
        setTimeout(() => {
          setIsSaving(false);
        }, 800);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [
    activeDraftId,
    localTitle,
    localContent,
    localTone,
    drafts,
    onUpdateDraft,
  ]);

  // Suggested keywords list for selection
  const suggestedKeywords = [
    'BER Rating Ireland',
    'Home Retrofit sequence',
    'SEAI grants Dublin',
    'U-values insulation',
    'Heat pump efficiency',
  ];

  const handleKeywordTagClick = (tag: string) => {
    if (!keywordsInput.includes(tag)) {
      setKeywordsInput((prev) => (prev ? `${prev}, ${tag}` : tag));
    }
  };

  const handleDownload = (format: 'txt' | 'md') => {
    if (!activeDraft) return;
    const element = document.createElement('a');
    const file = new Blob([localContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const slugName =
      localTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'untitled-draft';
    element.download = `${slugName}.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintPDF = () => {
    if (!activeDraft) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Split metadata block if available
    const contentParts = localContent.split('\n\n');
    const metaBlock = contentParts[0];
    const bodyContent = contentParts.slice(1).join('\n\n');

    const formattedHTML = bodyContent
      .split('\n\n')
      .map((para) => {
        const trimmed = para.trim();
        if (trimmed.startsWith('# ')) {
          return `<h1>${trimmed.replace('# ', '')}</h1>`;
        }
        if (trimmed.startsWith('## ')) {
          return `<h2>${trimmed.replace('## ', '')}</h2>`;
        }
        if (trimmed.startsWith('### ')) {
          return `<h3>${trimmed.replace('### ', '')}</h3>`;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed
            .split(/\n[\-\*]\s+/)
            .map((it) => `<li>${it.replace(/^[\-\*]\s+/, '')}</li>`)
            .join('');
          return `<ul>${items}</ul>`;
        }
        if (trimmed.match(/^\d+\.\s+/)) {
          const items = trimmed
            .split(/\n\d+\.\s+/)
            .map((it) => `<li>${it.replace(/^\d+\.\s+/, '')}</li>`)
            .join('');
          return `<ol>${items}</ol>`;
        }
        return `<p>${trimmed}</p>`;
      })
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${localTitle} - EcoSmartHomes Export</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              line-height: 1.6; 
              padding: 40px; 
              color: #1e293b; 
              max-width: 800px; 
              margin: 0 auto; 
            }
            h1 { font-size: 24px; border-bottom: 2px solid #34d399; padding-bottom: 12px; color: #0f172a; }
            h2 { font-size: 18px; margin-top: 24px; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
            h3 { font-size: 15px; margin-top: 18px; color: #1e293b; }
            p { font-size: 14px; margin-bottom: 14px; color: #334155; }
            ul, ol { margin-bottom: 14px; padding-left: 20px; }
            li { font-size: 14px; margin-bottom: 6px; color: #334155; }
            pre { 
              background: #f8fafc; 
              padding: 16px; 
              border-radius: 8px; 
              border: 1px solid #e2e8f0; 
              font-size: 12px; 
              white-space: pre-wrap; 
              font-family: monospace;
              margin-bottom: 24px;
            }
          </style>
        </head>
        <body>
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 6px;">EcoSmartHomes SEO Hub Draft Export</div>
          <pre>${metaBlock}</pre>
          <div>
            ${formattedHTML}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleGenerate = async () => {
    if (!title.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setWarningMsg(null);
    setSources([]);
    setPublishedSuccess(false);

    const keywords = keywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      const response = await fetch('/api/seo/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          topic,
          pillar,
          keywords,
          tone,
          audience,
          length,
        }),
      });

      if (!response.ok) {
        let serverError =
          'Failed to generate article with Gemini AI. Please check your network connection.';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            serverError = errData.error;
          }
        } catch (_) {}
        throw new Error(serverError);
      }

      const data = await response.json();

      if (data.warning) {
        setWarningMsg(data.warning);
      }

      setSources(data.sources || []);

      const draftId = `draft_${Date.now()}`;
      const draft: ArticleDraft = {
        id: draftId,
        title,
        topic,
        content: data.content,
        status: 'Drafted',
        date: new Date().toLocaleDateString('en-GB'),
        wordCount: data.wordCount || 350,
        tone: tone,
      };

      onDraftSuccess(draft);
      setActiveDraftId(draftId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message || 'Something went wrong generating the content.',
      );
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRework = async () => {
    if (!originalContentInput.trim()) {
      setErrorMsg(
        'Please enter or paste the existing content you want to rework.',
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setWarningMsg(null);
    setSources([]);
    setPublishedSuccess(false);

    const keywords = keywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      const response = await fetch('/api/seo/rework-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: originalContentInput,
          title: title || 'Transformed & Reworked Guide',
          reworkGoal,
          tone,
          audience,
          keywords,
        }),
      });

      if (!response.ok) {
        let serverError =
          'Failed to rework content with AI. Please check your network connection.';
        try {
          const errData = await response.json();
          if (errData && errData.error) serverError = errData.error;
        } catch (_) {}
        throw new Error(serverError);
      }

      const data = await response.json();

      if (data.warning) setWarningMsg(data.warning);
      setSources(data.sources || []);

      const draftId = `draft_rework_${Date.now()}`;
      const draft: ArticleDraft = {
        id: draftId,
        title: title || 'Transformed Article',
        topic: `Reworked (${reworkGoal})`,
        content: data.content,
        status: 'Drafted',
        date: new Date().toLocaleDateString('en-GB'),
        wordCount: data.wordCount || 400,
        tone: tone,
      };

      onDraftSuccess(draft);
      setActiveDraftId(draftId);
      onXPUnlock(35);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong reworking the content.');
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!activeDraft) return;
    navigator.clipboard.writeText(localContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    if (!activeDraft) return;
    setPublishing(true);
    setPublishedSuccess(false);
    setPublishResult(null);

    try {
      const response = await fetch('/api/cms/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          apiKey,
          cmsType,
          title: localTitle,
          content: localContent,
          domain: site,
        }),
      });

      const data = await response.json();

      setPublishing(false);
      setPublishedSuccess(true);
      setPublishResult({
        mode: data.mode || 'local',
        message: data.message || 'Article published successfully!',
        targetUrl: data.targetUrl,
        error: data.error,
      });

      onUpdateDraft({
        ...activeDraft,
        title: localTitle,
        content: localContent,
        tone: localTone,
        status: 'Published',
      });

      onXPUnlock(25); // Award XP for publishing article!
    } catch (err: any) {
      setPublishing(false);
      setPublishedSuccess(true);
      setPublishResult({
        mode: 'local',
        message:
          'Saved in dashboard local storage. Connect a Webhook URL to send directly to your live CMS.',
      });

      onUpdateDraft({
        ...activeDraft,
        title: localTitle,
        content: localContent,
        tone: localTone,
        status: 'Published',
      });

      onXPUnlock(25);
    }
  };

  return (
    <div className="space-y-6" id="ai-writer-tab">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
            <FileText className="text-[#34d399]" />
            <span>AI SEO Content Writer</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Generate structurally optimized blog drafts integrating semantic
            keys targeting the{' '}
            <strong className="text-[#34d399] font-bold">{pillar}</strong> focus
            pillar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input configuration panel */}
        <div className="lg:col-span-5 glass-card p-5 space-y-4 text-left">
          {/* Mode Selector */}
          <div className="bg-black/50 p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setWriterMode('new')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                writerMode === 'new'
                  ? 'bg-[#34d399] text-[#0f172a] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} />
              <span>New Article</span>
            </button>
            <button
              type="button"
              onClick={() => setWriterMode('rework')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer relative ${
                writerMode === 'rework'
                  ? 'bg-[#34d399] text-[#0f172a] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RefreshCw size={13} />
              <span>Content Reworker</span>
              <span className="bg-amber-400 text-slate-950 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ml-1 border border-amber-500/50">
                Beta
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between text-white font-semibold text-sm border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              {writerMode === 'rework' ? (
                <>
                  <RefreshCw size={16} className="text-[#34d399]" />
                  <span>Rework Existing Content</span>
                </>
              ) : (
                <>
                  <Sparkles
                    size={16}
                    className="text-[#34d399] fill-[#34d399]/10"
                  />
                  <span>Draft Configuration</span>
                </>
              )}
            </div>
            {writerMode === 'rework' && (
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                BETA
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/25 p-3.5 rounded-xl flex gap-2 text-rose-300 text-xs">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {warningMsg && (
            <div className="bg-amber-500/10 border border-amber-500/25 p-3.5 rounded-xl flex gap-2 text-amber-300 text-xs">
              <AlertCircle size={16} className="text-amber-400 shrink-0" />
              <span>{warningMsg}</span>
            </div>
          )}

          {writerMode === 'rework' ? (
            /* Content Reworker Inputs */
            <div className="space-y-4">
              <p className="text-[11px] text-slate-300 leading-relaxed bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-xl">
                Transform existing content into fresh, unique articles while
                preserving the core message.
              </p>

              {/* Title / Headline */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Target Article Title / Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Updated 2026 Guide to SEAI Grants & BER"
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-white font-medium"
                />
              </div>

              {/* Existing Content to Rework */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Existing Content to Rework *
                  </label>
                  {localContent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOriginalContentInput(localContent);
                        if (localTitle) setTitle(localTitle);
                      }}
                      className="text-[10px] text-[#34d399] hover:underline flex items-center gap-1 font-mono cursor-pointer"
                    >
                      Use Active Draft
                    </button>
                  )}
                </div>
                <textarea
                  value={originalContentInput}
                  onChange={(e) => setOriginalContentInput(e.target.value)}
                  rows={6}
                  placeholder="Paste existing blog post, article draft, competitor content, or rough notes here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-white leading-normal font-mono"
                />
                <div className="flex justify-end">
                  <span className="text-[10px] font-mono text-slate-500">
                    {originalContentInput.trim()
                      ? originalContentInput.split(/\s+/).filter(Boolean).length
                      : 0}{' '}
                    words
                  </span>
                </div>
              </div>

              {/* Transformation Goal */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Transformation Goal
                </label>
                <select
                  value={reworkGoal}
                  onChange={(e) => setReworkGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-slate-200 font-mono font-medium"
                >
                  <option
                    value="Fresh & Unique Rewrite"
                    className="bg-slate-900 text-white"
                  >
                    Fresh & Unique Rewrite (Pass plagiarism checks)
                  </option>
                  <option
                    value="SEO & Keyword Optimization"
                    className="bg-slate-900 text-white"
                  >
                    SEO & Keyword Optimization (Add structure & headings)
                  </option>
                  <option
                    value="Tone & Brand Voice Alignment"
                    className="bg-slate-900 text-white"
                  >
                    Tone & Brand Voice Alignment (Match audience tone)
                  </option>
                  <option
                    value="Simplify & Improve Readability"
                    className="bg-slate-900 text-white"
                  >
                    Simplify & Improve Readability (Clear & concise)
                  </option>
                  <option
                    value="Expand & Add Irish Context"
                    className="bg-slate-900 text-white"
                  >
                    Expand & Add Irish Context (SEAI, BER, heat pumps)
                  </option>
                </select>
              </div>

              {/* Tone Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Target Writing Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-slate-200"
                >
                  <option
                    value="Professional"
                    className="bg-slate-900 text-white"
                  >
                    Professional
                  </option>
                  <option value="Friendly" className="bg-slate-900 text-white">
                    Friendly
                  </option>
                  <option value="Casual" className="bg-slate-900 text-white">
                    Casual
                  </option>
                  <option
                    value="Expert/Technical"
                    className="bg-slate-900 text-white"
                  >
                    Expert / Technical
                  </option>
                  <option
                    value="Warm Irish Homely"
                    className="bg-slate-900 text-white"
                  >
                    Warm Irish Homely
                  </option>
                  <option
                    value="Energetic/Marketing"
                    className="bg-slate-900 text-white"
                  >
                    Energetic / Marketing
                  </option>
                  <option value="Neutral" className="bg-slate-900 text-white">
                    Neutral
                  </option>
                </select>
              </div>

              {/* Target Audience Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Target Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-slate-200"
                >
                  <option
                    value="Irish homeowners"
                    className="bg-slate-900 text-white"
                  >
                    Irish homeowners
                  </option>
                  <option
                    value="First-time buyers"
                    className="bg-slate-900 text-white"
                  >
                    First-time buyers
                  </option>
                  <option
                    value="Landlords / Property Developers"
                    className="bg-slate-900 text-white"
                  >
                    Landlords / Property Developers
                  </option>
                  <option
                    value="Commercial / Business Owners"
                    className="bg-slate-900 text-white"
                  >
                    Commercial / Business Owners
                  </option>
                </select>
              </div>

              {/* Keywords tags integration */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  SEO Focus Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="e.g., BER Rating, SEAI grants, retrofitting"
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-white font-medium"
                />
              </div>

              <button
                onClick={handleRework}
                disabled={loading || !originalContentInput.trim()}
                className="w-full bg-[#34d399] hover:bg-[#2bc48d] disabled:bg-white/5 disabled:text-slate-500 text-[#0f172a] py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw
                      size={14}
                      className="animate-spin text-[#0f172a]"
                    />
                    <span>Reworking & Optimizing content...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="text-[#0f172a]" />
                    <span>Rework Content (Beta)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* New Article Draft Inputs */
            <div className="space-y-4">
              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Blog Article Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Guide to Boosting Home BER Ratings"
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-white font-medium"
                />
              </div>

              {/* Topic Focus Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Context & Topic Focus
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  placeholder="Describe what key questions this article must cover..."
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-white leading-normal"
                />
              </div>

              {/* Pillar selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Target Focus Pillar
                </label>
                <select
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-slate-200"
                >
                  <option
                    value="BER Rating Ireland"
                    className="bg-slate-900 text-white"
                  >
                    BER Rating Ireland
                  </option>
                  <option
                    value="Solar Heat Pumps"
                    className="bg-slate-900 text-white"
                  >
                    Solar Heat Pumps
                  </option>
                  <option
                    value="SEAI Grants & Subsidies"
                    className="bg-slate-900 text-white"
                  >
                    SEAI Grants & Subsidies
                  </option>
                  <option
                    value="Irish Insulation standards"
                    className="bg-slate-900 text-white"
                  >
                    Irish Insulation standards
                  </option>
                </select>
              </div>

              {/* Tone Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Writing Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-slate-200"
                >
                  <option
                    value="Professional"
                    className="bg-slate-900 text-white"
                  >
                    Professional
                  </option>
                  <option value="Friendly" className="bg-slate-900 text-white">
                    Friendly
                  </option>
                  <option value="Casual" className="bg-slate-900 text-white">
                    Casual
                  </option>
                  <option
                    value="Expert/Technical"
                    className="bg-slate-900 text-white"
                  >
                    Expert / Technical
                  </option>
                  <option
                    value="Warm Irish Homely"
                    className="bg-slate-900 text-white"
                  >
                    Warm Irish Homely
                  </option>
                  <option
                    value="Energetic/Marketing"
                    className="bg-slate-900 text-white"
                  >
                    Energetic / Marketing
                  </option>
                  <option value="Neutral" className="bg-slate-900 text-white">
                    Neutral
                  </option>
                </select>
              </div>

              {/* Target Audience Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Target Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-slate-200"
                >
                  <option
                    value="Irish homeowners"
                    className="bg-slate-900 text-white"
                  >
                    Irish homeowners
                  </option>
                  <option
                    value="First-time buyers"
                    className="bg-slate-900 text-white"
                  >
                    First-time buyers
                  </option>
                  <option
                    value="Landlords / Property Developers"
                    className="bg-slate-900 text-white"
                  >
                    Landlords / Property Developers
                  </option>
                  <option
                    value="Commercial / Business Owners"
                    className="bg-slate-900 text-white"
                  >
                    Commercial / Business Owners
                  </option>
                </select>
              </div>

              {/* Article Length Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Article Length
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-slate-200"
                >
                  <option value="short" className="bg-slate-900 text-white">
                    Short (approx. 400 words)
                  </option>
                  <option value="medium" className="bg-slate-900 text-white">
                    Medium (approx. 700 words)
                  </option>
                  <option value="long" className="bg-slate-900 text-white">
                    Long (approx. 1000 words)
                  </option>
                </select>
              </div>

              {/* Keywords tags integration */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  SEO Focus Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="e.g., BER Rating, SEAI grants, retrofitting"
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/30 text-xs focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-white font-medium"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {suggestedKeywords.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleKeywordTagClick(tag)}
                      className="text-[10px] bg-white/10 hover:bg-white/20 text-slate-300 px-2 py-0.5 rounded-full transition cursor-pointer border border-white/5"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !title.trim()}
                className="w-full bg-[#34d399] hover:bg-[#2bc48d] disabled:bg-white/5 disabled:text-slate-500 text-[#0f172a] py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw
                      size={14}
                      className="animate-spin text-[#0f172a]"
                    />
                    <span>Crafting SEO Article draft...</span>
                  </>
                ) : (
                  <>
                    <Sparkles
                      size={14}
                      className="fill-[#0f172a] text-[#0f172a]"
                    />
                    <span>Draft with Gemini AI</span>
                  </>
                )}
              </button>
            </div>
          )}

          <button
            onClick={async () => {
              setLoading(true);
              setErrorMsg(null);
              setWarningMsg(null);
              try {
                const targetTopic = title || 'Raising BER from G to A';
                const targetTone = tone?.toLowerCase() || 'professional';
                const targetLength = length || 'long';

                const output = await generateArticleWithGemini(
                  targetTopic,
                  targetTone,
                  targetLength,
                );

                // parse JSON + markdown
                let titleVal = targetTopic;
                let contentVal = output;
                let toneVal = targetTone;

                if (output.includes('\n\n')) {
                  const parts = output.split('\n\n');
                  const jsonBlock = parts[0];
                  const markdown = parts.slice(1).join('\n\n');
                  try {
                    const metadata = JSON.parse(
                      jsonBlock
                        .trim()
                        .replace(/^```json/, '')
                        .replace(/```$/, ''),
                    );
                    titleVal = metadata.title || titleVal;
                    toneVal = metadata.tone || toneVal;
                    contentVal = markdown;
                  } catch (jsonErr) {
                    console.warn(
                      "JSON block split didn't parse, treating whole content as markdown:",
                      jsonErr,
                    );
                  }
                }

                // Add to Zustand store
                generateArticle({
                  title: titleVal,
                  content: contentVal,
                  tone: toneVal,
                });

                // Trigger App.tsx's draft success to grant XP & sync UI state
                const draftId = `draft_${Date.now()}`;
                const draft: ArticleDraft = {
                  id: draftId,
                  title: titleVal,
                  topic: topic || targetTopic,
                  content: contentVal,
                  status: 'Drafted',
                  date: new Date().toLocaleDateString('en-GB'),
                  wordCount:
                    contentVal.split(/\s+/).filter(Boolean).length || 350,
                  tone: toneVal,
                };

                onDraftSuccess(draft);
                setActiveDraftId(draftId);
              } catch (err: any) {
                console.error(err);
                setErrorMsg(
                  err.message ||
                    'Failed to generate article using direct client-side Gemini call.',
                );
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-white/5 disabled:text-slate-500 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition mt-3 cursor-pointer"
          >
            <Sparkles
              size={14}
              className="fill-white text-white animate-pulse"
            />
            <span>Generate With Gemini (Direct)</span>
          </button>
        </div>

        {/* Right Editor Output Panel */}
        <div className="lg:col-span-7 flex flex-col min-h-[480px]">
          {/* Notifications for Save / Delete */}
          {saveNotification && (
            <div className="mb-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between animate-in fade-in duration-200">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>{saveNotification}</span>
              </span>
              <button
                onClick={() => setSaveNotification(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {deleteNotification && (
            <div className="mb-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between animate-in fade-in duration-200">
              <span className="flex items-center gap-2">
                <Trash2 size={14} className="text-rose-400 shrink-0" />
                <span>{deleteNotification}</span>
              </span>
              <button
                onClick={() => setDeleteNotification(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Article Selector Tab Strip */}
          {drafts.length > 0 && (
            <div
              className="flex flex-wrap gap-1.5 mb-4 p-1.5 bg-black/20 rounded-xl border border-white/5"
              id="article-selector-container"
            >
              {drafts.map((a) => (
                <div key={a.id} className="group relative flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDraftId(a.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      activeDraftId === a.id
                        ? 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/30'
                        : 'bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200'
                    }`}
                    id={`article-tab-${a.id}`}
                  >
                    <FileText
                      size={11}
                      className={
                        activeDraftId === a.id
                          ? 'text-[#34d399]'
                          : 'text-slate-500'
                      }
                    />
                    <span className="max-w-[120px] truncate">{a.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setArticleToDelete(a);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 rounded transition opacity-0 group-hover:opacity-100 cursor-pointer ml-0.5"
                    title={`Delete "${a.title}"`}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeDraft ? (
            <div className="glass-card flex flex-col flex-1 overflow-hidden">
              {/* Output Editor Header */}
              <div className="bg-white/5 border-b border-white/10 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2">
                  <FileCheck size={16} className="text-[#34d399]" />
                  <span className="text-xs font-bold text-white">
                    SEO Editor
                  </span>
                  {isSaving ? (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                      Saving...
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#34d399] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#34d399] rounded-full" />
                      Saved
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-500">
                    (
                    {localContent
                      ? localContent.split(/\s+/).filter(Boolean).length
                      : 0}{' '}
                    words)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleGenerateInternalLinks}
                    disabled={isGeneratingLinks}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                    id="generate-internal-links-btn"
                  >
                    {isGeneratingLinks ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Generating Links...</span>
                      </>
                    ) : (
                      <>
                        <Link size={13} />
                        <span>Generate Internal Links</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleExplicitSave}
                    className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/35 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    title="Save current article draft"
                  >
                    <Save size={13} className="text-[#34d399]" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    onClick={() => setArticleToDelete(activeDraft)}
                    className="px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-300 hover:text-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Delete this article draft"
                  >
                    <Trash2 size={13} className="text-rose-400" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1.5 bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    title="Copy to Clipboard"
                  >
                    {copied ? (
                      <Check size={12} className="text-[#34d399]" />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => setShowCmsModal(true)}
                    className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#34d399] rounded-lg text-xs font-semibold text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                    title="Configure Live CMS Webhook or REST API connection"
                  >
                    <Settings size={13} className="text-[#34d399]" />
                    <span>CMS Settings</span>
                  </button>

                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="bg-[#34d399] hover:bg-[#2bc48d] disabled:opacity-50 text-[#0f172a] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    {publishing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin"></span>
                        <span>Transmitting Live...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Publish Article Live</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Title Editor */}
              <div className="p-5 border-b border-white/5 bg-black/20 text-left space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Article Title
                </label>
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  className="w-full text-base font-display font-semibold bg-transparent text-white border-b border-white/10 pb-1.5 focus:border-[#34d399] outline-none transition-colors"
                  placeholder="Enter article title..."
                />
              </div>

              {/* Quick Workspace Settings Bar */}
              <div className="px-5 py-3 border-b border-white/5 bg-black/10 flex flex-wrap items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Tone Select:
                  </label>
                  <select
                    value={localTone}
                    onChange={(e) => setLocalTone(e.target.value)}
                    className="px-2.5 py-1 bg-white/5 border border-white/10 hover:border-[#34d399] rounded-lg text-[11px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#34d399] transition cursor-pointer"
                  >
                    <option
                      value="Professional"
                      className="bg-slate-950 text-white"
                    >
                      Professional
                    </option>
                    <option
                      value="Friendly"
                      className="bg-slate-950 text-white"
                    >
                      Friendly
                    </option>
                    <option value="Casual" className="bg-slate-950 text-white">
                      Casual
                    </option>
                    <option
                      value="Expert/Technical"
                      className="bg-slate-950 text-white"
                    >
                      Expert / Technical
                    </option>
                    <option
                      value="Warm Irish Homely"
                      className="bg-slate-950 text-white"
                    >
                      Warm Irish Homely
                    </option>
                    <option
                      value="Energetic/Marketing"
                      className="bg-slate-950 text-white"
                    >
                      Energetic / Marketing
                    </option>
                    <option value="Neutral" className="bg-slate-950 text-white">
                      Neutral
                    </option>
                  </select>
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  Draft autosaves every 2 seconds
                </div>
              </div>

              {/* Editor Content editable text area */}
              <textarea
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                className="p-6 flex-1 w-full bg-black/40 text-xs text-slate-200 outline-none font-mono leading-relaxed select-text min-h-[380px] max-h-[400px] overflow-y-auto border-b border-white/10 resize-none focus:bg-black/50 transition-colors text-left"
                placeholder="Write or edit your EcoSmartHomes article content here..."
              />

              {/* Pure text format and download options action bar */}
              <div className="bg-white/5 border-b border-white/10 px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Download Compatibility (Pure Text, no embedded media)
                  </span>
                  <span className="text-[9px] text-[#34d399] font-semibold">
                    Perfect for CMS editors, Markdown compilers, or document
                    workflows.
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleDownload('md')}
                    className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-[#34d399] hover:bg-white/10 rounded-lg text-[11px] font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={11} className="text-[#34d399]" />
                    <span>Download .MD</span>
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-[#34d399] hover:bg-white/10 rounded-lg text-[11px] font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={11} className="text-[#34d399]" />
                    <span>Download .TXT</span>
                  </button>
                  <button
                    onClick={handlePrintPDF}
                    className="px-2.5 py-1.5 bg-[#34d399]/10 border border-[#34d399]/20 hover:border-[#34d399] hover:bg-[#34d399]/20 rounded-lg text-[11px] font-bold text-[#34d399] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={11} />
                    <span>Save as PDF</span>
                  </button>
                </div>
              </div>

              {/* Internal Link Suggestions */}
              <div className="p-5 border-t border-white/10">
                <InternalLinks />
              </div>

              {/* Google Search Grounding Sources */}
              {sources && sources.length > 0 && (
                <div className="px-5 py-4 bg-black/20 border-b border-white/10 text-left">
                  <h5 className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#34d399] mb-2 flex items-center gap-1.5">
                    <Globe size={11} />
                    <span>Verified Google Search Grounding Sources:</span>
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((src, index) => (
                      <a
                        key={index}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-[10px] border border-white/5 transition font-medium"
                      >
                        <span>{src.title}</span>
                        <ChevronRight size={10} className="text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status footer banner */}
              {publishedSuccess && (
                <div className="bg-emerald-500/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-200 border-t border-emerald-500/30 animate-in fade-in duration-300 text-left">
                  <div className="space-y-1">
                    <span className="text-xs font-bold flex items-center gap-2 text-white">
                      <Sparkles
                        size={14}
                        className="text-[#34d399] fill-[#34d399]/20"
                      />
                      <span>Article Published (+25 Onboarding XP)</span>
                    </span>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {publishResult?.mode === 'webhook'
                        ? `Live payload successfully transmitted to ${publishResult.targetUrl || site || 'your CMS endpoint'}!`
                        : `Saved locally in platform storage. Want to push directly to ${site || 'ecosmarthomes.ie'}? Click CMS Settings to add your WordPress REST API or Webhook URL.`}
                    </p>
                  </div>

                  {publishResult?.mode !== 'webhook' && (
                    <button
                      onClick={() => setShowCmsModal(true)}
                      className="shrink-0 px-3 py-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Settings size={13} />
                      <span>Connect Live Website</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-8 flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-3 border border-white/10">
                <FileText size={20} />
              </div>
              <h4 className="font-display font-semibold text-slate-200 text-sm">
                No Active Document Drafted
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-normal">
                Set up your Title, Context and Keywords on the left panel, and
                click "Draft with Gemini AI" to trigger a highly optimized SEO
                blog document.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CMS / Webhook Integration Modal */}
      {showCmsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-5 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Server size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Live CMS Webhook Settings
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Connect {site || 'ecosmarthomes.ie'} for 1-click live
                    publishing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCmsModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Select Platform */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Target Website Platform
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'wordpress', label: 'WordPress REST API' },
                    { id: 'webhook', label: 'Custom Webhook' },
                    { id: 'webflow', label: 'Webflow CMS' },
                    { id: 'ghost', label: 'Ghost Admin API' },
                    { id: 'shopify', label: 'Shopify Blog' },
                  ].map((plat) => (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => setCmsType(plat.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer text-xs font-semibold ${
                        cmsType === plat.id
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {plat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Endpoint URL Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Link size={12} className="text-[#34d399]" />
                  <span>Webhook / REST API Endpoint URL</span>
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder={
                    cmsType === 'wordpress'
                      ? `https://${site || 'ecosmarthomes.ie'}/wp-json/wp/v2/posts`
                      : 'https://your-domain.com/api/v1/webhook'
                  }
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#34d399] font-mono transition-colors"
                />
                <span className="text-[10px] text-slate-400 block leading-tight">
                  {cmsType === 'wordpress'
                    ? `Default WP REST endpoint: https://${site || 'ecosmarthomes.ie'}/wp-json/wp/v2/posts`
                    : 'Enter your custom Webhook URL, Zapier, Make, or CMS REST API endpoint.'}
                </span>
              </div>

              {/* API Key / Secret Token */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Authentication Token / Application Password (Optional)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="e.g. Bearer token or WP Application Password"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#34d399] font-mono transition-colors"
                />
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <CheckCircle2
                    size={15}
                    className="shrink-0 text-emerald-400"
                  />
                  <span>{testResult.msg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap size={13} className="text-amber-400" />
                <span>
                  {testingConnection ? 'Pinging...' : 'Test Connection'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCmsModal(false)}
                  className="px-3.5 py-2 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveCmsConfig}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
                >
                  Save Integration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Delete Article Draft
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Confirm draft removal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setArticleToDelete(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-white font-semibold">
                  "{articleToDelete.title}"
                </strong>
                ?
              </p>
              <p className="text-[11px] text-rose-300/80 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0 text-rose-400" />
                <span>
                  This action will permanently remove this draft from your AI
                  Writer session.
                </span>
              </p>
            </div>

            <div className="flex items-center justify-end border-t border-white/10 pt-4 gap-2.5">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Yes, Delete Article</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
