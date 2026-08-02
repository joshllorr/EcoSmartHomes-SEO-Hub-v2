import React from 'react';

const domains = [
  {
    name: 'EcoSmartHomes',
    url: 'https://ecosmarthomes.ie',
    repo: 'github.com/joe/ecosmarthomes-site',
    tone: 'Warm & Supportive',
    cta: 'Book your free retrofit consultation',
    isPrimary: true,
  },
  {
    name: 'SolarSmartHomes',
    url: 'https://solarsmarthomes.ie',
    repo: 'github.com/joe/solarsmarthomes-site',
    tone: 'Optimistic',
    cta: 'Calculate your solar savings',
    isPrimary: false,
  },
  {
    name: 'HeatPumpHub',
    url: 'https://heatpumphub.ie',
    repo: 'github.com/joe/heatpumphub-site',
    tone: 'Expert & Technical',
    cta: 'Compare heat pump options',
    isPrimary: false,
  },
  {
    name: 'InsulationAdvisor',
    url: 'https://insulationadvisor.ie',
    repo: 'github.com/joe/insulationadvisor-site',
    tone: 'Technical Standard',
    cta: 'Find the right insulation',
    isPrimary: false,
  },
];

export default function FleetManager() {
  return (
    <div
      style={{
        background: '#141c33',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '24px',
      }}
    >
      <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700 }}>
        🌐 Fleet Manager
      </h2>
      <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '14px' }}>
        Multi-site control, cross-domain expansion, and shared intelligence. One
        hub — four properties.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {domains.map((domain) => (
          <div
            key={domain.name}
            style={{
              background: '#0b1020',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                {domain.name}
              </h3>
              <span
                style={{
                  background: domain.isPrimary ? '#10b981' : '#3b82f6',
                  color: domain.isPrimary ? '#000' : '#fff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 800,
                }}
              >
                {domain.isPrimary ? 'PRIMARY' : 'FLEET'}
              </span>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#cbd5e1',
                marginBottom: '6px',
              }}
            >
              URL: <code style={{ color: '#38bdf8' }}>{domain.url}</code>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#cbd5e1',
                marginBottom: '6px',
              }}
            >
              Repo: <code style={{ color: '#94a3b8' }}>{domain.repo}</code>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#cbd5e1',
                marginBottom: '6px',
              }}
            >
              Tone: <strong>{domain.tone}</strong>
            </div>
            <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
              CTA:{' '}
              <em style={{ color: '#f59e0b' }}>
                {'"'}
                {domain.cta}
                {'"'}
              </em>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '20px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
          ✅ Autonomous expansion running every 4 hours across all domains
        </span>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          Shared knowledge graph: 38 nodes • 142 edges
        </span>
      </div>
    </div>
  );
}
