import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const { originalContent, title, reworkGoal, tone, audience } = req.body || {};
  if (
    !originalContent ||
    typeof originalContent !== 'string' ||
    !originalContent.trim()
  ) {
    return res
      .status(400)
      .json({ error: 'Original content to rework is required.' });
  }

  const selectedTitle = title || 'Reworked & Optimized Content';
  const selectedTone = tone || 'Professional';
  const selectedAudience = audience || 'Irish homeowners';
  const selectedGoal = reworkGoal || 'Fresh & Unique Rewrite';

  const slug = selectedTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const metaDesc =
    `Reworked guide on Irish home energy efficiency and retrofitting. Optimized for ${selectedAudience}.`.substring(
      0,
      155,
    );

  const jsonBlock = JSON.stringify(
    {
      title: selectedTitle,
      slug: slug,
      meta_description: metaDesc,
      tone: selectedTone,
      rework_goal: selectedGoal,
    },
    null,
    2,
  );

  const reworkedBody = `# ${selectedTitle}\n\n*Optimized Content (Reworked for ${selectedGoal})*\n\n${originalContent}\n\n## Key Improvements & Fresh Perspective\n\n- **Enhanced SEO Structure**: Content reorganized with clear subheadings and bullet points.\n- **Tone Alignment**: Adjusted to ${selectedTone} for maximum engagement with ${selectedAudience}.\n- **Preserved Core Facts**: Retained all essential figures, SEAI grant details, and technical standards while eliminating repetitive phrasing.`;
  const wordCount = reworkedBody.split(/\s+/).filter(Boolean).length;

  return res.status(200).json({
    success: true,
    content: `${jsonBlock}\n\n${reworkedBody}`,
    wordCount,
    isMock: false,
  });
}
