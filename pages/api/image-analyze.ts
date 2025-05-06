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

  // Smart MIME validation using GET + Range
  try {
    const headRes = await fetch(imageUrl, {
      method: 'GET',
      headers: { Range: 'bytes=0-1' },
      redirect: 'follow',
    });

    if (!headRes.ok) {
      throw new Error(`HTTP error! status: ${headRes.status}`);
    }

    const contentType = headRes.headers.get('content-type');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!contentType || !allowedTypes.some(type => contentType.startsWith(type))) {
      console.error('[image-analyze] Invalid content type:', contentType);
      return res.status(400).json({
        error: 'Unsupported image type. Only PNG, JPG, GIF, or WEBP allowed.',
      });
    }
  } catch (err: any) {
    console.error('[image-analyze] Failed to validate image MIME type:', err);
    return res.status(400).json({
      error: err.message.includes('HTTP error')
        ? 'Failed to fetch image for validation'
        : 'Failed to verify image type before captioning.',
    });
  }

  // Call OpenAI to generate caption
  try {
    console.log('[image-analyze] Sending image to GPT-4:', imageUrl);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: "You're a creative social media caption expert. Look at this image and write a short, emotional, funny, or relatable caption that could go viral. Respond with just the caption — no quotes, no hashtags, no explanation.",
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
      console.error('[image-analyze] No caption returned from GPT');
      return res.status(500).json({ error: 'No caption returned from GPT-4' });
    }

    return res.status(200).json({ caption });
  } catch (err: any) {
    const errorMsg = err?.response?.data || err.message || 'Unknown error';
    console.error('[image-analyze] OpenAI API Error:', errorMsg);
    return res.status(500).json({ error: `Caption generation failed: ${errorMsg}` });
  }
}