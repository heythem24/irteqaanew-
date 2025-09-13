import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore';

import type { FeaturedLeague, News, RecentAchievement } from '../types';

// Firestore structure: collection 'homepage', document 'main'
// {
//   heroCarousel: HeroCarouselImage[],
//   featuredLeagues: FeaturedLeague[],
//   news: News[],
//   recentAchievements: RecentAchievement[]
// }

function reviveDate<T extends Record<string, any>>(obj: T, dateKeys: string[]): T {
  const clone: any = Array.isArray(obj) ? [] : { ...obj };
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      clone[key] = reviveDate(val, dateKeys);
    } else if (Array.isArray(val)) {
      clone[key] = val.map((v) => (v && typeof v === 'object' ? reviveDate(v, dateKeys) : v));
    } else {
      clone[key] = val;
    }
  }
  // Convert direct keys if present
  for (const dk of dateKeys) {
    if (clone[dk]?.toDate) clone[dk] = clone[dk].toDate();
  }
  return clone as T;
}

function toTimestampSafe(date?: Date) {
  return date ? Timestamp.fromDate(new Date(date)) : undefined;
}

function sanitize(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (obj && typeof obj === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined) continue;
      out[k] = sanitize(v);
    }
    return out;
  }
  return obj;
}

export interface HomepageContent {
  heroCarousel: HeroCarouselImage[];
  featuredLeagues: FeaturedLeague[];
  news: News[];
  recentAchievements: RecentAchievement[];
}

export interface HeroCarouselImage {
  id: string;
  image: string; // Cloudinary URL
  alt?: string;
  createdAt?: Date;
}

const homepageCol = collection(db, 'homepage');
const homepageDocRef = doc(homepageCol, 'main');

export class HomepageService {
  static async getContent(): Promise<HomepageContent> {
    const snap = await getDoc(homepageDocRef);
    if (!snap.exists()) {
      return {
        heroCarousel: [],
        featuredLeagues: [],
        news: [],
        recentAchievements: []
      };
    }
    const data: any = snap.data();
    const heroCarousel: HeroCarouselImage[] = (data.heroCarousel || []).map((h: any) => reviveDate(h, ['createdAt']));
    const featuredLeagues: FeaturedLeague[] = (data.featuredLeagues || []).map((f: any) => reviveDate(f, ['createdAt']));
    const news: News[] = (data.news || []).map((n: any) => reviveDate(n, ['publishedAt', 'createdAt']));
    const recentAchievements: RecentAchievement[] = (data.recentAchievements || []).map((a: any) => reviveDate(a, ['achievementDate', 'createdAt']));
    return { heroCarousel, featuredLeagues, news, recentAchievements };
  }

  static async saveContent(content: HomepageContent): Promise<void> {
    const payload = sanitize({
      heroCarousel: (content.heroCarousel || []).map((h) => ({
        ...h,
        createdAt: toTimestampSafe(h.createdAt),
      })),
      featuredLeagues: content.featuredLeagues.map((f) => ({
        ...f,
        createdAt: toTimestampSafe(f.createdAt),
      })),
      news: content.news.map((n) => ({
        ...n,
        publishedAt: toTimestampSafe(n.publishedAt),
        createdAt: toTimestampSafe(n.createdAt),
      })),
      recentAchievements: content.recentAchievements.map((a) => ({
        ...a,
        achievementDate: toTimestampSafe(a.achievementDate),
        createdAt: toTimestampSafe(a.createdAt),
      })),
    });
    await setDoc(homepageDocRef, payload, { merge: true });
    // Notify UI listeners that dashboard content has been updated
    try {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('dashboardContentUpdated', { detail: { section: 'all' } });
        window.dispatchEvent(event);
      }
    } catch {
      // ignore
    }
  }
}
