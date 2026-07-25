export interface PillarData {
  name: string;
  readiness_score: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  articles_live: number;
  articles_total: number;
  backlinks: number;
  backlinks_required: number;
  bait_assets: {
    live: number;
    drafted: number;
    remaining: number;
  };
}

export interface UserXP {
  level: number;
  current: number;
  target: number;
  streak_days: number;
}

export interface TaskItem {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  category: "Research" | "Draft" | "Scout" | "Site Health" | "CMS";
  date: string;
}

export interface ArticleDraft {
  id: string;
  title: string;
  topic: string;
  content: string;
  status: "Drafted" | "Published";
  date: string;
  wordCount: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  tone?: string;
}

export interface DashboardState {
  site: string;
  pillar: PillarData;
  ai_suggestion: string;
  xp: UserXP;
  tasks: TaskItem[];
  weekly_challenges: WeeklyChallenge[];
  recent_activity: ActivityItem[];
  site_health: {
    status: "failed" | "success" | "running";
    error: string | null;
    last_scanned: string | null;
  };
  ai_visibility: {
    visits_last_30_days: number;
    ai_referrals: { source: string; visits: number }[];
  };
  seo_heatmap?: HeatmapDay[];
  drafts?: ArticleDraft[];
}

export interface HeatmapDay {
  day: string;
  visibility: number; // 0-100 scale representing visibility index
  discovery_sessions: number; // number of scans run
  ctr: number; // Click-Through Rate in percent
  rankings: number; // Top-10 ranking keywords count
}

export interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  orgName?: string;
  schemaDesc?: string;
  appliedSchemaNodes: any[];
  isBuiltIn?: boolean;
}

