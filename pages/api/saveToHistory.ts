import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(">> saveToHistory called with", req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, result } = req.body;

    await addDoc(collection(db, 'captions'), {
      prompt,
      result,
      createdAt: new Date(),
    });

    res.status(200).json({ message: 'Saved successfully' });
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({ message: 'Failed to save history' });
  }
}
