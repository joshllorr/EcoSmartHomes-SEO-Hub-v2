/**
 * logic/contractors/matchContractor.ts
 *
 * Phase 28 Contractor Matching Engine
 * Ranks SEAI registered contractors based on trade specialty, region, availability, and rating.
 */

export interface ContractorProfile {
  contractor_id: string;
  name: string;
  type: string[];
  region: string[];
  availability: Record<string, string[]>;
  certifications: string[];
  rating: number;
  jobsCompleted: number;
  contact: {
    phone: string;
    email: string;
  };
}

export interface ContractorMatch {
  contractor_id: string;
  contractor: ContractorProfile;
  score: number;
  reason: string;
}

export const SAMPLE_CONTRACTORS: ContractorProfile[] = [
  {
    contractor_id: 'ctr_2026_08_03_1612',
    name: 'GreenHeat Solutions Ireland',
    type: ['Heat Pump', 'Heating Controls'],
    region: ['Limerick', 'Cork', 'Clare'],
    availability: {
      '2026-08-10': ['09:00', '11:00', '14:00'],
      '2026-08-11': ['10:00', '13:00'],
    },
    certifications: ['SEAI Registered', 'RGI', 'F-Gas Certified'],
    rating: 4.9,
    jobsCompleted: 312,
    contact: {
      phone: '085-987-6543',
      email: 'info@greenheat.ie',
    },
  },
  {
    contractor_id: 'ctr_2026_08_03_1619',
    name: 'EcoSolar & Electric Munster',
    type: ['Solar PV', 'Heating Controls'],
    region: ['Limerick', 'Kerry', 'Tipperary'],
    availability: {
      '2026-08-12': ['09:00', '14:00'],
      '2026-08-13': ['10:00', '15:00'],
    },
    certifications: ['SEAI Registered', 'Safe Electric', 'RECI Certified'],
    rating: 4.8,
    jobsCompleted: 248,
    contact: {
      phone: '087-456-7890',
      email: 'solar@ecosolar.ie',
    },
  },
  {
    contractor_id: 'ctr_2026_08_03_1625',
    name: 'Munster Retrofit & Thermal Insulation',
    type: ['Attic Insulation', 'Wall Insulation'],
    region: ['Limerick', 'Cork', 'Waterford'],
    availability: {
      '2026-08-08': ['08:30', '11:30'],
      '2026-08-09': ['09:00', '13:30'],
    },
    certifications: ['SEAI Registered', 'NSAI Agrement Certified'],
    rating: 4.9,
    jobsCompleted: 410,
    contact: {
      phone: '086-321-6549',
      email: 'quotes@munsterretrofit.ie',
    },
  },
];

import { getContractorScore } from './contractorScoresEngine';

export async function matchContractorWithScores(
  env: any,
  upgradeType: string = 'Heat Pump',
  region: string = 'Limerick',
): Promise<ContractorMatch[]> {
  const matches = await Promise.all(
    SAMPLE_CONTRACTORS.map(async (contractor) => {
      let baseScore = 70;
      const reasons: string[] = [];

      if (contractor.type.includes(upgradeType)) {
        baseScore += 20;
        reasons.push(`${upgradeType} Specialist`);
      }

      if (contractor.region.includes(region)) {
        baseScore += 10;
        reasons.push(`Covers ${region} Region`);
      }

      if (contractor.certifications.includes('SEAI Registered')) {
        baseScore += 5;
        reasons.push('SEAI Certified');
      }

      // Fetch Phase 33 Quality Score
      const scoreRecord = await getContractorScore(
        env,
        contractor.contractor_id,
      );
      const qualityScore = scoreRecord
        ? scoreRecord.score
        : Math.round(contractor.rating * 20);
      reasons.push(`Quality Score: ${qualityScore}/100`);

      const finalScore = Math.min(
        100,
        Math.round(baseScore * 0.5 + qualityScore * 0.5),
      );

      return {
        contractor_id: contractor.contractor_id,
        contractor,
        score: finalScore,
        reason: reasons.join(', '),
      };
    }),
  );

  return matches.sort((a, b) => b.score - a.score);
}

export function matchContractor(
  upgradeType: string = 'Heat Pump',
  region: string = 'Limerick',
): ContractorMatch[] {
  return SAMPLE_CONTRACTORS.map((contractor) => {
    let score = 70;
    const reasons: string[] = [];

    if (contractor.type.includes(upgradeType)) {
      score += 20;
      reasons.push(`${upgradeType} Specialist`);
    }

    if (contractor.region.includes(region)) {
      score += 10;
      reasons.push(`Covers ${region} Region`);
    }

    if (contractor.certifications.includes('SEAI Registered')) {
      score += 5;
      reasons.push('SEAI Certified');
    }

    if (contractor.rating >= 4.8) {
      score += 5;
      reasons.push(`Top Rating (${contractor.rating}★)`);
    }

    return {
      contractor_id: contractor.contractor_id,
      contractor,
      score: Math.min(score, 99),
      reason: reasons.join(', '),
    };
  }).sort((a, b) => b.score - a.score);
}
