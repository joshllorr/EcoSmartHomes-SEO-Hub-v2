import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../../server';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
