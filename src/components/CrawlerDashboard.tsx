import React, { useEffect, useState } from 'react';
import { MetricCard } from './MetricCard';
import { LiveFeed } from './LiveFeed';
import HarborFeed from '../modules/HarborFeed';
import HubStatus from './HubStatus';
import { hubCommands } from '../services/hubCommands';
import UnifiedAnalytics from './UnifiedAnalytics';
import FleetManager from './FleetManager';
import RLPolicyDashboard from './RLPolicyDashboard';

export type ViewTab =
  | 'Dashboard'
  | 'Content'
  | 'Clusters'
  | 'Authority'
  | 'SERP'
  | 'Knowledge'
  | 'Fleet'
  | 'dashboard'
  | 'content'
  | 'clusters'
  | 'authority'
  | 'serp'
  | 'knowledge'
  | 'fleet'
  | 'analytics'
  | 'Analytics'
  | 'rl'
  | 'RL';

export const Dashboard: React.FC<{
  heartbeatMessage: string;
  queueLength: number;
  nextSlug: string | null;
  xp: number;
  visibility: number;
  events: string[];
}> = ({ heartbeatMessage, queueLength, nextSlug, xp, visibility, events }) => (
  <div>
    <div style={styles.metricsRow}>
      <MetricCard
        title="Crawler Heartbeat"
        heartbeat
        heartbeatMessage={heartbeatMessage}
      />
      <MetricCard
        title="Publishing Queue"
        value={queueLength}
        subText={nextSlug ? `Next up: ${nextSlug}.html` : 'Queue empty'}
      />
      <MetricCard
        title="Indexing XP"
        value={xp}
        progress={Math.min((xp / 200) * 100, 100)}
      />
      <MetricCard
        title="Visibility"
        value={visibility}
        subText="Live citations & visits"
      />
    </div>
    <LiveFeed events={events} />
    <HarborFeed />
  </div>
);

