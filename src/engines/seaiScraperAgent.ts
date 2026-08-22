import { VertexAI } from '@google-cloud/vertexai';
import baileys from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';

const project = process.env.GCP_PROJECT_ID || "gen-lang-client-0607449072";
const location = process.env.GCP_REGION || "us-central1";

const vertexAI = new VertexAI({ project, location });
const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const CACHE_FILE = path.join(process.cwd(), 'dist', 'seai_feed_cache.txt');
const AUTH_PATH = path.join(process.env.HOME || '/home/joehr4838', 'OpenGravity', 'auth_info_baileys');

async function broadcastWhatsAppAlert(summaryText: string) {
    try {
        const { useMultiFileAuthState } = baileys;
        const { state } = await useMultiFileAuthState(AUTH_PATH);
        const sock = (baileys.default || baileys)({ auth: state, printQRInTerminal: false });

        sock.ev.on('connection.update', async (update) => {
            if (update.connection === 'open') {
                const targetPhone = '353899590537@s.whatsapp.net';
                const alertBody = `🏛️ *SEAI Government Policy Update Detected!*\n\n` +
                                  `${summaryText}\n\n` +
                                  `⚙️ _Action Recommended: Review your 'munster-keywords-map.json' variables to maintain production precision._`;

                await sock.sendMessage(targetPhone, { text: alertBody });
                console.log(`[SEAI Scraper Alert] Policy patch broadcast dispatched to phone session.`);
                setTimeout(() => process.exit(0), 1000);
            }
        });
    } catch (err) {
        console.error('[SEAI Scraper Alert Error] Failed sending message payload:', err);
    }
}

export async function checkSeaiGovernmentPolicyChanges() {
    console.log(`[SEAI Scraper] Initiating automated regulatory scan...`);
    const targetFeedUrl = 'https://seai.ie';

    try {
        const response = await fetch(targetFeedUrl);
        const htmlText = await response.text();
        const cleanTextChunk = htmlText.replace(/<[^>]*>/g, ' ').substring(0, 15000);

        if (fs.existsSync(CACHE_FILE)) {
            const legacyCache = fs.readFileSync(CACHE_FILE, 'utf-8');
            if (legacyCache.trim() === cleanTextChunk.trim()) {
                console.log(`[SEAI Scraper] No content alterations identified on feed.`);
                return;
            }
        }

        const prompt = `You are a legal policy analyst tracking Irish home energy upgrades. Analyze this scraped text from the SEAI news feed. Determine if there are any NEW changes, boosts, or policy alerts regarding home upgrade grants, window grants, heat pumps, or retrofitting criteria.
        
        If there are NO structural policy changes or grant adjustments, respond with exactly: "NO_CHANGES"
        If there ARE actual changes, provide a concise, high-impact bulleted summary of what altered and what the new figures are.
        
        Scraped Feed Payload:
        ${cleanTextChunk}`;

        const resultStream = await model.generateContentStream({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const actualResult = await resultStream.response;
        const textAnalysis = actualResult.candidates.content.parts.text.trim();

        if (textAnalysis.includes("NO_CHANGES")) {
            console.log(`[SEAI Scraper Analysis] Text shift detected, but engine confirmed no regulatory updates.`);
        } else {
            console.log(`[SEAI Policy Alert!] Core identified structural changes! Dispatched via OpenGravity...`);
            await broadcastWhatsAppAlert(textAnalysis);
        }

        fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
        fs.writeFileSync(CACHE_FILE, cleanTextChunk, 'utf-8');

    } catch (error) {
        console.error('[SEAI Scraper Critical Failure] Failed executing background thread:', error);
    }
}
