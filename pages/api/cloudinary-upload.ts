import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import formidable, { Fields, Files } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Cloudinary credentials
cloudinary.config({
  cloud_name: 'dykeynprc',
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new formidable.IncomingForm();

  form.parse(req, async (err: any, fields: Fields, files: Files) => {
    if (err || !files.file) {
      console.error('[cloudinary-upload] Upload parse error:', err);
      return res.status(400).json({ error: 'Failed to read file.' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = file.filepath;

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'ai-content-gen',
        resource_type: 'image',
      });

      return res.status(200).json({ url: result.secure_url });
    } catch (uploadError: any) {
      console.error('[cloudinary-upload] Cloudinary error:', uploadError);
      return res.status(500).json({ error: 'Image upload to Cloudinary failed.' });
    } finally {
      fs.unlinkSync(filePath); // clean up temp file
    }
  });
}