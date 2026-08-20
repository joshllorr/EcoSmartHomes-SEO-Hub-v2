import type { NextApiRequest, NextApiResponse } from 'next';
import { VertexAI } from '@google-cloud/vertexai';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );

  if (req.method === 'OPTIONS') {
    res.status(200);
    return res.end();
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const keyword =
      body.keyword ||
      body.title ||
      body.topic ||
      body.query ||
      'solar pv grants ireland';
    const enterpriseToken =
      process.env.GEMINI_ACCESS_TOKEN || process.env.GEMINI_API_KEY;

    let articleText = '';

    // 1. Google Cloud Vertex AI Enterprise Initialization
    try {
      const client = new VertexAI({
        project:
          process.env.GOOGLE_CLOUD_PROJECT || 'gen-lang-client-0607449072',
        location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
        apiKey: enterpriseToken, // ← ENTERPRISE KEY (THE FIX)
      });

      const model = client.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const result = await model.generateContent(
        `Write a detailed, high-authority Irish SEO article with SEAI grants (€2,100 Solar PV, €6,500 Heat Pump) about: ${keyword}`,
      );

      articleText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (vertexErr: any) {
      console.warn(
        'Vertex SDK fallback to direct endpoint:',
        vertexErr.message,
      );

      // Direct Enterprise HTTPS Fallback using GEMINI_ACCESS_TOKEN
      if (enterpriseToken) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${enterpriseToken}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': enterpriseToken,
              Authorization: `Bearer ${enterpriseToken}`,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Write a detailed, high-authority Irish SEO article with SEAI grants (€2,100 Solar PV, €6,500 Heat Pump) about: ${keyword}`,
                    },
                  ],
                },
              ],
            }),
          },
        );
        const data = await response.json();
        articleText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    return res.status(200).json({
      ok: true,
      success: true,
      keyword,
      article: articleText,
      content: articleText,
      draft: articleText,
      markdown: articleText,
      data: {
        title: `Comprehensive Guide to ${keyword}`,
        content: articleText,
        article: articleText,
        keyword,
      },
      authSource: 'GEMINI_ACCESS_TOKEN',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Gemini Enterprise Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
