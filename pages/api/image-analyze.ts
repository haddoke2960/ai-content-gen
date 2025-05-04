import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const imageFile = files.file;
      if (!imageFile || Array.isArray(imageFile)) {
        return res.status(400).json({ error: 'Image file is missing or invalid' });
      }

      const fileData = fs.readFileSync(imageFile.path);
      const base64 = `data:${imageFile.type};base64,${fileData.toString('base64')}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe this image for social media or a product listing.',
              },
              {
                type: 'image_url',
                image_url: { url: base64 },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      const result = response.choices?.[0]?.message?.content;

      if (!result) {
        return res.status(500).json({ error: 'No result from OpenAI.' });
      }

      return res.status(200).json({ result });
    } catch (error: any) {
      console.error('OpenAI error:', error);
      return res.status(500).json({ error: 'Image captioning failed', detail: error.message });
    }
  });
}