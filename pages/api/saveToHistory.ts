// pages/api/saveToHistory.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, result } = req.body;

    if (!prompt || !result) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    await addDoc(collection(db, 'history'), {
      prompt,
      result,
      createdAt: serverTimestamp(),
    });

    return res.status(200).json({ message: 'Saved successfully' });
  } catch (error) {
    console.error('Error saving to history:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

