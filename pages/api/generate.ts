import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt, contentType } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    if (contentType === 'Generate Image') {
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      });

      const imageUrl = imageResponse?.data?.[0]?.url;

      if (!imageUrl) {
        return res.status(500).json({ error: 'No image URL returned from OpenAI' });
      }

      return res.status(200).json({ imageUrl });
    } else {
      const chatResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });

      const result = chatResponse.choices?.[0]?.message?.content?.trim();

      if (!result) {
        return res.status(500).json({ error: 'No result from OpenAI' });
      }

      return res.status(200).json({ result });
    }
  } catch (err: any) {
    console.error('OpenAI API Error:', err);
    return res.status(500).json({ error: 'Something went wrong with OpenAI API' });
  }
}
