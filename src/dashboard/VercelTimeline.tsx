import React, { useEffect, useState } from 'react';

interface VercelDeployment {
  buildId?: string;
  commitHash?: string;
  createdAt?: number | string;
  readyState?: string;
}

export default function VercelTimeline() {
  const [deployments, setDeployments] = useState<VercelDeployment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vercel exposes deployment metadata via build manifest
    fetch('/.vercel/manifest.json')
      .then((res) => {
        if (!res.ok) throw new Error('Manifest unavailable');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.deployments)) {
          setDeployments(data.deployments);
        } else {
          setError('No deployment metadata found in manifest.');
        }
      })
      .catch(() =>
        setError(
          'Vercel deployment metadata manifest unavailable in local dev.',
        ),
      );
  }, []);

  return (
    <div
      style={{
        padding: '20px',
        background: '#0a0a0a',
        color: '#0ff',
        fontFamily: 'monospace',
        borderRadius: '12px',
        marginTop: '20px',
        border: '1px solid #0ff',
      }}
    >
      <h2>📡 Vercel Deployment Timeline</h2>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {!error && deployments.length === 0 && <p>Loading deployment history…</p>}

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {deployments.map((d, i) => (
          <li
            key={i}
            style={{
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid #222',
            }}
          >
            <strong>Build:</strong> {d.buildId || 'N/A'}
            <br />
            <strong>Commit:</strong> {d.commitHash || 'N/A'}
            <br />
            <strong>Timestamp:</strong>{' '}
            {d.createdAt ? new Date(d.createdAt).toLocaleString() : 'N/A'}
            <br />
            <strong>Status:</strong> {d.readyState || 'Ready'}
          </li>
        ))}
      </ul>
    </div>
  );
}
