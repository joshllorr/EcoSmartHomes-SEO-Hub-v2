import React, { useEffect, useState } from 'react';
import { useHubEvents } from '../hooks/useHubEvents';
import { sendHubCommand, hubCommands } from '../services/hubCommands';

interface PreFlightResult {
  passed: boolean;
  checks: {
    hubOnline: boolean;
    queueLengthReasonable: boolean;
    noConflictingTasks: boolean;
    noManualOverride: boolean;
    noCooldownViolation: boolean;
  };
  failureReason?: string;
}

interface DecisionItem {
  id: string;
  action: string;
  siteId: string;
  slug: string;
  reason: string;
  priority: number;
  confidence: number;
  timestamp: number;
  executed: boolean;
  executionResult?: string;
  isPredictive?: boolean;
  preFlightResult?: PreFlightResult;
}

interface PageSignalItem {
  slug: string;
  siteId: string;
  serpVolatility: number;
  trafficTrend: number;
  backlinks: number;
  pillarScore: number;
}

interface TrendVectors {
  ctrTrend: number;
  serpVolatilityTrend: number;
  backlinkGrowthTrend: number;
  pillarStrengthTrend: number;
  contentVelocityTrend: number;
}

interface UnifiedData {
  harbor: {
    backlinksBuilt: number;
    serpVolatility: string;
    avgCtr: string;
    pillarReadiness: string;
    cmsStatus: string;
    linkBaitAssets: number;
    domainAuthority: number;
  };
  hub: {
    totalSynced: number;
    draftVelocity: string;
    rewriteFrequency: string;
    competitorDiffs: number;
    queueLength: number;
    recentEvents: any[];
  };
  fleet: {
    activeDomains: number;
    totalFleetTraffic: string;
    crossDomainLinks: number;
  };
  insights?: { text: string; action: any; button: string }[];
  autonomousState?: {
    autoPilotEnabled: boolean;
    minConfidenceThreshold: number;
    lastRunAt: number | null;
    trendVectors: TrendVectors;
    decisionsHistory: DecisionItem[];
    activeSignals: PageSignalItem[];
  };
  ts: number;
}