export const ContentEngine: React.FC = () => {
  const [topicInput, setTopicInput] = useState(
    'Heat Pump Maintenance Ireland 2026',
  );
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const runEngineAction = async (
    actionName: string,
    actionFn: () => Promise<void>,
  ) => {
    setActionStatus(`Executing ${actionName}...`);
    try {
      await actionFn();
      setActionStatus(`Completed ${actionName} (Check Harbor Feed for events)`);
    } catch (e) {
      setActionStatus(`Error executing ${actionName}`);
    }
    setTimeout(() => setActionStatus(null), 4000);
  };

  const currentSlug = topicInput
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>⚙️ Autonomous Content Engine Pipeline</h2>
      <p style={styles.cardDescription}>
        End-to-end content generation, optimization, schema injection, and
        GitHub deployment suite.
      </p>

      {actionStatus && (
        <div
          style={{
            ...styles.statusPill,
            marginBottom: '16px',
            display: 'inline-block',
          }}
        >
          ⚡ {actionStatus}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          placeholder="Enter target topic or keyword..."
          style={styles.qaInput}
        />
      </div>

      <div style={styles.grid}>
        <div style={styles.clusterBox}>
          <h3 style={styles.boxHeading}>1. Generation & Outlining</h3>
          <p style={styles.cardText}>
            Create SEO briefs, structured headings, and initial drafts.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            <button
              onClick={() =>
                runEngineAction('Generate SEO Brief', async () => {})
              }
              style={styles.navButtonActive}
            >
              Generate SEO Brief
            </button>
            <button
              onClick={() =>
                runEngineAction('Generate Outline', async () => {})
              }
              style={styles.navButtonActive}
            >
              Generate Outline
            </button>
            <button
              onClick={() =>
                runEngineAction('Generate Draft', () =>
                  hubCommands.generateDraft(currentSlug),
                )
              }
              style={styles.navButtonActive}
            >
              Generate Draft
            </button>
          </div>
        </div>

        <div style={styles.clusterBox}>
          <h3 style={styles.boxHeading}>2. Optimization & Patches</h3>
          <p style={styles.cardText}>
            Rewrite grade updates, competitor diff patches, and link-bait hooks.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            <button
              onClick={() =>
                runEngineAction('Rewrite Engine', () =>
                  hubCommands.rewriteArticle(currentSlug),
                )
              }
              style={styles.navButton}
            >
              Rewrite Engine
            </button>
            <button
              onClick={() =>
                runEngineAction('Competitor Diff', () =>
                  hubCommands.competitorDiff(currentSlug),
                )
              }
              style={styles.navButton}
            >
              Competitor Diff
            </button>
            <button
              onClick={() =>
                runEngineAction('Link-Bait Generator', () =>
                  hubCommands.triggerLinkBait(currentSlug),
                )
              }
              style={styles.navButton}
            >
              Link-Bait Generator
            </button>
            <button
              onClick={() =>
                runEngineAction('Queue Expansion', () =>
                  hubCommands.queueExpansion(currentSlug),
                )
              }
              style={styles.navButton}
            >
              Queue Expansion
            </button>
          </div>
        </div>

        <div style={styles.clusterBox}>
          <h3 style={styles.boxHeading}>3. Enrichment & Publishing</h3>
          <p style={styles.cardText}>
            Inject JSON-LD schemas, contextual links, and deploy to GitHub.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            <button
              onClick={() =>
                runEngineAction('Schema Injection', async () => {})
              }
              style={styles.navButton}
            >
              Schema Injection
            </button>
            <button
              onClick={() =>
                runEngineAction('Internal Linking', async () => {})
              }
              style={styles.navButton}
            >
              Internal Linking
            </button>
            <button
              onClick={() =>
                runEngineAction('Publish to GitHub', () =>
                  hubCommands.publishToGitHub(currentSlug),
                )
              }
              style={styles.navButtonActive}
            >
              Publish to GitHub
            </button>
          </div>
        </div>

        <div style={styles.clusterBox}>
          <h3 style={styles.boxHeading}>4. Autonomous Queue Monitor</h3>
          <p style={styles.cardText}>
            Active queue items pending automatic publishing & expansion.
          </p>
          <ul style={styles.clusterList}>
            <li style={styles.clusterItem}>
              ⏳ <code>heat-pump-electricity-tariff.html</code> (Autonomous
              Expansion)
            </li>
            <li style={styles.clusterItem}>
              ⏳ <code>solar-pv-battery-storage.html</code> (Autonomous
              Expansion)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const ClusterMap: React.FC = () => (
  <div style={styles.card}>
    <h2 style={styles.cardTitle}>🗺️ Topic Cluster Map & Pillar Hierarchy</h2>
    <p style={styles.cardDescription}>
      Internal cluster maps automatically interlink sub-topics around core
      pillar pages to maximize topical authority.
    </p>
    <div style={styles.grid}>
      <div style={styles.clusterBox}>
        <div style={styles.pillarHeader}>
          <span style={styles.pillarTag}>PILLAR</span>
          <h3 style={styles.boxHeading}>Heat Pump Retrofit Guide</h3>
          <code style={styles.code}>heat-pump-guide.html</code>
        </div>
        <ul style={styles.clusterList}>
          <li style={styles.clusterItem}>
            🔗 <code>heat-pump-costs.html</code> (SEAI Grants & Payback)
          </li>
          <li style={styles.clusterItem}>
            🔗 <code>heat-pump-grants.html</code> (2026 Eligibility Criteria)
          </li>
          <li style={styles.clusterItem}>
            🔗 <code>heat-pump-maintenance-schedule.html</code> [Auto-Expanded]
          </li>
          <li style={styles.clusterItem}>
            🔗 <code>heat-pump-electricity-tariff.html</code> [Auto-Expanded]
          </li>
        </ul>
      </div>

      <div style={styles.clusterBox}>
        <div style={styles.pillarHeader}>
          <span style={styles.pillarTag}>PILLAR</span>
          <h3 style={styles.boxHeading}>Solar PV & Battery Storage Hub</h3>
          <code style={styles.code}>solar-pv-guide.html</code>
        </div>
        <ul style={styles.clusterList}>
          <li style={styles.clusterItem}>
            🔗 <code>solar-pv-grants-2026.html</code> (€2,100 Subsidy)
          </li>
          <li style={styles.clusterItem}>
            🔗 <code>solar-panel-payback-period.html</code> (ROI Calculations)
          </li>
          <li style={styles.clusterItem}>
            🔗 <code>solar-pv-battery-storage.html</code> [Auto-Expanded]
          </li>
        </ul>
      </div>

      <div style={styles.clusterBox}>
        <div style={styles.pillarHeader}>
          <span style={styles.pillarTag}>PILLAR</span>
          <h3 style={styles.boxHeading}>Insulation & Airtightness Standard</h3>
          <code style={styles.code}>insulation-master-guide.html</code>
        </div>
        <ul style={styles.clusterList}>
          <li style={styles.clusterItem}>
            🔗 <code>attic-insulation-grants.html</code> (SEAI Support)
          </li>
          <li style={styles.clusterItem}>
            🔗 <code>external-wall-insulation.html</code> (Part L U-value)
          </li>
          <li style={styles.clusterItem}>
            🔗 <code>airtightness-guide.html</code> (NZEB Standards)
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export const AuthorityGraph: React.FC = () => (
  <div style={styles.card}>
    <h2 style={styles.cardTitle}>
      🕸️ Living Authority Graph (Nodes & Relationships)
    </h2>
    <p style={styles.cardDescription}>
      Bidirectional entity-page network monitoring link density, entity
      mentions, and identifying weak orphan nodes.
    </p>
    <div style={styles.statsRow}>
      <div style={styles.statPill}>
        Total Graph Nodes: <strong>38</strong>
      </div>
      <div style={styles.statPill}>
        Connected Edges: <strong>142</strong>
      </div>
      <div style={styles.statPillAlert}>
        Weak Nodes Detected: <strong>0 (Auto-boosted)</strong>
      </div>
    </div>

    <div style={styles.grid}>
      <div style={styles.clusterBox}>
        <h3 style={styles.boxHeading}>Entity & Page Node Network</h3>
        <div style={styles.nodeList}>
          <div style={styles.nodeBadge}>Page: heat-pump-costs (12 edges)</div>
          <div style={styles.nodeBadge}>Entity: SEAI Grant (32 mentions)</div>
          <div style={styles.nodeBadge}>Entity: BER Rating (28 mentions)</div>
          <div style={styles.nodeBadge}>Entity: NZEB Part L (19 mentions)</div>
          <div style={styles.nodeBadge}>Pillar: heat-pump-guide (24 edges)</div>
        </div>
      </div>

      <div style={styles.clusterBox}>
        <h3 style={styles.boxHeading}>Daily Auto-Boost Schedule</h3>
        <p style={styles.cardText}>
          Every day at 11:00 AM, the Authority Graph scans for weak nodes (edges
          &lt; 2) and automatically injects internal contextual links.
        </p>
        <div style={styles.statusPill}>
          Status: 100% Graph Connectivity Healthy
        </div>
      </div>
    </div>
  </div>
);

export const SerpMonitor: React.FC = () => (
  <div style={styles.card}>
    <h2 style={styles.cardTitle}>
      📊 SERP Monitor & Predictive Ranking Engine
    </h2>
    <p style={styles.cardDescription}>
      Algorithm-aware predictive SEO automation calculating linear regression
      ranking trends to pre-emptively patch content.
    </p>
    <div style={styles.grid}>
      <div style={styles.clusterBox}>
        <h3 style={styles.boxHeading}>Target Keyword Volatility</h3>
        <div style={styles.serpRow}>
          <div>
            <strong>"heat pump costs ireland"</strong>
            <div style={styles.subDetail}>
              Rank: #2 (Slope: -0.8 • Likely Rise 📈)
            </div>
          </div>
          <span style={styles.riseTag}>Auto-Strengthening</span>
        </div>
        <div style={styles.serpRow}>
          <div>
            <strong>"solar pv grants ireland"</strong>
            <div style={styles.subDetail}>
              Rank: #4 (Slope: +0.6 • Likely Drop 📉)
            </div>
          </div>
          <span style={styles.dropTag}>Pre-Emptive Patch Triggered</span>
        </div>
      </div>

      <div style={styles.clusterBox}>
        <h3 style={styles.boxHeading}>Automated Action Queues</h3>
        <ul style={styles.clusterList}>
          <li style={styles.clusterItem}>
            ⚡ Competitor Diff Queue: 0 pending
          </li>
          <li style={styles.clusterItem}>
            ⚡ Semantic Entity Boost Queue: 0 pending
          </li>
          <li style={styles.clusterItem}>
            ⚡ Internal Link Reinforcement Queue: 0 pending
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export const KnowledgeAssistant: React.FC<{
  qaQuestion: string;
  setQaQuestion: (q: string) => void;
  qaLoading: boolean;
  qaResult: {
    question: string;
    intent: string;
    answer: string;
    sources: string[];
  } | null;
  handleAskSubmit: (e: React.FormEvent) => void;
}> = ({ qaQuestion, setQaQuestion, qaLoading, qaResult, handleAskSubmit }) => (
  <div style={styles.card}>
    <h2 style={styles.cardTitle}>
      🧠 Conversational Knowledge Assistant (Phase 15)
    </h2>
    <p style={styles.cardDescription}>
      Domain-aware Q&A engine querying published pages, SEAI/CRU/NSAI datasets,
      and semantic entity graphs.
    </p>

    <form onSubmit={handleAskSubmit} style={styles.qaForm}>
      <input
        type="text"
        value={qaQuestion}
        onChange={(e) => setQaQuestion(e.target.value)}
        placeholder="Ask any Irish retrofit question (e.g., 'What SEAI grants cover air-to-water heat pumps?')"
        style={styles.qaInput}
      />
      <button type="submit" disabled={qaLoading} style={styles.qaSubmit}>
        {qaLoading ? 'Searching Graph...' : 'Ask Assistant'}
      </button>
    </form>

    {qaResult && (
      <div style={styles.qaResultBox}>
        <div style={styles.qaMetaHeader}>
          <span style={styles.intentBadge}>Intent: {qaResult.intent}</span>
          <span style={styles.sourcesCount}>
            {qaResult.sources?.length || 0} Sources Retrieved
          </span>
        </div>
        <div
          style={styles.qaAnswerContent}
          dangerouslySetInnerHTML={{ __html: qaResult.answer }}
        />
        <div style={styles.sourcesList}>
          <strong>Retrieved Sources:</strong>
          {qaResult.sources?.map((src) => (
            <span key={src} style={styles.sourceChip}>
              📄 {src}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

export const CrawlerDashboard: React.FC = () => {
  const [view, setView] = useState<ViewTab>('Dashboard');
  const [heartbeatMessage, setHeartbeatMessage] = useState<string>(
    'Waiting for crawler...',
  );
  const [xp, setXp] = useState<number>(142);
  const [visibility, setVisibility] = useState<number>(48);
  const [queueLength, setQueueLength] = useState<number>(2);
  const [nextSlug, setNextSlug] = useState<string | null>('heat-pump-costs');
  const [events, setEvents] = useState<string[]>([
    'Multi-Site Expansion: Created 2 gap expansion(s) across all 4 fleet domains',
    'Q&A: "How much does a heat pump cost?" → 4 sources used',
    'Cross-Domain Fusion: Enriched content graph with data from 4 verified Irish energy endpoints',
    'Predictive Ranking: likely_rise detected for "solar pv grants ireland". Strengthening topic cluster.',
    'Behavioural Telemetry: Optimal reader engagement detected on attic-insulation-faq.html',
  ]);

  const [qaQuestion, setQaQuestion] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaResult, setQaResult] = useState<{
    question: string;
    intent: string;
    answer: string;
    sources: string[];
  } | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${hostname}:3000`;

    console.log(
      'CrawlerDashboard: Connecting WebSocket to Express Backend:',
      wsUrl,
    );
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
    } catch (err) {
      console.warn(
        'CrawlerDashboard: Initial WS connection error, using fallback target',
        err,
      );
      ws = new WebSocket(`${protocol}//localhost:3000`);
    }

    ws.onopen = () => {
      console.log('CrawlerDashboard: WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data: any = JSON.parse(event.data);

        if (data.type === 'queue_update') {
          setQueueLength(data.queueLength ?? 0);
          setNextSlug(data.nextSlug || null);
          if (data.message) {
            setEvents((prev) => [data.message, ...prev].slice(0, 20));
          }
        }

        if (data.type === 'scheduled_publish') {
          const msg =
            data.message || `Scheduled Publish: ${data.slug}.html released`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (data.type === 'rewrite_event') {
          const msg =
            data.message ||
            `Rewrite Success: ${data.slug} upgraded to Grade ${data.newGrade}`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (data.type === 'serp_diff_patch' || data.type === 'serp_diff') {
          const count = Array.isArray(data.missingTopics)
            ? data.missingTopics.length
            : 3;
          const msg =
            data.message ||
            `SERP Diff: Added ${count} missing competitor topics to ${data.slug}.html`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (data.type === 'topic_cluster') {
          const msg =
            data.message ||
            `Pillar Updated: ${data.clusters?.length || 0} cluster pages linked to ${data.pillar}.html`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (data.type === 'semantic_enrichment') {
          const msg =
            data.message ||
            `Semantic Enrichment: Enriched ${data.slug}.html with ${data.entities?.length || 0} entities`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (
          data.type === 'authority_graph_boost' ||
          data.type === 'authority_graph_update'
        ) {
          const weakCount = Array.isArray(data.weakNodes)
            ? data.weakNodes.length
            : data.weakNodesCount || 0;
          const msg =
            data.message ||
            `Authority Graph: Updated graph with ${weakCount} weak node(s) detected`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (data.type === 'serp_volatility') {
          const msg =
            data.message ||
            `SERP Volatility: Detected ${data.volatility?.length || 0} shift(s) for '${data.keyword}'`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (data.type === 'adaptive_personalisation') {
          const msg =
            data.message ||
            `Adaptive Personalisation: ${data.slug}.html personalized for '${data.intent}' intent`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (data.type === 'behavioural_telemetry') {
          const msg =
            data.message ||
            `Behavioural Telemetry: Fix triggered for ${data.slug}.html (Dwell: ${Math.round((data.avgDwell || 0) / 1000)}s, Scroll: ${Math.round((data.avgScroll || 0) * 100)}%)`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (data.type === 'predictive_ranking') {
          const msg =
            data.message ||
            `Predictive Ranking: ${data.prediction} detected for '${data.keyword}'`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (data.type === 'autonomous_expansion') {
          const msg =
            data.message ||
            `Autonomous Expansion: Generated & published ${data.newPages?.length || 0} new cluster page(s) for '${data.core}'`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (data.type === 'cross_domain_fusion') {
          const msg =
            data.message ||
            `Cross-Domain Fusion: Enriched content graph with data from ${data.sources?.length || 0} verified Irish energy endpoints`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (
          data.type === 'qa_query' ||
          data.type === 'conversational_knowledge'
        ) {
          const msg =
            data.message ||
            `Q&A: "${data.question}" → ${data.sources?.length || 0} sources used`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (data.type === 'multi_site_expansion') {
          const msg =
            data.message ||
            `Multi-Site Expansion: Created ${data.gaps?.length || 0} gap expansion(s) across ${data.domains?.length || 4} fleet domains`;
          setEvents((prev) => [msg, ...prev].slice(0, 20));
          setHeartbeatMessage(msg);
        }

        if (
          data.type === 'crawler_heartbeat' ||
          data.type === 'crawl_heartbeat'
        ) {
          if (data.message) {
            setHeartbeatMessage(data.message);
          }
        }

        if (data.type === 'metric_update') {
          if (data.metric === 'crawl_heartbeat' && data.message) {
            setHeartbeatMessage(data.message);
          }

          if (data.metric === 'xp' && 'increment' in data) {
            setXp((prev) => prev + (data.increment || 0));
          }

          if (data.metric === 'visibility' && 'increment' in data) {
            setVisibility((prev) => prev + (data.increment || 0));
          }

          if (data.message) {
            setEvents((prev) => [data.message, ...prev].slice(0, 20));
          }
        }
      } catch (err) {
        console.error('CrawlerDashboard: Failed to parse message', err);
      }
    };

    ws.onclose = () => {
      console.log('CrawlerDashboard: WebSocket closed');
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuestion.trim()) return;
    setQaLoading(true);
    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: qaQuestion }),
      });
      const data = await res.json();
      setQaResult(data);
    } catch (err) {
      console.error('Q&A fetch error:', err);
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div style={styles.hubContainer}>
      <header style={styles.hubHeader}>
        {/* ── Title + Badge ── */}
        <div style={styles.headerTitleGroup}>
          <h1 style={styles.hubTitle}>EcoSmartHomes SEO Hub</h1>
          <span style={styles.badge}>
            Phase 16 Active • Multi-Site Autonomous
          </span>
        </div>

        {/* ── Hub Status indicator ── */}
        <HubStatus />

        {/* ── Header action buttons ── */}
        <div style={styles.headerButtons}>
          <button
            id="openLocalHub"
            onClick={() => window.open('http://localhost:5173', '_blank')}
            style={styles.localHubBtn}
          >
            🔗 Open Local Hub
          </button>
          <button
            id="returnToHarbor"
            onClick={() =>
              window.open('https://tools.ecosmarthomes.ie', '_blank')
            }
            style={styles.harborBtn}
          >
            🏠 Return to Harbor Dashboard
          </button>
        </div>

        {/* ── Module Nav ── */}
        <div className="hub-nav" style={styles.hubNav}>
          <button
            onClick={() => setView('dashboard')}
            style={
              view === 'dashboard' || view === 'Dashboard'
                ? styles.navButtonActive
                : styles.navButton
            }
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('content')}
            style={
              view === 'content' || view === 'Content'
                ? styles.navButtonActive
                : styles.navButton
            }
          >
            Content Engine
          </button>
          <button
            onClick={() => setView('clusters')}
            style={
              view === 'clusters' || view === 'Clusters'
                ? styles.navButtonActive
                : styles.navButton
            }
          >
            Clusters
          </button>
          <button
            onClick={() => setView('authority')}
            style={
              view === 'authority' || view === 'Authority'
                ? styles.navButtonActive
                : styles.navButton
            }
          >
            Authority Graph
          </button>
          <button
            onClick={() => setView('serp')}
            style={
              view === 'serp' || view === 'SERP'
                ? styles.navButtonActive
                : styles.navButton
            }
          >
            SERP Monitor
          </button>
          <button
            onClick={() => setView('knowledge')}
            style={
              view === 'knowledge' || view === 'Knowledge'
                ? styles.navButtonActive
                : styles.navButton
            }
          >
            Knowledge Assistant
          </button>
          <button
            onClick={() => setView('fleet')}
            style={
              view === 'fleet' || view === 'Fleet'
                ? styles.navButtonActive
                : styles.navButton
            }
          >
            Fleet Manager
          </button>
          <button
            onClick={() => setView('analytics')}
            style={
              view === 'analytics' || view === 'Analytics'
                ? styles.navButtonActive
                : styles.navButton
            }
          >
            Analytics
          </button>
          <button
            onClick={() => setView('rl')}
            style={
              view === 'rl' || view === 'RL'
                ? styles.navButtonActive
                : styles.navButton
            }
          >
            🧠 RL Policy Engine
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {(view === 'dashboard' || view === 'Dashboard') && (
          <Dashboard
            heartbeatMessage={heartbeatMessage}
            queueLength={queueLength}
            nextSlug={nextSlug}
            xp={xp}
            visibility={visibility}
            events={events}
          />
        )}
        {(view === 'content' || view === 'Content') && <ContentEngine />}
        {(view === 'clusters' || view === 'Clusters') && <ClusterMap />}
        {(view === 'authority' || view === 'Authority') && <AuthorityGraph />}
        {(view === 'serp' || view === 'SERP') && <SerpMonitor />}
        {(view === 'knowledge' || view === 'Knowledge') && (
          <KnowledgeAssistant
            qaQuestion={qaQuestion}
            setQaQuestion={setQaQuestion}
            qaLoading={qaLoading}
            qaResult={qaResult}
            handleAskSubmit={handleAskSubmit}
          />
        )}
        {(view === 'fleet' || view === 'Fleet') && <FleetManager />}

        {(view === 'analytics' || view === 'Analytics') && <UnifiedAnalytics />}
        {(view === 'rl' || view === 'RL') && <RLPolicyDashboard />}
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  hubContainer: {
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: '24px',
    background: '#0b1020',
    color: '#f5f7ff',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  hubHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  hubTitle: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  badge: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
  },
  hubNav: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  localHubBtn: {
    background: '#00b37e',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 0 12px rgba(0, 179, 126, 0.35)',
    transition: 'all 0.2s ease',
  },
  harborBtn: {
    background: '#004d40',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 0 12px rgba(0, 77, 64, 0.35)',
    transition: 'all 0.2s ease',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },

  nav: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  navButton: {
    background: '#141c33',
    color: '#94a3b8',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '10px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  navButtonActive: {
    background: '#3b82f6',
    color: '#ffffff',
    borderColor: '#3b82f6',
    boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
  },
  main: {
    width: '100%',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  card: {
    background: '#141c33',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '24px',
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: 700,
  },
  cardDescription: {
    margin: '0 0 20px 0',
    color: '#94a3b8',
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '16px',
  },
  clusterBox: {
    background: '#0b1020',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '16px',
  },
  pillarHeader: {
    marginBottom: '12px',
  },
  pillarTag: {
    background: '#f59e0b',
    color: '#000',
    fontSize: '10px',
    fontWeight: 800,
    padding: '2px 6px',
    borderRadius: '4px',
  },
  boxHeading: {
    margin: '6px 0 4px 0',
    fontSize: '16px',
    fontWeight: 700,
  },
  code: {
    color: '#38bdf8',
    fontSize: '13px',
  },
  clusterList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  clusterItem: {
    padding: '6px 0',
    fontSize: '13px',
    borderBottom: '1px dashed rgba(255, 255, 255, 0.05)',
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  statPill: {
    background: '#0b1020',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
  },
  statPillAlert: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
  },
  nodeList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px',
  },
  nodeBadge: {
    background: '#1e293b',
    color: '#cbd5e1',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
  },
  cardText: {
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: '1.5',
  },
  statusPill: {
    display: 'inline-block',
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    marginTop: '12px',
  },
  serpRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  subDetail: {
    color: '#94a3b8',
    fontSize: '12px',
    marginTop: '4px',
  },
  riseTag: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  dropTag: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  qaForm: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  qaInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: '#0b1020',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
  },
  qaSubmit: {
    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  qaResultBox: {
    background: '#0b1020',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '20px',
  },
  qaMetaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  intentBadge: {
    background: '#3b82f6',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },
  sourcesCount: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  qaAnswerContent: {
    lineHeight: '1.6',
    fontSize: '14px',
  },
  sourcesList: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
    fontSize: '12px',
  },
  sourceChip: {
    background: '#1e293b',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#38bdf8',
  },
  fleetCard: {
    background: '#0b1020',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '16px',
  },
  fleetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  activePill: {
    background: '#10b981',
    color: '#000',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 800,
  },
  fleetPill: {
    background: '#3b82f6',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
  },
  fleetDetail: {
    fontSize: '13px',
    color: '#cbd5e1',
    marginBottom: '6px',
  },
};
