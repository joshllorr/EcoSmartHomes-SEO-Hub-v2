import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { MapPin, Flame, BarChart2, Check, Info, MousePointerClick, ShieldAlert } from "lucide-react";

export interface SuburbData {
  name: string;
  searchVolume: number;
  competition: number; // 0 - 100
  berDemandScore: number; // 0 - 100
  topQuery: string;
  zoneCode: string;
}

export const SUBURB_METRICS: Record<string, SuburbData> = {
  "Limerick City": { name: "Limerick City", searchVolume: 18500, competition: 82, berDemandScore: 94, topQuery: "BER Assessment Limerick City", zoneCode: "V94-01" },
  "Castletroy": { name: "Castletroy", searchVolume: 14200, competition: 74, berDemandScore: 91, topQuery: "Heat Pump Retrofit Castletroy", zoneCode: "V94-02" },
  "Raheen": { name: "Raheen", searchVolume: 12800, competition: 68, berDemandScore: 88, topQuery: "SEAI Grant Contractor Raheen", zoneCode: "V94-03" },
  "Dooradoyle": { name: "Dooradoyle", searchVolume: 11900, competition: 65, berDemandScore: 86, topQuery: "Solar PV Installation Dooradoyle", zoneCode: "V94-04" },
  "Annacotty": { name: "Annacotty", searchVolume: 9400, competition: 58, berDemandScore: 80, topQuery: "Attic Insulation Annacotty", zoneCode: "V94-05" },
  "Mungret": { name: "Mungret", searchVolume: 8700, competition: 52, berDemandScore: 78, topQuery: "Home Energy Audit Mungret", zoneCode: "V94-06" },
  "V94 Eircode Area": { name: "V94 Eircode Area", searchVolume: 16100, competition: 79, berDemandScore: 92, topQuery: "V94 Energy Upgrade Contractors", zoneCode: "V94-ALL" },
  "Adare": { name: "Adare", searchVolume: 6200, competition: 45, berDemandScore: 73, topQuery: "Historic Home Retrofit Adare", zoneCode: "V94-07" },
  "Monaleen": { name: "Monaleen", searchVolume: 7800, competition: 50, berDemandScore: 82, topQuery: "A-Rated Extension Monaleen", zoneCode: "V94-08" },
  "Corbally": { name: "Corbally", searchVolume: 6900, competition: 48, berDemandScore: 75, topQuery: "Wall Insulation Corbally", zoneCode: "V94-09" },
  "Caherdavin": { name: "Caherdavin", searchVolume: 7100, competition: 51, berDemandScore: 77, topQuery: "Heat Pump Installer Caherdavin", zoneCode: "V94-10" },
  "Rhebogue": { name: "Rhebogue", searchVolume: 4900, competition: 38, berDemandScore: 68, topQuery: "SEAI One Stop Shop Rhebogue", zoneCode: "V94-11" },
  "Castleconnell": { name: "Castleconnell", searchVolume: 5300, competition: 41, berDemandScore: 70, topQuery: "BER Certificate Castleconnell", zoneCode: "V94-12" },
  "Shannon": { name: "Shannon", searchVolume: 10500, competition: 62, berDemandScore: 84, topQuery: "Commercial BER Shannon", zoneCode: "V14-SH" },
  "Patrickswell": { name: "Patrickswell", searchVolume: 3800, competition: 31, berDemandScore: 62, topQuery: "Grants Retrofit Patrickswell", zoneCode: "V94-13" },
  "Ballyneety": { name: "Ballyneety", searchVolume: 3200, competition: 28, berDemandScore: 59, topQuery: "Solar Panels Ballyneety", zoneCode: "V94-14" },
  "Clarina": { name: "Clarina", searchVolume: 2900, competition: 25, berDemandScore: 55, topQuery: "Draft Proofing Clarina", zoneCode: "V94-15" },
};

interface LimerickSuburbHeatmapProps {
  allSuburbs: string[];
  selectedSuburbs: string[];
  onToggleSuburb: (suburb: string) => void;
}

