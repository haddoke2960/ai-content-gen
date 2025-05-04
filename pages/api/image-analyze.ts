/**
 * /pages/api/image-analyze.ts
 * This API route handles image uploads and uses OpenAI Vision to generate a caption.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to parse form data' });
    }

    const imageFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!imageFile || !imageFile.filepath) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    try {
      const imageData = fs.readFileSync(imageFile.filepath);
      const base64Image = imageData.toString('base64');

      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this image in 1 sentence.' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 100,
      });

      const caption = response.choices?.[0]?.message?.content || 'No caption found';
      return res.status(200).json({ caption });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'Server error' });
    }
  });
}
