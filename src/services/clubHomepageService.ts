import { db } from '../config/firebase';
import { collection, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

export interface ClubHomepageContent {
  foundedYear?: number | string;
  athletesCount?: number;
  aboutAr?: string;
  aboutExtraAr?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

function toTs(d?: Date) {
  return d ? Timestamp.fromDate(new Date(d)) : undefined;
}

function revive(obj: any): any {
  if (!obj) return obj;
  const c: any = { ...obj };
  if (c.createdAt?.toDate) c.createdAt = c.createdAt.toDate();
  if (c.updatedAt?.toDate) c.updatedAt = c.updatedAt.toDate();
  return c;
}

function sanitize(o: any): any {
  if (o === undefined) return null;
  if (o === null) return null;
  if (Array.isArray(o)) return o.map(sanitize);
  if (typeof o === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined) continue;
      out[k] = sanitize(v);
    }
    return out;
  }
  return o;
}

export class ClubHomepageService {
  static col = collection(db, 'clubHomepage');

  static async getContent(clubId: string): Promise<ClubHomepageContent> {
    const ref = doc(this.col, String(clubId));
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { foundedYear: undefined, athletesCount: undefined, aboutAr: '', aboutExtraAr: [] };
    }
    return revive(snap.data());
  }

  static async saveContent(clubId: string, content: ClubHomepageContent): Promise<void> {
    const ref = doc(this.col, String(clubId));
    const now = new Date();
    const payload = sanitize({
      ...content,
      createdAt: toTs((content && content.createdAt) || now),
      updatedAt: toTs(now),
    });
    await setDoc(ref, payload, { merge: true });
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clubHomepageUpdated', { detail: { clubId: String(clubId) } }));
      }
    } catch {}
  }
}
