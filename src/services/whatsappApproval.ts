import twilio from 'twilio';
import fs from 'fs';
import path from 'path';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

const JOE_WHATSAPP_NUMBER = process.env.JOE_WHATSAPP_NUMBER || process.env.JOE_PHONE_NUMBER || 'whatsapp:+353899590537';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

const DRAFTS_FILE = path.join(process.cwd(), 'data', 'pending-drafts.json');

function ensureDir() {
  const dir = path.dirname(DRAFTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export interface DraftItem {
  id?: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  timestamp?: number;
}

export async function savePendingDraft(key: string, draft: DraftItem): Promise<void> {
  ensureDir();
  let drafts: Record<string, DraftItem> = {};
  if (fs.existsSync(DRAFTS_FILE)) {
    try { drafts = JSON.parse(fs.readFileSync(DRAFTS_FILE, 'utf8')); } catch (_) {}
  }
  const cleanKey = key.toLowerCase().trim();
  drafts[cleanKey] = { ...draft, timestamp: Date.now() };
  if (draft.slug) drafts[draft.slug.toLowerCase().trim()] = drafts[cleanKey];
  if (draft.id) drafts[draft.id.toLowerCase().trim()] = drafts[cleanKey];
  fs.writeFileSync(DRAFTS_FILE, JSON.stringify(drafts, null, 2));
}

export async function getPendingDraft(key: string): Promise<DraftItem | undefined> {
  if (!fs.existsSync(DRAFTS_FILE)) return undefined;
  try {
    const drafts = JSON.parse(fs.readFileSync(DRAFTS_FILE, 'utf8'));
    return drafts[key.toLowerCase().trim()];
  } catch (_) {
    return undefined;
  }
}

export async function removePendingDraft(key: string): Promise<void> {
  if (!fs.existsSync(DRAFTS_FILE)) return;
  try {
    const drafts = JSON.parse(fs.readFileSync(DRAFTS_FILE, 'utf8'));
    delete drafts[key.toLowerCase().trim()];
    fs.writeFileSync(DRAFTS_FILE, JSON.stringify(drafts, null, 2));
  } catch (_) {}
}

// 1. Send Draft to WhatsApp for Joe's Approval
export async function requestWhatsAppApproval(draft: DraftItem): Promise<void> {
  const approvalKey = draft.id || draft.slug;
  await savePendingDraft(approvalKey, draft);

  const messageText =
    `📰 *NEW SEO ARTICLE DRAFT GENERATED*\n\n` +
    `*Title*: ${draft.title}\n` +
    `*Key*: ${approvalKey}\n` +
    `*Summary*: ${draft.description || 'No description provided.'}\n\n` +
    `👉 Reply *APPROVE ${approvalKey}* to publish immediately to www.ecosmarthomes.ie\n` +
    `👉 Reply *REJECT ${approvalKey}* to discard.`;

  if (client) {
    try {
      const msg = await client.messages.create({
        from: TWILIO_WHATSAPP_NUMBER,
        to: JOE_WHATSAPP_NUMBER,
        body: messageText,
      });
      console.log(`[WhatsApp] Approval requested for: ${approvalKey}, SID: ${msg.sid}`);
    } catch (err: any) {
      console.error(`[WhatsApp Error] Failed to send approval message:`, err?.message || err);
    }
  } else {
    console.log(`[WhatsApp Mock] Approval requested for: ${approvalKey}`);
  }
}

// 2. Incoming WhatsApp Webhook Handler (Express endpoint in SEO Hub)
export async function handleWhatsAppWebhook(req: any, res: any): Promise<void> {
  const incomingMsg = req.body?.Body?.trim() || '';
  const fromNumber = req.body?.From;

  console.log(`[WhatsApp Webhook] Incoming message from ${fromNumber}: "${incomingMsg}"`);

  if (!incomingMsg) {
    res.setHeader('Content-Type', 'text/xml');
    return res.send('<Response></Response>');
  }

  const parts = incomingMsg.split(/\s+/);
  const command = parts[0].toUpperCase();
  const key = parts[1];

  let replyText = '';

  if (command === 'APPROVE' && key) {
    const draft = await getPendingDraft(key);
    if (draft) {
      try {
        const publishUrl = process.env.CMS_PUBLISH_URL || 'https://www.ecosmarthomes.ie/api/publish';
        console.log(`🚀 [Publishing] Sending "${draft.title}" to ${publishUrl}...`);

        const response = await fetch(publishUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: draft.title,
            slug: draft.slug,
            content: draft.content,
            description: draft.description,
            tags: ['Retrofit', 'SEAI Grants', 'BER Rating']
          }),
        });

        const data: any = await response.json().catch(() => ({}));

        if (response.ok && (data.ok || data.success)) {
          const liveUrl = data.url || `https://www.ecosmarthomes.ie/articles/${draft.slug}.html`;
          replyText = `🎉 Article "${draft.title}" APPROVED and published live!\n\n🔗 View live: ${liveUrl}`;
          await removePendingDraft(key);
        } else {
          replyText = `⚠️ Approved, but publication returned an error: ${data.error || response.statusText}`;
        }
      } catch (pubErr: any) {
        replyText = `⚠️ Error connecting to publish API: ${pubErr.message}`;
      }
    } else {
      replyText = `⚠️ Draft "${key}" not found or already published.`;
    }
  } else if (command === 'REJECT' && key) {
    await removePendingDraft(key);
    replyText = `🚫 Draft "${key}" has been rejected and discarded.`;
  } else {
    replyText = `🤖 EcoSmartHomes Bot: Send APPROVE <key> or REJECT <key>.`;
  }

  res.setHeader('Content-Type', 'text/xml');
  return res.send(`<Response><Message>${replyText}</Message></Response>`);
}
