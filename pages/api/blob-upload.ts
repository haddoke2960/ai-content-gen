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
    const filename = `${Date.now()}.jpg`; // Create a unique file name

    const { url } = await put(filename, req, {
      access: 'public', // Important for GPT-4 Vision
    });

    return res.status(200).json({ url });
  } catch (err) {
    console.error('Blob upload error:', err);
    return res.status(500).json({ error: 'Blob upload failed' });
  }
}
