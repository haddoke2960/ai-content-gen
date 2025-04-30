import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { text, targetLanguage } = req.body;

  // Validate request body
  if (!text || !targetLanguage) {
    return res.status(400).json({ message: 'Missing text or targetLanguage' });
  }

  try {
    // Call OpenAI API for translation
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Translate the following text to ${targetLanguage}: ${text}`,
        },
      ],
    });

    const translated = response.choices[0].message.content;
    return res.status(200).json({ translated });
  } catch (error: any) {
    console.error('Error during translation:', error);
    return res.status(500).json({ message: 'Translation failed', error: error.message });
  }
}
