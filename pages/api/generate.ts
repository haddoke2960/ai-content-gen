import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || '',
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'No prompt provided.' });
  }
  const promptText = prompt.trim();

  try {
    // **Viral Tags Generation Mode** – detect the "#ViralTag" keyword
    if (promptText.toLowerCase().startsWith('#viraltag')) {
      // Remove the "#ViralTag" prefix to get the topic
      const topic = promptText.replace(/^#ViralTag\s*/i, '');
      const tagPrompt = `Generate 10 viral hashtags relevant to "${topic}". 
Make sure they are creative, relevant, and varied. 
Respond with the 10 hashtags, separated by commas, and no other commentary.`;

      // Use a text completion (ChatGPT) to generate the tags
      const tagResponse = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: tagPrompt }],
        temperature: 0.7,
        max_tokens: 100,
      });
      const tagText = tagResponse.data.choices?.[0]?.message?.content;
      if (!tagText) {
        return res.status(500).json({ error: 'No tags generated' });
      }
      // Clean up the output (ensure it's a single comma-separated string)
      let tags = tagText.trim();
      // Sometimes the model might output line breaks or numbers – normalize it:
      tags = tags.replace(/\n/g, ', ').replace(/\s*,\s*$/g, '');
      return res.status(200).json({ tags });
    }

    // **Image Generation Mode** – if request explicitly indicates image generation
    if (req.body.image === true) {
      const imagePrompt = promptText;
      const imageResponse = await openai.createImage({
        prompt: imagePrompt,
        n: 1,
        size: '512x512',  // or '1024x1024' for higher resolution
        response_format: 'url',  // get URL to keep response small
      });
      const imageUrl = imageResponse.data.data?.[0]?.url;
      if (!imageUrl) {
        return res.status(500).json({ error: 'Image generation failed.' });
      }
      return res.status(200).json({ imageUrl });
    }

    // **Text Generation Mode** – default (using ChatGPT for general prompts)
    const chatResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: promptText }],
      temperature: 0.7,
      max_tokens: 1000,
    });
    const answer = chatResponse.data.choices?.[0]?.message?.content;
    if (!answer) {
      return res.status(500).json({ error: 'No result from generation.' });
    }
    res.status(200).json({ result: answer.trim() });
  } catch (error: any) {
    console.error('Error in /api/generate:', error);
    // Extract error info if available from OpenAI error response
    if (error.response?.data) {
      const code = error.response.status || 500;
      const message = error.response.data.error?.message || 'OpenAI API error';
      return res.status(code).json({ error: message });
    }
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}