import { db } from '../../firebase'; 
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'captions'));
    const deletePromises = querySnapshot.docs.map((document) => deleteDoc(document.ref));
    await Promise.all(deletePromises);

    res.status(200).json({ message: 'All history cleared.' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ error: 'Error clearing history.' });
  }
}
