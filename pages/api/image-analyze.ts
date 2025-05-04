import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';
import formidable from 'formidable';
import fs from 'fs';

// Disable default body parsing, as we'll use Formidable for multipart data
export const config = {
  api: {
    bodyParser: false,
  },
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || '',  // Ensure your OpenAI API key is set in environment
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Use Formidable to parse the incoming form-data (image file upload)
  const form = new formidable.IncomingForm();
  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Failed to parse form data' });
    }
    try {
      // The file field name is assumed to be "file" (as appended in the form data)
      let uploadedFile = files.file;
      if (!uploadedFile) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      // If multiple files (unlikely here), take the first one
      if (Array.isArray(uploadedFile)) {
        uploadedFile = uploadedFile[0];
      }

      // Read the file data into a base64-encoded string
      const filePath: string = uploadedFile.filepath || uploadedFile.path;  // `.filepath` for Formidable v2, `.path` for v1
      const fileData = await fs.promises.readFile(filePath);
      const mimeType: string = uploadedFile.mimetype || 'image/jpeg';
      const base64Image = fileData.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      // Call OpenAI GPT-4 (vision) to describe the image.
      // The content is an array with a text prompt and the image data as an "image_url".
      const completion = await openai.createChatCompletion({
        model: 'gpt-4-vision-preview',  // Requires GPT-4 Vision access
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Provide a concise caption describing this image.' },
              { type: 'image_url', image_url: { url: dataUrl } }
            ]
          }
        ],
        // max_tokens: 500,  // (Optional) limit tokens if needed
      });

      const answer = completion.data.choices?.[0]?.message?.content;
      if (!answer) {
        return res.status(500).json({ error: 'No caption generated from image' });
      }
      // Return the generated caption
      res.status(200).json({ caption: answer.trim() });
    } catch (error: any) {
      console.error('Error in image-analyze:', error);
      // Handle OpenAI or other errors
      const msg = error.response?.data?.error?.message || error.message || 'Image analysis failed';
      res.status(500).json({ error: msg });
    }
  });
}