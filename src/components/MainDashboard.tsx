import { motion } from 'motion/react';
import WelcomeCard from './WelcomeCard';
import PillarPerformanceCard from './PillarPerformanceCard';
import SEOHeatmapCard from './SEOHeatmapCard';
import XPCard from './XPCard';
import SiteHealthCard from './SiteHealthCard';
import AIVisibilityCard from './AIVisibilityCard';
import QuickActionsGrid from './QuickActionsGrid';
import ActivityFeed from './ActivityFeed';
import ErrorBoundary from './ErrorBoundary';
import RankingStabilityMap from './RankingStabilityMap';
import { DashboardState } from '../types';

interface MainDashboardProps {
  state: DashboardState;
  onConnectCMS: () => void;
  onOpenInWriter: (suggestion: string) => void;
  onAddSupportPage: () => void;
  onUpgradeLimit: () => void;
  onToggleTask: (taskId: string) => void;
  onRetryScan: (sitemapPath?: string) => void;
  onOptimizeAIVisibility: () => void;
  onQuickAction: (actionId: string) => void;
}

export default function MainDashboard({
  state,
  onConnectCMS,
  onOpenInWriter,
  onAddSupportPage,
  onUpgradeLimit,
  onToggleTask,
  onRetryScan,
  onOptimizeAIVisibility,
  onQuickAction,
}: MainDashboardProps) {
  const isCMSConnected =
    state.tasks.find((t) => t.id === 'connect_cms')?.completed || false;

  // Animation configuration presets
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 90,
        damping: 14,
      },
    },
  } as const;

  return (
    <motion.div
      className="grid grid-cols-1 xl:grid-cols-12 gap-6"
      id="dashboard-grid"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Left panel: main metrics, pillars & action tools (8 cols on xl) */}
      <motion.div
        className="xl:col-span-8 flex flex-col gap-6"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants}>
          <ErrorBoundary sectionName="Welcome Section">
            <WelcomeCard
              onConnectCMS={onConnectCMS}
              isCMSConnected={isCMSConnected}
            />
          </ErrorBoundary>
        </motion.div>

        <motion.div variants={cardVariants}>
          <ErrorBoundary sectionName="Ranking Stability Map">
            <RankingStabilityMap />
          </ErrorBoundary>
        </motion.div>

        <motion.div variants={cardVariants}>
          <ErrorBoundary sectionName="SEO Pillar performance Tracker">
            <PillarPerformanceCard
              pillar={state.pillar}
              aiSuggestion={state.ai_suggestion}
              onOpenInWriter={onOpenInWriter}
              onAddSupportPage={onAddSupportPage}
            />
          </ErrorBoundary>
        </motion.div>

        <motion.div variants={cardVariants}>
          <ErrorBoundary sectionName="SEO Heatmap & Trends">
            <SEOHeatmapCard data={state.seo_heatmap} />
          </ErrorBoundary>
        </motion.div>

        {/* 2-Column subgrid for Site Diagnostics & AI Engine stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          <motion.div variants={cardVariants}>
            <ErrorBoundary sectionName="Site Diagnostics Audit">
              <SiteHealthCard
                status={state.site_health.status}
                error={state.site_health.error}
                onRetryScan={onRetryScan}
              />
            </ErrorBoundary>
          </motion.div>

          <motion.div variants={cardVariants}>
            <ErrorBoundary sectionName="AI Search Citation Hub">
              <AIVisibilityCard
                visits={state.ai_visibility.visits_last_30_days}
                onOptimizeClick={onOptimizeAIVisibility}
              />
            </ErrorBoundary>
          </motion.div>
        </motion.div>

        <motion.div variants={cardVariants}>
          <ErrorBoundary sectionName="Quick Growth Actions Grid">
            <QuickActionsGrid onActionClick={onQuickAction} />
          </ErrorBoundary>
        </motion.div>
      </motion.div>

      {/* Right panel: Gamification standings, checklists & feed (4 cols on xl) */}
      <motion.div
        className="xl:col-span-4 flex flex-col gap-6"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants}>
          <ErrorBoundary sectionName="Growth XP Progress Tracker">
            <XPCard
              xp={state.xp}
              tasks={state.tasks}
              weeklyChallenges={state.weekly_challenges}
              onToggleTask={onToggleTask}
            />
          </ErrorBoundary>
        </motion.div>

        <motion.div variants={cardVariants}>
          <ErrorBoundary sectionName="SEO Live Activity Feed">
            <ActivityFeed activities={state.recent_activity} />
          </ErrorBoundary>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
