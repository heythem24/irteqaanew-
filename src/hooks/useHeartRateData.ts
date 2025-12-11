import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

interface HeartRateData {
  averageMaxHR: number;
  sentAt: string;
  sentBy: string;
}

export const useHeartRateData = (clubId: string) => {
  const [heartRateData, setHeartRateData] = useState<HeartRateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) {
      console.log('No clubId provided');
      setLoading(false);
      return;
    }

    console.log('Setting up heart rate listener for club:', clubId);
    const heartRateRef = doc(db, 'clubs', clubId, 'heartRateData', 'averageMaxHR');
    console.log('Document path:', `clubs/${clubId}/heartRateData/averageMaxHR`);
    
    const unsubscribe = onSnapshot(heartRateRef, (doc) => {
      console.log('Heart Rate Document Snapshot:', doc.exists(), doc.data());
      if (doc.exists()) {
        const data = doc.data() as HeartRateData;
        console.log('Setting heart rate data:', data);
        setHeartRateData(data);
      } else {
        console.log('Heart rate document does not exist');
        setHeartRateData(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to heart rate data:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clubId]);

  return { heartRateData, loading };
};