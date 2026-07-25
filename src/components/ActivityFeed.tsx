import { Clock, Search, FileText, Globe, HelpCircle, ArrowRight } from "lucide-react";
import { ActivityItem } from "../types";

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Research":
        return <Search size={13} className="text-blue-400" />;
      case "Draft":
        return <FileText size={13} className="text-[#34d399]" />;
      case "Scout":
        return <Globe size={13} className="text-purple-400" />;
      default:
        return <Clock size={13} className="text-slate-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Research":
        return "bg-blue-500/10 text-blue-300 border-blue-500/20";
      case "Draft":
        return "bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20";
      case "Scout":
        return "bg-purple-500/10 text-purple-300 border-purple-500/20";
      default:
        return "bg-white/5 text-slate-300 border-white/10";
    }
  };

  return (
    <div 
      className="glass-card p-6 flex flex-col gap-4 text-left"
      id="activity-feed-card"
    >
      <div>
        <span className="text-xs uppercase font-mono text-slate-400 font-bold">Audit Trail</span>
        <h3 className="text-sm font-semibold text-white mt-0.5">Recent SEO Activity</h3>
      </div>

      <div className="relative border-l-2 border-white/10 pl-4 space-y-5 py-1">
        {activities.map((act) => (
          <div key={act.id} className="relative group">
            {/* Circle Node */}
            <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-white/30 group-hover:border-[#34d399] transition duration-300 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-[#34d399] transition"></div>
            </div>

            {/* Content Card */}
            <div className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded border font-semibold ${getCategoryBadgeClass(act.category)}`}>
                  {act.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-medium">
                  {act.date}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-300 tracking-tight leading-snug group-hover:text-white">
                {act.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
