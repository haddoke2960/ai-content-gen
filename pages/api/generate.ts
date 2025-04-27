import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

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
    case 'YouTube Video Description':
      fullPrompt = `Write a YouTube video description for: ${prompt}`;
      break;
    case 'TikTok Hook':
      fullPrompt = `Write a viral TikTok hook for: ${prompt}`;
      break;
    case 'Hashtag Generator':
      fullPrompt = `Generate trending hashtags for: ${prompt}`;
      break;
    case 'Facebook Post':
      fullPrompt = `Write an engaging Facebook post about: ${prompt}`;
      break;
    case 'Twitter Post':
      fullPrompt = `Write a short and catchy tweet about: ${prompt}`;
      break;
    case 'WhatsApp Status':
      fullPrompt = `Write a creative WhatsApp status about: ${prompt}`;
      break;
    case 'Reddit Post':
      fullPrompt = `Write an interesting Reddit post about: ${prompt}`;
      break;
    case 'Pinterest Description':
      fullPrompt = `Write an attractive Pinterest pin description for: ${prompt}`;
      break;
    default:
      fullPrompt = prompt;
      break;
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: fullPrompt }],
    });

    const generatedText = completion.data.choices[0].message?.content || '';

    return res.status(200).json({ result: generatedText });
  } catch (error: any) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Error generating content' });
  }
}

