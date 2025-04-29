// pages/api/translate.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Data = {
  message?: string;
  translated?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { text, language } = req.body;

  if (!text || !language) {
    return res.status(400).json({ message: 'Missing text or language' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Translate the following into ${language}: ${text}`,
        },
      ],
    });

    const translated = completion.choices[0].message?.content?.trim();
    res.status(200).json({ translated });
  } catch (error) {
    console.error('Translate API error:', error);
    res.status(500).json({ message: 'Translation failed' });
  }
}
