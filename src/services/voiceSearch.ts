import { SearchCategory } from './globalSearchIndex';

// Standard TypeScript interface definitions for the W3C Web Speech API
export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type VoiceAction =
  | { type: 'search'; query: string }
  | { type: 'filter'; category: SearchCategory }
  | { type: 'navigate'; tab: string; label: string }
  | { type: 'select_first' }
  | { type: 'clear' }
  | { type: 'close' };

export interface VoiceCommandResult {
  action: VoiceAction;
  feedback: string;
  rawTranscript: string;
}

/**
 * Checks if the Web Speech API is supported in the current browser environment.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

/**
 * Creates and configures a browser SpeechRecognition instance.
 */
export function createSpeechRecognition(): ISpeechRecognition | null {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognitionConstructor =
    (window as unknown as { SpeechRecognition?: new () => ISpeechRecognition }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => ISpeechRecognition }).webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) return null;

  const recognition = new SpeechRecognitionConstructor();
  recognition.continuous = false;
  recognition.interimResults = true;
  // Prioritize Irish English locale for EcoSmartHomes Ireland, fallback to user's browser language or en-US
  recognition.lang =
    typeof navigator !== 'undefined' && navigator.language
      ? navigator.language
      : 'en-IE';
  recognition.maxAlternatives = 1;

  return recognition;
}

/**
 * Voice Navigation Destination Map
 */
const VOICE_TAB_MAPPINGS: Array<{
  keywords: string[];
  tab: string;
  label: string;
}> = [
  {
    keywords: ['writer', 'ai writer', 'article writer', 'content writer', 'generator', 'drafts studio'],
    tab: 'writer',
    label: 'AI Writer & Studio',
  },
  {
    keywords: ['overview', 'dashboard', 'seo overview', 'main dashboard', 'home', 'pillar health'],
    tab: 'dashboard',
    label: 'SEO Overview Dashboard',
  },
  {
    keywords: ['keyword', 'keywords', 'keyword intelligence', 'keyword research', 'serp explorer'],
    tab: 'keywords',
    label: 'Keyword Intelligence',
  },
  {
    keywords: ['serp', 'serp analyzer', 'rankings', 'competitor diff'],
    tab: 'serp',
    label: 'SERP Analyzer',
  },
  {
    keywords: ['audit', 'site audit', 'site health', 'technical audit', 'sitemap crawler', 'diagnostics'],
    tab: 'audit',
    label: 'Site Health & Audit',
  },
  {
    keywords: ['crawler', 'live crawler', 'harbor sync', 'telemetry'],
    tab: 'crawler',
    label: 'Live Crawler & Sync',
  },
  {
    keywords: ['grant', 'grants', 'seai', 'seai grants', 'grant planner', 'retrofit grants'],
    tab: 'p23_grants',
    label: 'SEAI Grant Planner',
  },
  {
    keywords: ['library', 'content library', 'articles library', 'repository'],
    tab: 'content_library',
    label: 'Content Library',
  },
  {
    keywords: ['ideas', 'content ideas', 'topic ideas', 'topics'],
    tab: 'content_ideas',
    label: 'Content Ideas',
  },
  {
    keywords: ['links', 'link builder', 'internal links', 'backlinks'],
    tab: 'link_builder',
    label: 'Link Builder',
  },
  {
    keywords: ['journey', 'homeowner journey', 'portal', 'homeowner portal'],
    tab: 'p32_journey',
    label: 'Homeowner Retrofit Portal',
  },
  {
    keywords: ['marl', 'multi agent', 'agent rl'],
    tab: 'p7_marl',
    label: 'MARL Reinforcement Engine',
  },
];

/**
 * Parses a spoken transcript into a structured VoiceCommandResult.
 * Handles commands (filter, navigate, clear, select, close) or defaults to search query.
 */