export const LimerickSuburbHeatmap: React.FC<LimerickSuburbHeatmapProps> = ({
  allSuburbs,
  selectedSuburbs,
  onToggleSuburb,
}) => {
  const [metricMode, setMetricMode] = useState<"searchVolume" | "competition" | "berDemandScore">("searchVolume");
  const [hoveredSuburb, setHoveredSuburb] = useState<SuburbData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Fallback metadata generator if custom suburb added
  const getSuburbInfo = (name: string): SuburbData => {
    if (SUBURB_METRICS[name]) return SUBURB_METRICS[name];
    return {
      name,
      searchVolume: 4500,
      competition: 42,
      berDemandScore: 65,
      topQuery: `BER Retrofit ${name}`,
      zoneCode: "V94-CUSTOM"
    };
  };

  const suburbsData = allSuburbs.map(getSuburbInfo);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || suburbsData.length === 0) return;

    const width = containerRef.current.clientWidth || 580;
    const height = 240;

    // Clear previous elements
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // D3 Treemap layout
    const hierarchyData = {
      name: "Limerick",
      children: suburbsData.map((d) => ({
        ...d,
        value: metricMode === "searchVolume" ? d.searchVolume : (metricMode === "competition" ? d.competition : d.berDemandScore)
      }))
    };

    const root = d3
      .hierarchy(hierarchyData)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3
      .treemap()
      .size([width, height])
      .paddingInner(3)
      .paddingOuter(2)
      .round(true);

    treemapLayout(root);

    // Color Scales
    let colorScale: (val: number) => string;

    if (metricMode === "searchVolume") {
      const maxVal = d3.max(suburbsData, (d) => d.searchVolume) || 18500;
      const minVal = d3.min(suburbsData, (d) => d.searchVolume) || 2000;
      colorScale = d3.scaleSequential()
        .domain([minVal, maxVal])
        .interpolator(d3.interpolateRgb("rgba(6, 78, 59, 0.8)", "rgba(52, 211, 153, 0.95)"));
    } else if (metricMode === "competition") {
      colorScale = d3.scaleSequential()
        .domain([20, 90])
        .interpolator(d3.interpolateRgb("rgba(180, 83, 9, 0.75)", "rgba(239, 68, 68, 0.95)"));
    } else {
      colorScale = d3.scaleSequential()
        .domain([50, 95])
        .interpolator(d3.interpolateRgb("rgba(30, 58, 138, 0.8)", "rgba(59, 130, 246, 0.95)"));
    }

    const nodes = root.leaves();

    const cellGroup = svg
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`)
      .style("cursor", "pointer")
      .on("click", (_event: any, d: any) => {
        onToggleSuburb(d.data.name);
      })
      .on("mouseenter", (_event: any, d: any) => {
        setHoveredSuburb(d.data);
      })
      .on("mouseleave", () => {
        setHoveredSuburb(null);
      });

    // Rectangles
    cellGroup
      .append("rect")
      .attr("width", (d: any) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d: any) => Math.max(0, d.y1 - d.y0))
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", (d: any) => colorScale(d.data.value))
      .attr("stroke", (d: any) => (selectedSuburbs.includes(d.data.name) ? "#34d399" : "rgba(255, 255, 255, 0.15)"))
      .attr("stroke-width", (d: any) => (selectedSuburbs.includes(d.data.name) ? 2.5 : 1))
      .attr("opacity", (d: any) => (selectedSuburbs.includes(d.data.name) ? 1 : 0.65))
      .style("transition", "all 0.2s ease");

    // Text Label - Suburb Name
    cellGroup
      .append("text")
      .attr("x", 6)
      .attr("y", 16)
      .attr("fill", "#ffffff")
      .attr("font-size", (d: any) => {
        const w = d.x1 - d.x0;
        if (w < 55) return "9px";
        if (w < 85) return "10px";
        return "11px";
      })
      .attr("font-weight", "bold")
      .attr("font-family", "monospace")
      .text((d: any) => {
        const w = d.x1 - d.x0;
        if (w < 40) return d.data.name.slice(0, 3);
        if (w < 70) return d.data.name.slice(0, 7) + (d.data.name.length > 7 ? ".." : "");
        return d.data.name;
      });

    // Text Label - Value
    cellGroup
      .append("text")
      .attr("x", 6)
      .attr("y", (d: any) => {
        const h = d.y1 - d.y0;
        return h > 40 ? 30 : 26;
      })
      .attr("fill", "rgba(255, 255, 255, 0.85)")
      .attr("font-size", "9px")
      .attr("font-family", "monospace")
      .text((d: any) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 50 || h < 32) return "";
        if (metricMode === "searchVolume") return `${(d.data.searchVolume / 1000).toFixed(1)}k/mo`;
        if (metricMode === "competition") return `${d.data.competition}% Diff`;
        return `Demand: ${d.data.berDemandScore}`;
      });

    // Checkmark Badge for Selected Areas
    cellGroup
      .filter((d: any) => selectedSuburbs.includes(d.data.name))
      .append("circle")
      .attr("cx", (d: any) => d.x1 - d.x0 - 10)
      .attr("cy", 10)
      .attr("r", 6)
      .attr("fill", "#10b981");

  }, [suburbsData, selectedSuburbs, metricMode]);

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 space-y-3 font-mono text-left">
      {/* Header & Mode Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Flame size={15} className="text-[#34d399]" />
          <span className="font-bold text-white text-xs">
            d3.js Suburb Heatmap Overlay
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] px-1.5 py-0.2 rounded font-bold">
            Interactive Area Selector
          </span>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setMetricMode("searchVolume")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
              metricMode === "searchVolume"
                ? "bg-emerald-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Search Volume
          </button>

          <button
            type="button"
            onClick={() => setMetricMode("competition")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
              metricMode === "competition"
                ? "bg-amber-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Competition %
          </button>

          <button
            type="button"
            onClick={() => setMetricMode("berDemandScore")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
              metricMode === "berDemandScore"
                ? "bg-blue-500 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            BER Demand
          </button>
        </div>
      </div>

      {/* D3 Heatmap SVG Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg bg-black/50 p-1 border border-white/10">
        <svg ref={svgRef} className="w-full h-[240px] block" />
      </div>

      {/* Legend & Hover Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[10px]">
        {/* Heatmap Color Bar */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Heat Intensity:</span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-500">Low</span>
            <div
              className={`h-2.5 w-24 rounded ${
                metricMode === "searchVolume"
                  ? "bg-gradient-to-r from-emerald-950 via-emerald-700 to-emerald-400"
                  : metricMode === "competition"
                  ? "bg-gradient-to-r from-amber-900 via-rose-700 to-red-500"
                  : "bg-gradient-to-r from-blue-950 via-blue-700 to-blue-400"
              }`}
            />
            <span className="text-[9px] text-slate-300 font-bold">High</span>
          </div>
        </div>

        {/* Click Instruction */}
        <div className="flex items-center gap-1 text-emerald-400/90 text-[10px]">
          <MousePointerClick size={12} />
          <span>Click suburb cell to toggle areaServed schema inclusion</span>
        </div>
      </div>

      {/* Hovered Suburb Quick Inspector */}
      {hoveredSuburb && (
        <div className="bg-black/80 border border-emerald-500/40 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-emerald-400" />
            <div>
              <span className="font-bold text-white">{hoveredSuburb.name}</span>
              <span className="text-slate-400 text-[10px] ml-1.5 font-mono">({hoveredSuburb.zoneCode})</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Volume: <strong className="text-emerald-300">{hoveredSuburb.searchVolume.toLocaleString()}/mo</strong></span>
            <span>SEO Difficulty: <strong className="text-amber-300">{hoveredSuburb.competition}%</strong></span>
            <span>BER Intent: <strong className="text-blue-300">{hoveredSuburb.berDemandScore}/100</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
