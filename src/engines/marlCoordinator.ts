import { GoogleGenAI } from '@google/genai';
<<<<<<< HEAD
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY || '').trim() });
const MATRIX_PATH = path.join(process.cwd(), 'src', 'engines', 'munster-keywords-map.json');
const MATRIX_PATH = path.join(process.cwd(), 'src', 'engines', 'munster-keywords-map.json');
export async function executeProgrammaticMunsterCampaign() {
=======
import fs from 'fs';
import path from 'path';

// Modern unified 2026 client initialization block reading process environment configurations
const apiKeyString = (process.env.GEMINI_API_KEY || '').trim();
const ai = new GoogleGenAI(apiKeyString ? { apiKey: apiKeyString } : {});

const MATRIX_PATH = path.join(process.cwd(), 'src', 'engines', 'munster-keywords-map.json');
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'pages');

export interface ProgrammaticGenerationOptions {
  limit?: number;
  dryRun?: boolean;
  clusterFilter?: string;
}

/**
 * Builds the dynamic interactive SEAI Grant Calculator widget HTML/Markdown embed
 */
export function renderGrantCalculatorWidget(location: string, topic: string): string {
  return `
<!-- START: Interactive SEAI Grant Calculator Component -->
<div class="ecosmart-grant-calculator my-8 p-6 bg-slate-900 text-white rounded-xl border border-emerald-500/30 shadow-2xl" data-location="${location}">
  <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
    <div>
      <h3 class="text-xl font-bold text-emerald-400">SEAI Grant & Co-Funding Calculator (${location})</h3>
      <p class="text-xs text-slate-400">Targeted Munster homeowner upgrade matching rates (Up to 50% capital grants)</p>
    </div>
    <span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/20">2026 SEAI Rates</span>
  </div>

  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div class="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60">
        <span class="text-slate-400 text-xs block">Heat Pump Grant (Air-to-Water)</span>
        <span class="text-lg font-bold text-white">€6,500</span>
        <span class="text-xs text-emerald-400 block mt-1">+ €350 Technical Assessment Subsidy</span>
      </div>
      <div class="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60">
        <span class="text-slate-400 text-xs block">External Wall Insulation</span>
        <span class="text-lg font-bold text-white">Up to €8,000</span>
        <span class="text-xs text-emerald-400 block mt-1">50% SEAI Capital Grant Co-Funding</span>
      </div>
      <div class="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60">
        <span class="text-slate-400 text-xs block">Solar PV System (up to 4kWp)</span>
        <span class="text-lg font-bold text-white">Up to €2,100</span>
        <span class="text-xs text-emerald-400 block mt-1">Zero VAT on Solar Installations</span>
      </div>
      <div class="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60">
        <span class="text-slate-400 text-xs block">Attic & Roof Insulation</span>
        <span class="text-lg font-bold text-white">Up to €1,500</span>
        <span class="text-xs text-emerald-400 block mt-1">Immediate U-Value Compliance (&le; 0.16 W/m²K)</span>
      </div>
    </div>
  </div>
</div>
<!-- END: Interactive SEAI Grant Calculator Component -->
`;
}

/**
 * Builds the high-converting Stripe E-Commerce Survey Bridge CTA Checkout Container (€49)
 */
export function renderStripeSurveyBridgeWidget(location: string, localizedKeyword: string): string {
  return `
<!-- START: Stripe E-Commerce Survey Bridge Checkout Container -->
<div class="ecosmart-stripe-bridge my-8 p-6 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 rounded-xl text-white shadow-2xl" data-keyword="${localizedKeyword}">
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="px-2 py-0.5 text-[11px] font-bold bg-indigo-500 text-white rounded">PRIORITY SERVICE</span>
        <span class="text-xs text-indigo-300 font-medium">Independent Irish BER & Survey Dispatch</span>
      </div>
      <h3 class="text-xl font-bold text-white">Book Your ${location} Home Architectural & Technical Survey</h3>
      <p class="text-sm text-slate-300 mt-1 max-w-xl">
        Lock in your certified SEAI Technical Assessment and guaranteed Part L compliance roadmap for <strong class="text-white">€49 onboarding fee</strong> (Fully refundable against completed retrofit works).
      </p>
    </div>
    <div class="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
      <a href="https://buy.stripe.com/test_ecosmart_survey_49" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-600/30 transition-all duration-150 border border-indigo-400/30">
        <span>Proceed to Secure Survey Checkout (€49) &rarr;</span>
      </a>
      <span class="text-[11px] text-slate-400 flex items-center gap-1">
        <svg class="w-3.5 h-3.5 text-emerald-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        256-Bit Encrypted Stripe E-Commerce Protocol
      </span>
    </div>
  </div>
</div>
<!-- END: Stripe E-Commerce Survey Bridge Checkout Container -->
`;
}

/**
 * Executes the Programmatic Munster Local SEO Generation Campaign
 */