export function parseVoiceCommand(transcript: string): VoiceCommandResult {
  const cleaned = transcript
    .trim()
    .replace(/[.,?!]+$/g, '') // remove trailing punctuation
    .trim();

  const lower = cleaned.toLowerCase();

  // 1. Clear / Reset Command
  if (
    lower === 'clear' ||
    lower === 'clear search' ||
    lower === 'clear input' ||
    lower === 'reset' ||
    lower === 'start over'
  ) {
    return {
      action: { type: 'clear' },
      feedback: 'Search cleared',
      rawTranscript: cleaned,
    };
  }

  // 2. Close / Exit Command
  if (
    lower === 'close' ||
    lower === 'close search' ||
    lower === 'close modal' ||
    lower === 'exit' ||
    lower === 'cancel'
  ) {
    return {
      action: { type: 'close' },
      feedback: 'Closing search dialog',
      rawTranscript: cleaned,
    };
  }

  // 3. Select First / Top Result Command
  if (
    lower === 'select first' ||
    lower === 'open first' ||
    lower === 'choose first' ||
    lower === 'first result' ||
    lower === 'open top' ||
    lower === 'select top' ||
    lower === 'choose top'
  ) {
    return {
      action: { type: 'select_first' },
      feedback: 'Opening top result',
      rawTranscript: cleaned,
    };
  }

  // 4. Category Filter Commands
  // e.g. "filter by drafts", "filter keywords", "show audits", "show all"
  const filterMatch = lower.match(/^(?:filter(?:\s+by)?|show|view|switch\s+to)\s+(.*)$/);
  if (filterMatch) {
    const target = filterMatch[1].trim();
    if (target === 'draft' || target === 'drafts' || target === 'content' || target === 'articles') {
      return {
        action: { type: 'filter', category: 'draft' },
        feedback: 'Filtered by: Content Drafts',
        rawTranscript: cleaned,
      };
    }
    if (
      target === 'keyword' ||
      target === 'keywords' ||
      target === 'research' ||
      target === 'keyword research' ||
      target === 'rankings'
    ) {
      return {
        action: { type: 'filter', category: 'keyword' },
        feedback: 'Filtered by: Research',
        rawTranscript: cleaned,
      };
    }
    if (
      target === 'audit' ||
      target === 'audits' ||
      target === 'site audits' ||
      target === 'logs' ||
      target === 'audit logs' ||
      target === 'site health'
    ) {
      return {
        action: { type: 'filter', category: 'audit' },
        feedback: 'Filtered by: Audits',
        rawTranscript: cleaned,
      };
    }
    if (target === 'nav' || target === 'navigation' || target === 'views' || target === 'pages') {
      return {
        action: { type: 'filter', category: 'nav' },
        feedback: 'Filtered by: Navigation',
        rawTranscript: cleaned,
      };
    }
    if (target === 'all' || target === 'all items' || target === 'everything' || target === 'all categories') {
      return {
        action: { type: 'filter', category: 'all' },
        feedback: 'Showing all categories',
        rawTranscript: cleaned,
      };
    }
  }

  // 5. Navigation Commands
  // e.g. "go to writer", "open dashboard", "navigate to site health", "launch crawler"
  const navMatch = lower.match(/^(?:go\s+to|open|navigate\s+to|launch|jump\s+to)\s+(.*)$/);
  if (navMatch) {
    const destination = navMatch[1].trim();
    for (const mapping of VOICE_TAB_MAPPINGS) {
      if (mapping.keywords.some((k) => destination === k || destination.includes(k))) {
        return {
          action: { type: 'navigate', tab: mapping.tab, label: mapping.label },
          feedback: `Navigating to ${mapping.label}`,
          rawTranscript: cleaned,
        };
      }
    }
  }

  // 6. Natural Search Queries with Prefixes
  // e.g. "search for heat pump grants", "find solar PV", "search SEAI"
  const searchPrefixMatch = cleaned.match(/^(?:search\s+for|search|find|look\s+for)\s+(.+)$/i);
  const finalQuery = searchPrefixMatch ? searchPrefixMatch[1].trim() : cleaned;

  return {
    action: { type: 'search', query: finalQuery },
    feedback: `Searching: "${finalQuery}"`,
    rawTranscript: cleaned,
  };
}

/**
 * List of sample voice commands for user guidance.
 */
export const VOICE_COMMAND_EXAMPLES = [
  { command: 'heat pump grants', description: 'Search keywords & drafts' },
  { command: 'open writer', description: 'Quick jump to AI Writer studio' },
  { command: 'filter drafts', description: 'Show only content drafts' },
  { command: 'filter keywords', description: 'Show only keyword research' },
  { command: 'filter audits', description: 'Show site audit & health logs' },
  { command: 'go to site health', description: 'Navigate to technical audit' },
  { command: 'open first', description: 'Instantly select the top search item' },
  { command: 'clear', description: 'Reset search query and filters' },
];
