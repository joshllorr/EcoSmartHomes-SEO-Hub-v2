import { GoogleGenAI, Type } from '@google/genai';

function getAIClient(): GoogleGenAI {
  return new GoogleGenAI(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : {});
}

export interface ExtractedBuildingMetrics {
  currentBERRating: string;
  targetBERRating: string;
  floorAreaSqm: number;
  heatPumpViabilityScore: number;
  estimatedWallUValue: number;
  calculatedSeaiGrants: number;
  recommendedUpgrades: string[];
}

export async function parseRetrofitDocument(
  pdfBuffer: Buffer
): Promise<ExtractedBuildingMetrics> {
  const ai = getAIClient();
  const base64Pdf = pdfBuffer.toString('base64');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Pdf,
            },
          },
          {
            text: `You are an expert Irish Building Energy Rating (BER) Technical Advisor.
Analyze this property document and extract key structural metrics according to SEAI grant frameworks and SR50 guidelines.
Extract the current BER, target BER after deep retrofit, floor area in m², heat pump viability score (0-100), estimated wall U-value, calculated SEAI grant matching total in EUR, and list of recommended upgrades.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentBERRating: { type: Type.STRING },
          targetBERRating: { type: Type.STRING },
          floorAreaSqm: { type: Type.NUMBER },
          heatPumpViabilityScore: { type: Type.NUMBER },
          estimatedWallUValue: { type: Type.NUMBER },
          calculatedSeaiGrants: { type: Type.NUMBER },
          recommendedUpgrades: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          'currentBERRating',
          'targetBERRating',
          'floorAreaSqm',
          'heatPumpViabilityScore',
          'estimatedWallUValue',
          'calculatedSeaiGrants',
          'recommendedUpgrades',
        ],
      },
    },
  });


  return JSON.parse(response.text!) as ExtractedBuildingMetrics;
}
