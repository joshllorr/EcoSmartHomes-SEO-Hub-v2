import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs';
import path from 'path';

const project = process.env.GCP_PROJECT_ID || "gen-lang-client-0607449072";
const location = process.env.GCP_REGION || "us-central1";

const vertexAI = new VertexAI({ project, location });
const model = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

interface PageAsset {
    filePath: string;
    urlPath: string;
    content: string;
}

export async function constructInternalLinkMesh(newTargetUrl: string, newTargetKeyword: string) {
    console.log(`[Link Mesh] Starting contextual mesh scanning for destination: ${newTargetUrl}`);
    
    // 1. Scan your markdown or HTML content directory where your blog posts/pages sit
    const contentDir = path.join(process.cwd(), 'content', 'pages'); 
    if (!fs.existsSync(contentDir)) {
        console.log(`[Link Mesh Warning] Content target directory not found. Skidding mesh.`);
        return;
    }

    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md') || f.endsWith('.html'));

    for (const file of files) {
        const fullPath = path.join(contentDir, file);
        let fileContent = fs.readFileSync(fullPath, 'utf-8');

        // Prevent linking back to the same page
        if (fileContent.includes(`href="${newTargetUrl}"`) || fullPath.includes(newTargetUrl)) continue;

        // 2. Ask Vertex AI if there is an intuitive anchor text phrase inside this existing article
        const prompt = `You are a strict SEO site architecture engineer. Analyze this article content and find the single best phrase to act as hyperlink anchor text linking to a new page about "${newTargetKeyword}". 
        
        Rules:
        - The anchor phrase MUST exist exactly word-for-word in the text.
        - Respond with ONLY a JSON object format: {"found": true, "exactPhrase": "the matched words"} or {"found": false}
        
        Text to analyze:
        ${fileContent.substring(0, 3000)}`;

        try {
            const responseStream = await model.generateContentStream({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            const actualResponse = await responseStream.response;
            const rawText = actualResponse.candidates.content.parts.text.replace(/```json|```/g, '').trim();
            const decision = JSON.parse(rawText);

            if (decision.found && decision.exactPhrase) {
                console.log(`[Link Mesh Match] 🔗 Found target inside ${file}: "${decision.exactPhrase}"`);
                
                // 3. Programmatically inject the raw HTML absolute hyperlink link mesh asset safely
                const replacementHtml = `<a href="${newTargetUrl}" class="seo-mesh-link">${decision.exactPhrase}</a>`;
                fileContent = fileContent.replace(decision.exactPhrase, replacementHtml);
                
                fs.writeFileSync(fullPath, fileContent, 'utf-8');
                console.log(`[Link Mesh Secured] Updated ${file} cleanly.`);
                break; // Limit to one strategic mesh injection per run to prevent over-optimisation
            }
        } catch (error) {
            console.error(`[Link Mesh Error] Failed processing mesh loop for ${file}:`, error);
        }
    }
}
