import React, { useEffect, useState, useCallback } from 'react';
import { useHubEvents } from '../hooks/useHubEvents';

interface HubEvent {
  id: string;
  type: string;
  slug?: string;
  title?: string;
  message: string;
  timestamp: number;
}

interface FeedResponse {
  events: HubEvent[];
  total: number;
  lastSyncAt: number | null;
}

const EVENT_ICONS: Record<string, string> = {
  draft_created: '📝',
  article_generated: '📝',
  article_draft: '📝',
  rewrite_success: '✍️',
  rewrite_event: '✍️',
  serp_diff_patch: '🔍',
  serp_diff: '🔍',
  link_bait_generated: '🪝',
  autonomous_expansion: '🤖',
  expansion_queued: '⏳',
  scheduled_publish: '🚀',
  visibility_spike: '📈',
  semantic_enrichment: '🧠',
  authority_graph_update: '🕸️',
  multi_site_expansion: '🌐',
  conversational_knowledge: '💬',
  metric_update: '📊',
  cross_domain_fusion: '🔗',
  predictive_ranking: '🎯',
  serp_volatility: '⚡',
  behavioural_telemetry: '👁️',
  adaptive_personalisation: '🎨',
  topic_cluster: '🗂️',
};

const EVENT_COLORS: Record<string, string> = {
  draft_created: '#3b82f6',
  article_generated: '#3b82f6',
  rewrite_success: '#10b981',
  rewrite_event: '#10b981',
  scheduled_publish: '#f59e0b',
  autonomous_expansion: '#8b5cf6',
  expansion_queued: '#8b5cf6',
  link_bait_generated: '#ec4899',
  serp_diff_patch: '#06b6d4',
  serp_diff: '#06b6d4',
  visibility_spike: '#10b981',
  semantic_enrichment: '#a78bfa',
  multi_site_expansion: '#f97316',
};

function getEventColor(type: string): string {
  return EVENT_COLORS[type] ?? '#64748b';
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function HarborFeed() {
  const [total, setTotal] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [, setTick] = useState(0);

  const events = useHubEvents(typeFilter);

  // We no longer need the complex local ws logic because useHubEvents handles it.
  // Wait, HarborFeed also tracked `total` and `lastSyncAt`. We can still fetch those once.
  useEffect(() => {
    fetch('/api/hub-events?limit=1')
      .then((res) => res.json())
      .then((data) => {
        setTotal(data.total);
        setLastSyncAt(data.lastSyncAt);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Tick every 30s to refresh "time ago" labels without refetching
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const filterTypes = [
    '',
    'draft_created',
    'rewrite_success',
    'scheduled_publish',
    'autonomous_expansion',
    'expansion_queued',
    'serp_diff',
    'link_bait_generated',
    'visibility_spike',
    'semantic_enrichment',
    'multi_site_expansion',
    'conversational_knowledge',
  ];

  return (
    <div
      style={{
        background: '#141c33',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
            🛰️ Harbor Activity Feed
          </h3>
          <span style={{ color: '#64748b', fontSize: '12px' }}>
            {total} total synced
            {lastSyncAt && ` · last sync ${timeAgo(lastSyncAt)}`}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Live indicator */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              color: '#10b981',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981',
                display: 'inline-block',
                animation: 'pulse 2s infinite',
              }}
            />
            LIVE
          </span>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              background: '#0b1020',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {filterTypes.map((t) => (
              <option key={t} value={t}>
                {t || 'All Events'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Event list */}
      {loading ? (
        <div
          style={{
            color: '#64748b',
            fontSize: '13px',
            textAlign: 'center',
            padding: '24px 0',
          }}
        >
          Connecting to Hub…
        </div>
      ) : events.length === 0 ? (
        <div
          style={{
            color: '#64748b',
            fontSize: '13px',
            textAlign: 'center',
            padding: '24px 0',
          }}
        >
          No events yet — start the local Hub to begin syncing.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {events.map((e) => (
            <div
              key={e.id ?? e.timestamp}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                background: '#0b1020',
                borderRadius: '8px',
                borderLeft: `3px solid ${getEventColor(e.type)}`,
              }}
            >
              {/* Icon */}
              <span
                style={{
                  fontSize: '16px',
                  lineHeight: 1,
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                {EVENT_ICONS[e.type] ?? '📡'}
              </span>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      background: `${getEventColor(e.type)}22`,
                      color: getEventColor(e.type),
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {e.type.replace(/_/g, ' ')}
                  </span>
                  <span
                    style={{
                      color: '#475569',
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {timeAgo(e.timestamp)}
                  </span>
                </div>

                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '13px',
                    color: '#cbd5e1',
                    lineHeight: '1.4',
                  }}
                >
                  {e.message}
                </p>

                {e.slug && (
                  <code
                    style={{
                      marginTop: '3px',
                      display: 'inline-block',
                      fontSize: '11px',
                      color: '#38bdf8',
                    }}
                  >
                    {e.slug}.html
                  </code>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
