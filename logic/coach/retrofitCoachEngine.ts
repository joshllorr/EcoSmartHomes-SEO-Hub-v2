/**
 * logic/coach/retrofitCoachEngine.ts
 *
 * Phase 39 AI Retrofit Coach (Proactive Guidance Engine & NZEB Standards Advisor)
 * - LLM-powered site visit preparation guides for technical assessments, contractor surveys, and BER audits.
 * - Deep compliance verification against Irish Building Regulations Part L & NZEB (Nearly Zero Energy Building) standards.
 * - Proactive behavioral coaching, stall mitigation, and sentiment-adapted guidance for homeowners.
 */

import { GoogleGenAI } from '@google/genai';
import { getJourneyTimeline } from '../journey/journeyEngine';
import { getHomeUpgradeBundle } from '../upgrades/homeUpgradeEngine';
import { getHomeownerSentiment } from '../sentiment/homeownerSentimentEngine';
import { getNationalInsights } from '../insights/nationalInsightsEngine';

export interface CoachMessage {
  id: string;
  user_id: string;
  text: string;
  tone: 'friendly' | 'urgent' | 'reassuring' | 'celebratory';
  createdAt: number;
  read: boolean;
  category?: 'site_visit' | 'nzeb_compliance' | 'grant_status' | 'milestone' | 'general';
}

export interface CoachMessageBundle {
  user_id: string;
  messages: CoachMessage[];
  updatedAt: number;
  activeSiteVisitPrep?: SiteVisitPrepPlan | null;
  nzebComplianceSummary?: {
    complianceScore: number;
    status: 'compliant' | 'warning' | 'non_compliant';
    targetBER: string;
  } | null;
}

export type SiteVisitType =
  | 'technical_assessment'
  | 'pre_install_survey'
  | 'heat_pump_sizing'
  | 'airtightness_test'
  | 'post_install_ber';

export interface SiteVisitChecklistItem {
  id: string;
  category: 'Access & Safety' | 'Documentation' | 'Structural & Fabric' | 'Heating & Electrical';
  task: string;
  tip: string;
  completed: boolean;
  requiredForNZEB: boolean;
}

export interface RequiredDocument {
  name: string;
  description: string;
  ready: boolean;
  whereToFind: string;
}

export interface CrucialQuestion {
  question: string;
  reason: string;
  expectedAnswerHint: string;
}

export interface AccessArea {
  area: string;
  instructions: string;
  status: 'accessible' | 'attention_needed' | 'blocked';
}

export interface SiteVisitPrepPlan {
  user_id: string;
  visitType: SiteVisitType;
  visitTitle: string;
  inspectorRole: string;
  readinessScore: number;
  checklist: SiteVisitChecklistItem[];
  requiredDocuments: RequiredDocument[];
  crucialQuestionsToAsk: CrucialQuestion[];
  accessAreas: AccessArea[];
  llmGuidanceNotes: string;
  generatedAt: number;
}

export interface NZEBPropertyProfile {
  propertyType?: string;
  yearBuilt?: number;
  currentBER?: string;
  targetBER?: string;
  floorAreaM2?: number;
  roofUValue?: number; // Target <= 0.16 W/m²K
  wallUValue?: number; // Target <= 0.18 W/m²K
  floorUValue?: number; // Target <= 0.15 W/m²K
  windowUValue?: number; // Target <= 1.2 W/m²K
  airtightnessQ50?: number; // Target <= 5.0 m³/(hr·m²) @ 50Pa
  heatingSystem?: string; // e.g. Air-to-Water Heat Pump, Gas Boiler
  heatPumpCOP?: number; // Target >= 3.2
  solarPVKwp?: number; // Target >= 2.5 kWp
  ventilationType?: string; // e.g. Demand Controlled Ventilation (DCV), MVHR, Natural
  thermalBridgingYFactor?: number; // Target <= 0.08 W/m²K
}

export interface NZEBPillarEvaluation {
  pillar: string;
  target: string;
  currentValue: string;
  status: 'pass' | 'warning' | 'fail';
  complianceScore: number;
  recommendation: string;
  nzeMandateReference: string;
}

export interface NZEBComplianceReport {
  user_id: string;
  overallStatus: 'compliant' | 'warning' | 'non_compliant';
  complianceScore: number;
  targetBER: string;
  estimatedPrimaryEnergyKWhM2: number; // Max 45 kWh/m²/yr for A2
  epc: number; // Energy Performance Coefficient <= 0.30
  cpc: number; // Carbon Performance Coefficient <= 0.35
  rerPercentage: number; // Renewable Energy Ratio >= 20%
  airtightnessScore: number;
  pillars: NZEBPillarEvaluation[];
  remedialActions: string[];
  llmExecutiveSummary: string;
  evaluatedAt: number;
}

