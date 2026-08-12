import type { VercelRequest, VercelResponse } from '@vercel/node';

export async function proxyOrHandle(
  endpointPath: string,
  req: VercelRequest,
  res: VercelResponse,
  fallbackAppHandler?: (req: any, res: any) => any,
) {
  const backendUrl = process.env.BACKEND_URL;

  if (backendUrl) {
    try {
      const baseUrl = backendUrl.replace(/\/$/, '');
      const targetUrl = `${baseUrl}${endpointPath}`;
      const response = await fetch(targetUrl, {
        method: req.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization
            ? { Authorization: req.headers.authorization as string }
            : {}),
        },
        body:
          req.method !== 'GET' && req.method !== 'HEAD'
            ? JSON.stringify(req.body || {})
            : undefined,
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err: any) {
      return res.status(500).json({
        error: `Proxy to BACKEND_URL failed: ${err?.message || String(err)}`,
        targetUrl: `${backendUrl.replace(/\/$/, '')}${endpointPath}`,
      });
    }
  }

  if (fallbackAppHandler) {
    return fallbackAppHandler(req, res);
  }

  return res.status(500).json({
    error: 'BACKEND_URL environment variable is not configured on Vercel.',
  });
}
