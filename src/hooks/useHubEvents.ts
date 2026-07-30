import { useEffect, useState } from "react";

export interface HubEvent {
  id: string;
  type: string;
  siteId?: string;
  slug?: string;
  title?: string;
  message: string;
  timestamp: number;
}

export function useHubEvents(filterType?: string) {
  const [events, setEvents] = useState<HubEvent[]>([]);

  useEffect(() => {
    // Initial fetch
    fetch(filterType ? `/api/hub-events?limit=30&type=${encodeURIComponent(filterType)}` : `/api/hub-events?limit=30`)
      .then(res => res.json())
      .then(data => setEvents(data.events || []))
      .catch(() => {});

    // WebSocket for real-time live events
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const defaultWsUrl = `${protocol}//${window.location.host}`;
    const wsUrl = window.location.port === "3000" ? "ws://localhost:3000" : (defaultWsUrl || "ws://localhost:3000");

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      ws = new WebSocket(defaultWsUrl);
    }

    ws.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data);
        if (event.type && event.message) {
          if (filterType && event.type !== filterType) return;
          setEvents(prev => {
            if (prev.some(e => e.id === event.id)) return prev;
            return [event, ...prev].slice(0, 100);
          });
        }
      } catch (err) {}
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [filterType]);

  return events;
}
