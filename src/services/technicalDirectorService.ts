import { db } from '../config/firebase';
import { addDoc, collection, doc, getDocs, query, updateDoc, where, serverTimestamp } from 'firebase/firestore';

/**
 * Service for Technical Director features (e.g., Periodisation Annuelle)
 */
export class TechnicalDirectorService {
  /**
   * Save or update the periodisation data for a given club and month.
   * Data is stored in 'td_periodisation' collection, uniquely by (clubId, month).
   */
  static async savePeriodisation(clubId: string, month: string, data: any): Promise<string> {
    const colRef = collection(db, 'td_periodisation');
    const qy = query(colRef, where('clubId', '==', clubId), where('month', '==', month));
    const snap = await getDocs(qy);
    const payload: any = {
      clubId,
      month,
      data,
      updatedAt: serverTimestamp(),
    };
    if (!snap.empty) {
      const d = snap.docs[0];
      await updateDoc(doc(db, 'td_periodisation', d.id), payload);
      return d.id;
    } else {
      const ref = await addDoc(colRef, { ...payload, createdAt: serverTimestamp() });
      return ref.id;
    }
  }

  /**
   * Load periodisation data for a given club and month. Returns the saved data or null.
   */
  static async getPeriodisation(clubId: string, month: string): Promise<any | null> {
    const colRef = collection(db, 'td_periodisation');
    const qy = query(colRef, where('clubId', '==', clubId), where('month', '==', month));
    const snap = await getDocs(qy);
    if (snap.empty) return null;
    const d = snap.docs[0];
    const x = d.data() as any;
    return x?.data ?? null;
  }
}
