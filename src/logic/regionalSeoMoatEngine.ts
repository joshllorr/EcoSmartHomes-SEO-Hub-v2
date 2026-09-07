/**
 * src/logic/regionalSeoMoatEngine.ts
 *
 * Programmatic Regional SEO Moat Engine for EcoSmartHomes SEO Hub
 * Generates programmatic landing pages, localized metadata, Google Rich Results
 * schemas (LocalBusiness, FAQPage, BreadcrumbList), and XML sitemaps
 * across all 26 Republic of Ireland counties and Eircode routing zones.
 */

import {
  IRISH_COUNTIES_DATA,
  IrishCountyInfo,
  getCountyBySlug,
} from '../data/irishCountiesData';
import { globalFreeLlmApiClient } from '../utils/freeLlmApiClient';

export interface RegionalLandingPage {
  slug: string;
  county: string;
  irishName: string;
  province: string;
  eircode: string;
  canonicalUrl: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  contentMarkdown: string;
  wordCount: number;
  readingTimeMins: number;
  jsonLdSchemas: {
    localBusiness: Record<string, any>;
    faqPage: Record<string, any>;
    breadcrumbList: Record<string, any>;
  };
  metrics: {
    monthlySearches: number;
    avgRank: number;
    grantDemand: string;
    registeredContractors: number;
    seaiGrantAllocation: string;
  };
  keyTakeaways: string[];
}

export interface RegionalMoatSummary {
  totalCounties: number;
  totalMonthlySearches: number;
  totalContractors: number;
  provinces: Record<string, number>;
  generatedAt: string;
  pages: RegionalLandingPage[];
}

export class RegionalSeoMoatEngine {
  /**
   * Generates a programmatic landing page for a specific county
   */
  public generateCountyPage(
    slug: string,
    options?: {
      useAi?: boolean;
      customTone?: string;
    },
  ): RegionalLandingPage {
    const county = getCountyBySlug(slug);
    if (!county) {
      throw new Error(`County not found for slug: "${slug}"`);
    }

    const canonicalUrl = `https://ecosmarthomes.ie/counties/${county.slug}`;

    // Meta Title target: 50-60 chars
    const metaTitle =
      `SEAI Grants ${county.county} (${county.eircode}): €12,500 Heat Pump Guide 2026`.slice(
        0,
        65,
      );

    // Meta Description target: 150-160 chars
    const metaDescription =
      `Complete 2026 SEAI grant guide for County ${county.county} (${county.eircode}). Heat pumps up to €12,500, €50k One Stop Shop retrofits & registered assessors.`.slice(
        0,
        160,
      );

    const h1 = `SEAI Home Energy Upgrade Grants in County ${county.county} (${county.eircode})`;

    const keyTakeaways = [
      `Up to €12,500 heat pump funding for ${county.county} homes (Houses) and €9,500 (Apartments).`,
      `One Stop Shop (OSS) deep retrofits grant-funded up to 50% (capped at €50,000).`,
      `Standalone window grants up to €4,000 and attic insulation up to €2,500.`,
      `Simplified 8-tier BER Scale (A0 to G): Target B2 or A0 Zero-Carbon standard.`,
      `Local registered installer network across ${county.majorTowns.slice(0, 3).join(', ')} and ${county.eircode}.`,
    ];

    const contentMarkdown = this.buildMarkdownContent(county, keyTakeaways);
    const wordCount = contentMarkdown.split(/\s+/).filter(Boolean).length;
    const readingTimeMins = Math.ceil(wordCount / 200);

    const jsonLdSchemas = {
      localBusiness: this.buildLocalBusinessSchema(county, canonicalUrl),
      faqPage: this.buildFaqSchema(county),
      breadcrumbList: this.buildBreadcrumbSchema(county, canonicalUrl),
    };

    return {
      slug: county.slug,
      county: county.county,
      irishName: county.irishName,
      province: county.province,
      eircode: county.eircode,
      canonicalUrl,
      metaTitle,
      metaDescription,
      h1,
      contentMarkdown,
      wordCount,
      readingTimeMins,
      jsonLdSchemas,
      metrics: {
        monthlySearches: county.monthlySearches,
        avgRank: county.avgRank,
        grantDemand: county.grantDemand,
        registeredContractors: county.registeredContractors,
        seaiGrantAllocation: county.seaiGrantAllocation,
      },
      keyTakeaways,
    };
  }

