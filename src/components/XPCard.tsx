import { Award, CheckSquare, Square, Zap, Flame, CheckCircle, TrendingUp } from "lucide-react";
import { TaskItem, WeeklyChallenge, UserXP } from "../types";

interface XPCardProps {
  xp: UserXP;
  tasks: TaskItem[];
  weeklyChallenges: WeeklyChallenge[];
  onToggleTask: (taskId: string) => void;
}

export default function XPCard({
  xp,
  tasks,
  weeklyChallenges,
  onToggleTask
}: XPCardProps) {
  
  const xpPercentage = Math.min(100, Math.floor((xp.current / xp.target) * 100));

  return (
    <div 
      className="glass-card p-6 flex flex-col gap-6"
      id="xp-gamification-card"
    >
      {/* XP Level Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 text-[#34d399] flex items-center justify-center font-bold text-lg border border-[#34d399]/20">
            {xp.level}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs uppercase font-mono text-slate-400 font-bold">Current Standing</span>
            <span className="text-sm font-semibold text-white">SEO Level Rank</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-xs text-slate-400 font-mono">Streak</span>
            <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
              <Flame size={14} className="fill-amber-400 text-amber-400" />
              {xp.streak_days} Days
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col text-left">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="font-semibold text-slate-300">Onboarding Progress XP</span>
          <span className="font-mono text-slate-400 font-medium">
            {xp.current} / {xp.target} XP ({xpPercentage}%)
          </span>
        </div>
        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/10 p-[1px]">
          <div 
            className="bg-gradient-to-r from-[#34d399] to-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${xpPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <div className="flex flex-col text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <CheckCircle size={13} className="text-slate-400" />
          <span>Onboarding Tasks</span>
        </h4>
        <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                task.completed 
                  ? "bg-white/5 border-white/5 text-slate-500 line-through" 
                  : "bg-white/10 border-white/10 hover:border-white/25 text-slate-200 hover:bg-white/15"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {task.completed ? (
                  <CheckSquare size={16} className="text-[#34d399] shrink-0" />
                ) : (
                  <Square size={16} className="text-slate-400 shrink-0" />
                )}
                <span className="text-xs font-medium">{task.title}</span>
              </div>
              {!task.completed && (
                <span className="text-[10px] font-mono font-bold bg-[#34d399]/20 text-[#34d399] px-1.5 py-0.5 rounded">
                  +{task.xp} XP
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Challenges */}
      <div className="border-t border-white/10 pt-4 flex flex-col text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <TrendingUp size={13} />
          <span>Weekly Challenges</span>
        </h4>
        <div className="space-y-3">
          {weeklyChallenges.map((challenge) => (
            <div key={challenge.id} className="bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className={`font-semibold ${challenge.completed ? "text-[#34d399] font-bold" : "text-slate-300"}`}>
                  {challenge.title}
                </span>
                <span className="font-mono text-slate-400 font-medium text-[10px]">
                  {challenge.current} / {challenge.target}
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    challenge.completed ? "bg-[#34d399]" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (challenge.current / challenge.target) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
