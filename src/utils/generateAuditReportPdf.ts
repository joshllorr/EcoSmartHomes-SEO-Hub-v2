import { jsPDF } from 'jspdf';
import { ArticleDraft } from '../types';

// English syllable counter helper for Flesch Reading Ease
function countWordSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  if (clean.length <= 3) return 1;
  const stripped = clean
    .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
    .replace(/^y/, '');
  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export interface AuditPdfOptions {
  draft: ArticleDraft;
  targetDomain?: string;
}

export function generateAuditReportPdf({ draft, targetDomain = 'ecosmarthomes.ie' }: AuditPdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  // -------------------------------------------------------------
  // Data & Metrics Extraction
  // -------------------------------------------------------------
  const title = (draft.metaTitle || draft.title || 'Untitled Article Draft').trim();
  const rawContent = (draft.content || '').replace(/[#*`_~[\]()]/g, ' ').trim();
  const words = rawContent.split(/\s+/).filter(Boolean);
  const totalWords = words.length || 1;

  const sentences = rawContent
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.split(/\s+/).length > 1);
  const totalSentences = Math.max(1, sentences.length);
  const avgSentenceLength = Number((totalWords / totalSentences).toFixed(1));

  // Syllables and Flesch score
  const totalSyllables = words.reduce((acc, w) => acc + countWordSyllables(w), 0);
  let fleschScore = 0;
  if (totalWords > 0) {
    fleschScore = Math.round(
      206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords),
    );
    fleschScore = Math.max(0, Math.min(100, fleschScore));
  }

  // Headings
  const h2Count = (draft.content.match(/^##\s+.+$/gm) || []).length;
  const h3Count = (draft.content.match(/^###\s+.+$/gm) || []).length;

  // Title Audit
  const titleLen = title.length;
  let titleStatus = 'Optimal';
  let titleStatusColor = [16, 185, 129]; // Emerald
  if (titleLen === 0) {
    titleStatus = 'Missing';
    titleStatusColor = [239, 68, 68];
  } else if (titleLen < 40) {
    titleStatus = 'Too Short';
    titleStatusColor = [245, 158, 11];
  } else if (titleLen > 65) {
    titleStatus = 'Too Long (SERP Truncation)';
    titleStatusColor = [245, 158, 11];
  }

  // Meta Description Audit
  const metaDesc = (draft.metaDescription || '').trim();
  const metaLen = metaDesc.length;
  let metaStatus = 'Optimal';
  let metaStatusColor = [16, 185, 129];
  if (metaLen === 0) {
    metaStatus = 'Missing Tag';
    metaStatusColor = [239, 68, 68];
  } else if (metaLen < 110) {
    metaStatus = 'Short Snippet';
    metaStatusColor = [245, 158, 11];
  } else if (metaLen > 165) {
    metaStatus = 'Long (Ellipsis Risk)';
    metaStatusColor = [245, 158, 11];
  }

  // Keyword Density Audit
  const keywordsList =
    draft.keywords && draft.keywords.length > 0
      ? draft.keywords
      : [
          'BER rating Ireland',
          'SEAI grants',
          'home retrofit',
          'energy efficiency',
        ];

  const lowerContent = (draft.content || '').toLowerCase();
  const lowerTitle = title.toLowerCase();

  const kwAudits = keywordsList.map((kw) => {
    const cleanKw = kw.trim();
    const escaped = cleanKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = lowerContent.match(new RegExp(`\\b${escaped}\\b`, 'gi')) || [];
    const count = matches.length;
    const kwWords = cleanKw.split(/\s+/).length;
    const density = Number(((count * kwWords / totalWords) * 100).toFixed(2));
    const inTitle = lowerTitle.includes(cleanKw.toLowerCase());
    
    let status = 'Optimal';
    if (count === 0) status = 'Missing';
    else if (density < 0.8) status = 'Sparse';
    else if (density > 3.0) status = 'High';

    return { keyword: cleanKw, count, density, inTitle, status };
  });

  const totalKwOccurrences = kwAudits.reduce((acc, k) => acc + k.count, 0);
  const avgKwDensity = Number((kwAudits.reduce((acc, k) => acc + k.density, 0) / (kwAudits.length || 1)).toFixed(2));

  // Readability Status
  let readabilityGrade = 'Standard';
  let readabilityColor = [16, 185, 129];
  if (fleschScore >= 60) {
    readabilityGrade = 'Easy & Engaging';
  } else if (fleschScore >= 45) {
    readabilityGrade = 'Moderate Complexity';
    readabilityColor = [245, 158, 11];
  } else {
    readabilityGrade = 'Dense Structure';
    readabilityColor = [239, 68, 68];
  }

  // Calculate Overall Readiness Score (0-100)
  let overallScore = 0;
  // Title (25)
  if (titleLen >= 45 && titleLen <= 65) overallScore += 25;
  else if (titleLen >= 35 && titleLen <= 70) overallScore += 15;
  else if (titleLen > 0) overallScore += 8;

  // Meta (25)
  if (metaLen >= 120 && metaLen <= 165) overallScore += 25;
  else if (metaLen >= 80 && metaLen <= 180) overallScore += 15;
  else if (metaLen > 0) overallScore += 5;

  // Keywords (25)
  const kwScoreRatio = kwAudits.filter((k) => k.status === 'Optimal').length / (kwAudits.length || 1);
  overallScore += Math.round(kwScoreRatio * 25);

  // Readability (25)
  if (fleschScore >= 60) overallScore += 25;
  else if (fleschScore >= 40) overallScore += 16;
  else overallScore += 8;

  overallScore = Math.min(100, Math.max(0, overallScore));

  let scoreTier = 'A-Grade (Ready to Publish)';
  let scoreTierColor = [16, 185, 129];
  if (overallScore < 60) {
    scoreTier = 'Needs SEO Optimization';
    scoreTierColor = [239, 68, 68];
  } else if (overallScore < 80) {
    scoreTier = 'B-Grade (Minor Tweaks)';
    scoreTierColor = [245, 158, 11];
  }

  // -------------------------------------------------------------
  // PDF Rendering with jsPDF
  // -------------------------------------------------------------
  let y = 36;

  // Top Accent Stripe
  doc.setFillColor(16, 185, 129); // #10b981
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Header Box
  doc.setFillColor(15, 23, 42); // #0f172a (Slate-900)
  doc.roundedRect(margin, y, contentWidth, 70, 8, 8, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('ECOSMARTHOMES IRELAND', margin + 18, y + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(52, 211, 153); // #34d399
  doc.text('CONTENT QUALITY & SEO READINESS AUDIT REPORT', margin + 18, y + 42);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // #94a3b8
  const reportDate = new Date().toLocaleDateString('en-IE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Generated: ${reportDate} | Domain: ${targetDomain}`, margin + 18, y + 56);

  // Score Badge in Header (Right Side)
  const badgeWidth = 95;
  const badgeHeight = 52;
  const badgeX = margin + contentWidth - badgeWidth - 14;
  const badgeY = y + 9;
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 6, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(scoreTierColor[0], scoreTierColor[1], scoreTierColor[2]);
  doc.text(`${overallScore}/100`, badgeX + badgeWidth / 2, badgeY + 24, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(scoreTier.toUpperCase(), badgeX + badgeWidth / 2, badgeY + 40, { align: 'center' });

  y += 82;

  // -------------------------------------------------------------
  // Article Metadata Box
  // -------------------------------------------------------------
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, y, contentWidth, 58, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ARTICLE DRAFT TITLE:', margin + 14, y + 16);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const truncatedTitle = doc.splitTextToSize(title, contentWidth - 28);
  doc.text(truncatedTitle.slice(0, 1), margin + 14, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Draft ID: ${draft.id}   |   Status: ${draft.status}   |   Tone: ${draft.tone || 'Professional'}   |   Words: ${totalWords}`,
    margin + 14,
    y + 48,
  );

  y += 68;

  // -------------------------------------------------------------
  // Section: Checklist Breakdown (4 Core Pillars)
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('SEO Best Practices & Content Readiness Checklist', margin, y + 10);
  y += 18;

  // 2-Column Grid for Checklist items
  const colWidth = (contentWidth - 12) / 2;

  // ---------------------------
  // Card 1: Title Length & SERP
  // ---------------------------
  const card1X = margin;
  const card1Y = y;
  const cardHeight = 104;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card1X, card1Y, colWidth, cardHeight, 6, 6, 'FD');

  // Title Card Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Title Length & SERP Display', card1X + 12, card1Y + 18);

  // Status Badge
  doc.setFillColor(titleStatusColor[0], titleStatusColor[1], titleStatusColor[2]);
  doc.roundedRect(card1X + colWidth - 70, card1Y + 8, 58, 14, 3, 3, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(titleStatus.toUpperCase(), card1X + colWidth - 41, card1Y + 18, { align: 'center' });

  // Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Length: ${titleLen} characters (Target: 45–65 chars)`, card1X + 12, card1Y + 36);
  doc.text(`SERP Pixel Estimate: ~${Math.round(titleLen * 9)}px / 580px max`, card1X + 12, card1Y + 48);

  // Diagnostic Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const titleNote =
    titleLen >= 45 && titleLen <= 65
      ? 'Optimal search display: Title fits clearly on both desktop and mobile Google result pages.'
      : titleLen < 45
      ? 'Title is concise but could be expanded with high-intent keywords to improve ranking potential.'
      : 'Title exceeds standard 60-character SERP limit and may be cut off with an ellipsis.';
  const wrappedTitleNote = doc.splitTextToSize(titleNote, colWidth - 24);
  doc.text(wrappedTitleNote, card1X + 12, card1Y + 64);

  // ---------------------------
  // Card 2: Meta Description
  // ---------------------------
  const card2X = margin + colWidth + 12;
  const card2Y = y;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card2X, card2Y, colWidth, cardHeight, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Meta Description Tag', card2X + 12, card2Y + 18);

  doc.setFillColor(metaStatusColor[0], metaStatusColor[1], metaStatusColor[2]);
  doc.roundedRect(card2X + colWidth - 70, card2Y + 8, 58, 14, 3, 3, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(metaStatus.toUpperCase(), card2X + colWidth - 41, card2Y + 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Length: ${metaLen} characters (Target: 120–160 chars)`, card2X + 12, card2Y + 36);

  // Snippet Preview
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const snippetText = metaDesc
    ? `"${metaDesc.length > 85 ? metaDesc.substring(0, 82) + '...' : metaDesc}"`
    : 'No custom meta description assigned. Google will extract fallback text.';
  const wrappedSnippet = doc.splitTextToSize(snippetText, colWidth - 24);
  doc.text(wrappedSnippet, card2X + 12, card2Y + 52);

  y += cardHeight + 12;

  // ---------------------------
  // Card 3: Keyword Density
  // ---------------------------
  const card3X = margin;
  const card3Y = y;
  const card3Height = 110;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card3X, card3Y, colWidth, card3Height, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Focus Keyword Density', card3X + 12, card3Y + 18);

  const kwGoodCount = kwAudits.filter((k) => k.status === 'Optimal').length;
  doc.setFillColor(kwGoodCount >= 2 ? 16 : 245, kwGoodCount >= 2 ? 185 : 158, kwGoodCount >= 2 ? 129 : 11);
  doc.roundedRect(card3X + colWidth - 70, card3Y + 8, 58, 14, 3, 3, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(`${kwGoodCount}/${kwAudits.length} OPTIMIZED`, card3X + colWidth - 41, card3Y + 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Keywords Tracked: ${kwAudits.length}   |   Target Density: 1.0%–2.5%`, card3X + 12, card3Y + 34);
  doc.text(`Total Keyword Mentions: ${totalKwOccurrences}   |   Avg Density: ${avgKwDensity}%`, card3X + 12, card3Y + 46);

  // Micro Keyword list
  let kwRowY = card3Y + 60;
  kwAudits.slice(0, 3).forEach((k) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`• ${k.keyword.length > 20 ? k.keyword.substring(0, 18) + '..' : k.keyword}`, card3X + 12, kwRowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(k.status === 'Optimal' ? 16 : 100, k.status === 'Optimal' ? 185 : 116, k.status === 'Optimal' ? 129 : 139);
    doc.text(`${k.density}% (${k.count}x)${k.inTitle ? ' [In Title]' : ''}`, card3X + colWidth - 12, kwRowY, { align: 'right' });
    kwRowY += 12;
  });

  // ---------------------------
  // Card 4: Readability & UX
  // ---------------------------
  const card4X = margin + colWidth + 12;
  const card4Y = y;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card4X, card4Y, colWidth, card3Height, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Readability & Content Structure', card4X + 12, card4Y + 18);

  doc.setFillColor(readabilityColor[0], readabilityColor[1], readabilityColor[2]);
  doc.roundedRect(card4X + colWidth - 70, card4Y + 8, 58, 14, 3, 3, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(`${fleschScore}/100 SCORE`, card4X + colWidth - 41, card4Y + 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Flesch Reading Ease: ${fleschScore}/100 (${readabilityGrade})`, card4X + 12, card4Y + 34);
  doc.text(`Average Sentence Length: ${avgSentenceLength} words per sentence`, card4X + 12, card4Y + 46);
  doc.text(`Heading Hierarchy: ${h2Count} H2 Subheadings, ${h3Count} H3 Subsections`, card4X + 12, card4Y + 58);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const readNote =
    fleschScore >= 60
      ? 'Well-structured, conversational tone tailored for residential retrofit decision-makers.'
      : 'Sentence structures are slightly technical. Shorter paragraphs will improve comprehension.';
  const wrappedReadNote = doc.splitTextToSize(readNote, colWidth - 24);
  doc.text(wrappedReadNote, card4X + 12, card4Y + 74);

  y += card3Height + 14;

  // -------------------------------------------------------------
  // Section: Detailed Keyword Audit Table
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Target Phrase Diagnostics Table', margin, y + 8);
  y += 16;

  // Table Header
  const tableX = margin;
  const tableWidth = contentWidth;
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.setDrawColor(226, 232, 240);
  doc.rect(tableX, y, tableWidth, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('FOCUS KEYWORD PHRASE', tableX + 10, y + 12);
  doc.text('MATCHES', tableX + 220, y + 12, { align: 'center' });
  doc.text('DENSITY (%)', tableX + 300, y + 12, { align: 'center' });
  doc.text('IN TITLE', tableX + 380, y + 12, { align: 'center' });
  doc.text('AUDIT STATUS', tableX + tableWidth - 14, y + 12, { align: 'right' });
  y += 18;

  // Table Rows
  kwAudits.forEach((item, idx) => {
    const rowBg = idx % 2 === 0 ? 255 : 250;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.setDrawColor(241, 245, 249);
    doc.rect(tableX, y, tableWidth, 16, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(item.keyword, tableX + 10, y + 11);

    doc.setFont('helvetica', 'bold');
    doc.text(String(item.count), tableX + 220, y + 11, { align: 'center' });
    doc.text(`${item.density}%`, tableX + 300, y + 11, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(item.inTitle ? 16 : 148, item.inTitle ? 185 : 163, item.inTitle ? 129 : 184);
    doc.text(item.inTitle ? 'YES (Confirmed)' : 'No', tableX + 380, y + 11, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    if (item.status === 'Optimal') {
      doc.setTextColor(16, 185, 129);
      doc.text('OPTIMIZED', tableX + tableWidth - 14, y + 11, { align: 'right' });
    } else if (item.status === 'Sparse') {
      doc.setTextColor(245, 158, 11);
      doc.text('SPARSE (<1.0%)', tableX + tableWidth - 14, y + 11, { align: 'right' });
    } else if (item.status === 'High') {
      doc.setTextColor(239, 68, 68);
      doc.text('HIGH (>3.0%)', tableX + tableWidth - 14, y + 11, { align: 'right' });
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text('MISSING (0x)', tableX + tableWidth - 14, y + 11, { align: 'right' });
    }

    y += 16;
  });

  y += 12;

  // -------------------------------------------------------------
  // Actionable Publishing Recommendations Box
  // -------------------------------------------------------------
  doc.setFillColor(240, 253, 250); // Emerald-50
  doc.setDrawColor(204, 251, 241); // Emerald-100
  doc.roundedRect(margin, y, contentWidth, 68, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 148, 136); // Emerald-600
  doc.text('ACTIONABLE PUBLISHING & INDEXING RECOMMENDATIONS', margin + 12, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const rec1 = '• Ensure Google structured schema markup (Article & FAQPage) is injected prior to publication.';
  const rec2 = '• Connect 2+ relevant internal hub pillars (e.g., SEAI Grant Calculator & BER Assessment Ireland).';
  const rec3 = '• Maintain active keyword density between 1.0% and 2.5% to ensure semantic relevance without penalties.';
  doc.text(rec1, margin + 12, y + 30);
  doc.text(rec2, margin + 12, y + 42);
  doc.text(rec3, margin + 12, y + 54);

  // -------------------------------------------------------------
  // Footer
  // -------------------------------------------------------------
  const footerY = pageHeight - 24;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 8, margin + contentWidth, footerY - 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('EcoSmartHomes Ireland © SEO Hub | Confidential Diagnostic Summary', margin, footerY);
  doc.text('Page 1 of 1', margin + contentWidth, footerY, { align: 'right' });

  // Save the generated PDF
  const sanitizedFilename = `SEO-Readiness-Audit-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 35)}.pdf`;

  doc.save(sanitizedFilename);
}
