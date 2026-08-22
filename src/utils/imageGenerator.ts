/**
 * src/utils/imageGenerator.ts
 *
 * Client-side integration and utility functions for generating SEO-optimized blog featured images
 * using Imagen (Gemini Image Generation models) via the server-side API proxy.
 */

export interface GenerateImageParams {
  title: string;
  keywords?: string[];
  topic?: string;
  tone?: string;
  style?: string;
  customPrompt?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16' | '21:9';
  site?: string;
}

export interface GeneratedImageResponse {
  success: boolean;
  imageUrl: string;
  altText: string;
  caption: string;
  suggestedFileName: string;
  prompt: string;
  aspectRatio: string;
  style: string;
  dimensions: { width: number; height: number };
  isMock: boolean;
  warning?: string;
}

export interface ImageStylePreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  promptModifier: string;
  recommendedFor: string;
}

export const IMAGE_STYLE_PRESETS: ImageStylePreset[] = [
  {
    id: 'photorealistic-architectural',
    name: 'Photorealistic Architectural',
    description: 'Crisp, high-end architectural photography with natural daylight & Irish context.',
    badge: 'Popular',
    promptModifier: 'architectural magazine photography, 8k resolution, natural soft lighting, photorealistic Irish residential exterior, ultra sharp, Hasselblad 50mm f/1.8, no text, clean composition',
    recommendedFor: 'Featured Hero & Authority Posts',
  },
  {
    id: 'modern-irish-residential',
    name: 'Modern Irish Residential',
    description: 'Authentic modern Irish detached home with solar PV slate roof and heat pump unit.',
    badge: 'Local Context',
    promptModifier: 'modern Irish suburban house with black solar panels on slate roof, heat pump outdoor unit in manicured lawn, Irish overcast sunny day, high detail editorial photography, no text',
    recommendedFor: 'Retrofit & Grant Guides',
  },
  {
    id: 'eco-solar-3d-render',
    name: 'Eco 3D Technical Render',
    description: '3D isometric cutaway illustrating energy flow, solar panels, and battery storage.',
    badge: 'Technical',
    promptModifier: 'isometric 3D architectural diagram of eco house, glowing energy flow lines, solar roof cells, heat pump, clean minimalist render, Octane render 3D, emerald green and slate tones, no text',
    recommendedFor: 'Cost Breakdowns & Explainer Guides',
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Interior/Exterior',
    description: 'Sophisticated interior blend showing smart home thermostats, warmth, and insulation.',
    badge: 'Lifestyle',
    promptModifier: 'luxury modern eco-friendly home living room with floor-to-ceiling glass, smart thermostat control, warm wood and stone, soft morning sunlight, architectural digest aesthetic, no text',
    recommendedFor: 'Lifestyle & Homeowner Stories',
  },
  {
    id: 'clean-vector-infographic',
    name: 'Clean Vector Banner',
    description: 'Flat minimalist graphic with modern icons for BER ratings, sun, and heat pumps.',
    badge: 'Graphic',
    promptModifier: 'clean modern vector illustration of sustainable smart home, green energy badges, solar rays, minimalist flat design, Irish green and navy color scheme, Dribbble trending, no text',
    recommendedFor: 'Social Cards & Quick Tips',
  },
];

export interface AspectRatioOption {
  id: '16:9' | '4:3' | '1:1' | '9:16';
  label: string;
  sublabel: string;
  width: number;
  height: number;
  iconName: string;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  {
    id: '16:9',
    label: '16:9 Banner (Hero)',
    sublabel: '1200 × 675 · Ideal for Google SEO, OpenGraph & Blog Headers',
    width: 1200,
    height: 675,
    iconName: 'RectangleHorizontal',
  },
  {
    id: '4:3',
    label: '4:3 Standard',
    sublabel: '1024 × 768 · Great for in-article editorial cards & tablet views',
    width: 1024,
    height: 768,
    iconName: 'LayoutGrid',
  },
  {
    id: '1:1',
    label: '1:1 Square',
    sublabel: '1080 × 1080 · Optimized for Social Feeds (Instagram / LinkedIn)',
    width: 1080,
    height: 1080,
    iconName: 'Square',
  },
  {
    id: '9:16',
    label: '9:16 Story',
    sublabel: '720 × 1280 · Mobile Stories & Vertical Promos',
    width: 720,
    height: 1280,
    iconName: 'RectangleVertical',
  },
];

/**
 * Generate a client-side SVG fallback asset when API key or quota is unavailable
 */
