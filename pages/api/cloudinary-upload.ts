import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import formidable, { File } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Cloudinary config
cloudinary.config({
  cloud_name: 'dykeynprc',
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Custom types
interface FormDataFields {
  [key: string]: string[];
}

interface FormDataFiles {
  file: File | File[];
  [key: string]: File | File[] | undefined;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ url?: string; error?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();

    const { fields, files } = await new Promise<{
      fields: FormDataFields;
      files: FormDataFiles;
    }>((resolve, reject) => {
      form.parse(req, (err: any, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    if (!files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = file.filepath;

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'ai-content-gen',
        resource_type: 'auto',
      });

      return res.status(200).json({ url: result.secure_url });
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('[cloudinary-upload] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Upload failed',
    });
  }
}