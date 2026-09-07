import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  X,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Radio,
} from 'lucide-react';

interface HealthData {
  status: string;
  service?: string;
  version?: string;
  uptime?: number;
  dependencies?: {
    gemini?: boolean;
    sentry?: boolean;
  };
  totalEventsSynced?: number;
  lastSyncAt?: number | null;
  timestamp?: number;
}

export interface ConnectionAttempt {
  id: string;
  timestamp: Date;
  status: 'online' | 'offline';
  httpStatus?: number;
  statusText?: string;
  latency: number | null;
  errorMessage?: string | null;
  healthData?: HealthData | null;
}

export default function SystemStatus() {
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>(
    'checking',
  );
  const [latency, setLatency] = useState<number | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [attempts, setAttempts] = useState<ConnectionAttempt[]>([]);

  const checkHealth = useCallback(async () => {
    setIsRefreshing(true);
    const startTime = performance.now();
    const attemptTime = new Date();
    const attemptId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Attempt /health first, fallback to /api/health if HTML/error returned
      let res: Response;
      let usedEndpoint = '/health';
      try {
        res = await fetch('/health', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
          cache: 'no-cache',
        });
        const contentType = res.headers?.get?.('content-type') || '';
        const isHtml = contentType.includes('text/html');
        // If /health returned HTML (SPA fallback) or error, try /api/health
        if (!res.ok || isHtml) {
          usedEndpoint = '/api/health';
          res = await fetch('/api/health', {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: controller.signal,
            cache: 'no-cache',
          });
        }
      } catch {
        usedEndpoint = '/api/health';
        res = await fetch('/api/health', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
          cache: 'no-cache',
        });
      }
      clearTimeout(timeoutId);

      const roundTrip = Math.round(performance.now() - startTime);
      setLatency(roundTrip);
      setLastChecked(attemptTime);

      const finalContentType = res.headers?.get?.('content-type') || '';
      const finalIsHtml = finalContentType.includes('text/html');

      if (res.ok && !finalIsHtml) {
        const data: HealthData = await res.json();
        setHealthData(data);
        const isOnline = data.status === 'online' || res.status === 200;
        setStatus(isOnline ? 'online' : 'offline');

        const newAttempt: ConnectionAttempt = {
          id: attemptId,
          timestamp: attemptTime,
          status: isOnline ? 'online' : 'offline',
          httpStatus: res.status,
          statusText: res.statusText || 'OK',
          latency: roundTrip,
          errorMessage: isOnline
            ? null
            : `API returned status: "${data.status}"`,
          healthData: data,
        };

        setAttempts((prev) => [newAttempt, ...prev].slice(0, 5));
      } else {
        let errorBody = '';
        try {
          errorBody = await res.text();
        } catch {
          // ignore body parse failure
        }

        const errorMsg = !isJson
          ? `Server returned non-JSON response from ${usedEndpoint} (${res.status} ${res.statusText || 'OK'})`
          : errorBody
            ? `HTTP ${res.status} (${res.statusText}): ${errorBody.slice(0, 120)}`
            : `HTTP ${res.status} (${res.statusText || 'Error'}) from ${usedEndpoint}`;

        setStatus('offline');
        setHealthData(null);

        const newAttempt: ConnectionAttempt = {
          id: attemptId,
          timestamp: attemptTime,
          status: 'offline',
          httpStatus: res.status,
          statusText: res.statusText || 'Error',
          latency: roundTrip,
          errorMessage: errorMsg,
          healthData: null,
        };

        setAttempts((prev) => [newAttempt, ...prev].slice(0, 5));
      }
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const errorMsg = isAbort
        ? 'Connection timed out after 5,000ms'
        : err instanceof Error
          ? err.message
          : 'Network failure or connection refused';

      setStatus('offline');
      setLatency(null);
      setHealthData(null);
      setLastChecked(attemptTime);

      const newAttempt: ConnectionAttempt = {
        id: attemptId,
        timestamp: attemptTime,
        status: 'offline',
        httpStatus: undefined,
        statusText: isAbort ? 'Timed Out' : 'Fetch Failed',
        latency: null,
        errorMessage: errorMsg,
        healthData: null,
      };

      setAttempts((prev) => [newAttempt, ...prev].slice(0, 5));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };
    if (showModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const formatUptime = (seconds?: number) => {
    if (seconds === undefined) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  };

  const formatRelativeTime = (date: Date) => {
    const diffSecs = Math.max(
      0,
      Math.floor((Date.now() - date.getTime()) / 1000),
    );
    if (diffSecs < 5) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    return `${diffMins}m ago`;
  };

  // Diagnostic Stats
  const successfulAttemptsCount = attempts.filter(
    (a) => a.status === 'online',
  ).length;
  const recentErrors = attempts.filter((a) => a.errorMessage);

  return (
    <>
      <div
        className="relative inline-flex items-center"
        id="system-status-container"
      >
        <button
          id="system-status-indicator-btn"
          onClick={() => setShowModal(true)}
          aria-label="Open backend diagnostic modal"
          aria-haspopup="dialog"
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition cursor-pointer select-none ${
            status === 'online'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              : status === 'offline'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
          }`}
          title={`Backend status: ${status.toUpperCase()} ${latency !== null ? `(${latency}ms)` : ''} - Click for diagnostic modal`}
        >
          {/* Pulse Dot Indicator */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            {status === 'online' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            {status === 'offline' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                status === 'online'
                  ? 'bg-emerald-500'
                  : status === 'offline'
                    ? 'bg-rose-500'
                    : 'bg-amber-400 animate-pulse'
              }`}
            />
          </span>

          <span className="hidden sm:inline font-semibold">
            {status === 'online'
              ? 'API Online'
              : status === 'offline'
                ? 'API Offline'
                : 'Connecting'}
          </span>

          {status === 'online' && latency !== null && (
            <span className="hidden md:inline text-[10px] text-emerald-400/80 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {latency}ms
            </span>
          )}
        </button>
      </div>

      {/* Diagnostic Modal */}
      {showModal && (
        <div
          id="system-status-diagnostic-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="diagnostic-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-lg bg-[#0b132b] text-slate-100 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    status === 'online'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : status === 'offline'
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`}
                >
                  <Server size={18} />
                </div>
                <div>
                  <h3
                    id="diagnostic-modal-title"
                    className="font-semibold text-white text-sm"
                  >
                    System Health Diagnostics
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live connection status & recent attempt history for{' '}
                    <span className="font-mono text-slate-300">/health</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id="system-status-modal-ping-btn"
                  onClick={checkHealth}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer disabled:opacity-50"
                  title="Run ping check now"
                >
                  <RefreshCw
                    size={13}
                    className={
                      isRefreshing ? 'animate-spin text-emerald-400' : ''
                    }
                  />
                  <span>Ping</span>
                </button>

                <button
                  id="system-status-modal-close-btn"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  aria-label="Close diagnostic modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto px-5 py-4 space-y-4 text-xs">
              {/* Primary Status Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    State
                  </span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === 'online'
                          ? 'bg-emerald-400'
                          : status === 'offline'
                            ? 'bg-rose-400'
                            : 'bg-amber-400'
                      }`}
                    />
                    <span
                      className={
                        status === 'online'
                          ? 'text-emerald-300 font-mono'
                          : status === 'offline'
                            ? 'text-rose-300 font-mono'
                            : 'text-amber-300 font-mono'
                      }
                    >
                      {status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Latency
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {latency !== null ? `${latency} ms` : 'N/A'}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Success Rate
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {attempts.length > 0
                      ? `${Math.round((successfulAttemptsCount / attempts.length) * 100)}%`
                      : '100%'}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Uptime
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {formatUptime(healthData?.uptime)}
                  </span>
                </div>
              </div>

              {/* Error Alert Box (if any errors present in recent history) */}
              {recentErrors.length > 0 && (
                <div
                  id="system-status-error-alert"
                  className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-1.5"
                >
                  <div className="flex items-center gap-2 font-semibold text-rose-300 text-xs">
                    <AlertTriangle
                      size={15}
                      className="shrink-0 text-rose-400"
                    />
                    <span>Error Reported in Recent Health Checks</span>
                  </div>
                  <div className="text-[11px] text-rose-200/90 font-mono bg-black/30 p-2 rounded border border-rose-500/20 break-all">
                    {recentErrors[0].errorMessage}
                  </div>
                  <div className="text-[10px] text-rose-300/80">
                    Occurred at {recentErrors[0].timestamp.toLocaleTimeString()}{' '}
                    ({formatRelativeTime(recentErrors[0].timestamp)})
                  </div>
                </div>
              )}

              {/* No Error Banner */}
              {recentErrors.length === 0 && attempts.length > 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px]">
                  <ShieldCheck
                    size={16}
                    className="text-emerald-400 shrink-0"
                  />
                  <span>
                    All recent connection attempts completed with 0 errors.
                    Backend responding normally.
                  </span>
                </div>
              )}

              {/* Last 5 Connection Attempts List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Radio size={13} className="text-slate-400" />
                    Last 5 Connection Attempts
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Newest first
                  </span>
                </div>

                <div className="space-y-2" id="system-status-attempts-list">
                  {attempts.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                      Pinging /health endpoint...
                    </div>
                  ) : (
                    attempts.map((attempt, index) => {
                      const isSuccess = attempt.status === 'online';
                      return (
                        <div
                          key={attempt.id}
                          id={`system-status-attempt-item-${index}`}
                          className={`p-3 rounded-xl border transition-all ${
                            isSuccess
                              ? 'bg-slate-900/50 border-white/10 hover:border-emerald-500/30'
                              : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              {isSuccess ? (
                                <CheckCircle2
                                  size={14}
                                  className="text-emerald-400 shrink-0"
                                />
                              ) : (
                                <AlertCircle
                                  size={14}
                                  className="text-rose-400 shrink-0"
                                />
                              )}
                              <span className="font-semibold text-slate-200">
                                Attempt #{attempts.length - index}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                                  isSuccess
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {attempt.httpStatus
                                  ? `HTTP ${attempt.httpStatus}`
                                  : attempt.statusText || 'Offline'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {attempt.latency !== null && (
                                <span className="font-mono text-[11px] text-slate-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                                  {attempt.latency}ms
                                </span>
                              )}
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                <Clock size={10} />
                                <span>
                                  {formatRelativeTime(attempt.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Attempt Details or Error Message */}
                          {attempt.errorMessage ? (
                            <div className="mt-1 text-[11px] font-mono text-rose-300 bg-rose-950/40 border border-rose-500/20 rounded p-1.5 break-all">
                              <span className="text-rose-400 font-semibold mr-1">
                                Error:
                              </span>
                              {attempt.errorMessage}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 flex items-center justify-between">
                              <span>
                                {attempt.healthData?.service ||
                                  'Local Hub Service'}{' '}
                                • Uptime:{' '}
                                {formatUptime(attempt.healthData?.uptime)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {attempt.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Endpoint & Integration Metadata */}
              {healthData && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Service Identifier:</span>
                    <span className="text-slate-300 font-medium">
                      {healthData.service} ({healthData.version || 'v2'})
                    </span>
                  </div>
                  {healthData.dependencies && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Dependency Integrations:
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-mono flex items-center gap-1 ${
                            healthData.dependencies.gemini
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          <Activity size={10} />
                          Gemini:{' '}
                          {healthData.dependencies.gemini ? 'Ready' : 'Mock'}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-mono flex items-center gap-1 ${
                            healthData.dependencies.sentry
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          Sentry:{' '}
                          {healthData.dependencies.sentry
                            ? 'Active'
                            : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-white/10 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                {status === 'online' ? (
                  <Wifi size={12} className="text-emerald-400" />
                ) : (
                  <WifiOff size={12} className="text-rose-400" />
                )}
                <span>
                  {lastChecked
                    ? `Last ping: ${lastChecked.toLocaleTimeString()}`
                    : 'Initializing...'}{' '}
                  (Auto 15s)
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
