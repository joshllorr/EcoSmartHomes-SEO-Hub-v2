import { Request, Response } from 'express';
import { parseRetrofitDocument } from '../../services/pdfParser';
import { sendJoeApprovalAlert } from '../../services/twilioWhatsApp';

export const handleDocumentUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const stripeSessionId = req.body.stripeSessionId || 'manual_upload';
    const leadId = `cashel-${Date.now().toString(36)}`;

    console.log(`📖 Received PDF file: ${req.file.originalname} for session: ${stripeSessionId}`);

    // 1. Parse using Gemini 2.5 Flash
    console.log('🦰 Parsing with Gemini 2.5 Flash...');
    const metrics = await parseRetrofitDocument(req.file.buffer);

    // 2. Send WhatsApp approval alert to Joe
    await sendJoeApprovalAlert({
      leadId,
      name: 'Homeowner',
      location: 'Cashel, Tipperary',
      maxGrant: metrics.calculatedSeaiGrants,
      margin: Math.round(metrics.calculatedSeaiGrants * 0.25),
    });

    console.log(`2_Notification dispatched to Joe for lead: ${leadId}`);

    res.json({
      success: true,
      leadId,
      metrics,
      message: 'Document analyzed successfully and queued for review.',
    });
  } catch (err: any) {
    console.error('Error processing retrofit upload:', err);
    res.status(500).json({ error: err.message || 'Failed to process document.' });
  }
};
