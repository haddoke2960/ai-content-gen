// pages/api/generate.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt, contentType } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ message: 'Invalid prompt' });
  }

  try {
    if (contentType === 'Generate Image') {
      const image = await openai.images.generate({
        prompt,
        n: 1,
        size: '512x512',
      });

      const imageUrl = image?.data?.[0]?.url;
      if (!imageUrl) {
        return res.status(500).json({ message: 'No image URL returned from OpenAI' });
      }

      return res.status(200).json({ image: imageUrl });
    }

    // For all other content types, generate text
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