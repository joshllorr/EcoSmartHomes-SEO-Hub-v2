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
      body.keyword || body.title || body.topic || 'solar pv grants ireland';

    // 🎯 ENTERPRISE VERTEX AI CLIENT WITH GEMINI_ACCESS_TOKEN
    const client = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION,
      apiKey: process.env.GEMINI_ACCESS_TOKEN, // ← ENTERPRISE KEY (THE FIX)
    } as any);

    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash-001',
    });

    const result = await model.generateContent(
      `Write a detailed SEO article about: ${keyword}`,
    );

    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      (typeof (result?.response as any)?.text === 'function'
        ? (result.response as any).text()
        : '');

    return res.status(200).json({
      ok: true,
      success: true,
      keyword,
      article: text,
      content: text,
      draft: text,
      markdown: text,
      data: {
        article: text,
        content: text,
        keyword,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Gemini Enterprise Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
