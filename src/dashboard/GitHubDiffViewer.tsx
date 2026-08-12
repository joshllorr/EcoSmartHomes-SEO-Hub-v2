import React, { useEffect, useState } from 'react';

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author?: {
      name: string;
      date: string;
    };
  };
}

interface GitHubFileDiff {
  filename: string;
  patch?: string;
  additions?: number;
  deletions?: number;
}

export default function GitHubDiffViewer() {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const repo = 'joshllorr/EcoSmartHomes-SEO-Hub-v2';

  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}/commits`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCommits(data);
        }
      })
      .catch(() => {});
  }, [repo]);

  const loadDiff = (sha: string) => {
    setSelectedCommit(sha);
    setLoading(true);
    setDiff(null);

    fetch(`https://api.github.com/repos/${repo}/commits/${sha}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.files)) {
          const formatted = (data.files as GitHubFileDiff[])
            .map(
              (f) =>
                `🔧 ${f.filename} (+${f.additions || 0} / -${f.deletions || 0})\n${f.patch || '[Binary or large diff]'}`,
            )
            .join('\n\n' + '─'.repeat(50) + '\n\n');
          setDiff(formatted);
        } else {
          setDiff('No file diffs returned.');
        }
      })
      .catch(() => setDiff('Failed to fetch commit diff from GitHub API.'))
      .finally(() => setLoading(false));
  };

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
      <h2>🧬 GitHub Commit Diff Viewer</h2>

      <h3>Recent Commits</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {commits.slice(0, 10).map((c) => (
          <li
            key={c.sha}
            style={{
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <button
              onClick={() => loadDiff(c.sha)}
              style={{
                background: selectedCommit === c.sha ? '#0f0' : '#222',
                color: selectedCommit === c.sha ? '#000' : '#0f0',
                border: '1px solid #0f0',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              View Diff
            </button>
            <span>
              <strong>{c.sha.slice(0, 7)}</strong> —{' '}
              {c.commit.message.split('\n')[0]}
            </span>
          </li>
        ))}
      </ul>

      {selectedCommit && (
        <>
          <h3 style={{ marginTop: '20px' }}>
            Diff for {selectedCommit.slice(0, 7)}
          </h3>
          <pre
            style={{
              background: '#000',
              color: '#0f0',
              padding: '15px',
              borderRadius: '8px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              maxHeight: '400px',
              border: '1px solid #333',
            }}
          >
            {loading ? 'Loading commit diff…' : diff}
          </pre>
        </>
      )}
    </div>
  );
}
