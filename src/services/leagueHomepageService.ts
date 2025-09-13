import { db } from '../config/firebase';
import { doc, collection, getDoc, setDoc, Timestamp } from 'firebase/firestore';

export interface LeagueAthleteCard {
  id: string;
  name?: string;
  nameAr?: string;
  belt?: string;
  beltAr?: string;
  highlight?: string;
  image?: string;
  createdAt?: Date;
}

export interface LeagueAchievementItem {
  id: string;
  title?: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  date?: Date;
  image?: string;
  createdAt?: Date;
}

export interface LeagueEventItem {
  id: string;
  title?: string;
  titleAr?: string;
  date?: Date;
  image?: string;
  createdAt?: Date;
}

export interface LeagueHomepageContent {
  standoutAthletes: LeagueAthleteCard[];
  achievements: LeagueAchievementItem[];
  upcomingEvents: LeagueEventItem[];
  managementTeam?: LeagueManagementMember[];
  leagueClubs?: LeagueClubCard[];
  president?: LeaguePresident;
  headerLogo?: string; // league header logo shown on public league page
  hideImages?: boolean; // globally hide section images on league page
}

export interface LeagueManagementMember {
  id: string;
  nameAr?: string;
  positionAr?: string;
  image?: string;
  createdAt?: Date;
}

export interface LeagueClubCard {
  id: string;          // entry id
  clubId: string;      // reference to clubs collection
  image?: string;      // optional override image for the card
  createdAt?: Date;
}

export interface LeaguePresident {
  nameAr?: string;
  positionAr?: string; // e.g., رئيس الرابطة
  image?: string;      // Cloudinary URL
  bioAr?: string;
  email?: string;
  phone?: string;
  experiences?: string[]; // bullet points
  achievements?: string[]; // bullet points
  updatedAt?: Date;
}

function toTs(d?: Date) {
  return d ? Timestamp.fromDate(new Date(d)) : undefined;
}

function revive(obj: any, dateKeys: string[]): any {
  if (!obj) return obj;
  const c: any = Array.isArray(obj) ? [] : { ...obj };
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (Array.isArray(v)) c[k] = v.map((i) => revive(i, dateKeys));
    else if (v && typeof v === 'object') c[k] = revive(v, dateKeys);
    else c[k] = v;
  }
  for (const dk of dateKeys) {
    if (c[dk]?.toDate) c[dk] = c[dk].toDate();
  }
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

export class LeagueHomepageService {
  static col = collection(db, 'leagueHomepage');

  static async getContent(leagueId: string): Promise<LeagueHomepageContent> {
    const ref = doc(this.col, leagueId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { standoutAthletes: [], achievements: [], upcomingEvents: [], managementTeam: [], leagueClubs: [] };
    }
    const d: any = snap.data();
    return {
      standoutAthletes: (d.standoutAthletes || []).map((a: any) => revive(a, ['createdAt'])),
      achievements: (d.achievements || []).map((a: any) => revive(a, ['date', 'createdAt'])),
      upcomingEvents: (d.upcomingEvents || []).map((e: any) => revive(e, ['date', 'createdAt'])),
      managementTeam: (d.managementTeam || []).map((m: any) => revive(m, ['createdAt'])),
      leagueClubs: (d.leagueClubs || []).map((c: any) => revive(c, ['createdAt'])),
      president: d.president ? revive(d.president, ['updatedAt']) : undefined,
      headerLogo: d.headerLogo || undefined,
      hideImages: !!d.hideImages,
    };
  }

  static async saveContent(leagueId: string, content: LeagueHomepageContent): Promise<void> {
    const ref = doc(this.col, leagueId);
    const payload = sanitize({
      standoutAthletes: (content.standoutAthletes || []).map((a) => ({ ...a, createdAt: toTs(a.createdAt) })),
      achievements: (content.achievements || []).map((a) => ({ ...a, date: toTs(a.date), createdAt: toTs(a.createdAt) })),
      upcomingEvents: (content.upcomingEvents || []).map((e) => ({ ...e, date: toTs(e.date), createdAt: toTs(e.createdAt) })),
      managementTeam: (content.managementTeam || []).map((m) => ({ ...m, createdAt: toTs(m.createdAt) })),
      leagueClubs: (content.leagueClubs || []).map((c) => ({ ...c, createdAt: toTs(c.createdAt) })),
      president: content.president ? { ...content.president, updatedAt: toTs(content.president.updatedAt) } : undefined,
      headerLogo: content.headerLogo,
      hideImages: !!content.hideImages,
    });
    await setDoc(ref, payload, { merge: true });
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('leagueHomepageUpdated', { detail: { leagueId } }));
      }
    } catch {}
  }
}
