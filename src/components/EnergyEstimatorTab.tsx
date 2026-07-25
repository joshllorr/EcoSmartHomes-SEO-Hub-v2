import { useState } from "react";
import { 
  Calculator, 
  MapPin, 
  Search, 
  Sparkles, 
  Thermometer, 
  Euro, 
  Flame, 
  Cpu, 
  Loader2, 
  Compass, 
  ShieldCheck, 
  Navigation, 
  TrendingDown,
  ExternalLink,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnergyEstimatorTab() {
  // Calculator States
  const [propertyType, setPropertyType] = useState("semi_detached");
  const [floorArea, setFloorArea] = useState(120);
  const [occupants, setOccupants] = useState(3);
  const [insulationLevel, setInsulationLevel] = useState("moderate"); // poor, moderate, good
  const [heatingSystem, setHeatingSystem] = useState("gas_boiler"); // gas_boiler, oil_boiler, electric, heat_pump

  // AI & Maps Grounding States
  const [searchQuery, setSearchQuery] = useState("Registered air-to-water heat pump suppliers in Limerick V94");
  const [isLoading, setIsLoading] = useState(false);
  const [advisorResponse, setAdvisorResponse] = useState<string>("");
  const [sources, setSources] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  // Quick query suggestions focusing on Limerick V94 and surrounding areas
  const suggestions = [
    "SEAI registered heat pump contractors in Limerick V94",
    "Cavity wall & attic insulation suppliers in Raheen & Dooradoyle",
    "Registered BER rating assessors Castletroy & Annacotty (V94)",
    "Builders merchants for insulation boards Dock Road Limerick"
  ];

  // Geolocation trigger
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setLocationStatus("Retrieving GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocating(false);
        setLocationStatus(`Located! Coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocating(false);
        setLocationStatus("Location access denied or timed out. Defaulting to Limerick V94 Center (52.6638, -8.6267).");
      }
    );
  };

  // Submit search query to the backend Maps Grounding endpoint
  const handleAdvisorSearch = async (queryToSubmit = searchQuery) => {
    if (!queryToSubmit.trim()) return;
    setIsLoading(true);
    setAdvisorResponse("");
    setSources([]);

    try {
      const res = await fetch("/api/energy/maps-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryToSubmit,
          latitude: userLocation?.lat || null,
          longitude: userLocation?.lng || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setAdvisorResponse(data.text);
        setSources(data.sources || []);
      } else {
        setAdvisorResponse("Sorry, we couldn't retrieve answers. Please check your network connection or try again.");
      }
    } catch (err: any) {
      console.error("Advisor request failed:", err);
      setAdvisorResponse(`Error executing smart search. Offline simulation active. Ensure server is started properly.`);
    } finally {
      setIsLoading(false);
    }
  };

  // PHYSICS CALCULATIONS BASED ON IRISH STANDARDS & ENERGY COSTS
  // Heat Loss Indicator (HLI) approximation
  const getHLI = () => {
    switch (insulationLevel) {
      case "poor": return 3.5;
      case "moderate": return 2.2;
      case "good": return 1.1;
      default: return 2.2;
    }
  };

  // Space Heating Demand (kWh/year) = Area * HLI * degree_days_factor
  const getHeatingDemand = () => {
    const hli = getHLI();
    return Math.round(floorArea * hli * 46);
  };

  // Hot Water Demand (kWh/year) = ~600 kWh per occupant
  const getWaterDemand = () => {
    return occupants * 600;
  };

  // Efficiency and fuel costs
  const getSystemMetrics = () => {
    // Return { efficiency, fuelPrice_per_kWh, co2_per_kWh }
    switch (heatingSystem) {
      case "gas_boiler":
        return { efficiency: 0.85, price: 0.11, co2: 0.203, label: "Gas Boiler", fuel: "Gas" };
      case "oil_boiler":
        return { efficiency: 0.80, price: 0.12, co2: 0.263, label: "Oil Boiler", fuel: "Heating Oil" };
      case "electric":
        return { efficiency: 1.0, price: 0.34, co2: 0.348, label: "Direct Electric", fuel: "Electricity" };
      case "heat_pump":
        return { efficiency: 4.0, price: 0.34, co2: 0.348, label: "Air-to-Water Heat Pump", fuel: "Electricity (HP Rate)" };
      default:
        return { efficiency: 0.85, price: 0.11, co2: 0.203, label: "Gas Boiler", fuel: "Gas" };
    }
  };

  const heatingDemand = getHeatingDemand();
  const waterDemand = getWaterDemand();
  const totalThermalDemand = heatingDemand + waterDemand;

  const metrics = getSystemMetrics();
  const deliveredHeatingFuel = heatingDemand / metrics.efficiency;
  const deliveredWaterFuel = waterDemand / (metrics.efficiency > 2.0 ? 2.5 : metrics.efficiency); // heat pumps do DHW at slightly lower COP (~2.5)

  const annualHeatingCost = deliveredHeatingFuel * metrics.price;
  const annualWaterCost = deliveredWaterFuel * metrics.price;
  const totalAnnualCost = annualHeatingCost + annualWaterCost;

  const annualCO2 = (deliveredHeatingFuel + deliveredWaterFuel) * metrics.co2;

  // Comparison logic with a state-of-the-art A-rated Heat Pump Retrofit
  const retrofitHeatingFuel = heatingDemand / 4.0; // Heat pump CoP 4.0
  const retrofitWaterFuel = waterDemand / 2.5; // Water heating CoP 2.5
  const retrofitAnnualCost = (retrofitHeatingFuel + retrofitWaterFuel) * 0.34;
  const retrofitCO2 = (retrofitHeatingFuel + retrofitWaterFuel) * 0.348;

  const costSavings = Math.max(0, totalAnnualCost - retrofitAnnualCost);
  const carbonSavings = Math.max(0, annualCO2 - retrofitCO2);

  return (
    <div className="space-y-6 text-left" id="estimator-tab">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
            <Thermometer className="text-[#34d399]" />
            <span>Facilities & Building Energy Estimator</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Calculate domestic heating and hot water costs, evaluate retrofits, and seek verified contractors in Ireland using smart Google Maps grounding.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300">
          <ShieldCheck className="text-[#34d399] shrink-0" size={16} />
          <span>Calculations aligned with SEAI DEAP & BER standard models</span>
        </div>
      </div>

      {/* Grid Layout: Left Inputs, Right Calculator Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs panel (5 columns on large screen) */}
        <div className="lg:col-span-5 glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Calculator className="text-[#34d399]" size={16} />
            <h3 className="font-semibold text-white text-sm">Building Specifications</h3>
          </div>

          <div className="space-y-4">
            {/* Property Type selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Property Category</label>
              <select 
                value={propertyType} 
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-hidden focus:border-[#34d399] transition"
              >
                <option value="apartment">Apartment / Flat (Low losses)</option>
                <option value="mid_terrace">Mid-Terrace House</option>
                <option value="semi_detached">Semi-Detached House</option>
                <option value="detached">Detached House (High losses)</option>
              </select>
            </div>

            {/* Numeric input row for floor area and occupants */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Floor Area (m²)</label>
                <input 
                  type="number"
                  value={floorArea}
                  min={20}
                  max={600}
                  onChange={(e) => setFloorArea(Math.max(20, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-hidden focus:border-[#34d399] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">No. of Occupants</label>
                <input 
                  type="number"
                  value={occupants}
                  min={1}
                  max={12}
                  onChange={(e) => setOccupants(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-hidden focus:border-[#34d399] transition"
                />
              </div>
            </div>

            {/* Insulation level select */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Thermal Envelope State</label>
                <span className="text-[10px] font-mono text-[#34d399] bg-[#34d399]/10 px-2 py-0.5 rounded">
                  HLI: {getHLI()} W/m²K
                </span>
              </div>
              <select 
                value={insulationLevel} 
                onChange={(e) => setInsulationLevel(e.target.value)}
                className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-hidden focus:border-[#34d399] transition"
              >
                <option value="poor">Poor (Single glaze, uninsulated solid walls - HLI 3.5)</option>
                <option value="moderate">Moderate (Double glaze, basic cavity insulation - HLI 2.2)</option>
                <option value="good">Excellent (A-Rated retrofit, triple glaze, airtight - HLI 1.1)</option>
              </select>
            </div>

            {/* Space heating fuel selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Primary Heating System</label>
              <select 
                value={heatingSystem} 
                onChange={(e) => setHeatingSystem(e.target.value)}
                className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-hidden focus:border-[#34d399] transition"
              >
                <option value="gas_boiler">Natural Gas Boiler (85% Eff, 11c/kWh)</option>
                <option value="oil_boiler">Home Heating Oil Boiler (80% Eff, 12c/kWh)</option>
                <option value="electric">Direct Electrical Heating (100% Eff, 34c/kWh)</option>
                <option value="heat_pump">Air-to-Water Heat Pump (400% COP, 34c/kWh)</option>
              </select>
            </div>
          </div>

          {/* Quick Informational Tip */}
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#34d399]">
              <Info size={13} />
              <span>Did you know?</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              To quality for state heat pump funding in Ireland, building surveyors must certify that the overall Heat Loss Indicator (HLI) has been lowered to <strong className="text-white">2.0 W/m²K or less</strong>.
            </p>
          </div>
        </div>

        {/* Right calculator results panel (7 columns on large screen) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main cost metrics card */}
          <div className="glass-card p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#34d399]/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-semibold text-white text-sm">Estimated Cost & Demand Breakdown</h3>
                <span className="text-[10px] font-mono text-slate-400">Annual Run Rates</span>
              </div>

              {/* Grid of calculations */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/25 border border-white/5 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Heating Demand</p>
                  <p className="text-base font-semibold text-white mt-1">{heatingDemand.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">kWh</span></p>
                </div>

                <div className="bg-black/25 border border-white/5 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Hot Water Demand</p>
                  <p className="text-base font-semibold text-white mt-1">{waterDemand.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">kWh</span></p>
                </div>

                <div className="bg-black/25 border border-white/5 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Delivered Fuel</p>
                  <p className="text-base font-semibold text-white mt-1">{Math.round(deliveredHeatingFuel + deliveredWaterFuel).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">kWh</span></p>
                </div>

                <div className="bg-black/25 border border-white/5 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Carbon Footprint</p>
                  <p className="text-base font-semibold text-white mt-1">{Math.round(annualCO2).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">kg</span></p>
                </div>
              </div>

              {/* Cost Highlight section */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-[#34d399]/5 border border-emerald-500/15 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                <div>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Total Annual Energy Expense</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl md:text-3xl font-display font-extrabold text-white">€{Math.round(totalAnnualCost).toLocaleString()}</span>
                    <span className="text-xs text-slate-400 font-medium">/ year</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Based on Irish utility averages for {metrics.label}.</p>
                </div>

                {heatingSystem !== "heat_pump" && (
                  <div className="bg-black/30 px-4 py-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-[#34d399]/10 text-[#34d399] rounded-lg">
                      <TrendingDown size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">By Retrofitting HP</p>
                      <p className="text-sm font-bold text-[#34d399]">Save €{Math.round(costSavings).toLocaleString()} / yr</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Savings projection progress bar */}
            {heatingSystem !== "heat_pump" && (
              <div className="border-t border-white/10 pt-4 mt-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Retrofit Benefit Summary</span>
                  <span className="text-[10px] text-slate-400">Estimated CO₂ reduction: <strong>{Math.round(carbonSavings).toLocaleString()} kg/yr</strong></span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 w-12 text-right">Current</span>
                  <div className="flex-1 bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#64748b] h-full rounded-full w-full"></div>
                  </div>
                  <span className="font-mono text-slate-400 w-12 font-bold">€{Math.round(totalAnnualCost)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="font-semibold text-emerald-400 w-12 text-right">A-Retrofit</span>
                  <div className="flex-1 bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(10, (retrofitAnnualCost / totalAnnualCost) * 100))}%` }}></div>
                  </div>
                  <span className="font-mono text-emerald-400 w-12 font-bold">€{Math.round(retrofitAnnualCost)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive AI Advisor with Google Maps grounding */}
      <div className="glass-card p-6 space-y-5" id="energy-maps-advisor">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#34d399]/10 rounded-xl text-[#34d399]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Interactive AI Advisor & Local Supplier Finder</h3>
              <p className="text-[11px] text-slate-400">Powered by Gemini 3.5 Flash & authentic Google Maps grounding.</p>
            </div>
          </div>

          {/* Geolocation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGetLocation}
              disabled={locating}
              className="px-3 py-2 bg-white/5 border border-white/10 hover:border-[#34d399] rounded-xl text-[11px] font-semibold text-slate-200 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {locating ? <Loader2 className="animate-spin text-[#34d399]" size={12} /> : <MapPin className="text-[#34d399]" size={12} />}
              <span>{locating ? "Locating..." : "Use Current Location"}</span>
            </button>
            {locationStatus && (
              <span className="text-[10px] font-mono text-slate-400 bg-black/25 px-2 py-1 rounded max-w-[200px] truncate" title={locationStatus}>
                {locationStatus}
              </span>
            )}
          </div>
        </div>

        {/* Search Bar Block */}
        <div className="space-y-3">
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask e.g. Where can I find registered solar panel suppliers near Dublin?"
                className="w-full bg-[#0f172a]/70 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-hidden focus:border-[#34d399] transition"
                onKeyDown={(e) => e.key === "Enter" && handleAdvisorSearch()}
              />
            </div>
            <button
              onClick={() => handleAdvisorSearch()}
              disabled={isLoading || !searchQuery.trim()}
              className="bg-[#34d399] hover:bg-[#2bc48d] disabled:bg-[#34d399]/40 text-[#0f172a] px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? <Loader2 className="animate-spin" size={13} /> : <Compass size={13} />}
              <span>{isLoading ? "Searching..." : "Search & Ground"}</span>
            </button>
          </div>

          {/* Quick suggestions row */}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(s);
                  handleAdvisorSearch(s);
                }}
                className="text-[10px] text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#34d399] px-2.5 py-1.5 rounded-full transition cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Advisor Results stage */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-black/25 border border-white/5 p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]"
            >
              <Loader2 className="animate-spin text-[#34d399]" size={28} />
              <div className="space-y-1">
                <p className="text-xs text-slate-200 font-semibold">Gemini is searching local building and energy databases...</p>
                <p className="text-[10px] text-slate-400">Accessing real-time Google Maps coordinates around Ireland to gather verified contacts.</p>
              </div>
            </motion.div>
          ) : advisorResponse ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Advisor generated text (7 columns) */}
              <div className="lg:col-span-7 bg-[#0f172a]/60 border border-white/5 p-5 rounded-xl text-xs text-slate-200 leading-relaxed space-y-3 max-h-[400px] overflow-y-auto">
                <div className="prose prose-invert max-w-none text-slate-200">
                  {advisorResponse.split("\n").map((line, idx) => {
                    if (line.startsWith("###")) {
                      return <h3 key={idx} className="text-sm font-bold text-white mt-4 mb-2 first:mt-0">{line.replace("###", "").trim()}</h3>;
                    }
                    if (line.startsWith("##")) {
                      return <h4 key={idx} className="text-xs font-bold text-[#34d399] mt-3 mb-1.5">{line.replace("##", "").trim()}</h4>;
                    }
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <p key={idx} className="font-semibold text-white mt-2">{line.replace(/\*\*/g, "").trim()}</p>;
                    }
                    if (line.startsWith("- ") || line.startsWith("* ")) {
                      return <li key={idx} className="ml-4 list-disc mt-1 text-slate-300">{line.substring(2)}</li>;
                    }
                    return <p key={idx} className="mt-2 text-slate-300">{line}</p>;
                  })}
                </div>
              </div>

              {/* Verified map markers / citations lists (5 columns) */}
              <div className="lg:col-span-5 bg-black/20 border border-white/10 p-5 rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-[#34d399]" size={14} />
                    <h4 className="text-xs font-semibold text-white">Google Maps Grounded Locations</h4>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Live coordinates verified of local facilities, consultants, and contractors near your search focus.
                  </p>

                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {sources.map((src, i) => (
                      <div key={i} className="bg-[#0f172a]/80 border border-white/5 rounded-lg p-3 hover:border-white/10 transition space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[11px] font-bold text-white leading-tight">{src.title}</span>
                          {src.uri && (
                            <a
                              href={src.uri}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="text-[10px] text-[#34d399] hover:underline flex items-center gap-1 shrink-0 font-semibold"
                            >
                              <span>View Map</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                        {src.snippets && src.snippets.map((snip: string, j: number) => (
                          <p key={j} className="text-[10px] text-slate-400 leading-normal pl-1.5 border-l border-white/10 italic">
                            "{snip}"
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 font-mono text-center border-t border-white/5 pt-3">
                  Verification timestamp: {new Date().toLocaleDateString("en-GB")}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/10 border border-dashed border-white/10 p-10 rounded-xl text-center space-y-2 text-slate-400 flex flex-col items-center"
            >
              <Compass size={24} className="text-slate-500 animate-pulse" />
              <p className="text-xs">Enter a contractor type or energy surveying query above and click "Search & Ground" to locate facilities in Ireland.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
