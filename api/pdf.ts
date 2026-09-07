import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateRetrofitPdfHtml } from '../src/engines/logic/pdf/retrofitPdf';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = (req.query.id as string) || 'grant_2026_08_03_1207';
    const plan = {
      plan_id: id.startsWith('plan_') ? id : `plan_${id}`,
      grant_id: id,
    };
    const user = {
      name: "Sarah O'Connor",
      eircode: id.includes('1142') ? 'T12 Y5R8' : 'V94 X2C9',
    };

    const html = generateRetrofitPdfHtml(plan, user);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (err: any) {
    return res
      .status(500)
      .send(`Failed to generate PDF blueprint: ${err.message || err}`);
  }
}
