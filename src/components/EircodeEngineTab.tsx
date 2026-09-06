/**
 * src/components/EircodeEngineTab.tsx
 *
 * Hyper-Local "Eircode Engine" with Dynamic BER Jump & Solar Yield Calculators
 *
 * Allows Irish homeowners and retrofit contractors to input any Eircode or Routing Key (e.g. V94, T12, D04),
 * computes SEAI DEAP 4.2 compliant BER Jump (e.g. G -> A2), simulates Met Éireann localized solar irradiance
 * and Clean Export Guarantee (CEG) revenues, and generates Programmatic SEO Schemas for Irish county hubs.
 */

import { useState, useEffect } from 'react';
import {
  MapPin,
  Sun,
  Zap,
  TrendingUp,
  Award,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Layers,
  ArrowRight,
  Flame,
  HelpCircle,
  Sparkles,
  Sliders,
  BatteryCharging,
} from 'lucide-react';
import { apiGet, apiPost } from '../hooks/useApi';
import {
  BERBand,
  PropertyType,
  RoofOrientation,
  ComprehensiveEircodeAudit,
  EircodeRoutingInfo,
  BER_SCALE,
} from '../logic/eircodeEngine';

export default function EircodeEngineTab() {
  const [eircodeInput, setEircodeInput] = useState<string>('V94 X2R8');
  const [propertyType, setPropertyType] =
    useState<PropertyType>('semi_detached');
  const [floorArea, setFloorArea] = useState<number>(125);
  const [currentBER, setCurrentBER] = useState<BERBand>('E');
  const [solarKwp, setSolarKwp] = useState<number>(4.3);
  const [roofOrientation, setRoofOrientation] =
    useState<RoofOrientation>('south');
  const [hasBattery, setHasBattery] = useState<boolean>(false);

  // Planned Measures
  const [atticInsulation, setAtticInsulation] = useState<boolean>(true);
  const [cavityWallInsulation, setCavityWallInsulation] =
    useState<boolean>(true);
  const [heatPumpAirToWater, setHeatPumpAirToWater] = useState<boolean>(true);
  const [solarPV, setSolarPV] = useState<boolean>(true);
  const [tripleGlazing, setTripleGlazing] = useState<boolean>(false);

  const [audit, setAudit] = useState<ComprehensiveEircodeAudit | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [routingKeys, setRoutingKeys] = useState<EircodeRoutingInfo[]>([]);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  // Fetch routing keys on mount
  useEffect(() => {
    const fetchRoutingKeys = async () => {
      try {
        const res = await apiGet<{
          success: boolean;
          routingKeys: EircodeRoutingInfo[];
        }>('/api/eircode/routing-keys');
        if (res.success && res.routingKeys) {
          setRoutingKeys(res.routingKeys);
        }
      } catch (err) {
        console.error('Failed to load routing keys', err);
      }
    };
    fetchRoutingKeys();
  }, []);

  // Run calculation
  const calculateAudit = async () => {
    try {
      setLoading(true);
      const res = await apiPost<{
        success: boolean;
        audit: ComprehensiveEircodeAudit;
      }>('/api/eircode/calculate', {
        eircode: eircodeInput,
        propertyType,
        floorAreaM2: floorArea,
        currentBER,
        solarKwp,
        roofOrientation,
        hasBatteryStorage: hasBattery,
        plannedMeasures: {
          atticInsulation,
          cavityWallInsulation,
          heatPumpAirToWater,
          solarPV,
          tripleGlazing,
        },
      });

      if (res.success && res.audit) {
        setAudit(res.audit);
      }
    } catch (err) {
      console.error('Calculation error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateAudit();
  }, [
    propertyType,
    floorArea,
    currentBER,
    solarKwp,
    roofOrientation,
    hasBattery,
    atticInsulation,
    cavityWallInsulation,
    heatPumpAirToWater,
    solarPV,
    tripleGlazing,
  ]);

  const handleCopySchema = () => {
    if (!audit?.seoProgrammaticMetadata?.schemaJsonLD) return;
    navigator.clipboard.writeText(
      JSON.stringify(audit.seoProgrammaticMetadata.schemaJsonLD, null, 2),
    );
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const berBands: BERBand[] = ['A0', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-emerald-500/30 rounded-2xl bg-slate-900/90 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold tracking-wider border border-emerald-500/30">
              Irish Microclimate & DEAP 4.2 Engine
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold tracking-wider border border-sky-500/30">
              Clean Export Guarantee (CEG)
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
            <MapPin size={22} className="text-emerald-400" />
            Hyper-Local "Eircode Engine" with Dynamic BER Jump & Solar Yield
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Evaluate localized solar radiation and building energy upgrades
            across all 26 Irish counties. Calculates SEAI DEAP 4.2 compliant BER
            improvements, Clean Export Guarantee revenues, and programmatic SEO
            schemas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 gap-2">
            <MapPin size={14} className="text-emerald-400" />
            <input
              type="text"
              value={eircodeInput}
              onChange={(e) => setEircodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && calculateAudit()}
              placeholder="e.g. V94 X2R8"
              className="bg-transparent text-xs font-mono font-bold text-white w-24 focus:outline-none"
            />
          </div>
          <button
            onClick={calculateAudit}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            {loading ? 'Evaluating...' : 'Run Audit'}
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Property & Technical Specifications (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Home Specifications & Measures
              </h3>
            </div>
            {audit && (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {audit.routingInfo.county} ({audit.routingInfo.routingKey})
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* Quick Routing Key Selector */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex justify-between">
                <span>Eircode Routing Area:</span>
                <span className="text-slate-400 font-normal">
                  {audit?.routingInfo.name || 'Limerick V94'}
                </span>
              </label>
              <select
                value={audit?.routingInfo.routingKey || 'V94'}
                onChange={(e) => {
                  setEircodeInput(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
              >
                {routingKeys.map((r) => (
                  <option key={r.routingKey} value={r.routingKey}>
                    {r.routingKey} - {r.name} ({r.county})
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type & Floor Area */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">
                  Property Type:
                </label>
                <select
                  value={propertyType}
                  onChange={(e) =>
                    setPropertyType(e.target.value as PropertyType)
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="semi_detached">Semi-Detached</option>
                  <option value="detached">Detached</option>
                  <option value="mid_terrace">Mid-Terrace</option>
                  <option value="end_terrace">End-Terrace</option>
                  <option value="bungalow">Bungalow</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">
                  Floor Area (m²):
                </label>
                <input
                  type="number"
                  value={floorArea}
                  onChange={(e) => setFloorArea(Number(e.target.value))}
                  min={50}
                  max={500}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Baseline BER Band */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 font-semibold">
                  Current Baseline BER:
                </label>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white"
                  style={{
                    backgroundColor: BER_SCALE[currentBER]?.color || '#999',
                  }}
                >
                  {currentBER} ({BER_SCALE[currentBER]?.label})
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {berBands.map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => setCurrentBER(band)}
                    className={`py-1 rounded text-[10px] font-mono font-bold border transition-all ${
                      currentBER === band
                        ? 'border-white text-white shadow-md scale-105'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                    style={{
                      backgroundColor:
                        currentBER === band
                          ? BER_SCALE[band].color
                          : `${BER_SCALE[band].color}25`,
                    }}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </div>

            {/* Solar Array Specifications */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sun size={14} className="text-amber-400" />
                  Rooftop Solar PV Array
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {solarKwp} kWp
                </span>
              </div>

              <div className="space-y-1">
                <input
                  type="range"
                  min={1.5}
                  max={10.0}
                  step={0.4}
                  value={solarKwp}
                  onChange={(e) => setSolarKwp(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1.5 kWp (4 panels)</span>
                  <span>4.3 kWp (Standard)</span>
                  <span>10.0 kWp (Max)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400">
                    Roof Orientation:
                  </label>
                  <select
                    value={roofOrientation}
                    onChange={(e) =>
                      setRoofOrientation(e.target.value as RoofOrientation)
                    }
                    className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-white font-medium"
                  >
                    <option value="south">South (Optimal 100%)</option>
                    <option value="south_east">South-East (94%)</option>
                    <option value="south_west">South-West (94%)</option>
                    <option value="east">East (82%)</option>
                    <option value="west">West (81%)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="hasBattery"
                    checked={hasBattery}
                    onChange={(e) => setHasBattery(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <label
                    htmlFor="hasBattery"
                    className="text-xs text-slate-300 font-medium cursor-pointer"
                  >
                    5kWh Battery Storage
                  </label>
                </div>
              </div>
            </div>

            {/* Planned Retrofit Measures Selection */}
            <div className="space-y-2 pt-1">
              <label className="text-slate-300 font-semibold block">
                Active Retrofit Measures:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg cursor-pointer hover:border-emerald-500/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={atticInsulation}
                    onChange={(e) => setAtticInsulation(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-200">
                    Attic (300mm Wool)
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg cursor-pointer hover:border-emerald-500/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={cavityWallInsulation}
                    onChange={(e) => setCavityWallInsulation(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-200">
                    Cavity Wall Pump
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg cursor-pointer hover:border-emerald-500/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={heatPumpAirToWater}
                    onChange={(e) => setHeatPumpAirToWater(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-200">
                    Air-to-Water HP
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg cursor-pointer hover:border-emerald-500/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={solarPV}
                    onChange={(e) => setSolarPV(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-200">Solar PV Array</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: BER Jump & Solar Yield Results (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {audit ? (
            <>
              {/* Top Executive Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 glass-card border border-emerald-500/30 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/80 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-300">
                    Predicted BER Jump
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded font-mono font-extrabold text-sm text-white"
                      style={{
                        backgroundColor:
                          BER_SCALE[audit.berJump.currentBER]?.color,
                      }}
                    >
                      {audit.berJump.currentBER}
                    </span>
                    <ArrowRight size={14} className="text-slate-400" />
                    <span
                      className="px-3 py-1 rounded font-mono font-extrabold text-lg text-white shadow-lg"
                      style={{
                        backgroundColor:
                          BER_SCALE[audit.berJump.predictedBER]?.color,
                      }}
                    >
                      {audit.berJump.predictedBER}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    -{audit.berJump.energyReductionPercentage}% Primary Energy
                  </span>
                </div>

                <div className="p-4 glass-card border border-amber-500/30 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900/80 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-300">
                    Annual Total Savings
                  </span>
                  <span className="text-2xl font-mono font-extrabold text-amber-400">
                    €
                    {(
                      audit.berJump.annualBillSavingsEUR +
                      audit.solarYield.totalAnnualSolarBenefitEUR
                    ).toLocaleString()}
                    <span className="text-xs font-normal text-slate-400">
                      /yr
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Bills + CEG Export Revenue
                  </span>
                </div>

                <div className="p-4 glass-card border border-sky-500/30 rounded-2xl bg-gradient-to-br from-sky-950/40 to-slate-900/80 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-sky-300">
                    SEAI Grants Offset
                  </span>
                  <span className="text-2xl font-mono font-extrabold text-sky-400">
                    €{audit.financials.totalGrantOffsetEUR.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Net Payback: ~{audit.financials.paybackYears} Years
                  </span>
                </div>
              </div>

              {/* Solar Microclimate Details Card */}
              <div className="glass-card p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sun size={18} className="text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Solar Microclimate & Clean Export Yield (
                      {audit.routingInfo.name})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    GHI: {audit.routingInfo.annualSolarIrradianceKWhM2}{' '}
                    kWh/m²/yr
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">
                      Annual Yield
                    </span>
                    <span className="text-base font-mono font-bold text-white">
                      {audit.solarYield.annualGenerationKWh.toLocaleString()}{' '}
                      kWh
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      {audit.solarYield.panelCount} × 430W Panels
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">
                      Self-Consumption
                    </span>
                    <span className="text-base font-mono font-bold text-emerald-400">
                      €{audit.solarYield.annualSelfConsumptionSavingsEUR}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      {audit.solarYield.selfConsumptionKWh} kWh offset
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">
                      CEG Grid Export
                    </span>
                    <span className="text-base font-mono font-bold text-sky-400">
                      €{audit.solarYield.annualExportRevenueEUR}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      {audit.solarYield.gridExportKWh} kWh @ €0.21
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">
                      Carbon Mitigated
                    </span>
                    <span className="text-base font-mono font-bold text-purple-300">
                      {(audit.solarYield.co2MitigatedKgPerYear / 1000).toFixed(
                        2,
                      )}{' '}
                      t
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      CO2 avoided/yr
                    </span>
                  </div>
                </div>

                {/* Heat Loss Indicator Assessment */}
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={16}
                      className="text-emerald-400 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white">
                        Heat Loss Indicator (HLI):{' '}
                        {audit.berJump.heatLossIndicatorHLI.predictedHLI} W/K/m²
                      </span>
                      <p className="text-[10px] text-slate-300">
                        {audit.berJump.heatLossIndicatorHLI
                          .qualifiesForHeatPumpGrant
                          ? '✅ Compliant with SEAI Heat Pump grant requirement (HLI ≤ 2.0 W/K/m²).'
                          : '⚠️ Additional fabric insulation required to reach HLI ≤ 2.0 threshold.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded">
                    SEAI DEAP 4.2
                  </span>
                </div>
              </div>

              {/* SEAI Grants Breakdown Table */}
              <div className="glass-card p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  2026 SEAI Domestic Grant Schedule
                </h3>

                <div className="divide-y divide-slate-800/80 text-xs">
                  {audit.financials.grantsBreakdown.map((grant, idx) => (
                    <div
                      key={idx}
                      className="py-2 flex justify-between items-center font-medium"
                    >
                      <span className="text-slate-300">{grant.measure}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        +€{grant.grantAmountEUR.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between items-center text-slate-200 font-bold">
                    <span>Total SEAI Grant Assistance</span>
                    <span className="font-mono text-emerald-400">
                      €{audit.financials.totalGrantOffsetEUR.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 flex justify-between items-center text-white font-extrabold">
                    <span>Estimated Net Homeowner Investment</span>
                    <span className="font-mono text-amber-400">
                      €{audit.financials.netHomeownerCostEUR.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Programmatic SEO Schema Export */}
              <div className="glass-card p-5 rounded-2xl bg-slate-900/90 border border-sky-500/30 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-sky-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Programmatic County Page SEO Schema
                    </h3>
                  </div>
                  <button
                    onClick={handleCopySchema}
                    className="px-3 py-1 bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/30 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedSchema ? <Check size={12} /> : <Copy size={12} />}
                    {copiedSchema ? 'Copied!' : 'Copy JSON-LD Schema'}
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-500">Target Keyword: </span>
                    <span className="text-sky-300 font-bold">
                      "{audit.seoProgrammaticMetadata.targetKeyword}"
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Page Title: </span>
                    <span className="text-slate-200">
                      {audit.seoProgrammaticMetadata.suggestedPageTitle}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-mono">
              Loading Eircode calculations...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