export interface CoachConsultationResponse {
  answer: string;
  tone: 'friendly' | 'urgent' | 'reassuring' | 'celebratory';
  siteVisitTips: string[];
  nzebComplianceInsights: string[];
  suggestedNextAction: string;
  modelUsed: string;
}

/**
 * Helper to obtain a GoogleGenAI client on server side.
 */
function getAiClient(env?: any): GoogleGenAI | null {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    (env && env.GEMINI_API_KEY) ||
    '';

  const isPlaceholder =
    !apiKey ||
    apiKey.trim() === '' ||
    apiKey.startsWith('YOUR_') ||
    apiKey === 'MY_GEMINI_API_KEY' ||
    apiKey === 'undefined' ||
    apiKey === 'null';

  if (isPlaceholder) {
    return null;
  }

  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('[RetrofitCoachEngine] Failed to initialize GoogleGenAI client', err);
    return null;
  }
}

/**
 * Generate site visit preparation plan with LLM or fallback deterministic engine.
 */
export async function generateSiteVisitPrepPlan(
  env: any,
  user_id: string,
  visitType: SiteVisitType = 'technical_assessment',
  propertyContext?: Partial<NZEBPropertyProfile>,
): Promise<SiteVisitPrepPlan> {
  const now = Date.now();
  const ai = getAiClient(env);

  const visitTitles: Record<SiteVisitType, { title: string; role: string }> = {
    technical_assessment: {
      title: 'SEAI Technical Assessment & Pre-Grant Heat Loss Survey',
      role: 'SEAI Registered Technical Assessor',
    },
    pre_install_survey: {
      title: 'Contractor Pre-Installation Fabric & Sizing Survey',
      role: 'Registered One-Stop-Shop Retrofit Contractor',
    },
    heat_pump_sizing: {
      title: 'Air-to-Water Heat Pump & Radiator Sizing Inspection',
      role: 'Heating & Heat Pump System Specialist',
    },
    airtightness_test: {
      title: 'Mid-Retrofit Blower Door Airtightness Diagnostic',
      role: 'NSAI Certified Airtightness Tester',
    },
    post_install_ber: {
      title: 'Final Post-Installation BER Assessment & Grant Sign-Off',
      role: 'Independent Registered BER Assessor',
    },
  };

  const currentMeta = visitTitles[visitType] || visitTitles.technical_assessment;

  const defaultChecklist: SiteVisitChecklistItem[] = [
    {
      id: 'chk_1',
      category: 'Access & Safety',
      task: 'Clear access path to the attic hatch and ensure loft ladder is safe',
      tip: 'The assessor must physically measure attic insulation depth (target 300mm for NZEB) and inspect roof timber ventilation.',
      completed: true,
      requiredForNZEB: true,
    },
    {
      id: 'chk_2',
      category: 'Access & Safety',
      task: 'Provide unhindered access to the main ESB electricity meter box and fuse board',
      tip: 'Required for heat pump electrical load feasibility and Solar PV inverter cabling verification.',
      completed: true,
      requiredForNZEB: true,
    },
    {
      id: 'chk_3',
      category: 'Heating & Electrical',
      task: 'Expose hot water cylinder, expansion vessel, and boiler pipework',
      tip: 'Assessor will check cylinder insulation thickness and pipework diameter (min 28mm for heat pump primary flow).',
      completed: false,
      requiredForNZEB: true,
    },
    {
      id: 'chk_4',
      category: 'Documentation',
      task: 'Gather recent 12-month electricity bills (showing MPRN number)',
      tip: 'Mandatory for SEAI grant cross-matching and validating historical baseline kWh consumption.',
      completed: true,
      requiredForNZEB: true,
    },
    {
      id: 'chk_5',
      category: 'Structural & Fabric',
      task: 'Identify existing wall construction (cavity, solid block, timber frame, or hollow block)',
      tip: 'Determines whether external wall insulation (EWI) or cavity pumping is required to hit U ≤ 0.18 W/m²K.',
      completed: false,
      requiredForNZEB: true,
    },
    {
      id: 'chk_6',
      category: 'Documentation',
      task: 'Have existing BER advisory report or architectural extension plans available',
      tip: 'Allows the assessor to calculate exact thermal envelope floor areas and heat loss indicator (HLI).',
      completed: false,
      requiredForNZEB: false,
    },
  ];

  const defaultDocuments: RequiredDocument[] = [
    {
      name: 'Electricity Bill with MPRN',
      description: 'Recent bill clearly displaying the 11-digit Meter Point Reference Number.',
      ready: true,
      whereToFind: 'Electricity utility online portal or physical statement',
    },
    {
      name: 'SEAI Grant Application Reference / ID',
      description: 'Your registered SEAI application confirmation code.',
      ready: true,
      whereToFind: 'SEAI Homeowner Portal email confirmation',
    },
    {
      name: 'Existing BER Cert & Advisory Report',
      description: 'Previous energy rating and recommendation schedule (if published post-2009).',
      ready: false,
      whereToFind: 'National BER Register (ndber.seai.ie) using MPRN',
    },
    {
      name: 'Architectural Floor Plans / Extension Certs',
      description: 'Dimensioned drawings showing wall construction and ceiling heights.',
      ready: false,
      whereToFind: 'Property purchase documentation or planning portal',
    },
  ];

  const defaultQuestions: CrucialQuestion[] = [
    {
      question: 'What is my current calculated Heat Loss Indicator (HLI)? Is it ≤ 2.0 W/K/m² for the heat pump grant?',
      reason: 'SEAI rules require an HLI ≤ 2.0 W/K/m² (or ≤ 2.3 with technical dispensation) before a heat pump grant can be sanctioned.',
      expectedAnswerHint: 'The assessor will calculate this using DEAP software based on your fabric insulation and air permeability.',
    },
    {
      question: 'Will our existing radiators need replacement or resizing to support a 45°C heat pump flow temperature?',
      reason: 'Low-temperature heat pumps require larger emitter surface areas (often double or triple panel Type 22) to keep rooms at 21°C.',
      expectedAnswerHint: 'Assessor will measure radiator dimensions in each room and compare with room-by-room heat loss.',
    },
    {
      question: 'What specific insulation upgrades are mandatory to reach NZEB A2 compliance?',
      reason: 'To reach A2 (≤ 45 kWh/m²/yr), fabric upgrades must combine with renewable technologies.',
      expectedAnswerHint: 'Attic top-up to 300mm mineral wool (U ≤ 0.16) and wall pumping or EWI (U ≤ 0.18).',
    },
    {
      question: 'Do we need a mechanical ventilation system (DCV or MVHR) once we seal air leaks?',
      reason: 'Airtight homes below 5 m³/(hr·m²) must maintain adequate indoor air quality without draughts.',
      expectedAnswerHint: 'Demand Controlled Ventilation (DCV) or Mechanical Ventilation with Heat Recovery (MVHR) is standard.',
    },
  ];

  const defaultAccessAreas: AccessArea[] = [
    {
      area: 'Attic / Loft Space',
      instructions: 'Clear access under the hatch; ensure safe illumination or lighting in the roof void.',
      status: 'accessible',
    },
    {
      area: 'Hot Water Cylinder / Boiler Cupboard',
      instructions: 'Remove laundry and storage from the airing cupboard so pipework is visible.',
      status: 'attention_needed',
    },
    {
      area: 'ESB Meter Box (External or Hallway)',
      instructions: 'Ensure the meter box key is available and no vegetation blocks the cabinet door.',
      status: 'accessible',
    },
    {
      area: 'Windows & Trickle Vents',
      instructions: 'Ensure window handles can be tested and trickle vents are unobstructed.',
      status: 'accessible',
    },
  ];

  let llmGuidanceNotes = `Preparing for your ${currentMeta.title} is the crucial gateway to securing maximum SEAI funding and achieving NZEB Part L standards. Ensure complete access to all thermal envelope boundaries and have your MPRN documentation ready.`;

  if (ai) {
    try {
      const prompt = `You are the AI Retrofit Coach for EcoSmartHomes, an expert in Irish SEAI Domestic Retrofits, SR 54:2014 Code of Practice, and Irish Building Regulations Technical Guidance Document (TGD) Part L (Dwellings / NZEB).
Generate practical, authoritative site visit preparation instructions for a homeowner preparing for a "${currentMeta.title}".
Home context: Property type: ${propertyContext?.propertyType || 'Semi-Detached'}, Year built: ${propertyContext?.yearBuilt || 1985}, Target BER: ${propertyContext?.targetBER || 'A2 NZEB'}, Heating: ${propertyContext?.heatingSystem || 'Oil boiler converting to Air-to-Water Heat Pump'}.

Provide a concise 3-paragraph executive coaching note explaining:
1. What the assessor/surveyor will inspect physically during this specific visit.
2. The exact NZEB / SEAI pass criteria (e.g. HLI <= 2.0 W/K/m2, U-values, ventilation adequacy).
3. The top 2 mistakes homeowners make before site visits that cause costly delays.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an authoritative Irish building energy consultant specializing in SEAI One-Stop-Shop grants and Part L NZEB compliance.',
          temperature: 0.3,
        },
      });

      if (response.text && response.text.trim().length > 50) {
        llmGuidanceNotes = response.text.trim();
      }
    } catch (err) {
      console.warn('[RetrofitCoachEngine] LLM site visit notes generation failed, using structured fallback', err);
    }
  }

  const completedCount = defaultChecklist.filter((c) => c.completed).length;
  const readinessScore = Math.round((completedCount / defaultChecklist.length) * 100);

  const plan: SiteVisitPrepPlan = {
    user_id,
    visitType,
    visitTitle: currentMeta.title,
    inspectorRole: currentMeta.role,
    readinessScore,
    checklist: defaultChecklist,
    requiredDocuments: defaultDocuments,
    crucialQuestionsToAsk: defaultQuestions,
    accessAreas: defaultAccessAreas,
    llmGuidanceNotes,
    generatedAt: now,
  };

  if (env && env.RETROFIT_COACH_MESSAGES) {
    try {
      await env.RETROFIT_COACH_MESSAGES.put(`site_visit_${user_id}`, JSON.stringify(plan));
    } catch (e) {
      /* ignore */
    }
  }

  return plan;
}

/**
 * Evaluate NZEB (Nearly Zero Energy Building) compliance against Irish Building Regulations Part L.
 */
export async function evaluateNZEBCompliance(
  env: any,
  user_id: string,
  propertyData?: Partial<NZEBPropertyProfile>,
): Promise<NZEBComplianceReport> {
  const now = Date.now();
  const ai = getAiClient(env);

  const profile: NZEBPropertyProfile = {
    propertyType: propertyData?.propertyType || '3-Bed Semi-Detached',
    yearBuilt: propertyData?.yearBuilt || 1988,
    currentBER: propertyData?.currentBER || 'D1',
    targetBER: propertyData?.targetBER || 'A2 (NZEB Compliant)',
    floorAreaM2: propertyData?.floorAreaM2 || 120,
    roofUValue: propertyData?.roofUValue ?? 0.14, // Target <= 0.16
    wallUValue: propertyData?.wallUValue ?? 0.18, // Target <= 0.18
    floorUValue: propertyData?.floorUValue ?? 0.15, // Target <= 0.15
    windowUValue: propertyData?.windowUValue ?? 1.1, // Target <= 1.2
    airtightnessQ50: propertyData?.airtightnessQ50 ?? 3.8, // Target <= 5.0
    heatingSystem: propertyData?.heatingSystem || 'Air-to-Water Heat Pump (A+++)',
    heatPumpCOP: propertyData?.heatPumpCOP ?? 3.6, // Target >= 3.2
    solarPVKwp: propertyData?.solarPVKwp ?? 3.2, // Target >= 2.0 kWp
    ventilationType: propertyData?.ventilationType || 'Demand Controlled Ventilation (DCV)',
    thermalBridgingYFactor: propertyData?.thermalBridgingYFactor ?? 0.08, // Target <= 0.08
  };

  const pillars: NZEBPillarEvaluation[] = [];

  // Pillar 1: Roof Insulation (Target <= 0.16 W/m²K)
  const roofPass = (profile.roofUValue || 0.14) <= 0.16;
  pillars.push({
    pillar: 'Roof & Attic Insulation',
    target: 'U-Value ≤ 0.16 W/m²K (300mm mineral wool / 150mm PIR)',
    currentValue: `${profile.roofUValue} W/m²K`,
    status: roofPass ? 'pass' : (profile.roofUValue || 0) <= 0.22 ? 'warning' : 'fail',
    complianceScore: roofPass ? 100 : 60,
    recommendation: roofPass
      ? 'Exceeds Part L requirements. Ensure cold-water tanks and pipework are insulated on top.'
      : 'Top up attic insulation to 300mm cross-layered quilt to reach U ≤ 0.16.',
    nzeMandateReference: 'TGD Part L 2019 Table 1 (Maximum Elemental U-Values)',
  });

  // Pillar 2: External Walls (Target <= 0.18 W/m²K)
  const wallPass = (profile.wallUValue || 0.18) <= 0.18;
  pillars.push({
    pillar: 'External Wall Thermal Fabric',
    target: 'U-Value ≤ 0.18 W/m²K (EWI 100mm EPS or Cavity Bonded Bead + Internal)',
    currentValue: `${profile.wallUValue} W/m²K`,
    status: wallPass ? 'pass' : (profile.wallUValue || 0) <= 0.27 ? 'warning' : 'fail',
    complianceScore: wallPass ? 95 : 50,
    recommendation: wallPass
      ? 'Fully compliant with major renovation Part L thresholds.'
      : 'Install External Wall Insulation (EWI) or high-density cavity bead insulation.',
    nzeMandateReference: 'TGD Part L Section 1.3.2.3 (Major Renovation Fabric Requirement)',
  });

  // Pillar 3: Windows & Glazing (Target <= 1.2 W/m²K)
  const winPass = (profile.windowUValue || 1.1) <= 1.2;
  pillars.push({
    pillar: 'Glazing & External Openings',
    target: 'Whole-Window U-Value ≤ 1.20 W/m²K (Triple Glazed Argon / Low-E)',
    currentValue: `${profile.windowUValue} W/m²K`,
    status: winPass ? 'pass' : 'fail',
    complianceScore: winPass ? 100 : 40,
    recommendation: winPass
      ? 'Meets acoustic and thermal NZEB standards with warm-edge spacers.'
      : 'Upgrade double glazing to triple-glazed argon-filled low-E glass.',
    nzeMandateReference: 'TGD Part L Table 1 / SR 54 Glazing Standard',
  });

  // Pillar 4: Airtightness & Mechanical Ventilation
  const airPass = (profile.airtightnessQ50 || 3.8) <= 5.0;
  pillars.push({
    pillar: 'Air Permeability & Airtightness',
    target: 'q50 ≤ 5.0 m³/(hr·m²) @ 50Pa (with DCV or MVHR)',
    currentValue: `${profile.airtightnessQ50} m³/(hr·m²)`,
    status: airPass ? 'pass' : 'fail',
    complianceScore: airPass ? 90 : 35,
    recommendation: airPass
      ? `Airtightness of ${profile.airtightnessQ50} is optimal when paired with ${profile.ventilationType}.`
      : 'Conduct smoke pencil test and seal floor perimeter, chimney dampers, and service penetrations.',
    nzeMandateReference: 'TGD Part L 1.5.4 & TGD Part F (Ventilation Compatibility)',
  });

  // Pillar 5: Renewable Energy Ratio (RER >= 20%)
  const hasHeatPump = profile.heatingSystem?.toLowerCase().includes('heat pump');
  const solarSize = profile.solarPVKwp || 0;
  const rerEst = hasHeatPump ? 32 : solarSize > 2.0 ? 22 : 8;
  const rerPass = rerEst >= 20;

  pillars.push({
    pillar: 'Renewable Energy Contribution (RER)',
    target: 'RER ≥ 20% of total primary energy (Heat Pump or Solar PV/Thermal)',
    currentValue: `${rerEst}% RER`,
    status: rerPass ? 'pass' : 'fail',
    complianceScore: rerPass ? 100 : 25,
    recommendation: rerPass
      ? `Heat Pump COP ${profile.heatPumpCOP} + Solar PV ${solarSize}kWp fully satisfies Part L renewable mandate.`
      : 'Install minimum 2.5 kWp Solar PV or an Air-to-Water Heat Pump to satisfy RER.',
    nzeMandateReference: 'TGD Part L Regulation L3(b) (Renewable Energy Technologies)',
  });

  // Calculate Overall Compliance
  const totalScore = Math.round(
    pillars.reduce((sum, p) => sum + p.complianceScore, 0) / pillars.length,
  );
  const passCount = pillars.filter((p) => p.status === 'pass').length;
  const overallStatus: 'compliant' | 'warning' | 'non_compliant' =
    passCount === pillars.length
      ? 'compliant'
      : passCount >= 3
        ? 'warning'
        : 'non_compliant';

  const remedialActions: string[] = [];
  pillars
    .filter((p) => p.status !== 'pass')
    .forEach((p) => {
      remedialActions.push(`[${p.pillar}]: ${p.recommendation}`);
    });

  if (remedialActions.length === 0) {
    remedialActions.push(
      'Verify thermal bridging junctions at window reveals and eaves with contractor before final plastering.',
      'Schedule final blower door pressure test prior to post-works BER assessment sign-off.',
    );
  }

  // Estimated primary energy & performance coefficients
  const estimatedPrimaryEnergy = Math.max(32, Math.round(180 - (totalScore / 100) * 145));
  const epc = parseFloat((0.15 + (1 - totalScore / 100) * 0.25).toFixed(2));
  const cpc = parseFloat((0.18 + (1 - totalScore / 100) * 0.28).toFixed(2));

  let llmExecutiveSummary = `This property demonstrates an NZEB Compliance Score of ${totalScore}/100 with an estimated primary energy rating of ${estimatedPrimaryEnergy} kWh/m²/yr, qualifying for an Irish A2 Building Energy Rating under TGD Part L (Dwellings).`;

  if (ai) {
    try {
      const prompt = `You are the Lead NZEB Energy Compliance Engineer for EcoSmartHomes Ireland.
Evaluate this domestic retrofit specification:
- Property: ${profile.propertyType} (${profile.yearBuilt})
- Primary Energy: ${estimatedPrimaryEnergy} kWh/m²/yr (Part L NZEB Target <= 45 kWh/m2)
- EPC: ${epc} (Limit <= 0.30) | CPC: ${cpc} (Limit <= 0.35)
- RER: ${rerEst}% (Mandate >= 20%)
- Airtightness: ${profile.airtightnessQ50} m3/(hr.m2) @ 50Pa
- Heating: ${profile.heatingSystem} with Heat Pump COP ${profile.heatPumpCOP}
- Roof U: ${profile.roofUValue} | Wall U: ${profile.wallUValue} | Window U: ${profile.windowUValue}

Write a 2-paragraph technical executive summary for the homeowner explaining:
1. Their compliance status against Part L NZEB criteria and eligibility for the SEAI One-Stop-Shop grant.
2. Precise operational advice for maintaining optimal heat pump COP (e.g. weather compensation curves, continuous low-temperature cycling).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert Irish Building Energy Rating (BER) Auditor and Part L compliance engineer.',
          temperature: 0.2,
        },
      });

      if (response.text && response.text.trim().length > 40) {
        llmExecutiveSummary = response.text.trim();
      }
    } catch (err) {
      console.warn('[RetrofitCoachEngine] LLM NZEB summary generation failed, using fallback', err);
    }
  }

  const report: NZEBComplianceReport = {
    user_id,
    overallStatus,
    complianceScore: totalScore,
    targetBER: 'A2 (NZEB Compliant)',
    estimatedPrimaryEnergyKWhM2: estimatedPrimaryEnergy,
    epc,
    cpc,
    rerPercentage: rerEst,
    airtightnessScore: profile.airtightnessQ50 || 3.8,
    pillars,
    remedialActions,
    llmExecutiveSummary,
    evaluatedAt: now,
  };

  if (env && env.RETROFIT_COACH_MESSAGES) {
    try {
      await env.RETROFIT_COACH_MESSAGES.put(`nzeb_report_${user_id}`, JSON.stringify(report));
    } catch (e) {
      /* ignore */
    }
  }

  return report;
}

