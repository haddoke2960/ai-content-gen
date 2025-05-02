// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next';


type GenerateResult = {
  text?: string;
  imageUrl?: string;
  error?: string;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse<GenerateResult>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { type, prompt } = req.body;
  if (!type || !prompt) {
    return res.status(400).json({ error: 'Missing type or prompt.' });
  }
  try {
    if (type === 'generateImage') {
      // Use OpenAI's image generation (DALL-E 3) to create an image from text
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '512x512',
      });
      const imageUrl = imageResponse.data[0].url;
      if (!imageUrl) {
        return res.status(500).json({ error: 'Image generation failed.' });
      }
      return res.status(200).json({ imageUrl });
    } else if (type === 'productDescription') {
      // Use ChatGPT to generate a detailed product description
      const chatResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an assistant skilled at writing product descriptions.' },
          { role: 'user', content: `Write a detailed product description for: "${prompt}"` }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });
      const description = chatResponse.choices?.[0]?.message?.content?.trim();
      if (!description) {
        return res.status(500).json({ error: 'Failed to generate product description.' });
      }
      return res.status(200).json({ text: description });
    } else {
      // Fallback for any other text generation requests
      const chatResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
      });
      const output = chatResponse.choices?.[0]?.message?.content?.trim();
      if (!output) {
        return res.status(500).json({ error: 'Failed to generate content.' });
      }
      return res.status(200).json({ text: output });
    }
  } catch (error) {
    console.error('OpenAI API error (generate):', error);
    res.status(500).json({ error: 'Error generating content.' });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt, contentType } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ message: 'Invalid prompt' });
  }

  try {
    if (contentType === 'Generate Image') {
      const image = await openai.images.generate({
        prompt,
        n: 1,
        size: '512x512',
      });

      const imageUrl = image?.data?.[0]?.url;
      if (!imageUrl) {
        return res.status(500).json({ message: 'No image URL returned from OpenAI' });
      }

      return res.status(200).json({ image: imageUrl });
    }

    // For all other content types, generate text
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: contentType
            ? `You are an AI writing assistant. Generate a ${contentType} based on this: ${prompt}`
            : prompt,
        },
      ],
      temperature: 0.8,
    });

    const result = chat.choices[0].message?.content;
    return res.status(200).json({ result });
  } catch (error: any) {
    console.error('Error in generate.ts:', error);
    return res.status(500).json({ message: 'Failed to generate content', error: error.message });
  }
}