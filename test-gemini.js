import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testGeminiVertex() {
  console.log('--- EcoSmartHomes Gemini Vertex AI Enterprise Test ---');
  try {
    const project =
      process.env.GOOGLE_CLOUD_PROJECT || 'gen-lang-client-0607449072';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const apiKey = process.env.GEMINI_API_KEY;

    console.log(
      `Connecting to Vertex AI (Project: ${project}, Location: ${location})...`,
    );

    // Supports both Vertex AI Express Key and Google Cloud ADC/OAuth
    const ai = new GoogleGenAI({
      vertexai: true,
      apiKey: apiKey && apiKey.startsWith('AQ.') ? apiKey : undefined,
      project: apiKey && apiKey.startsWith('AQ.') ? undefined : project,
      location: location,
    });

    console.log('Sending prompt via Vertex AI to gemini-2.5-flash...');
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents:
        'Write a one-sentence summary of EcoSmartHomes Ireland SEO Hub.',
    });

    console.log(
      '\n✅ SUCCESS! Gemini Vertex AI Response:\n',
      result.text || JSON.stringify(result),
    );
  } catch (err) {
    console.error('\n❌ Vertex AI Test Result:', err.message || err);
  }
}

testGeminiVertex();
