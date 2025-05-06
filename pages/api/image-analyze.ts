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

  if (!imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    console.error('[image-analyze] Unsupported file extension:', imageUrl);
    return res.status(400).json({ error: 'Image must be .jpg, .jpeg, .png, .gif, or .webp' });
  }

  try {
    console.log('[image-analyze] Analyzing:', imageUrl);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are an AI caption writer. Generate a short, fun, engaging caption for the image that could go viral on Instagram or Twitter. Do not explain — only return the caption.',
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    });

    const caption = response.choices?.[0]?.message?.content?.trim();

    if (!caption) {
      return res.status(500).json({ error: 'No caption returned from GPT-4' });
    }

    return res.status(200).json({ caption });
  } catch (err: any) {
    const errorMsg = err?.response?.data || err.message || 'Unknown error';
    console.error('[image-analyze] OpenAI API Error:', errorMsg);
    return res.status(500).json({ error: `Caption generation failed: ${errorMsg}` });
  }
}