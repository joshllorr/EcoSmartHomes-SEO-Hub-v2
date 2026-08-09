/**
 * logic/retrofit/aiPlanner.ts
 *
 * Phase 27 AI Retrofit Planner Engine (Updated for March 28th 2026 SEAI Rules & New G → A BER Scale)
 */

export interface RetrofitPlan {
  plan_id: string;
  grant_id: string;
  user_id?: string;
  createdAt: number;
  recommendedUpgrades: string[];
  costEstimate: {
    attic: number;
    controls: number;
    heatPump: number;
    solar: number;
    wall: number;
    total: number;
  };
  grantOffsets: {
    attic: number;
    controls: number;
    heatPump: number;
    solar: number;
    wall: number;
    fullRetrofitBonus: number;
    solarDiverterBonus: number;
    comboBonus: number;
    total: number;
  };
  netCost: number;
  berImpact: string;
  annualSavings: number;
  deepRetrofitSavings: number;
  timeline: { task: string; duration: string; sequence: number }[];
  materials: string[];
  contractorsNeeded: string[];
  complianceDocs: string[];
}

export function aiPlanner(grantRecord?: any, userRecord?: any): RetrofitPlan {
  const grantId = grantRecord?.id || 'grant_2026_08_03_1207';
  const userId = userRecord?.user_id || 'user_2026_08_03_1412';
  const planId = `plan_${new Date()
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 12)}_${Math.floor(Math.random() * 9000 + 1000)}`;

  const recommendedUpgrades = [
    'Attic Insulation',
    'Smart Heating Controls',
    'Air-to-Water Heat Pump',
    'Rooftop Solar PV',
  ];

  const costEstimate = {
    attic: 2200,
    controls: 1400,
    heatPump: 14500,
    solar: 7500,
    wall: 4500,
    total: 30100,
  };

  // March 28th 2026 SEAI Grant Increases & Bonuses
  const grantOffsets = {
    attic: 2000,
    controls: 1000,
    heatPump: 8000,
    solar: 3000,
    wall: 4000,
    fullRetrofitBonus: 2500,
    solarDiverterBonus: 400,
    comboBonus: 1200,
    total: 22100,
  };

  const netCost = costEstimate.total - grantOffsets.total;

  // 2026 SEAI Mandatory Execution Sequence
  const timeline = [
    { task: '1. Attic Insulation', duration: '1 day', sequence: 1 },
    { task: '2. Smart Heating Controls', duration: '1 day', sequence: 2 },
    {
      task: '3. Air-to-Water Heat Pump Upgrade',
      duration: '3 days',
      sequence: 3,
    },
    { task: '4. Rooftop Solar PV Array', duration: '1 day', sequence: 4 },
  ];

  const materials = [
    '300mm High-Performance Mineral Wool Ceiling Insulation Roll',
    'SEAI 2026 Multi-Zone Smart Thermostat Controller Kit',
    '12kW A+++ Rated Air-to-Water Monobloc Heat Pump Unit',
    '4.2kWp Monocrystalline Solar PV Array (10x panels)',
    '3.6kW Hybrid Solar Inverter & Eddi Solar Diverter',
  ];

  const contractorsNeeded = [
    'SEAI-Registered Insulation Contractor',
    'Certified Heating Controls Technician',
    'SEAI-Registered Heat Pump F-Gas Installer',
    'RECI-Certified Solar PV Electrical Installer',
  ];

  const complianceDocs = [
    'MPRN Proof of Property Ownership',
    'Recent Electricity Utility Bill',
    '2026 SEAI Format BER Assessment Cert',
    'SEAI Registered Contractor Sign-off Sheet',
    'Heat Pump Commissioning Sheet',
    'Solar PV NC6 Grid Connection Form',
  ];

  return {
    plan_id: planId,
    grant_id: grantId,
    user_id: userId,
    createdAt: Date.now(),
    recommendedUpgrades,
    costEstimate,
    grantOffsets,
    netCost,
    berImpact: 'G → A',
    annualSavings: 920,
    deepRetrofitSavings: 1450,
    timeline,
    materials,
    contractorsNeeded,
    complianceDocs,
  };
}
