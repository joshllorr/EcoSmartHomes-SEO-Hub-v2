import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs';
import path from 'path';

const project = 'gen-lang-client-0607449072';
const location = 'us-central1';

const vertexAI = new VertexAI({ project, location });

// Use gemini-2.5-flash (Nano Banana 2) for immediate, cost-effective vision loops
const model = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

function convertLocalFileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };
}

async function runVisionExtractionTest() {
    console.log("📸 Initializing Nano Banana 2 Structural Vision Scan...");
    
    // Put a test image file path here (e.g., a sample roof layout jpeg)
    const testFilePath = path.join(process.cwd(), 'dist', 'sample_roof.jpg');
    
    if (!fs.existsSync(testFilePath)) {
        console.log(`❌ Test failed: Please drop a file named 'sample_roof.jpg' into your dist folder first.`);
        return;
    }

    const imageBufferPart = convertLocalFileToGenerativePart(testFilePath, "image/jpeg");
    const textPromptPart = { text: "Analyze this roof for solar panel installation space. State orientation (North/South/East/West) and obstructions." };

    try {
        const resultStream = await model.generateContentStream({
            contents: [{ role: 'user', parts: [imageBufferPart, textPromptPart] }],
        });
        const finalResponse = await resultStream.response;
        console.log("\n=================== VISION OUTPUT ===================");
        console.log(finalResponse.candidates.content.parts.text);
        console.log("=====================================================");
        console.log("\n✅ Success: Multimodal asset parsing is live on your cloud credits.");
    } catch (err) {
        console.error("Vertex Multimodal Error:", err);
    }
}

runVisionExtractionTest();