  /**
   * Generates landing pages for all 26 Republic of Ireland counties
   */
  public generateAllCountiesMoat(): RegionalMoatSummary {
    const pages = IRISH_COUNTIES_DATA.map((c) =>
      this.generateCountyPage(c.slug),
    );

    const totalMonthlySearches = pages.reduce(
      (sum, p) => sum + p.metrics.monthlySearches,
      0,
    );
    const totalContractors = pages.reduce(
      (sum, p) => sum + p.metrics.registeredContractors,
      0,
    );

    const provinces: Record<string, number> = {
      Munster: 0,
      Leinster: 0,
      Connacht: 0,
      Ulster: 0,
    };
    for (const p of pages) {
      if (provinces[p.province] !== undefined) {
        provinces[p.province]++;
      }
    }

    return {
      totalCounties: pages.length,
      totalMonthlySearches,
      totalContractors,
      provinces,
      generatedAt: new Date().toISOString(),
      pages,
    };
  }

  /**
   * Compiles valid XML Sitemap string for all 26 counties
   */
  public generateRegionalSitemapXml(
    baseUrl = 'https://ecosmarthomes.ie',
  ): string {
    const today = new Date().toISOString().split('T')[0];
    const urls = IRISH_COUNTIES_DATA.map((c) => {
      return `  <url>
    <loc>${baseUrl}/counties/${c.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Programmatic Regional SEO Moat: 26 Republic of Ireland Counties -->
${urls}
</urlset>`;
  }

  /**
   * Builds rich markdown article body tailored to the county
   */
  private buildMarkdownContent(
    county: IrishCountyInfo,
    keyTakeaways: string[],
  ): string {
    const townsList = county.majorTowns.join(', ');
    const faqsList = county.sampleFaqs
      .map((f) => `### ${f.question}\n\n${f.answer}`)
      .join('\n\n');

    return `# SEAI Home Energy Upgrade Grants in County ${county.county} (${county.eircode})
*Also known as Contae ${county.irishName} • Province of ${county.province}*

## Executive Summary: SEAI Budget 2026 for ${county.county} Homeowners
Under the **€558 Million Budget 2026 National Retrofit Allocation**, homeowners across **County ${county.county}** and the **${county.eircode}** Eircode zone can access enhanced grant support to transform cold, draughty properties into energy-efficient, warm homes.

Whether you reside in **${townsList}**, SEAI registered contractors are actively delivering turnkey home retrofits with subsidized capital allowances.

### Key Grant Highlights at a Glance
${keyTakeaways.map((t) => `- **${t.split(':')[0]}**: ${t.split(':')[1] || t}`).join('\n')}

---

## 1. Statutory 2026 Grant Rates for ${county.county}
The Department of the Environment, Climate and Communications has updated statutory caps for all domestic dwellings built before 2011:

| Energy Upgrade Measure | Maximum 2026 SEAI Grant | Typical Homeowner Net Cost |
| :--- | :--- | :--- |
| **Air-to-Water Heat Pump (House)** | **€12,500** | €2,500 – €4,500 |
| **Air-to-Water Heat Pump (Apartment)** | **€9,500** | €1,800 – €3,200 |
| **One Stop Shop (OSS) Deep Retrofit** | **Up to 50% (€50,000 cap)** | Balanced via low-cost green loan |
| **External Wall Insulation** | **€8,000** | Varies by floor area |
| **Cavity Wall Insulation** | **€1,800** (standard) / **€2,300** (welfare) | Often €0 – €400 net |
| **Attic Insulation** | **€2,000** (standard) / **€2,500** (first-time buyer) | €200 – €500 net |
| **Standalone Triple-Glazed Windows** | **€4,000** | Reduced draughts & U-values |
| **External Doors** | **€1,600** (€800/door, max 2) | Factory sealed thermal threshold |
| **Domestic Solar PV Panels** | **€1,800** | Rapid payback via Clean Export |

---

## 2. Local Housing Stock & Climate Resilience in ${county.county}
Every Irish county presents distinct architectural and climatic challenges:

- **Housing Stock Profile**: ${county.housingStock}
- **Regional Climate Considerations**: ${county.climateProfile}
- **Current Average BER Rating**: Baseline **${county.avgBer}**, with a statutory target of **${county.targetBer}** for deep retrofits.

In **County ${county.county}**, applying the **"Fabric First"** methodology is essential: sealing heat leaks through attic and wall insulation before commissioning heat pump compressors ensures maximum seasonal coefficient of performance (SCOP > 3.8).

---

## 3. SEAI Registered Contractor Network across ${county.eircode}
There are currently approximately **${county.registeredContractors} SEAI-registered technical assessors and contractors** operating across ${county.county}.

### Finding Approved Contractors in Your Eircode
1. **Pre-Assessment BER Survey**: A registered BER assessor visits your property in ${townsList} to calculate your Heat Loss Indicator (HLI).
2. **One Stop Shop vs. Individual Grants**: Choose between single-measure grants (where you pay upfront and claim rebate) or a One Stop Shop provider who deducts grant funding off the upfront invoice.
3. **Application Protocol**: All grant applications must be approved by SEAI *prior* to commencing any construction work.

---

## 4. Frequently Asked Questions: ${county.county} Retrofits

${faqsList}

### What is the new simplified 8-tier BER Scale?
Ireland's updated 2026 Building Energy Rating scale simplifies categorization into 8 distinct bands: **A0, A, B, C, D, E, F, and G**. The new **A0 rating** represents Zero-Carbon Ready homes producing on-site renewable energy, while the minimum national deep retrofit target is **B2**.

---

## 5. Next Steps for ${county.county} Homeowners
Ready to boost your BER rating, lower your winter heating bills, and claim up to €50,000 in government grant support?

1. Verify your property address in **${county.eircode}** using the EcoSmartHomes Regional Grant Estimator.
2. Schedule an on-site Home Energy Assessment with an SEAI registered advisor in ${county.majorTowns[0]}.
3. Secure your grant allocation and lock in approved installer pricing for 2026.`;
  }

  /**
   * JSON-LD LocalBusiness / HomeAndConstructionBusiness Schema
   */
  private buildLocalBusinessSchema(
    county: IrishCountyInfo,
    canonicalUrl: string,
  ): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      '@id': `${canonicalUrl}#localbusiness`,
      name: `EcoSmartHomes - ${county.county} SEAI Retrofit & BER Advisors`,
      url: canonicalUrl,
      description: `Official regional SEAI energy upgrade advisor and BER assessment network serving County ${county.county} (${county.eircode}) and surrounding areas.`,
      telephone: '+353 61 900 120',
      priceRange: '€€€',
      address: {
        '@type': 'PostalAddress',
        addressLocality: county.county,
        addressRegion: county.province,
        postalCode: county.eircode,
        addressCountry: 'IE',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: county.coordinates.lat,
        longitude: county.coordinates.lng,
      },
      areaServed: [
        {
          '@type': 'AdministrativeArea',
          name: county.county,
        },
        ...county.majorTowns.map((town) => ({
          '@type': 'City',
          name: town,
        })),
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:30',
          closes: '18:00',
        },
      ],
      knowsAbout: [
        'SEAI Home Energy Grants 2026',
        'Air-to-Water Heat Pumps',
        'One Stop Shop Deep Retrofits',
        'Building Energy Rating (BER) Assessments',
        'External Wall Insulation',
        'Solar PV Microgeneration',
      ],
    };
  }

  /**
   * JSON-LD FAQPage Schema
   */
  private buildFaqSchema(county: IrishCountyInfo): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: county.sampleFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }

  /**
   * JSON-LD BreadcrumbList Schema
   */
  private buildBreadcrumbSchema(
    county: IrishCountyInfo,
    canonicalUrl: string,
  ): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://ecosmarthomes.ie/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Counties',
          item: 'https://ecosmarthomes.ie/counties',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: county.county,
          item: canonicalUrl,
        },
      ],
    };
  }
}

export const globalRegionalSeoMoatEngine = new RegionalSeoMoatEngine();
