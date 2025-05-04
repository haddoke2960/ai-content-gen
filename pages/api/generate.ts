import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

type GenerateResult = { result?: string; imageUrl?: string; error?: string };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse<GenerateResult>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, contentType } = req.body;
  if (!prompt || !contentType) return res.status(400).json({ error: 'Missing parameters' });

  try {
    if (contentType === 'Generate Image') {
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt.slice(0, 500),
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      });

      const imageUrl = imageResponse.data[0]?.url;
      return imageUrl ? res.json({ imageUrl }) : res.status(500).json({ error: 'Image generation failed' });
    }

    const isViralTag = contentType === 'ViralTag';
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: isViralTag 
          ? `Generate exactly 10 unique, viral hashtags separated by commas about: ${prompt}`
          : `Generate a ${contentType} based on: ${prompt}`
      }],
      max_tokens: isViralTag ? 200 : 500
    });

    const result = chatResponse.choices[0]?.message?.content;
    return result ? res.json({ result }) : res.status(500).json({ error: 'Generation failed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}