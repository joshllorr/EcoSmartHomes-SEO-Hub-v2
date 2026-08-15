import type { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyOrHandle } from '../_proxy';
import app from '../../server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return proxyOrHandle('/api/whatsapp/request-approval', req, res, (q, s) =>
    app(q as any, s as any),
  );
}
