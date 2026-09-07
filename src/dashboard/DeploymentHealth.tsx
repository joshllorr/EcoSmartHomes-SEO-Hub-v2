import React, { useEffect, useState } from 'react';

export default function DeploymentHealth() {
  const [bundleHash, setBundleHash] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState('Checking…');
  const [apiStatus, setApiStatus] = useState('Checking…');
  const [engines, setEngines] = useState<Record<string, boolean>>({});
  const [timestamp] = useState(new Date().toISOString());

  // Detect bundle hash (Vite auto-injects this into script tags)
  useEffect(() => {
    try {
      const scripts = [...document.querySelectorAll('script')];
      const mainBundle = scripts.find((s) => s.src.includes('assets'));
      if (mainBundle) {
        const hash = mainBundle.src.split('.').slice(-2)[0];
        setBundleHash(hash);
      } else {
        setBundleHash('Dev / Single Chunk');
      }
    } catch {
      setBundleHash('Unavailable');
    }
  }, []);

  // Cache freshness check
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        if (regs.length === 0) {
          setCacheStatus('No SW — Fresh');
        } else {
          const active = regs.some((reg) => reg.active);
          setCacheStatus(
            active
              ? 'Service Worker Active — May Cache Old Bundles'
              : 'No Active SW — Fresh',
          );
        }
      });
    } else {
      setCacheStatus('No SW — Fresh');
    }
  }, []);

  // API health check
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (res.ok) setApiStatus('Online 🟢');
        else setApiStatus(`Status ${res.status}`);
      })
      .catch(() => setApiStatus('Offline 🔴'));
  }, []);

  // Engine availability check using static Vite globbing
  useEffect(() => {
    const engineList = [
      'retrofitAdvisorEngine',
      'retrofitCoachEngine',
      'journeyEngine',
      'trackerEngine',
      'submitEngine',
      'marlCoordinator',
      'marlGenome',
    ];

    try {
      const logicModules = import.meta.glob('/src/engines/logic/**/*.ts');
      const serverModules = import.meta.glob('/src/server/*.ts');
      const allPaths = [
        ...Object.keys(logicModules),
        ...Object.keys(serverModules),
      ];

      const results: Record<string, boolean> = {};
      engineList.forEach((engine) => {
        results[engine] = allPaths.some((path) =>
          path.includes(`/${engine}.ts`),
        );
      });

      setEngines(results);
    } catch {
      const results: Record<string, boolean> = {};
      engineList.forEach((engine) => {
        results[engine] = false;
      });
      setEngines(results);
    }
  }, []);

  return (
    <div
      style={{
        padding: '20px',
        background: '#111',
        color: '#0f0',
        fontFamily: 'monospace',
        borderRadius: '12px',
        marginTop: '20px',
        border: '1px solid #0f0',
      }}
    >
      <h2>🚀 Deployment Health Dashboard</h2>

      <p>
        <strong>Commit SHA:</strong>{' '}
        {import.meta.env.VITE_COMMIT_SHA || 'Not Set'}
      </p>
      <p>
        <strong>Build Timestamp:</strong> {timestamp}
      </p>
      <p>
        <strong>Environment:</strong> {import.meta.env.MODE}
      </p>
      <p>
        <strong>Bundle Hash:</strong> {bundleHash || 'Detecting...'}
      </p>
      <p>
        <strong>Cache Status:</strong> {cacheStatus}
      </p>
      <p>
        <strong>API Status:</strong> {apiStatus}
      </p>

      <h3>Engine Status</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {Object.entries(engines).map(([name, ok]) => (
          <li key={name} style={{ marginBottom: '4px' }}>
            {name}: {ok ? '🟢 Loaded' : '🔴 Missing'}
          </li>
        ))}
      </ul>

      <h3>Mobile/Desktop Sync</h3>
      <p style={{ color: '#aaa', fontSize: '0.9em' }}>
        If mobile shows older UI, clear cached files. Bundle Hash must match
        across devices.
      </p>
    </div>
  );
}
