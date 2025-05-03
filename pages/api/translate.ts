import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Missing text or targetLanguage' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Translate the following text to ${targetLanguage}: ${text}`,
        },
      ],
    });

    const translated = response.choices?.[0]?.message?.content;

    if (!translated) {
      return res.status(500).json({ error: 'No translation returned from OpenAI' });
    }

    return res.status(200).json({ translated });
  } catch (error: any) {
    console.error('OpenAI translation error:', error);
    return res.status(500).json({ error: 'Translation failed', detail: error.message });
  }
}
