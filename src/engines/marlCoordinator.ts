import { GoogleGenAI } from '@google/genai';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY || '').trim() });
const MATRIX_PATH = path.join(process.cwd(), 'src', 'engines', 'munster-keywords-map.json');
const MATRIX_PATH = path.join(process.cwd(), 'src', 'engines', 'munster-keywords-map.json');
export async function executeProgrammaticMunsterCampaign() {
