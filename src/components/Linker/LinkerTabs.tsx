import { NavLink } from "react-router-dom";

export type LinkerTabType = "linker" | "pillar_pages" | "link_bait";

export interface LinkerTabItem {
  name: string;
  path: string;
}

export const LINKER_TABS: LinkerTabItem[] = [
  { name: "Linker", path: "/linker" },
  { name: "Pillar Pages", path: "/pillar-pages" },
  { name: "Link Bait Builder", path: "/link-bait" }
];

interface LinkerTabsProps {
  activeTab?: LinkerTabType;
  onTabChange?: (tabName: string) => void;
}

export default function LinkerTabs({ activeTab, onTabChange }: LinkerTabsProps) {
  return (
    <div className="flex gap-6 border-b border-white/10 pb-2 text-left" id="linker-tabs-nav">
      {LINKER_TABS.map((t) => (
        <NavLink
          key={t.name}
          to={t.path}
          onClick={() => onTabChange && onTabChange(t.name)}
          className={({ isActive }) =>
            `pb-2 text-sm transition font-medium ${
              isActive
                ? "border-b-2 border-[#34d399] font-semibold text-white"
                : "text-slate-400 hover:text-white"
            }`
          }
        >
          {t.name}
        </NavLink>
      ))}
    </div>
  );
}
