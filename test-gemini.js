import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testGeminiVertex() {
  console.log('--- EcoSmartHomes Gemini Vertex AI Test ---');
  try {
    const ai = new GoogleGenAI({
      vertexAI: true,
      project: 'gen-lang-client-0607449072',
      location: 'us-central1',
    });

    console.log('Sending prompt via Vertex AI to gemini-1.5-flash...');
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'Write a one-sentence summary of EcoSmartHomes.ie.',
    });

    console.log(
      '\n✅ SUCCESS! Gemini Response:\n',
      result.text || JSON.stringify(result),
    );
  } catch (err) {
    console.error('\n❌ Vertex AI Test Result:', err.message || err);
  }
}

testGeminiVertex();
