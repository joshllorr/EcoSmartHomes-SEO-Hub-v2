declare module 'next' {
  export interface NextApiRequest {
    query: Record<string, any>;
    body?: any;
    method?: string;
    headers: Record<string, any>;
  }
  export interface NextApiResponse {
    status: (code: number) => NextApiResponse;
    json: (body: any) => NextApiResponse | void;
    send: (body: any) => NextApiResponse | void;
  }
}
