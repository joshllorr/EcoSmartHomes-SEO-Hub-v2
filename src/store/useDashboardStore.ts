import { create } from 'zustand';

export interface Article {
  id: number | string;
  title: string;
  content: string;
  tone: string;
}

export interface TitleMetaData {
  title: string;
  slug: string;
  meta_description: string;
  alternatives: string[];
}

export interface ContentGraph {
  pillars: any[];
  linkBait: any[];
  articles: any[];
  backlinks: any[];
  internalLinks: any[];
  locations: any[];
  keywords: any[];
}

interface DashboardStore {
  articles: Article[];
  xp: number;
  serp: any | null;
  titleMeta: TitleMetaData | null;
  targetDomain: string;
  linkBaitIdeas: any[];
  backlinks: any[];
  pillarPages: any[];
  internalLinks: any[];
  contentGraph: ContentGraph;
  updateArticle: (id: number | string, updates: Partial<Article>) => void;
  generateArticle: (payload?: {
    title: string;
    content: string;
    tone: string;
  }) => void;
  setSERP: (serp: any) => void;
  setTitleMeta: (data: TitleMetaData | null) => void;
  setTargetDomain: (domain: string) => void;
  setLinkBaitIdeas: (ideas: any[]) => void;
  setBacklinks: (data: any[]) => void;
  addPillarPage: (pillar: any) => void;
  setInternalLinks: (links: any[]) => void;
  updateContentGraph: (updates: Partial<ContentGraph>) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  articles: [],
  xp: 0,
  serp: null,
  titleMeta: null,
  targetDomain:
    localStorage.getItem('ecosmart_target_domain') || 'ecosmarthomes.ie',
  linkBaitIdeas: [],
  backlinks: [],
  pillarPages: [],
  internalLinks: [],
  contentGraph: {
    pillars: [],
    linkBait: [],
    articles: [],
    backlinks: [],
    internalLinks: [],
    locations: [],
    keywords: [],
  },
  setLinkBaitIdeas: (ideas) =>
    set((state) => ({
      linkBaitIdeas: ideas,
      contentGraph: { ...state.contentGraph, linkBait: ideas },
    })),
  setBacklinks: (data) =>
    set((state) => ({
      backlinks: data,
      contentGraph: { ...state.contentGraph, backlinks: data },
    })),
  addPillarPage: (pillar) =>
    set((state) => {
      const updated = [...state.pillarPages, pillar];
      return {
        pillarPages: updated,
        contentGraph: { ...state.contentGraph, pillars: updated },
      };
    }),
  setInternalLinks: (links) =>
    set((state) => ({
      internalLinks: links,
      contentGraph: { ...state.contentGraph, internalLinks: links },
    })),
  updateContentGraph: (updates) =>
    set((state) => ({
      contentGraph: { ...state.contentGraph, ...updates },
    })),
  updateArticle: (id, updates) =>
    set((state) => {
      const updatedArticles = state.articles.map((article) =>
        article.id === id ? { ...article, ...updates } : article,
      );
      return {
        articles: updatedArticles,
        contentGraph: { ...state.contentGraph, articles: updatedArticles },
      };
    }),
  generateArticle: (payload) =>
    set((state) => {
      const newArticle = {
        id: Date.now(),
        title: payload?.title || 'New Article',
        content: payload?.content || '',
        tone: payload?.tone || 'professional',
      };
      const updatedArticles = [...state.articles, newArticle];
      return {
        articles: updatedArticles,
        xp: state.xp + 30,
        contentGraph: { ...state.contentGraph, articles: updatedArticles },
      };
    }),
  setSERP: (serp) => set(() => ({ serp })),
  setTitleMeta: (titleMeta) => set(() => ({ titleMeta })),
  setTargetDomain: (domain) => {
    const cleaned = domain
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '');
    const finalDomain = cleaned || 'ecosmarthomes.ie';
    localStorage.setItem('ecosmart_target_domain', finalDomain);
    set(() => ({ targetDomain: finalDomain }));
  },
}));