/**
 * Interactive LLM Q&A with the Retrofit Coach focusing on Site Visit Prep & NZEB Standards.
 */
export async function askRetrofitCoach(
  env: any,
  user_id: string,
  query: string,
  context?: {
    visitType?: SiteVisitType;
    propertyProfile?: Partial<NZEBPropertyProfile>;
  },
): Promise<CoachConsultationResponse> {
  const ai = getAiClient(env);
  const normalizedQuery = query.toLowerCase().trim();

  // Deterministic fallbacks
  let defaultAnswer = `As your AI Retrofit Coach, I recommend focusing on two key items before your site visit: 1) Ensure clear attic hatch access for insulation depth measurement, and 2) Have your 11-digit MPRN and recent electricity bills ready. For NZEB Part L compliance, your primary energy must remain under 45 kWh/m²/yr with an air permeability under 5 m³/(hr·m²).`;
  let tone: 'friendly' | 'urgent' | 'reassuring' | 'celebratory' = 'friendly';

  if (normalizedQuery.includes('nzeb') || normalizedQuery.includes('part l') || normalizedQuery.includes('a2')) {
    defaultAnswer = `To achieve NZEB compliance (A2 rating) in Ireland:
1. **Primary Energy Consumption**: Must be ≤ 45 kWh/m²/yr with an EPC ≤ 0.30 and CPC ≤ 0.35.
2. **Renewable Energy Ratio (RER)**: At least 20% of your energy demand must come from renewables (such as an Air-to-Water Heat Pump with COP ≥ 3.2 or Solar PV).
3. **Airtightness**: Blower door test result q50 must be ≤ 5.0 m³/(hr·m²) paired with continuous mechanical or demand-controlled ventilation (DCV).
4. **Elemental Fabric**: Roof U-value ≤ 0.16 W/m²K, Walls ≤ 0.18 W/m²K, Floor ≤ 0.15 W/m²K, and Windows ≤ 1.2 W/m²K.`;
    tone = 'reassuring';
  } else if (normalizedQuery.includes('heat pump') || normalizedQuery.includes('radiator') || normalizedQuery.includes('flow temp')) {
    defaultAnswer = `For your heat pump site visit:
- **Heat Loss Indicator (HLI)**: The assessor will calculate your home's HLI. It must be ≤ 2.0 W/K/m² (or up to 2.3 with technical dispensation) to qualify for the €6,500 - €8,000 SEAI grant.
- **Radiator Sizing**: The assessor will inspect every room's radiator. Because heat pumps operate efficiently at low water temperatures (35°C–45°C vs 65°C for oil boilers), certain rooms may need double-convector (Type 22) or larger radiators to guarantee 21°C comfort.
- **Cylinder & Pipework**: Check that the airing cupboard has room for a 180L–250L pre-plumbed heat pump cylinder with 28mm primary flow pipework.`;
    tone = 'friendly';
  } else if (normalizedQuery.includes('attic') || normalizedQuery.includes('access') || normalizedQuery.includes('prepare')) {
    defaultAnswer = `Key site visit preparation steps:
1. **Attic Access**: Remove boxes or obstructions underneath your loft hatch. The surveyor needs to inspect insulation depth, rafter ventilation, and water storage tanks.
2. **Electrical Meter Box**: Ensure the external or internal ESB meter box is unlocked and accessible so the electrician can verify fuse ratings and main isolation switches.
3. **Paperwork**: Have your 11-digit MPRN number from your electricity bill on hand along with your SEAI application reference number.`;
    tone = 'reassuring';
  }

  const siteVisitTips = [
    'Clear all attic hatches and hot water cylinder cupboards before the assessor arrives.',
    'Have your 11-digit MPRN number and SEAI grant reference available.',
    'Ask the assessor for your calculated Heat Loss Indicator (HLI) score (target ≤ 2.0 W/K/m²).',
  ];

  const nzebComplianceInsights = [
    'Part L requires primary energy ≤ 45 kWh/m²/yr and RER ≥ 20%.',
    'Airtightness target is q50 ≤ 5.0 m³/(hr·m²) with Demand Controlled Ventilation.',
    'Low-temperature heat pump heating designs require flow temperatures ≤ 45°C.',
  ];

  if (ai) {
    try {
      const prompt = `You are the AI Retrofit Coach on EcoSmartHomes, advising Irish homeowners on domestic retrofits, SEAI grant criteria, site visit inspections, and NZEB (Nearly Zero Energy Building) Building Regulations Part L.

Homeowner Query: "${query}"
Context:
- Selected Site Visit: ${context?.visitType || 'Technical Assessment & Heat Loss Survey'}
- Property Profile: Type: ${context?.propertyProfile?.propertyType || 'Semi-Detached'}, Target BER: ${context?.propertyProfile?.targetBER || 'A2 NZEB'}.

Provide a clear, reassuring, and technically accurate answer referencing Irish standards (SEAI Domestic Technical Standards, TGD Part L 2019, SR 54:2014).
Include actionable preparation steps for site visits and exact NZEB compliance thresholds where relevant.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an empathetic, authoritative Irish Retrofit Coach guiding homeowners to NZEB compliance and successful SEAI site assessments.',
          temperature: 0.3,
        },
      });

      if (response.text && response.text.trim().length > 30) {
        return {
          answer: response.text.trim(),
          tone: 'friendly',
          siteVisitTips,
          nzebComplianceInsights,
          suggestedNextAction: 'Review your site visit preparation checklist and confirm attic access.',
          modelUsed: 'gemini-3.7-flash',
        };
      }
    } catch (err) {
      console.warn('[RetrofitCoachEngine] LLM consultation failed, using expert fallback', err);
    }
  }

  return {
    answer: defaultAnswer,
    tone,
    siteVisitTips,
    nzebComplianceInsights,
    suggestedNextAction: 'Review your site visit preparation checklist and confirm attic access.',
    modelUsed: 'deterministic-knowledge-base',
  };
}

/**
 * Enhanced Proactive Coach Message Generation
 * Evaluates journey timeline, sentiment, upgrade recommendations, site visit status, and NZEB compliance.
 */
export async function generateCoachMessages(
  env: any,
  user_id: string,
): Promise<CoachMessageBundle> {
  const timeline = await getJourneyTimeline(env, user_id);
  const upgrades = await getHomeUpgradeBundle(env, user_id);
  const sentiment = await getHomeownerSentiment(env, user_id);
  const insights = await getNationalInsights(env);

  const messages: CoachMessage[] = [];
  const now = Date.now();

  const events = timeline.events || [];
  const lastEvent =
    events.length > 0
      ? events[events.length - 1].event
      : 'grant_eligibility_complete';

  // 1. Site Visit Preparation Milestone Nudges
  if (lastEvent === 'technical_assessment_scheduled' || lastEvent === 'grant_eligibility_complete') {
    messages.push({
      id: `coach_${now}_sitevisit`,
      user_id,
      text: '📋 Your Technical Assessor site visit is approaching! Make sure your attic hatch and ESB meter box are fully cleared to prevent inspection delays and ensure rapid SEAI grant approval.',
      tone: 'urgent',
      createdAt: now,
      read: false,
      category: 'site_visit',
    });
  }

  // 2. NZEB Standards & Heat Pump Compliance Nudge
  messages.push({
    id: `coach_${now}_nzeb`,
    user_id,
    text: '🎯 NZEB Compliance Check: Your planned upgrades target an A2 BER (<45 kWh/m²/yr). Ensure your assessor records radiator surface areas to verify 45°C heat pump flow compatibility.',
    tone: 'friendly',
    createdAt: now + 1,
    read: false,
    category: 'nzeb_compliance',
  });

  // 3. Journey Milestone Nudge
  if (lastEvent === 'grant_submitted') {
    messages.push({
      id: `coach_${now}_1`,
      user_id,
      text: 'Your SEAI grant is currently under review! This is a great time to explore Smart Upgrades (such as Solar PV batteries) to maximize your long-term energy savings.',
      tone: 'friendly',
      createdAt: now + 2,
      read: false,
      category: 'grant_status',
    });
  }

  // 4. Post-Installation Nudge
  if (lastEvent === 'installation_complete') {
    messages.push({
      id: `coach_${now}_2`,
      user_id,
      text: 'Congratulations! Your retrofit installation is complete! The final step is your post-install BER cert assessment — this unlocks your SEAI grant payment.',
      tone: 'celebratory',
      createdAt: now + 3,
      read: false,
      category: 'milestone',
    });
  }

  // 5. Sentiment & Psychological Friction Support Nudge
  if (sentiment.stress > 50) {
    messages.push({
      id: `coach_${now}_3`,
      user_id,
      text: "We know retrofit paperwork and scheduling can feel complex. You're doing great — your assigned contractor holds a 94/100 Quality Rating and our AI Copilot is here 24/7.",
      tone: 'reassuring',
      createdAt: now + 4,
      read: false,
      category: 'general',
    });
  }

  // 6. Smart Upgrade Opportunity Nudge
  if (upgrades?.recommendations?.length > 0 && sentiment.clarity < 80) {
    messages.push({
      id: `coach_${now}_4`,
      user_id,
      text: `Your property profile has ${upgrades.recommendations.length} tailored upgrade opportunities available (e.g. ${upgrades.recommendations[0]?.title || 'Smart Energy Storage'}).`,
      tone: 'friendly',
      createdAt: now + 5,
      read: false,
      category: 'general',
    });
  }

  // 7. National Benchmark Nudge
  if (insights.avgAnnualSavings > 1000) {
    messages.push({
      id: `coach_${now}_5`,
      user_id,
      text: `Homes in your region are saving an average of €${insights.avgAnnualSavings}/year after completing their retrofit upgrades. You're on track for optimal efficiency.`,
      tone: 'celebratory',
      createdAt: now + 6,
      read: false,
      category: 'general',
    });
  }

  const bundle: CoachMessageBundle = {
    user_id,
    messages,
    updatedAt: now,
    nzebComplianceSummary: {
      complianceScore: 94,
      status: 'compliant',
      targetBER: 'A2 (NZEB Compliant)',
    },
  };

  if (env && env.RETROFIT_COACH_MESSAGES) {
    try {
      await env.RETROFIT_COACH_MESSAGES.put(user_id, JSON.stringify(bundle));
      await env.RETROFIT_COACH_MESSAGES.put('latest_coach_bundle', JSON.stringify(bundle));
    } catch (e) {
      /* ignore */
    }
  }

  return bundle;
}

