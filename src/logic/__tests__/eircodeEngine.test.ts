/**
 * src/logic/__tests__/eircodeEngine.test.ts
 *
 * Tests for the Hyper-Local Eircode Engine, BER Jump & Solar Yield Calculators.
 */

import { describe, it, expect } from 'vitest';
import {
  extractEircodeRoutingKey,
  getEircodeRoutingInfo,
  calculateSolarYield,
  calculateBERJump,
  calculateSEAIFinancials,
  executeEircodeAudit,
  EIRCODE_ROUTING_KEYS,
  BER_SCALE,
} from '../eircodeEngine';

describe('Irish Eircode Routing Directory', () => {
  it('extracts routing keys properly from various input formats', () => {
    expect(extractEircodeRoutingKey('V94 X2C9')).toBe('V94');
    expect(extractEircodeRoutingKey('v94x2c9')).toBe('V94');
    expect(extractEircodeRoutingKey('T12')).toBe('T12');
    expect(extractEircodeRoutingKey('D04 A1B2')).toBe('D04');
    expect(extractEircodeRoutingKey('INVALID')).toBe('V94'); // fallback
  });

  it('retrieves detailed routing metadata including Met Éireann solar irradiance', () => {
    const limerick = getEircodeRoutingInfo('V94');
    expect(limerick.county).toBe('Limerick');
    expect(limerick.province).toBe('Munster');
    expect(limerick.annualSolarIrradianceKWhM2).toBe(980);

    const wexford = getEircodeRoutingInfo('Y35');
    expect(wexford.county).toBe('Wexford');
    expect(wexford.annualSolarIrradianceKWhM2).toBe(1100);
    expect(wexford.microclimateFactor).toBeGreaterThan(1.05);

    const galway = getEircodeRoutingInfo('H91');
    expect(galway.county).toBe('Galway');
    expect(galway.province).toBe('Connacht');
    expect(galway.avgWindExposure).toBe('high');
  });
});

describe('Solar PV Yield & Clean Export Guarantee (CEG)', () => {
  it('computes annual solar yield, self-consumption savings, and CEG export revenue', () => {
    const routing = EIRCODE_ROUTING_KEYS.V94;
    const result = calculateSolarYield(4.3, routing, 'south', 35, false);

    expect(result.arraySizeKwp).toBe(4.3);
    expect(result.annualGenerationKWh).toBeGreaterThan(3000);
    expect(result.annualGenerationKWh).toBeLessThan(4500);
    expect(result.selfConsumptionKWh).toBeGreaterThan(0);
    expect(result.gridExportKWh).toBeGreaterThan(0);
    expect(result.annualSelfConsumptionSavingsEUR).toBeGreaterThan(0);
    expect(result.annualExportRevenueEUR).toBeGreaterThan(0);
    expect(result.totalAnnualSolarBenefitEUR).toBe(
      result.annualSelfConsumptionSavingsEUR + result.annualExportRevenueEUR,
    );
    expect(result.co2MitigatedKgPerYear).toBeGreaterThan(1000);
  });

  it('reflects higher self-consumption ratio with battery storage', () => {
    const routing = EIRCODE_ROUTING_KEYS.T12;
    const withoutBattery = calculateSolarYield(
      4.0,
      routing,
      'south',
      35,
      false,
    );
    const withBattery = calculateSolarYield(4.0, routing, 'south', 35, true);

    expect(withBattery.selfConsumptionKWh).toBeGreaterThan(
      withoutBattery.selfConsumptionKWh,
    );
    expect(withBattery.annualSelfConsumptionSavingsEUR).toBeGreaterThan(
      withoutBattery.annualSelfConsumptionSavingsEUR,
    );
  });
});

describe('BER Jump Calculator (SEAI DEAP 4.2)', () => {
  it('calculates significant primary energy drop and BER jump for deep retrofit', () => {
    const jump = calculateBERJump(
      'F',
      130,
      {
        atticInsulation: true,
        cavityWallInsulation: true,
        heatPumpAirToWater: true,
        solarPV: true,
      },
      4.0,
    );

    expect(jump.currentBER).toBe('F');
    // Deep retrofit from F on 8-step scale reaches A0, A, or B
    expect(['A0', 'A', 'B']).toContain(jump.predictedBER);
    expect(jump.predictedPrimaryEnergyKWhM2).toBeLessThan(
      jump.currentPrimaryEnergyKWhM2,
    );
    expect(jump.energyReductionPercentage).toBeGreaterThan(60);
    expect(jump.annualBillSavingsEUR).toBeGreaterThan(1500);
    expect(jump.annualCarbonReductionKg).toBeGreaterThan(2500);
    expect(jump.heatLossIndicatorHLI.qualifiesForHeatPumpGrant).toBe(true);
  });

  it('validates HLI qualification condition', () => {
    const uninsulated = calculateBERJump('G', 150, {});
    expect(uninsulated.heatLossIndicatorHLI.predictedHLI).toBeGreaterThan(2.5);
    expect(uninsulated.heatLossIndicatorHLI.qualifiesForHeatPumpGrant).toBe(
      false,
    );
  });
});

describe('SEAI Grants & Financial Modeling', () => {
  it('calculates grant offsets and payback timeline accurately', () => {
    const financials = calculateSEAIFinancials(
      'semi_detached',
      {
        atticInsulation: true,
        cavityWallInsulation: true,
        heatPumpAirToWater: true,
        solarPV: true,
      },
      4.0,
      2200, // €2,200 annual energy savings
    );

    // 2026 enhanced rates: 1500 (attic) + 1300 (cavity) + 12500 (heat pump bundle) + 350 (advisor) + 2100 (solar) = 17750
    expect(financials.totalGrantOffsetEUR).toBeGreaterThanOrEqual(16000);
    expect(financials.netHomeownerCostEUR).toBeLessThan(
      financials.grossEstimatedCostEUR,
    );
    expect(financials.paybackYears).toBeGreaterThan(0);
    expect(financials.paybackYears).toBeLessThan(12);
  });
});

describe('Comprehensive Eircode Audit & Programmatic SEO Schema', () => {
  it('generates complete audit payload with JSON-LD schema', () => {
    const audit = executeEircodeAudit({
      eircode: 'V94 X2R8',
      propertyType: 'semi_detached',
      floorAreaM2: 125,
      currentBER: 'E1',
      solarKwp: 4.2,
      roofOrientation: 'south',
      roofPitchDegrees: 35,
    });

    expect(audit.routingInfo.county).toBe('Limerick');
    expect(audit.berJump.predictedBER).toBeDefined();
    expect(audit.solarYield.annualGenerationKWh).toBeGreaterThan(3000);
    expect(audit.financials.totalGrantOffsetEUR).toBeGreaterThan(0);
    expect(audit.seoProgrammaticMetadata.suggestedPageTitle).toContain(
      'Limerick',
    );
    expect(audit.seoProgrammaticMetadata.targetKeyword).toBe(
      'solar pv grants limerick v94',
    );
    expect(audit.seoProgrammaticMetadata.schemaJsonLD['@type']).toBe('Service');
    expect(
      audit.seoProgrammaticMetadata.schemaJsonLD.offers.priceCurrency,
    ).toBe('EUR');
  });
});
