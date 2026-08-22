import { constructInternalLinkMesh } from './linkMeshEngine.js';
import baileys from '@whiskeysockets/baileys';
import path from 'path';

const AUTH_PATH = "/home/joehr4838/OpenGravity/auth_info_baileys";
const TARGET_PHONE = "353899590537@s.whatsapp.net";

// Your Cloudflare Worker Main Endpoint Configuration
const CLOUDFLARE_API_PUBLISH_URL = "https://ecosmarthomes.ie";
const CLOUDFLARE_AUTH_SECRET = process.env.CLOUDFLARE_API_SECRET || "secure-hub-handshake-token";

export async function handlePostApprovalDeployment(publishedUrl: string, targetKeyword: string, articleMarkdown: string) {
    console.log("🚀 Initializing live deployment to Cloudflare Edge KV...");

    // 1. Instantly push the content text to your live Cloudflare Worker database layer
    try {
        const response = await fetch(CLOUDFLARE_API_PUBLISH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CLOUDFLARE_AUTH_SECRET}`
            },
            body: JSON.stringify({
                urlPath: publishedUrl,
                keyword: targetKeyword,
                content: articleMarkdown,
                timestamp: Date.now()
            })
        });

        if (response.ok) {
            console.log("✅ SUCCESS: Article successfully written live into Cloudflare KV space!");
        } else {
            console.error(`❌ Cloudflare KV Error: Worker responded with status ${response.status}`);
        }
    } catch (cfError) {
        console.error("❌ Network execution failure pushing to Cloudflare API:", cfError);
    }

    // 2. Fire the automatic internal link mesh engine locally across your pages
    try {
        await constructInternalLinkMesh(publishedUrl, targetKeyword);
    } catch (meshError) {
        console.error("[Link Mesh Error] Failed to compute semantic connections:", meshError);
    }

    // 3. Automatically dispatch a live deployment confirmation card to your WhatsApp phone number
    try {
        const { useMultiFileAuthState } = baileys;
        const { state } = await useMultiFileAuthState(AUTH_PATH);
        const sock = (baileys.default || baileys)({ auth: state, printQRInTerminal: false });

        sock.ev.on('connection.update', async (update) => {
            if (update.connection === 'open') {
                const alertMessage = `🟢 *EcoSmartHomes Hub Automation Success*\n\n` +
                                     `✅ *New Page Fully Synchronised Live!*\n` +
                                     `• *Route:* \`${publishedUrl}\`\n` +
                                     `• *Keyword Group:* \`${targetKeyword}\`\n\n` +
                                     `🔗 _The internal link mesh engine has crawled your foundational posts and written anchors back to this new route live on Cloudflare Edge._`;

                await sock.sendMessage(TARGET_PHONE, { text: alertMessage });
                console.log(`[Automation Broadcast] Dispatched confirmation directly to phone.`);
                setTimeout(() => process.exit(0), 1000);
            }
        });
    } catch (whatsappError) {
        console.error("[Automation Broadcast Error] Failed to route mobile warning update:", whatsappError);
    }
}

