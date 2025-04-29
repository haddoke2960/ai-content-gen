import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ message: 'Missing text or target language' });
  }

  try {
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
        format: 'text',
      }),
    });

    const data = await response.json();

    if (!data.translatedText) {
      return res.status(500).json({ message: 'Translation failed' });
    }

    res.status(200).json({ translatedText: data.translatedText });
  } catch (error) {
    res.status(500).json({ message: 'Translation error', error });
  }
}
