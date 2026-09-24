import { describe, it, expect } from 'vitest';
import handler, {
  classifySupplierQuery,
  getLocalSuppliersDataset,
} from '../../api/energy/maps-grounding';

describe('Maps Grounding & Local Supplier Finder Engine', () => {
  describe('classifySupplierQuery', () => {
    it('classifies heat pump queries accurately', () => {
      expect(
        classifySupplierQuery(
          'SEAI registered heat pump contractors in Limerick V94',
        ),
      ).toBe('heat_pump');
      expect(
        classifySupplierQuery('air to water heating systems Castletroy'),
      ).toBe('heat_pump');
    });

    it('classifies insulation queries accurately', () => {
      expect(
        classifySupplierQuery(
          'Cavity wall & attic insulation suppliers in Raheen & Dooradoyle',
        ),
      ).toBe('insulation');
      expect(classifySupplierQuery('external wall insulation grant')).toBe(
        'insulation',
      );
    });

    it('classifies BER assessor queries accurately', () => {
      expect(
        classifySupplierQuery(
          'Registered BER rating assessors Castletroy & Annacotty (V94)',
        ),
      ).toBe('ber_assessor');
      expect(classifySupplierQuery('Technical assessment for heat pump')).toBe(
        'ber_assessor',
      );
    });

    it('classifies builders merchants queries accurately', () => {
      expect(
        classifySupplierQuery(
          'Builders merchants for insulation boards Dock Road Limerick',
        ),
      ).toBe('builders_merchants');
      expect(classifySupplierQuery('hardware trade supplies Limerick')).toBe(
        'builders_merchants',
      );
    });

    it('classifies solar queries accurately', () => {
      expect(classifySupplierQuery('Solar PV panels grant installer')).toBe(
        'solar_pv',
      );
    });

    it('defaults to general Irish retrofit advisory for generic queries', () => {
      expect(classifySupplierQuery('How do I upgrade my house?')).toBe(
        'general',
      );
    });
  });

  describe('getLocalSuppliersDataset', () => {
    it('returns rich content and Google Maps search links for heat pumps', () => {
      const data = getLocalSuppliersDataset('heat_pump', 52.6466, -8.5921);
      expect(data.text).toContain('SEAI Registered Heat Pump Contractors');
      expect(data.text).toContain('€12,500');
      expect(data.sources.length).toBeGreaterThan(0);
      data.sources.forEach((source) => {
        expect(source.title).toBeDefined();
        expect(source.uri).toContain('https://www.google.com/maps/search/');
        expect(source.snippets.length).toBeGreaterThan(0);
      });
    });

    it('returns BER assessors with Annacotty and Castletroy focus', () => {
      const data = getLocalSuppliersDataset('ber_assessor', 52.6466, -8.5921);
      expect(data.text).toContain('SEAI BER Assessors');
      expect(data.text).toContain('8-tier BER framework');
      const titles = data.sources.map((s) => s.title);
      expect(
        titles.some((t) => t.includes('Limerick') || t.includes('Castletroy')),
      ).toBe(true);
    });

    it('returns Dock Road merchants for builders merchants category', () => {
      const data = getLocalSuppliersDataset(
        'builders_merchants',
        52.6466,
        -8.5921,
      );
      expect(data.text).toContain('Dock Road');
      expect(
        data.sources.some(
          (s) => s.title.includes('Dock Road') || s.title.includes('Chadwicks'),
        ),
      ).toBe(true);
    });
  });

  describe('Vercel Serverless Handler (api/energy/maps-grounding)', () => {
    it('handles POST requests successfully with valid JSON body', async () => {
      let statusCode = 0;
      let jsonResponse: any = null;

      const mockReq: any = {
        method: 'POST',
        body: {
          prompt:
            'Registered BER rating assessors Castletroy & Annacotty (V94)',
          latitude: 52.6466,
          longitude: -8.5921,
        },
      };

      const mockRes: any = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(data: any) {
          jsonResponse = data;
          return this;
        },
      };

      await handler(mockReq, mockRes);

      expect(statusCode).toBe(200);
      expect(jsonResponse).toBeDefined();
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.text).toContain('BER Assessors');
      expect(Array.isArray(jsonResponse.sources)).toBe(true);
      expect(jsonResponse.sources.length).toBeGreaterThan(0);
      expect(jsonResponse.sources[0].uri).toContain('google.com/maps');
    });

    it('handles GET requests for diagnostics and health check', async () => {
      let statusCode = 0;
      let jsonResponse: any = null;

      const mockReq: any = {
        method: 'GET',
        query: {
          prompt: 'SEAI registered heat pump contractors in Limerick V94',
        },
      };

      const mockRes: any = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(data: any) {
          jsonResponse = data;
          return this;
        },
      };

      await handler(mockReq, mockRes);

      expect(statusCode).toBe(200);
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.sources.length).toBeGreaterThan(0);
    });
  });
});
