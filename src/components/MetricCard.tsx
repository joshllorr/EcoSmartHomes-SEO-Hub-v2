import React from "react";

export interface MetricCardProps {
  title: string;
  value?: string | number;
  subText?: string;
  heartbeat?: boolean;
  heartbeatMessage?: string;
  progress?: number;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subText,
  heartbeat,
  heartbeatMessage,
  progress,
  icon,
  style,
  className = "",
}) => {
  return (
    <div style={{ ...styles.card, ...style }} className={`glass-card ${className}`}>
      <div style={styles.headerRow}>
        <h2 style={styles.cardTitle}>{title}</h2>
        {icon && <span style={styles.iconContainer}>{icon}</span>}
      </div>

      {heartbeat ? (
        <div style={styles.heartbeatRow}>
          <span style={styles.heartbeatDot} />
          <span style={styles.heartbeatText}>{heartbeatMessage || "Waiting for crawler..."}</span>
        </div>
      ) : (
        <>
          {value !== undefined && <p style={styles.metricValue}>{value}</p>}

          {progress !== undefined && (
            <div style={styles.progressBarOuter}>
              <div
                style={{
                  ...styles.progressBarInner,
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                }}
              />
            </div>
          )}

          {subText && <p style={styles.subText}>{subText}</p>}
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    background: "#151a2c",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid #252b3f",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
    color: "#f5f7ff",
  },
  iconContainer: {
    display: "flex",
    alignItems: "center",
    color: "#3dd68c",
  },
  heartbeatRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px",
  },
  heartbeatDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#3dd68c",
    boxShadow: "0 0 8px #3dd68c",
    flexShrink: 0,
  },
  heartbeatText: {
    fontSize: "14px",
    color: "#d0d5f0",
  },
  metricValue: {
    fontSize: "28px",
    fontWeight: 600,
    margin: "0 0 8px 0",
    color: "#ffffff",
  },
  progressBarOuter: {
    width: "100%",
    height: "8px",
    borderRadius: "999px",
    background: "#252b3f",
    overflow: "hidden",
    marginTop: "4px",
  },
  progressBarInner: {
    height: "100%",
    background: "linear-gradient(90deg, #3dd68c, #4fd1ff)",
    transition: "width 0.3s ease",
  },
  subText: {
    fontSize: "12px",
    color: "#9aa0c2",
    margin: "6px 0 0 0",
  },
};

export default MetricCard;
