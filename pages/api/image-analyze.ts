// pages/api/image-analyze.ts
// Handles uploaded image (base64) and sends it to OpenAI Vision model

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { base64 } = req.body;

  if (!base64 || typeof base64 !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing image data' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image for social media or product listing.'
            },
            {
              type: 'image_url',
              image_url: { url: base64 },
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const result = response.choices?.[0]?.message?.content;

    if (!result) {
      return res.status(500).json({ error: 'No result returned from OpenAI Vision' });
    }

    return res.status(200).json({ result });
  } catch (error: any) {
    console.error('OpenAI Vision error:', error);
    return res.status(500).json({ error: 'Image analysis failed', detail: error.message });
  }
}
