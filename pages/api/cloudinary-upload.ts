import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: 'dykeynprc',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      if (err || !files.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const filePath = file.filepath;

      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'ai-content-gen',
        resource_type: 'auto',
      });

      return res.status(200).json({ url: result.secure_url });
    } catch (error) {
      console.error('[cloudinary-upload] Error:', error);
      return res.status(500).json({ error: error.message || 'Upload failed' });
    } finally {
      const file = Array.isArray(files?.file) ? files?.file[0] : files?.file;
      if (file && fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
    }
  });
}
