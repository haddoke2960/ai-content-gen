import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

type GenerateResult = {
  result?: string;
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

  try {
    if (contentType === 'Generate Image') {
      try {
        const imageResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: prompt.slice(0, 500),
          n: 1,
          size: '1024x1024',
        });

        const imageUrl = imageResponse.data[0]?.url;
        if (!imageUrl) {
          throw new Error("No image URL returned.");
        }

        return res.status(200).json({ imageUrl });
      } catch (error: any) {
        console.error("OpenAI Image API Error:", error.message);
        return res.status(400).json({ error: "Image generation failed." });
      }
    }

    const isViralTag = contentType === 'ViralTag';

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: isViralTag
            ? `Generate exactly 10 unique, viral hashtags separated by commas about: ${prompt}`
            : `Generate a ${contentType} based on: ${prompt}`,
        },
      ],
      max_tokens: isViralTag ? 200 : 500,
    });

    const result = chatResponse.choices[0]?.message?.content;

    if (!result) {
      return res.status(500).json({ error: 'Content generation failed.' });
    }

    return res.status(200).json({ result });
  } catch (error: any) {
    console.error("OpenAI API Error:", error.message);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}