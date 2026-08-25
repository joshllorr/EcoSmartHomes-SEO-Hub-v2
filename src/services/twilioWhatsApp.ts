import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendJoeApprovalAlert(lead: {
  leadId: string;
  name: string;
  location: string;
  maxGrant: number;
  margin: number;
}) {
  const messageBody = `ðŸ“¾ *NEWNESS RETROFIT DIAGNOSTIC DRAFT GENERATED*
Client Name: ${lead.name} (${lead.location})
Calculated Max SEAI Grants: â‚¬${lead.maxGrant.toLocaleString()}
Estimated Project Margin: â‚¬${lead.margin.toLocaleString()}

àŸ‘‰ Reply "*APPROVE ${lead.leadId}*" to transmit PDFroadmap live to client.
ðŸ‘‰ Reply "*REJECT ${lead.leadId}*" to cancel session.`;

  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${process.env.JOE_PHONE_NUMBER}`,
    body: messageBody,
  });
}
