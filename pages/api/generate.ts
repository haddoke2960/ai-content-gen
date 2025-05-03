import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

type GenerateResult = {
  text?: string;
  imageUrl?: string;
  error?: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResult>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, contentType } = req.body;

  if (!prompt || !contentType) {
    return res.status(400).json({ error: 'Missing prompt or content type' });
  }

  try {
    if (contentType === 'Generate Image') {
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '512x512',
      });

      const imageUrl = imageResponse?.data?.[0]?.url;

      if (!imageUrl) {
        return res.status(500).json({ error: 'Failed to generate image' });
      }

      return res.status(200).json({ imageUrl });
    }

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Generate a ${contentType} based on this prompt: ${prompt}`,
        },
      ],
      max_tokens: 500,
    });

    const result = chatResponse.choices?.[0]?.message?.content;

    if (!result) {
      return res.status(500).json({ error: 'No result from OpenAI' });
    }

    return res.status(200).json({ text: result });
  } catch (error: any) {
    console.error('OpenAI error (generate):', error);
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
