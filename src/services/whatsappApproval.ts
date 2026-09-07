import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

const JOE_WHATSAPP_NUMBER =
  process.env.JOE_WHATSAPP_NUMBER || 'whatsapp:+3538XXXXXXXX'; // User phone number
const TWILIO_WHATSAPP_NUMBER =
  process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio WhatsApp number

export interface DraftItem {
  title: string;
  slug: string;
  content: string;
  description: string;
  timestamp?: number;
}

// In-memory pending draft registry
const pendingDrafts: Map<string, DraftItem> = new Map();

export async function savePendingDraft(
  slug: string,
  draft: DraftItem,
): Promise<void> {
  pendingDrafts.set(slug, { ...draft, timestamp: Date.now() });
}

export async function getPendingDraft(
  slug: string,
): Promise<DraftItem | undefined> {
  return pendingDrafts.get(slug);
}

export async function removePendingDraft(slug: string): Promise<boolean> {
  return pendingDrafts.delete(slug);
}

// 1. Send Draft to WhatsApp for Joe's Approval
export async function requestWhatsAppApproval(draft: DraftItem): Promise<void> {
  await savePendingDraft(draft.slug, draft);

  const messageText =
    `📰 *NEW SEO ARTICLE DRAFT GENERATED*\n\n` +
    `*Title*: ${draft.title}\n` +
    `*Slug*: ${draft.slug}\n` +
    `*Summary*: ${draft.description || 'No description provided.'}\n\n` +
    `Reply *APPROVE ${draft.slug}* to publish immediately to www.ecosmarthomes.ie\n` +
    `Reply *REJECT ${draft.slug}* to discard.`;

  if (client) {
    try {
      await client.messages.create({
        from: TWILIO_WHATSAPP_NUMBER,
        to: JOE_WHATSAPP_NUMBER,
        body: messageText,
      });
      console.log(`[WhatsApp] Approval requested for: ${draft.slug}`);
    } catch (err: any) {
      console.error(
        `[WhatsApp Error] Failed to send approval message for ${draft.slug}:`,
        err?.message || err,
      );
    }
  } else {
    console.log(
      `[WhatsApp Mock] Approval requested for: ${draft.slug} (Configure TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN to send live WhatsApp messages)`,
    );
  }
}

// 2. Incoming WhatsApp Webhook Handler (Express endpoint in SEO Hub)
export async function handleWhatsAppWebhook(req: any, res: any): Promise<void> {
  const incomingMsg = req.body?.Body?.trim();
  const fromNumber = req.body?.From;

  console.log(
    `[WhatsApp Webhook] Incoming message from ${fromNumber}: "${incomingMsg}"`,
  );

  if (incomingMsg) {
    const parts = incomingMsg.split(/\s+/);
    const command = parts[0].toUpperCase();
    const slug = parts[1];

    if (command === 'APPROVE' && slug) {
      const draft = await getPendingDraft(slug);
      if (draft) {
        try {
          // Send approved article directly to Cloudflare Worker bridge / CMS publish endpoint
          const publishUrl =
            process.env.CMS_PUBLISH_URL ||
            'https://www.ecosmarthomes.ie/api/publish';
          const response = await fetch(publishUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: draft.title,
              slug: draft.slug,
              content: draft.content,
              description: draft.description,
            }),
          });

          const result = await response
            .json()
            .catch(() => ({ status: 'success' }));
          await removePendingDraft(slug);

          console.log(
            `[WhatsApp] Published article ${slug} to ${publishUrl}:`,
            result,
          );

          // Notify Joe on WhatsApp that it is live!
          if (client) {
            await client.messages.create({
              from: TWILIO_WHATSAPP_NUMBER,
              to: fromNumber || JOE_WHATSAPP_NUMBER,
              body: `🚀 *ARTICLE LIVE ON ECOSMARTHOMES.IE!*\n\nURL: https://www.ecosmarthomes.ie/articles/${draft.slug}.html`,
            });
          }
        } catch (err: any) {
          console.error(
            `[WhatsApp Publish Error] Failed to publish ${slug}:`,
            err?.message || err,
          );
          if (client) {
            await client.messages.create({
              from: TWILIO_WHATSAPP_NUMBER,
              to: fromNumber || JOE_WHATSAPP_NUMBER,
              body: `❌ *PUBLISH FAILED for ${slug}*: ${err?.message || 'Network error'}`,
            });
          }
        }
      } else {
        if (client) {
          await client.messages.create({
            from: TWILIO_WHATSAPP_NUMBER,
            to: fromNumber || JOE_WHATSAPP_NUMBER,
            body: `⚠️ *DRAFT NOT FOUND*: No pending draft found for slug "${slug}".`,
          });
        }
      }
    } else if (command === 'REJECT' && slug) {
      await removePendingDraft(slug);
      console.log(`[WhatsApp] Draft rejected: ${slug}`);
      if (client) {
        await client.messages.create({
          from: TWILIO_WHATSAPP_NUMBER,
          to: fromNumber || JOE_WHATSAPP_NUMBER,
          body: `🗑️ *DRAFT REJECTED*: Article "${slug}" has been discarded.`,
        });
      }
    }
  }

  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>');
}
