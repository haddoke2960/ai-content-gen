import type { NextApiRequest, NextApiResponse } from 'next';
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, type } = req.body;

  if (!prompt || !type) {
    return res.status(400).json({ error: 'Missing prompt or contentType' });
  }

  let fullPrompt = '';

  switch (type) {
    case 'Instagram Caption':
      fullPrompt = `Write a catchy Instagram caption for this topic: ${prompt}`;
      break;
    case 'Product Description':
      fullPrompt = `Write a compelling product description for: ${prompt}`;
      break;
    case 'LinkedIn Post':
      fullPrompt = `Write a professional LinkedIn post about: ${prompt}`;
      break;
    default:
      fullPrompt = prompt;
      break;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
    });

    const output = completion.choices[0].message.content;
    res.status(200).json({ result: output });
  } catch (error: any) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'Something went wrong with OpenAI' });
  }
}