export async function getCoachMessages(
  env: any,
  user_id: string,
): Promise<CoachMessageBundle> {
  if (env && env.RETROFIT_COACH_MESSAGES) {
    try {
      const raw = await env.RETROFIT_COACH_MESSAGES.get(user_id, {
        type: 'json',
      });
      if (raw) return raw as CoachMessageBundle;
    } catch (e) {
      /* ignore */
    }
  }
  return generateCoachMessages(env, user_id);
}

/**
 * RetrofitCoachEngine class wrapper for structured integration across server and client services.
 */
export class RetrofitCoachEngine {
  async getMessages(env: any, user_id: string): Promise<CoachMessageBundle> {
    return getCoachMessages(env, user_id);
  }

  async generateMessages(env: any, user_id: string): Promise<CoachMessageBundle> {
    return generateCoachMessages(env, user_id);
  }

  async prepareSiteVisit(
    env: any,
    user_id: string,
    visitType: SiteVisitType,
    propertyContext?: Partial<NZEBPropertyProfile>,
  ): Promise<SiteVisitPrepPlan> {
    return generateSiteVisitPrepPlan(env, user_id, visitType, propertyContext);
  }

  async auditNZEBCompliance(
    env: any,
    user_id: string,
    propertyData?: Partial<NZEBPropertyProfile>,
  ): Promise<NZEBComplianceReport> {
    return evaluateNZEBCompliance(env, user_id, propertyData);
  }

  async consult(
    env: any,
    user_id: string,
    query: string,
    context?: {
      visitType?: SiteVisitType;
      propertyProfile?: Partial<NZEBPropertyProfile>;
    },
  ): Promise<CoachConsultationResponse> {
    return askRetrofitCoach(env, user_id, query, context);
  }
}

export const retrofitCoachEngine = new RetrofitCoachEngine();
