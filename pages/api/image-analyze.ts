import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

export const config = {
  api: { bodyParser: false },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();
  
  try {
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        err ? reject(err) : resolve([fields, files]);
      });
    });

    const imageFile = files.file;
    if (!imageFile?.filepath) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imageData = fs.readFileSync(imageFile.filepath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Describe this image in 1 sentence.' },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      }],
      max_tokens: 100,
    });

    const caption = response.choices[0]?.message?.content || 'No caption generated';
    return res.status(200).json({ caption });
  } catch (error: any) {
    console.error('Image analysis error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  } finally {
    if (files?.file?.filepath) {
      fs.unlinkSync(files.file.filepath);
    }
  }
}