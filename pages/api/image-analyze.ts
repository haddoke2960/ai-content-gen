import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { imageUrl } = req.body;

  if (!imageUrl) {
    console.error('Missing imageUrl in request body');
    return res.status(400).json({ error: 'Missing image URL' });
  }

  console.log('Processing image from URL:', imageUrl);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image in a short, social-media-style caption.' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const caption = response.choices[0]?.message?.content?.trim();

    if (!caption) {
      throw new Error('No caption returned from GPT');
    }

    return res.status(200).json({ caption });
  } catch (err: any) {
    console.error('GPT Vision failed:', err.message);
    return res.status(500).json({ error: 'Caption generation failed' });
  }
}
