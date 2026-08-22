import React, { useState, useMemo } from 'react';
import {
  Clock,
  BookOpen,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BarChart3,
  Mic,
  Smile,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { calculateReadabilityMetrics } from '../utils/readability';

interface ReadabilityTimeWidgetProps {
  content: string;
  className?: string;
  defaultExpanded?: boolean;
}

export default function ReadabilityTimeWidget({
  content,
  className = '',
  defaultExpanded = true,
}: ReadabilityTimeWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [readingSpeedWpm, setReadingSpeedWpm] = useState<number>(200);
  const [showTooltip, setShowTooltip] = useState(false);

  const metrics = useMemo(() => {
    return calculateReadabilityMetrics(content, readingSpeedWpm);
  }, [content, readingSpeedWpm]);

  // Color mapping based on Flesch-Kincaid Grade Level
  const getGradeTheme = (grade: number) => {
    if (grade === 0 && metrics.totalWords === 0) {
      return {
        badgeBg: 'bg-slate-800 text-slate-400 border-slate-700',
        textColor: 'text-slate-400',
        dotColor: 'bg-slate-400',
        progressBarBg: 'bg-slate-700',
      };
    }
    if (grade <= 6.0) {
      return {
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        textColor: 'text-emerald-400',
        dotColor: 'bg-emerald-400',
        progressBarBg: 'bg-emerald-500',
      };
    }
    if (grade <= 8.5) {
      return {
        badgeBg: 'bg-[#34d399]/15 text-[#34d399] border-[#34d399]/30',
        textColor: 'text-[#34d399]',
        dotColor: 'bg-[#34d399]',
        progressBarBg: 'bg-[#34d399]',
      };
    }
    if (grade <= 11.5) {
      return {
        badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        textColor: 'text-amber-400',
        dotColor: 'bg-amber-400',
        progressBarBg: 'bg-amber-500',
      };
    }
    return {
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      textColor: 'text-rose-400',
      dotColor: 'bg-rose-400',
      progressBarBg: 'bg-rose-500',
    };
  };

  const theme = getGradeTheme(metrics.fleschKincaidGradeLevel);

  return (
    <div
      className={`glass-card overflow-hidden border border-white/10 rounded-2xl transition-all ${className}`}
      id="readability-time-widget"
    >
      {/* Header Bar */}
      <div className="bg-white/5 border-b border-white/10 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#34d399]/15 rounded-lg border border-[#34d399]/30 text-[#34d399]">
            <Clock size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white tracking-wide">
                Readability & Time
              </h4>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}
                id="fkgl-score-badge"
              >
                Grade {metrics.fleschKincaidGradeLevel.toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Accessibility & Engagement Diagnostics
            </span>
          </div>
        </div>

        {/* Quick Highlights / Controls */}
        <div className="flex items-center gap-3">
          {/* Estimated Reading Time Pill */}
          <div
            className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-slate-200"
            id="estimated-reading-time-pill"
            title={`Based on ${readingSpeedWpm} WPM average reading speed`}
          >
            <BookOpen size={12} className="text-[#34d399]" />
            <span>{metrics.estimatedReadingTimeFormatted}</span>
          </div>

          {/* Quick Toggle Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer border border-white/5"
            title={isExpanded ? 'Collapse widget' : 'Expand widget details'}
            id="toggle-readability-widget-btn"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {isExpanded && (
        <div className="p-5 space-y-4 text-left animate-in fade-in duration-200">
          {/* Top Score Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Reading Time Card */}
            <div className="bg-black/30 border border-white/5 p-3.5 rounded-xl space-y-1 relative group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  Reading Time
                </span>
                <Clock size={13} className="text-[#34d399]" />
              </div>
              <div
                className="text-lg font-bold text-white font-display"
                id="reading-time-value"
              >
                {metrics.estimatedReadingTimeFormatted}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                <span>{metrics.totalWords} words</span>
                <span className="text-slate-500 font-mono">@ {readingSpeedWpm} WPM</span>
              </div>
            </div>

            {/* Flesch-Kincaid Grade Level Card */}
            <div className="bg-black/30 border border-white/5 p-3.5 rounded-xl space-y-1 relative">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  Flesch-Kincaid Grade
                </span>
                <GraduationCap size={13} className={theme.textColor} />
              </div>
              <div
                className={`text-lg font-bold font-display ${theme.textColor}`}
                id="fkgl-level-value"
              >
                Grade {metrics.fleschKincaidGradeLevel.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-400 truncate pt-1 border-t border-white/5">
                {metrics.gradeDescription}
              </div>
            </div>

            {/* Flesch Reading Ease Card */}
            <div className="bg-black/30 border border-white/5 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  Reading Ease
                </span>
                <Smile size={13} className="text-indigo-400" />
              </div>
              <div
                className="text-lg font-bold text-white font-display flex items-baseline gap-1"
                id="reading-ease-value"
              >
                <span>{metrics.fleschReadingEase}</span>
                <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5 truncate">
                {metrics.fleschReadingEase >= 70
                  ? 'Easy to Read'
                  : metrics.fleschReadingEase >= 60
                  ? 'Standard Clarity'
                  : 'Fairly Difficult'}
              </div>
            </div>

            {/* Speaking / Audio Time Card */}
            <div className="bg-black/30 border border-white/5 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  Audio / Speaking
                </span>
                <Mic size={13} className="text-teal-400" />
              </div>
              <div
                className="text-lg font-bold text-white font-display"
                id="speaking-time-value"
              >
                {metrics.estimatedSpeakingTimeFormatted}
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5 truncate">
                Podcast / Voiceover pace
              </div>
            </div>
          </div>

          {/* Accessibility Progress & Audience Match */}
          <div className="p-3.5 bg-black/20 border border-white/5 rounded-xl space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
                <span className="text-xs font-bold text-slate-200">
                  {metrics.accessibilityLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="text-slate-400 hover:text-white p-0.5 transition cursor-pointer"
                  title="What is Flesch-Kincaid Grade Level?"
                >
                  <HelpCircle size={12} />
                </button>
              </div>
              <span className="text-[11px] text-[#34d399] font-medium">
                {metrics.targetAudienceMatch}
              </span>
            </div>

            {/* Informational Tooltip */}
            {showTooltip && (
              <div className="p-3 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-300 space-y-1.5 font-sans animate-in fade-in">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-[#34d399]" />
                  <span>Understanding Flesch-Kincaid Accessibility:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The <strong>Flesch-Kincaid Grade Level (FKGL)</strong> formula calculates the US school grade required to easily understand the text. For web audiences and Irish homeowner guides, grades <strong>6.0 to 8.5 (Plain English)</strong> provide the highest conversion, engagement, and accessibility.
                </p>
              </div>
            )}

            {/* Visual Grade Meter Bar */}
            <div className="space-y-1 pt-1">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${theme.progressBarBg}`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(5, (metrics.fleschKincaidGradeLevel / 16) * 100),
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono pt-0.5">
                <span>Grade 1 (Elementary)</span>
                <span className="text-[#34d399] font-bold">Grade 7-8 (Target: Plain English)</span>
                <span>Grade 16+ (Academic)</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Breakdown Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase font-mono block">
                Avg Sentence Length
              </span>
              <span className="text-xs font-bold text-white font-mono">
                {metrics.avgWordsPerSentence} words
              </span>
              <span className="text-[9px] text-slate-500 block">
                {metrics.avgWordsPerSentence <= 18 ? 'Good length' : 'Consider splitting'}
              </span>
            </div>

            <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase font-mono block">
                Complex Words (3+ syl)
              </span>
              <span className="text-xs font-bold text-white font-mono">
                {metrics.complexWordsPercentage}% ({metrics.complexWordsCount})
              </span>
              <span className="text-[9px] text-slate-500 block">
                Target: &lt;15-20%
              </span>
            </div>

            <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase font-mono block">
                Sentence Count
              </span>
              <span className="text-xs font-bold text-white font-mono">
                {metrics.totalSentences} sentences
              </span>
              <span className="text-[9px] text-slate-500 block">
                Structure balance
              </span>
            </div>

            <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase font-mono block">
                Reading Pace WPM
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={readingSpeedWpm}
                  onChange={(e) => setReadingSpeedWpm(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-[#34d399] font-mono outline-none cursor-pointer"
                  id="wpm-selector"
                >
                  <option value={180} className="bg-slate-900 text-white">
                    180 (Casual)
                  </option>
                  <option value={200} className="bg-slate-900 text-white">
                    200 (Standard)
                  </option>
                  <option value={240} className="bg-slate-900 text-white">
                    240 (Fast)
                  </option>
                  <option value={280} className="bg-slate-900 text-white">
                    280 (Skim)
                  </option>
                </select>
              </div>
              <span className="text-[9px] text-slate-500 block">
                Words per minute
              </span>
            </div>
          </div>

          {/* Actionable Accessibility Recommendation */}
          {metrics.recommendations.length > 0 && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
              <Lightbulb size={15} className="text-[#34d399] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-white text-[11px] block">
                  Accessibility Recommendation:
                </span>
                <ul className="text-[11px] text-emerald-200/90 list-disc list-inside space-y-0.5">
                  {metrics.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
