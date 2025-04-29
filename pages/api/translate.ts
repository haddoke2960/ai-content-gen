import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { text, targetLang } = req.body;

  // Mocked translations for demonstration
  const fakeTranslations: Record<string, string> = {
    es: 'Texto traducido al español',
    fr: 'Texte traduit en français',
    de: 'Ins Deutsche übersetzter Text',
    ar: 'النص المترجم إلى العربية',
    hi: 'हिंदी में अनुवादित पाठ',
    ur: 'اردو میں ترجمہ شدہ متن',
    pa: 'ਪੰਜਾਬੀ ਵਿੱਚ ਅਨੁਵਾਦਿਤ ਪਾਠ',
    ru: 'Переведённый текст на русский',
    fa: 'متن ترجمه شده به فارسی',
    tg: 'Матни тарҷумашуда ба тоҷикӣ',
  };

  const translatedText = fakeTranslations[targetLang] || `Translated (${targetLang}): ${text}`;

  return res.status(200).json({ translatedText });
}
