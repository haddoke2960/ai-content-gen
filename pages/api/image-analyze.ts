import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import formidable from 'formidable-serverless';

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

  form.parse(req, async (err, fields) => {
    try {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const base64 = fields.image as string;

      if (!base64 || typeof base64 !== 'string') {
        return res.status(400).json({ error: 'Invalid image data' });
      }

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