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
<<<<<<< HEAD
    const filename = `${Date.now()}.jpg`; // or use original file name if available

    const { url } = await put(filename, req, {
      access: 'public',
    });

    return res.status(200).json({ url });
  } catch (err) {
    console.error('Blob upload error:', err);
=======
   const { url } = await put(req, { access: 'public' });
return res.status(200).json({ url });
    return res.status(200).json({ url: blob.url });
  } catch (err: any) {
    console.error('Upload failed', err);
>>>>>>> 26e9c09f8ad315ef7d5be1068bb6a2597c7dd670
    return res.status(500).json({ error: 'Blob upload failed' });
  }
}