export async function executeProgrammaticMunsterCampaign(options?: ProgrammaticGenerationOptions): Promise<{ generatedCount: number; files: string[] }> {
  console.log('🚀 Initializing Developer AI Studio Campaign Engine...');

  if (!fs.existsSync(MATRIX_PATH)) {
    console.error('❌ Target keyword matrix file not found on disk:', MATRIX_PATH);
    return { generatedCount: 0, files: [] };
  }

  const seoMatrix = JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf-8'));
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const generatedFiles: string[] = [];
  let count = 0;
  const maxLimit = options?.limit ?? 50;

  for (const cluster of seoMatrix.clusters) {
    if (options?.clusterFilter && cluster.clusterId !== options.clusterFilter) {
      continue;
    }

    const locations = [...cluster.geographicModifiers.tier1Cities, ...cluster.geographicModifiers.tier2Towns];

    for (const kwObj of cluster.keywords) {
      for (const loc of locations) {
        if (count >= maxLimit) break;

        const localizedKeyword = `${kwObj.phrase} ${loc}`;
        const fileSlug = localizedKeyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const targetFilePath = path.join(OUTPUT_DIR, `${fileSlug}.md`);

        if (fs.existsSync(targetFilePath)) {
          generatedFiles.push(targetFilePath);
          continue;
        }

        console.log(`[Gemini Engine] 🧠 Structuring asset: "${localizedKeyword}"`);

        const prompt = `You are the lead SEAI Technical Energy Advisor for EcoSmartHomes Ireland.
Write a comprehensive, authoritative, locally grounded Home Energy Survey & Retrofit guide landing page targeting property owners in ${loc}, Ireland.

Target Keyword: "${localizedKeyword}"
Core Topic: ${cluster.coreTopic}
Target Audience: ${kwObj.targetAudience || 'Munster Homeowners'}

Structure your guide in clean Markdown format with:
1. Clear H1 Title featuring the target keyword and ${loc}, County / Munster.
2. Local Context & Housing Stock Analysis for ${loc} (typical builds, insulation gaps, cavity vs hollow block, heating fuel reliance on oil/gas).
3. Detailed SEAI Grants breakdown & Technical Advisor fee repayment process.
4. Step-by-step homeowner journey to achieve an A2 Building Energy Rating (BER) and NZEB Part L standard compliance.
5. Frequently Asked Questions by ${loc} homeowners regarding surveyor visits, MPRN verification, and grant application timelines.

Keep tone professional, authoritative, actionable, and compliant with Irish Building Regulations TGD Part L.`;

        try {
          let content = '';

          if (apiKeyString && !options?.dryRun) {
            try {
              const response = await ai.models.generateContent({
                model: 'gemini-3.7-flash',
                contents: prompt,
              });
              content = response.text || '';
            } catch (modelErr: any) {
              console.warn(`[Gemini Engine] Primary generation returned error: ${modelErr?.message || modelErr}. Falling back to structured local engine.`);
            }
          }

          if (!content) {
            // High-quality deterministic structural fallback
            content = `# ${localizedKeyword.toUpperCase()} - Complete Homeowner SEAI Grant & Retrofit Guide (${loc}, Ireland)

## Comprehensive SEAI Home Upgrade & Grant Roadmap for ${loc}

Homeowners across **${loc}** and the wider Munster region are upgrading their properties to achieve higher Building Energy Ratings (BER), drastically reduce winter heating bills, and transition away from expensive kerosene oil boilers to modern air-to-water heat pumps.

### Why ${loc} Homeowners Are Retrofitting in 2026
Properties in ${loc} often face unique climatic and architectural factors:
- **Local Microclimate**: High precipitation and coastal/inland wind exposure requiring robust external insulation (U-value &le; 0.18 W/m²K).
- **SEAI Grant Co-Funding**: Access up to 50% capital grants under the National Retrofit Plan.
- **Low Interest Loans**: Eligibility for government-backed Home Energy Upgrade Loans from 3.55% APR.

---

### Step-by-Step Retrofit Process in ${loc}
1. **Initial BER Assessment & Technical Survey**: Establish your baseline energy performance.
2. **Fabric First Upgrades**: Attic insulation (&le; 0.16 W/m²K) and cavity/external wall insulation.
3. **Renewable Heating & Solar PV**: Air-to-water heat pump sizing and solar rooftop installation.
4. **Final Post-Works BER Sign-Off**: Verification for grant disbursement.
`;
          }

          // Inject Dynamic Interactive Calculator & Stripe Survey Bridge CTA
          const grantCalculatorHtml = renderGrantCalculatorWidget(loc, cluster.coreTopic);
          const stripeBridgeHtml = renderStripeSurveyBridgeWidget(loc, localizedKeyword);

          const finalPageMarkdown = `${content.trim()}\n\n${grantCalculatorHtml}\n\n${stripeBridgeHtml}\n`;

          fs.writeFileSync(targetFilePath, finalPageMarkdown, 'utf-8');
          console.log(`[Success] Written landing page asset: ${fileSlug}.md`);
          generatedFiles.push(targetFilePath);
          count++;
        } catch (err) {
          console.error(`Generation failure for ${localizedKeyword}:`, err);
        }
      }
    }
  }

  return { generatedCount: count, files: generatedFiles };
}
>>>>>>> 4db0a330e215240e901521ca8c5f917725d70480
