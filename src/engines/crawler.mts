import baileys from '@whiskeysockets/baileys';
import path from 'path';

// Locate our active OpenGravity session data folder
const AUTH_PATH = path.join(process.env.HOME || '/home/joehr4838', 'OpenGravity', 'auth_info_baileys');

async function sendWhatsAppAlert(deadUrl: string, status: number, targetDomain: string) {
    try {
        const { useMultiFileAuthState } = baileys;
        const { state } = await useMultiFileAuthState(AUTH_PATH);
        
        // Re-use the existing authenticated session identity
        const sock = baileys.default({
            auth: state,
            printQRInTerminal: false
        });

        // Wait a brief moment to ensure the socket socket is active
        sock.ev.on('connection.update', async (update) => {
            if (update.connection === 'open') {
                const targetPhone = process.env.WHATSAPP_PHONE_NUMBER?.replace('+', '') + '@s.whatsapp.net';
                const alertMessage = `🚨 *EcoSmartHomes SEO Hub Alert*\n\n` +
                                     `⚠️ *Dead Link Detected!*\n` +
                                     `• *Domain:* \`${targetDomain}\`\n` +
                                     `• *Broken URL:* ${deadUrl}\n` +
                                     `• *HTTP Status:* \`${status} (Broken Page)\`\n\n` +
                                     `⚙️ _Background agent has automatically flagged this path to prevent Google Search index degradation._`;

                await sock.sendMessage(targetPhone, { text: alertMessage });
                console.log(`[Alert Engine] Securely broadcasted 404 warning to phone context.`);
            }
        });
    } catch (error) {
        console.error('[Alert Engine] Failed to dispatch mobile notification payload:', error);
    }
}

// === WHERE TO INJECT INSIDE YOUR EXISTING CRAWLER LOOP ===
// Inside your active page crawl function, catch bad responses like this:
if (response.status === 404 || response.status === 500) {
    await sendWhatsAppAlert(currentUrl, response.status, targetDomain);
}
