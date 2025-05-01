// pages/api/generate.ts
// Handles text and image generation based on contentType

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt, contentType } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ message: 'Invalid prompt' });
  }

  try {
    // Image generation for "Generate Image" content type
    if (contentType === 'Generate Image') {
      const image = await openai.images.generate({
        prompt,
        n: 1,
        size: '512x512' // or '1024x1024' for higher res
      });

      const imageUrl = image.data[0]?.url;
      if (!imageUrl) throw new Error('No image returned');

      return res.status(200).json({ image: imageUrl });
    }

    // Text generation for all other content types
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: contentType
            ? `You are an AI writing assistant. Generate a ${contentType} based on this: ${prompt}`
            : prompt,
        },
      ],
      temperature: 0.8,
    });

    const result = chat.choices[0].message?.content;
    return res.status(200).json({ result });
  } catch (error: any) {
    console.error('Error in generate.ts:', error);
    return res.status(500).json({ message: 'Failed to generate content', error: error.message });
  }
}
