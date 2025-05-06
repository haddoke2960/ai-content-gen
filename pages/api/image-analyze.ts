// pages/api/image-analyze.ts
import { OpenAI } from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { imageUrl } = req.body;

  if (!imageUrl) return res.status(400).json({ error: 'Missing image URL' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image in a creative caption.' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const caption = completion.choices[0].message.content;
    res.status(200).json({ caption });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Caption generation failed' });
  }
}