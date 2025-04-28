

// pages/api/clearHistory.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
    const querySnapshot = await getDocs(collection(db, 'captions'));
    const deletePromises = querySnapshot.docs.map((document) =>
      deleteDoc(doc(db, 'captions', document.id))
    );

    await Promise.all(deletePromises);

    return res.status(200).json({ message: 'Database cleared successfully' });
  } catch (error) {
    console.error('Error clearing database history:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}