export function generateClientFallbackImage(
  title: string,
  keywords: string[] = [],
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16' = '16:9',
  style: string = 'Photorealistic Architectural'
): string {
  const is169 = aspectRatio === '16:9';
  const isSquare = aspectRatio === '1:1';
  const width = is169 ? 1200 : isSquare ? 800 : 1024;
  const height = is169 ? 675 : isSquare ? 800 : 768;

  const cleanTitle = (title || 'EcoSmartHomes Irish Home Retrofit Guide')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  const kwList = keywords.length > 0 ? keywords.slice(0, 3).join(' • ') : 'SEAI Grants • Solar PV • Heat Pumps';

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09131f"/>
      <stop offset="50%" stop-color="#0f2638"/>
      <stop offset="100%" stop-color="#06322b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>

  <!-- Decorative Solar / Wave Grid -->
  <g opacity="0.15">
    <circle cx="${width * 0.85}" cy="${height * 0.3}" r="220" fill="none" stroke="#34d399" stroke-width="2"/>
    <circle cx="${width * 0.85}" cy="${height * 0.3}" r="320" fill="none" stroke="#34d399" stroke-width="1.5" stroke-dasharray="8 8"/>
    <circle cx="${width * 0.85}" cy="${height * 0.3}" r="420" fill="none" stroke="#34d399" stroke-width="1"/>
    
    <path d="M 0,${height * 0.8} Q ${width * 0.25},${height * 0.65} ${width * 0.5},${height * 0.85} T ${width},${height * 0.7}" fill="none" stroke="#10b981" stroke-width="2" opacity="0.3"/>
  </g>

  <!-- Architectural House Silhouette & Solar Panels -->
  <g transform="translate(${width * 0.65}, ${height * 0.38})" opacity="0.9">
    <!-- House body -->
    <path d="M 0,160 L 120,40 L 240,160 L 240,280 L 0,280 Z" fill="#0c1f2e" stroke="#1e3a5f" stroke-width="3"/>
    <!-- Roof with solar panels -->
    <polygon points="120,40 240,160 210,160 120,70 30,160 0,160" fill="#047857"/>
    <!-- Solar grid lines -->
    <line x1="60" y1="120" x2="180" y2="120" stroke="#34d399" stroke-width="2"/>
    <line x1="80" y1="95" x2="160" y2="95" stroke="#34d399" stroke-width="2"/>
    <line x1="120" y1="70" x2="120" y2="150" stroke="#34d399" stroke-width="2"/>
    <!-- Heat pump icon box -->
    <rect x="255" y="220" width="55" height="60" rx="8" fill="#0c2333" stroke="#34d399" stroke-width="2"/>
    <circle cx="282" cy="250" r="16" fill="none" stroke="#34d399" stroke-width="2"/>
    <path d="M 282,238 L 282,262 M 270,250 L 294,250" stroke="#34d399" stroke-width="2"/>
    <!-- Windows glow -->
    <rect x="35" y="180" width="50" height="50" rx="4" fill="#34d399" opacity="0.3"/>
    <rect x="155" y="180" width="50" height="50" rx="4" fill="#34d399" opacity="0.3"/>
    <rect x="95" y="210" width="50" height="70" rx="4" fill="#0f3747"/>
  </g>

  <!-- Editorial Info Card Overlay -->
  <g transform="translate(60, ${height * 0.18})">
    <!-- Brand / Topic Badge -->
    <rect x="0" y="0" width="220" height="34" rx="17" fill="url(#glass)" stroke="#34d399" stroke-width="1.5"/>
    <circle cx="18" cy="17" r="6" fill="#34d399"/>
    <text x="34" y="22" fill="#34d399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="1">ECOSMARTHOMES.IE</text>

    <!-- Title -->
    <text x="0" y="90" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${is169 ? '34' : '28'}" font-weight="800" filter="url(#shadow)">
      ${cleanTitle.length > 55 ? cleanTitle.slice(0, 52) + '...' : cleanTitle}
    </text>

    <!-- Subtitle / Keywords Pill -->
    <rect x="0" y="130" width="${Math.min(500, width * 0.5)}" height="32" rx="8" fill="#ffffff" fill-opacity="0.08"/>
    <text x="14" y="151" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">
      ${kwList}
    </text>

    <!-- SEO Meta Stats -->
    <g transform="translate(0, 195)">
      <rect x="0" y="0" width="130" height="42" rx="8" fill="#047857" fill-opacity="0.3" stroke="#34d399" stroke-width="1"/>
      <text x="14" y="18" fill="#a7f3d0" font-family="monospace" font-size="9" font-weight="700">FEATURED HERO</text>
      <text x="14" y="33" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="700">${aspectRatio} · SEO OPT</text>

      <rect x="145" y="0" width="130" height="42" rx="8" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
      <text x="159" y="18" fill="#94a3b8" font-family="monospace" font-size="9" font-weight="700">STYLE PRESET</text>
      <text x="159" y="33" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="600">${style.slice(0, 16)}</text>
    </g>
  </g>

  <!-- Bottom Accent Bar -->
  <rect x="0" y="${height - 8}" width="${width}" height="8" fill="url(#accent)"/>
</svg>
`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Call the server-side image generation endpoint with Imagen / Gemini Image API
 */
export async function generateFeaturedImage(
  params: GenerateImageParams
): Promise<GeneratedImageResponse> {
  const response = await fetch('/api/seo/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image Generation failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as GeneratedImageResponse;
  return data;
}

/**
 * Insert image markdown into the article draft content with high SEO quality
 */
export function insertImageIntoMarkdown(
  currentContent: string,
  imageMeta: {
    url: string;
    alt: string;
    caption?: string;
  },
  placement: 'top_hero' | 'cursor' | 'bottom' = 'top_hero'
): string {
  const alt = imageMeta.alt || 'Irish home energy retrofit featured hero image';
  const captionText = imageMeta.caption ? `\n*${imageMeta.caption}*\n` : '';
  const imageMarkdown = `\n![${alt}](${imageMeta.url})${captionText}\n`;

  const trimmed = currentContent.trim();
  if (!trimmed) {
    return imageMarkdown.trim();
  }

  if (placement === 'top_hero') {
    // If the content starts with an H1 (# Title), insert right below the H1
    const h1Match = trimmed.match(/^(#\s+[^\n]+\n+)/);
    if (h1Match) {
      const h1 = h1Match[1];
      const rest = trimmed.slice(h1.length);
      return `${h1}${imageMarkdown}\n${rest}`;
    }
    return `${imageMarkdown}\n${trimmed}`;
  }

  if (placement === 'bottom') {
    return `${trimmed}\n\n${imageMarkdown}`;
  }

  // Default fallback
  return `${imageMarkdown}\n${trimmed}`;
}
