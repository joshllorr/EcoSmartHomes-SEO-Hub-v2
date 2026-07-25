import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ChevronRight } from "lucide-react";

interface Props {
  children: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] Uncaught error in section "${this.props.sectionName || "Unknown"}":`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="glass-card p-6 border-red-500/30 bg-red-950/10 text-left flex flex-col gap-4 relative overflow-hidden"
          id={`error-boundary-${(this.props.sectionName || "generic").toLowerCase().replace(/\s+/g, "-")}`}
        >
          {/* Accent light indicator */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl translate-x-8 -translate-y-8" />

          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 shrink-0">
              <AlertTriangle size={20} className="animate-pulse" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  Load Error
                </span>
                {this.props.sectionName && (
                  <span className="text-xs font-mono text-slate-400">
                    in {this.props.sectionName}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-white">
                Something went wrong rendering this section
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                {this.state.error?.message || "An unexpected rendering fault occurred. Please reset this component section or verify your current dataset."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-xl border border-white/10 hover:border-white/20 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw size={13} />
              Reset Section
            </button>
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
              Isolated context <ChevronRight size={10} /> State safeguarded
            </span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