export const UnifiedAnalytics: React.FC = () => {
  const [data, setData] = useState<UnifiedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const events = useHubEvents(); // Real-time Layer 4 overlay

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/unified-analytics');
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error('Failed to fetch unified analytics');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerCycle = async () => {
    setIsProcessing(true);
    await hubCommands.triggerAutonomousCycle();
    await fetchAnalytics();
    setIsProcessing(false);
  };

  const handleToggleAutoPilot = async () => {
    if (!data?.autonomousState) return;
    setIsProcessing(true);
    await hubCommands.toggleAutoPilot(!data.autonomousState.autoPilotEnabled);
    await fetchAnalytics();
    setIsProcessing(false);
  };

  if (!data) {
    return (
      <div style={{ color: '#9aa0c2', padding: '40px', textAlign: 'center' }}>
        Loading Unified Analytics...
      </div>
    );
  }

  const { harbor, hub, fleet, autonomousState } = data;
  const trends = autonomousState?.trendVectors;

  const renderTrendTag = (val?: number) => {
    if (val === undefined) return null;
    const isPositive = val >= 0;
    const pct = (val * 100).toFixed(1);
    return (
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: isPositive ? '#10b981' : '#f87171',
          background: isPositive
            ? 'rgba(16, 185, 129, 0.12)'
            : 'rgba(239, 68, 68, 0.12)',
          padding: '2px 6px',
          borderRadius: '4px',
          marginLeft: '8px',
        }}
      >
        {isPositive ? `+${pct}% 📈` : `${pct}% 📉`}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          Unified Analytics & Predictive Intelligence
        </h2>
        <span style={styles.liveBadge}>● LIVE</span>
      </div>

      <div style={styles.grid}>
        {/* ── Content Velocity ── */}
        <div style={styles.card}>
          <h3 style={styles.cardHeader}>⚡ Content Velocity</h3>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Drafts per week</span>
            <span style={styles.metricValue}>{hub.draftVelocity}</span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Velocity Trend Vector</span>
            <span style={styles.metricValue}>
              {renderTrendTag(trends?.contentVelocityTrend)}
            </span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Rewrite Frequency</span>
            <span style={styles.metricValue}>{hub.rewriteFrequency}</span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Competitor Diffs</span>
            <span style={styles.metricValue}>
              {hub.competitorDiffs} patches
            </span>
          </div>
        </div>

        {/* ── SEO Performance ── */}
        <div style={styles.card}>
          <h3 style={styles.cardHeader}>📈 Predictive SEO Metrics</h3>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Average CTR</span>
            <span style={{ ...styles.metricValue, color: '#10b981' }}>
              {harbor.avgCtr} {renderTrendTag(trends?.ctrTrend)}
            </span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>SERP Volatility</span>
            <span
              style={{
                ...styles.metricValue,
                color: harbor.serpVolatility === 'Low' ? '#10b981' : '#f59e0b',
              }}
            >
              {harbor.serpVolatility}{' '}
              {renderTrendTag(trends?.serpVolatilityTrend)}
            </span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Backlinks Built</span>
            <span style={styles.metricValue}>
              {harbor.backlinksBuilt}{' '}
              {renderTrendTag(trends?.backlinkGrowthTrend)}
            </span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Domain Authority</span>
            <span style={styles.metricValue}>{harbor.domainAuthority}/100</span>
          </div>
        </div>

        {/* ── Automation Health ── */}
        <div style={styles.card}>
          <h3 style={styles.cardHeader}>🤖 Automation Health</h3>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>CMS Status</span>
            <span style={{ ...styles.metricValue, color: '#10b981' }}>
              {harbor.cmsStatus}
            </span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Pillar Readiness</span>
            <span style={styles.metricValue}>
              {harbor.pillarReadiness}{' '}
              {renderTrendTag(trends?.pillarStrengthTrend)}
            </span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Pre-Flight Guard</span>
            <span style={{ ...styles.metricValue, color: '#10b981' }}>
              Active ✈️
            </span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Total Events Synced</span>
            <span style={styles.metricValue}>{hub.totalSynced}</span>
          </div>
        </div>

        {/* ── Fleet Overview ── */}
        <div style={styles.card}>
          <h3 style={styles.cardHeader}>🌐 Fleet Overview</h3>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Active Domains</span>
            <span style={styles.metricValue}>{fleet.activeDomains}</span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Total Fleet Traffic</span>
            <span style={{ ...styles.metricValue, color: '#10b981' }}>
              {fleet.totalFleetTraffic}
            </span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Cross-Domain Links</span>
            <span style={styles.metricValue}>{fleet.crossDomainLinks}</span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Link-Bait Assets</span>
            <span style={styles.metricValue}>{harbor.linkBaitAssets}</span>
          </div>
        </div>
      </div>

      {/* ── Layer 7: AI Predictive Autonomous Decision Engine Panel ── */}
      {autonomousState && (
        <div
          style={{ ...styles.card, marginTop: '10px', borderColor: '#818cf8' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3
                style={{
                  ...styles.cardHeader,
                  borderBottom: 'none',
                  margin: 0,
                  color: '#a5b4fc',
                  fontSize: '18px',
                }}
              >
                🔮 Predictive Engine with Pre-Flight Checklist Safety Guard
              </h3>
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '13px',
                  margin: '4px 0 0 0',
                }}
              >
                Actions evaluate Hub online status, queue bounds, task
                conflicts, manual overrides & 3-minute cooldowns before
                execution.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span
                style={{
                  background: autonomousState.autoPilotEnabled
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)',
                  color: autonomousState.autoPilotEnabled
                    ? '#10b981'
                    : '#f59e0b',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {autonomousState.autoPilotEnabled
                  ? '🟢 PREDICTIVE AUTO-PILOT'
                  : '⏸️ AUTO-PILOT PAUSED'}
              </span>
              <button
                onClick={handleToggleAutoPilot}
                disabled={isProcessing}
                style={{
                  ...styles.actionBtn,
                  background: autonomousState.autoPilotEnabled
                    ? '#374151'
                    : '#10b981',
                  color: '#ffffff',
                }}
              >
                {autonomousState.autoPilotEnabled
                  ? 'Pause Auto-Pilot'
                  : 'Enable Auto-Pilot'}
              </button>
              <button
                onClick={handleTriggerCycle}
                disabled={isProcessing}
                style={{
                  ...styles.actionBtn,
                  background:
                    'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              >
                {isProcessing
                  ? 'Forecast & Executing...'
                  : 'Run Predictive Engine 🔮'}
              </button>
            </div>
          </div>

          <h4
            style={{
              color: '#cbd5e1',
              fontSize: '14px',
              margin: '16px 0 12px 0',
            }}
          >
            Predictive Pre-Flight Optimization Ledger
          </h4>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {autonomousState.decisionsHistory.slice(0, 6).map((dec) => {
              const confPct = Math.round((dec.confidence || 0.8) * 100);
              const meetsThreshold = (dec.confidence || 0.8) >= 0.7;
              const pfPassed = dec.preFlightResult?.passed ?? true;
              const isDeferred = dec.executionResult?.startsWith('DEFERRED:');

              return (
                <div
                  key={dec.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: dec.isPredictive
                      ? 'rgba(99, 102, 241, 0.08)'
                      : 'rgba(15, 23, 42, 0.6)',
                    border: isDeferred
                      ? '1px solid rgba(245, 158, 11, 0.4)'
                      : dec.isPredictive
                        ? '1px solid rgba(99, 102, 241, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {dec.isPredictive && (
                        <span
                          style={{
                            background:
                              'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                            color: '#ffffff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                          }}
                        >
                          🔮 PREEMPTIVE
                        </span>
                      )}
                      <span
                        style={{
                          background: meetsThreshold
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                          color: meetsThreshold ? '#34d399' : '#fbbf24',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        Conf: {confPct}%
                      </span>
                      <span
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#60a5fa',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        Prio: {dec.priority.toFixed(2)}
                      </span>
                      <strong style={{ color: '#38bdf8', fontSize: '13px' }}>
                        {dec.siteId}
                      </strong>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                        / {dec.slug}.html
                      </span>
                      <span
                        style={{
                          background: '#1e293b',
                          color: '#e2e8f0',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        {dec.action}
                      </span>
                    </div>
                    <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
                      💡 {dec.reason}
                    </span>
                    {isDeferred && (
                      <span
                        style={{
                          color: '#f59e0b',
                          fontSize: '12px',
                          fontStyle: 'italic',
                        }}
                      >
                        ⚠️ {dec.executionResult}
                      </span>
                    )}
                  </div>

                  <div>
                    {dec.executed ? (
                      <span
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        ✈️ PASSED & EXECUTED
                      </span>
                    ) : isDeferred ? (
                      <span
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        ✈️ PRE-FLIGHT DEFERRED
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          sendHubCommand(dec.action as any, {
                            siteId: dec.siteId,
                            slug: dec.slug,
                          })
                        }
                        style={{
                          ...styles.actionBtn,
                          fontSize: '12px',
                          padding: '4px 10px',
                        }}
                      >
                        {!meetsThreshold
                          ? 'Review & Execute'
                          : 'Execute Manual'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {autonomousState.decisionsHistory.length === 0 && (
              <span
                style={{
                  color: '#94a3b8',
                  fontSize: '13px',
                  fontStyle: 'italic',
                }}
              >
                No predictive decisions evaluated yet. Click {'"'}
                Run Predictive Engine{'"'} to trigger evaluation.
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Layer 6: Insights Engine & Layer 7: Action Buttons ── */}
      {data.insights && data.insights.length > 0 && (
        <div
          style={{ ...styles.card, marginTop: '10px', borderColor: '#3dd68c' }}
        >
          <h3 style={{ ...styles.cardHeader, color: '#3dd68c' }}>
            🧠 Autonomous Insights Engine
          </h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {data.insights.map((insight, idx) => (
              <div key={idx} style={styles.insightRow}>
                <span style={styles.insightText}>💡 {insight.text}</span>
                <button
                  onClick={() =>
                    sendHubCommand(insight.action as any, {
                      slug: 'auto-generated',
                    })
                  }
                  style={styles.actionBtn}
                >
                  {insight.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Layer 4: Real-time Event Overlay ── */}
      <div style={{ ...styles.card, marginTop: '10px', padding: '12px 20px' }}>
        <h3 style={styles.cardHeader}>⚡ Real-Time Operations Overlay</h3>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px',
          }}
        >
          {events.slice(0, 5).map((e) => (
            <div key={e.id} style={styles.eventPill}>
              <strong style={{ color: '#f1f5f9' }}>{e.type}</strong> —{' '}
              {e.message}
            </div>
          ))}
          {events.length === 0 && (
            <span style={styles.metricLabel}>Waiting for live events...</span>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginTop: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#f5f7ff',
  },
  liveBadge: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#151a2c',
    border: '1px solid #252b3f',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  cardHeader: {
    margin: '0 0 16px 0',
    fontSize: '15px',
    color: '#e2e8f0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '12px',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px dashed rgba(255,255,255,0.05)',
  },
  metricLabel: {
    color: '#9aa0c2',
    fontSize: '13px',
  },
  metricValue: {
    color: '#f1f5f9',
    fontWeight: 600,
    fontSize: '14px',
  },
  insightRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(61, 214, 140, 0.05)',
    padding: '12px 16px',
    borderRadius: '8px',
    borderLeft: '3px solid #3dd68c',
  },
  insightText: {
    color: '#e2e8f0',
    fontSize: '14px',
    fontWeight: 500,
  },
  actionBtn: {
    background: '#3dd68c',
    color: '#0f172a',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  eventPill: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid #252b3f',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#9aa0c2',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};

export default UnifiedAnalytics;
