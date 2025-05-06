import { put } from '@vercel/blob';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { blob } = await put(req, {
      access: 'public', // Important: makes the image viewable by OpenAI
    });

    return res.status(200).json({ url: blob.url });
  } catch (err: any) {
    console.error('Upload failed', err);
    return res.status(500).json({ error: 'Blob upload failed' });
  }
}