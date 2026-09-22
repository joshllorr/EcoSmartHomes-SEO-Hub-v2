import type { VercelRequest, VercelResponse } from '@vercel/node';
import { globalEditorialWarRoomEngine } from '../../src/logic/editorialWarRoomEngine';

export function generateFallbackArticle(params: {
  title: string;
  topic?: string;
  pillar?: string;
  keywords?: string[];
  tone?: string;
  audience?: string;
  length?: string;
}) {
  const { title, topic, pillar, keywords, tone, audience, length } = params;
  const slug = (title || 'article')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const selectedTone = tone || 'Authoritative, Reassuring & Clear';
  const selectedAudience = audience || 'Irish homeowners';
  const selectedLength = length || 'medium';

  const metaDesc =
    `Complete guide to ${title}. Learn about 2026 SEAI grants up to €12,500 for heat pumps, €50,000 for One Stop Shop deep retrofits, and the simplified BER scale.`.substring(
      0,
      158,
    );

  const intro = `Upgrading your home's energy efficiency is the most strategic investment an Irish homeowner can make in 2026. Backed by a record **€558 million Government allocation in Budget 2026** targeting **70,000 homes**, the Sustainable Energy Authority of Ireland (SEAI) has restructured grant allocations and simplified the national building energy rating framework. Under the **${pillar || 'SEAI Home Energy Upgrade Grants 2026'}** program, homeowners can access up to **€12,500** for heat pumps, standalone grants for windows and doors, and up to **€50,000** for complete One Stop Shop deep retrofits. This authoritative guide provides comprehensive clarity on the new 8-tier BER scale (A0–G), updated grant thresholds, and how an accredited EcoSmartHomes retrofit advisor manages full compliance and application end-to-end.`;

  const section1 = `## 1. The New Simplified BER Scale (A0, A, B, C, D, E, F, G)\n\nTo make energy performance transparent for Irish property owners, the national Building Energy Rating (BER) framework has been streamlined into eight clear categories: **A0, A, B, C, D, E, F, and G**.\n\n- **BER A0**: Reserved exclusively for the most energy-efficient, zero-carbon, fossil-fuel-free homes operating at ultra-low energy demand.\n- **BER A & B (B2 Minimum Target)**: High-performance retrofitted standard. BER B2 is established as the minimum performance benchmark for One Stop Shop deep retrofits.\n- **BER C & D**: Moderate efficiency representing standard 1990s–2000s Irish residential stock.\n- **BER E, F & G**: High-priority candidates for SEAI grant support and deep thermal retrofitting.`;

  const section2 = `## 2. Individual Energy Upgrade Grants (Better Energy Homes 2026 Rates)\n\nFor homeowners seeking step-by-step measures, the 2026 Better Energy Homes scheme offers enhanced direct cash subsidies:\n\n- **Heat Pump Systems (Air-to-Water / Ground-Source)**: Subsidized up to **€12,500** for houses (including Renewable Heat Bonus & central heating support) and up to **€9,500** for apartments.\n- **External Wall Insulation**: Grant support of **€8,000** for solid-wall properties.\n- **Standalone Windows Upgrade**: Subsidized up to **€4,000** for high-efficiency double/triple glazing.\n- **External Doors**: **€800 per door** (capped at 2 doors / €1,600 total).\n- **Attic Insulation**: **€2,000** standard grant (enhanced to **€2,500** for first-time buyers or qualifying welfare recipients).\n- **Cavity Wall Insulation**: **€1,800** (enhanced to **€2,300** for welfare recipients).\n- **Solar PV Systems**: **€1,800** direct grant support.\n- **Heating Controls Upgrade**: **€700** grant contribution.\n\n*Eligibility Note*: Homes generally must be built prior to 2011 for insulation and heating grants, and prior to 2021 for heat pumps and solar PV. All works must be performed by SEAI-registered contractors and approved prior to commencement.`;

  const section3 = `## 3. One Stop Shop (OSS) Deep Retrofits (up to €50,000 Cap)\n\nFor homeowners aiming for a comprehensive transformation, the SEAI **One Stop Shop (OSS)** scheme provides a hassle-free, fully managed pathway:\n\n- **End-to-End Management**: Managed by a certified OSS provider from initial technical assessment to final post-works BER certification.\n- **50% Cost Coverage**: Grants cover up to 50% of total project costs, capped at **€50,000** per home.\n- **Comprehensive Scope**: Combines heat pumps, external wall & attic insulation, solar PV, mechanical ventilation, and airtightness measures.\n- **Key 2026 Rules Change**: The previous minimum energy uplift requirement is now **removed** whenever a heat pump is included in the project scope, making significantly more Irish homes immediately eligible.`;

  const section4 = `## 4. Fully Funded Warmer Homes Scheme & Key 2026 Enhancements\n\nFor qualifying welfare recipients, the **Fully Funded Warmer Homes Scheme** provides 100% free retrofits covering insulation, heating upgrades, ventilation, draught-proofing, lagging jackets, and BER assessments.\n\n- **Waiting Times & Grant Stacking**: Current waiting times stand at 24–26 months. Crucially, homeowners on the waiting list can now utilize enhanced individual Better Energy Homes grants in the interim **without losing their place** on the Warmer Homes list.\n- **Second Wall Insulation Grants**: Homeowners who previously received cavity or internal wall insulation grants are now officially permitted to claim a second grant for external wall insulation.\n- **First-Time Buyer Support**: First-time buyers can claim an enhanced **€2,500** attic insulation grant, plus **€280** towards pre/post BER assessments.`;

  const cta = `## Step-by-Step Application Process with your EcoSmartHomes Advisor\n\nNavigating SEAI eligibility, contractor selection, and grant stacking is seamless with an accredited **EcoSmartHomes retrofit advisor**:\n\n1. **Eligibility & Online Check**: We audit your property build date (pre-2011 / pre-2021) and check SEAI eligibility.\n2. **Pre-Works BER Assessment**: Certified assessors model your baseline BER (G through D) and Heat Loss Indicator.\n3. **Contractor Quotation & Application**: We select SEAI-registered contractors and submit your grant application online before starting work.\n4. **Grant Approval & Execution**: Works are completed to NSAI standards. For individual grants, payments are disbursed within 4–8 weeks; for OSS projects, grants are **deducted upfront** off your bill.\n\nReady to transform your home into an A0-rated sanctuary? Contact EcoSmartHomes at **ecosmarthomes.ie** or speak with an advisor today!`;

  let bodyMarkdown = `# ${title}\n\n${intro}\n\n${section1}\n\n${section2}\n\n${section3}\n\n${section4}\n\n${cta}`;

  if (selectedLength === 'short') {
    bodyMarkdown = `# ${title}\n\n${intro}\n\n${section1}\n\n${section2}\n\n${cta}`;
  }

  const generatedCount = bodyMarkdown.split(/\s+/).filter(Boolean).length;
  const jsonBlock = JSON.stringify(
    {
      title,
      slug,
      meta_description: metaDesc,
      tone: selectedTone,
      word_count: generatedCount,
    },
    null,
    2,
  );

  return {
    content: `${jsonBlock}\n\n${bodyMarkdown}`,
    wordCount: generatedCount,
    jsonMetadata: {
      title,
      slug,
      meta_description: metaDesc,
      tone: selectedTone,
      word_count: generatedCount,
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const {
    title,
    topic,
    pillar,
    keywords,
    tone,
    audience,
    length,
    useWarRoom,
    region,
  } = req.body || {};

  const articleTitle = title || topic || 'SEAI Home Energy Upgrade Grants 2026';

  try {
    // 1. If War Room requested or default generation, run the multi-agent pipeline
    const warRoomResult = await globalEditorialWarRoomEngine.executePipeline({
      title: articleTitle,
      topic: topic || '',
      pillar: pillar || 'SEAI Home Energy Upgrade Grants 2026',
      keywords: Array.isArray(keywords) ? keywords : [],
      tone: tone || 'Authoritative, Reassuring & Clear',
      audience: audience || 'Irish homeowners',
      length: length || 'medium',
      region: region || 'Limerick V94 & Munster',
    });

    return res.status(200).json({
      success: true,
      content: warRoomResult.content,
      articleBody: warRoomResult.articleBody,
      jsonMetadata: warRoomResult.jsonMetadata,
      jsonLdSchema: warRoomResult.jsonLdSchema,
      certificationReport: warRoomResult.certificationReport,
      wordCount: warRoomResult.jsonMetadata.word_count,
      isMock: false,
      isWarRoom: Boolean(useWarRoom),
      provider: warRoomResult.provider,
    });
  } catch (err: any) {
    console.warn('War Room invocation fallback:', err?.message || err);

    // Fallback to high-fidelity structured Irish retrofit article
    const fallback = generateFallbackArticle({
      title: articleTitle,
      topic,
      pillar,
      keywords: Array.isArray(keywords) ? keywords : [],
      tone,
      audience,
      length,
    });

    return res.status(200).json({
      success: true,
      content: fallback.content,
      jsonMetadata: fallback.jsonMetadata,
      wordCount: fallback.wordCount,
      isMock: true,
      warning:
        'Generated high-fidelity SEAI 2026 Budget compliant article in offline safe mode.',
    });
  }
}
