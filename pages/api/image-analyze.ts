import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageUrl } = req.body;

  if (!imageUrl) {
    console.error('[image-analyze] Missing imageUrl');
    return res.status(400).json({ error: 'Missing image URL' });
  }

  if (
    !imageUrl.endsWith('.jpg') &&
    !imageUrl.endsWith('.jpeg') &&
    !imageUrl.endsWith('.png')
  ) {
    console.error('[image-analyze] Unsupported file type:', imageUrl);
    return res.status(400).json({ error: 'Only JPG and PNG images are supported.' });
  }

  try {
    console.log('[image-analyze] Analyzing image:', imageUrl);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image in a short, engaging social media caption.' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const caption = response.choices?.[0]?.message?.content?.trim();

    if (!caption) {
      console.error('[image-analyze] No caption returned from GPT');
      return res.status(500).json({ error: 'Caption generation failed' });
    }

    return res.status(200).json({ caption });
  } catch (err: any) {
    console.error('[image-analyze] OpenAI API Error:', err.message || err);
    return res.status(500).json({ error: 'Caption generation failed' });
  }
}
