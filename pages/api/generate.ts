
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

// Setup OpenAI with your API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// API Route Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, type } = req.body;

  if (!prompt || !type) {
    return res.status(400).json({ error: "Missing prompt or contentType" });
  }

  let fullPrompt = "";

  switch (type) {
    case "Instagram Caption":
      fullPrompt = `Write a catchy Instagram caption for this topic: ${prompt}`;
      break;
    case "Product Description":
      fullPrompt = `Write a compelling product description for: ${prompt}`;
      break;
    case "LinkedIn Post":
      fullPrompt = `Write a professional LinkedIn post about: ${prompt}`;
      break;
    case "YouTube Video Description":
      fullPrompt = `Write a detailed YouTube video description for: ${prompt}`;
      break;
    case "TikTok Hook":
      fullPrompt = `Write a viral TikTok hook for: ${prompt}`;
      break;
    case "Hashtag Generator":
      fullPrompt = `Generate trending hashtags for: ${prompt}`;
      break;
    case "Facebook Post":
      fullPrompt = `Write an engaging Facebook post about: ${prompt}`;
      break;
    case "Twitter Post":
      fullPrompt = `Write a short and catchy Twitter post for: ${prompt}`;
      break;
    case "WhatsApp Message":
      fullPrompt = `Write a creative WhatsApp message for: ${prompt}`;
      break;
    case "Reddit Post":
      fullPrompt = `Write a Reddit post for: ${prompt}`;
      break;
    case "Pinterest Pin Description":
      fullPrompt = `Write a Pinterest pin description for: ${prompt}`;
      break;
    default:
      fullPrompt = prompt;
      break;
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
    });

    const output = completion.data.choices[0].message?.content;
    res.status(200).json({ result: output });
  } catch (error: any) {
    console.error("OpenAI API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate content" });
  }
}
