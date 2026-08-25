import { Request, Response } from 'express';

export const handleWhatsAppWebhook = async (req: Request, res: Response) => {
  const incomingMsg = (req.body.Body || '').trim();
  const fromNumber = req.body.From;

  console.log(`💥 Inbound WhatsApp message from ${fromNumber}: "${incomingMsg}"`);

  if (incomingMsg.startsWith('APPROVE')) {
    const leadId = incomingMsg.split(' ')[1];
    console.log(`👎 [APPROVED] Dispatching finalized PDF roadmap for lead: ${leadId}`);

    res.type('text/xml').send(`
      <Response>
        <Message>🝅 Approved! Feasibility Roadmap is being dispatched to the client.</Message>
      </Response>
    `);
  } else if (incomingMsg.startsWith('REJECT')) {
    const leadId = incomingMsg.split(' ')[1];
    console.log(`🝑 [REJECTED] Lead session dropped: ${leadId}`);

    res.type('text/xml').send(`
      <Response>
        <Message>🝑 Session ${leadId} has been rejected.</Message>
      </Response>
    `);
  } else {
    res.type('text/xml').send(`
      <Response>
        <Message>Unrecognized command. Reply "APPROVE &lt;leadId&gt;" or "REJECT &lt;leadId&gt;".</Message>
      </Response>
    `);
  }
};
