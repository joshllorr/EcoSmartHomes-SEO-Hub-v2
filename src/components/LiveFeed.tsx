import React from 'react';

export interface LiveFeedProps {
  events: string[];
  title?: string;
  emptyMessage?: string;
  maxHeight?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({
  events,
  title = 'Live Crawler Feed',
  emptyMessage = 'Waiting for events…',
  maxHeight = '260px',
  style,
  className = '',
}) => {
  return (
    <div
      style={{ ...styles.card, ...style }}
      className={`glass-card ${className}`}
    >
      {title && <h2 style={styles.cardTitle}>{title}</h2>}
      <div style={{ ...styles.feed, maxHeight }}>
        {events.length === 0 ? (
          <p style={styles.subText}>{emptyMessage}</p>
        ) : (
          events.map((msg, idx) => (
            <div key={idx} style={styles.feedItem}>
              <span style={styles.badge}>Live</span>
              <span>{msg}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    background: '#151a2c',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #252b3f',
  },
  cardTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#f5f7ff',
  },
  subText: {
    fontSize: '12px',
    color: '#9aa0c2',
    margin: 0,
    padding: '12px 0',
    textAlign: 'center',
  },
  feed: {
    overflowY: 'auto',
    padding: '8px',
    background: '#101425',
    borderRadius: '8px',
    border: '1px solid #252b3f',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  feedItem: {
    padding: '8px 10px',
    borderRadius: '6px',
    background: '#181d30',
    fontSize: '13px',
    color: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderLeft: '3px solid #3dd68c',
  },
  badge: {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'rgba(61, 214, 140, 0.15)',
    color: '#3dd68c',
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
};

export default LiveFeed;
