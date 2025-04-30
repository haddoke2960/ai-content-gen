import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt, result } = req.body;

  // Validate request body
  if (!prompt || !result) {
    return res.status(400).json({ message: 'Missing prompt or result' });
  }

  try {
    // Save the prompt and result to Firestore
    await addDoc(collection(db, 'captions'), {
      prompt,
      result,
      createdAt: serverTimestamp(),  // Use Firestore server time for consistency
    });
    return res.status(200).json({ message: 'Saved successfully' });
  } catch (error: any) {
    console.error('Error saving history:', error);
    return res.status(500).json({ message: 'Failed to save history', error: error.message });
  }
}
