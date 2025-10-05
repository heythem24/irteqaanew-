// Note: Removed pass-through re-exports to avoid circular dependency with mockDataService.
import { db } from '../config/firebase';
import type { Club, League, User, Competition, Participation, Pairings, PairMatch, CompetitionOrganizer, OrganizerRole } from '../types';
import { leagues as mockLeagues } from '../data/mockData';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Firebase compatibility types
export type WhereFilterOp = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';
export type Unsubscribe = () => void;

// ===== Utilities: Timestamp <-> Date handling =====
function tsToDate(value: unknown): Date {
  try {
    if (value instanceof Date) return value;
    if (value && typeof value === 'object' && (value as Timestamp).toDate) return (value as Timestamp).toDate();
    if (typeof value === 'number') return new Date(value);
  } catch { }
  return new Date();
}

// ===== Competition Organizers (per-competition accounts) =====
export class CompetitionOrganizersService {
  static async createOrganizer(data: Omit<CompetitionOrganizer, 'id' | 'createdAt' | 'isActive'> & { isActive?: boolean }): Promise<string> {
    const payload: any = {
      ...data,
      isActive: data.isActive ?? true,
      createdAt: serverTimestamp()
    };
    Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k]; });
    const ref = await addDoc(collection(db, 'competition_organizers'), payload);
    return ref.id;
  }

  static async listByCompetition(competitionId: string): Promise<CompetitionOrganizer[]> {
    const qy = query(collection(db, 'competition_organizers'), where('competitionId', '==', competitionId));
    const snap = await getDocs(qy);
    return snap.docs.map(d => {
      const x = d.data() as any;
      return {
        id: d.id,
        competitionId: x.competitionId,
        username: x.username,
        password: x.password,
        role: x.role as OrganizerRole,
        mat: x.mat,
        isActive: Boolean(x.isActive),
        createdAt: tsToDate(x.createdAt)
      } as CompetitionOrganizer;
    });
  }

  static async deleteOrganizer(id: string): Promise<void> {
    await deleteDoc(doc(db, 'competition_organizers', id));
  }

  static async login(competitionId: string, username: string, password: string, role: OrganizerRole): Promise<CompetitionOrganizer | null> {
    const qy = query(
      collection(db, 'competition_organizers'),
      where('competitionId', '==', competitionId),
      where('username', '==', username),
      where('password', '==', password),
      where('role', '==', role),
      where('isActive', '==', true)
    );
    const snap = await getDocs(qy);
    if (snap.empty) return null;
    const d = snap.docs[0];
    const x = d.data() as any;
    return {
      id: d.id,
      competitionId: x.competitionId,
      username: x.username,
      password: x.password,
      role: x.role as OrganizerRole,
      mat: x.mat,
      isActive: Boolean(x.isActive),
      createdAt: tsToDate(x.createdAt)
    } as CompetitionOrganizer;
  }
}

// Mapper for competitions
function mapCompetitionData(id: string, data: any): Competition {
  return {
    id,
    name: data.name,
    nameAr: data.nameAr,
    leagueId: data.leagueId,
    place: data.place,
    placeAr: data.placeAr,
    description: data.description,
    descriptionAr: data.descriptionAr,
    level: data.level,
    wilayaId: typeof data.wilayaId === 'number' ? data.wilayaId : undefined,
    image: data.image,
    registrationDeadline: data.registrationDeadline ? tsToDate(data.registrationDeadline) : undefined,
    registrationDeadlineTime: typeof data.registrationDeadlineTime === 'string' ? data.registrationDeadlineTime : undefined,
    startDate: tsToDate(data.startDate),
    startTime: typeof data.startTime === 'string' ? data.startTime : undefined,
    endDate: tsToDate(data.endDate),
    endTime: typeof data.endTime === 'string' ? data.endTime : undefined,
    status: data.status,
    categories: Array.isArray(data.categories) ? data.categories : [],
    weights: data.weights || undefined,
    isActive: Boolean(data.isActive),
    createdAt: tsToDate(data.createdAt)
  } as Competition;
}

// ===== Competitions Service backed by Firestore =====
export class CompetitionsService {
  static async createCompetition(data: Omit<Competition, 'id' | 'createdAt'>): Promise<string> {
    const payload: any = {
      ...data,
      startDate: data.startDate instanceof Date ? data.startDate : new Date(data.startDate as any),
      endDate: data.endDate instanceof Date ? data.endDate : new Date(data.endDate as any),
      registrationDeadline: data.registrationDeadline
        ? (data.registrationDeadline instanceof Date ? data.registrationDeadline : new Date(data.registrationDeadline as any))
        : undefined,
      weights: data.weights || undefined,
      isActive: data.isActive ?? true,
      createdAt: serverTimestamp()
    };
    Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k]; });
    const ref = await addDoc(collection(db, 'competitions'), payload);
    return ref.id;
  }

  static async updateCompetition(id: string, data: Partial<Competition>): Promise<void> {
    const ref = doc(db, 'competitions', id);
    const { createdAt, ...rest } = data as any;
    const payload: any = { ...rest };
    if (payload.startDate) payload.startDate = payload.startDate instanceof Date ? payload.startDate : new Date(payload.startDate);
    if (payload.endDate) payload.endDate = payload.endDate instanceof Date ? payload.endDate : new Date(payload.endDate);
    if (payload.registrationDeadline) payload.registrationDeadline = payload.registrationDeadline instanceof Date ? payload.registrationDeadline : new Date(payload.registrationDeadline);
    if (payload.weights === undefined) delete payload.weights; // لا ترسل undefined
    // Remove undefined fields (Firestore updateDoc does not accept undefined values)
    Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k]; });
    await updateDoc(ref, payload);
  }

  static async deleteCompetition(id: string): Promise<void> {
    const ref = doc(db, 'competitions', id);
    await deleteDoc(ref);
  }

  static async getCompetitionById(id: string): Promise<Competition | null> {
    const ref = doc(db, 'competitions', id);
    const ds = await getDoc(ref);
    return ds.exists() ? mapCompetitionData(ds.id, ds.data()) : null;
  }

  static async getAllCompetitions(): Promise<Competition[]> {
    const snap = await getDocs(collection(db, 'competitions'));
    return snap.docs.map(d => mapCompetitionData(d.id, d.data()));
  }

  static async getCompetitionsByStatus(status: 'upcoming' | 'ongoing' | 'finished'): Promise<Competition[]> {
    const qy = query(collection(db, 'competitions'), where('status', '==', status));
    const snap = await getDocs(qy);
    return snap.docs.map(d => mapCompetitionData(d.id, d.data()));
  }
}

// ===== Pairings (Random Draw) Service =====
export class PairingsService {
  // جلب القرعة حسب البطولة
  static async getPairingsByCompetition(competitionId: string): Promise<Pairings | null> {
    const qy = query(collection(db, 'pairings'), where('competitionId', '==', competitionId));
    const snap = await getDocs(qy);
    if (snap.empty) return null;
    const d = snap.docs[0];
    const data = d.data() as any;
    return {
      id: d.id,
      competitionId: data.competitionId,
      matches: Array.isArray(data.matches) ? data.matches : [],
      createdAt: tsToDate(data.createdAt)
    } as Pairings;
  }

  // إنشاء/استبدال القرعة
  static async createOrReplacePairings(competitionId: string, matches: PairMatch[]): Promise<string> {
    // حذف القديمة إن وجدت
    const qy = query(collection(db, 'pairings'), where('competitionId', '==', competitionId));
    const snap = await getDocs(qy);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'pairings', d.id));
    }
    // نظّف أي حقول undefined داخل كل مباراة لأن Firestore لا يقبل undefined
    const sanitizedMatches = matches.map((m) => {
      const x: any = { ...m };
      Object.keys(x).forEach((k) => {
        if (x[k] === undefined) delete x[k];
      });
      // لا ترسل مفاتيح فارغة
      if (x.athlete1Id === '') delete x.athlete1Id;
      if (x.athlete2Id === '') delete x.athlete2Id;
      return x;
    });

    const payload: any = {
      competitionId,
      matches: sanitizedMatches,
      createdAt: serverTimestamp()
    };
    Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k]; });
    const ref = await addDoc(collection(db, 'pairings'), payload);
    return ref.id;
  }

  // جلب معرف وثيقة القرعة لهذه البطولة
  private static async getPairingsDocRef(competitionId: string) {
    const qy = query(collection(db, 'pairings'), where('competitionId', '==', competitionId));
    const snap = await getDocs(qy);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, data: d.data() as any };
  }

  // تحديث نتيجة مباراة: ضبط الفائز وتعيين الحالة منتهية
  static async setMatchWinner(competitionId: string, matchIndex: number, winnerId: string, updatedBy?: string): Promise<void> {
    const docInfo = await this.getPairingsDocRef(competitionId);
    if (!docInfo) throw new Error('لا توجد قرعة محفوظة لهذه البطولة');
    const matches = Array.isArray(docInfo.data.matches) ? [...docInfo.data.matches] : [];
    if (matchIndex < 0 || matchIndex >= matches.length) throw new Error('فهرس مباراة غير صالح');
    const prev = matches[matchIndex] || {};
    // منع التقدم للدور التالي قبل اكتمال كل مباريات الدور السابق (لنفس المرحلة ولنفس المجموعة)
    const stage = (prev as any).stage || 'main';
    const roundNum: number | undefined = (prev as any).round;
    const groupKey: string = (prev as any).groupKey || '';
    if (roundNum && roundNum > 1) {
      const prevRound = roundNum - 1;
      const prevRoundMatches = matches.filter((mm: any) => (
        (mm?.round || 1) === prevRound &&
        ((mm?.stage) || 'main') === stage &&
        ((mm?.groupKey) || '') === groupKey
      ));
      if (prevRoundMatches.length > 0 && prevRoundMatches.some((mm: any) => (mm?.status || 'pending') !== 'finished')) {
        throw new Error('لا يمكن إعلان فائز قبل اكتمال جميع مباريات الدور السابق.');
      }
    }
    // تحقق من اكتمال مباريات المصدر (from1/from2) إن وُجدت
    const f1: number | undefined = (prev as any).from1;
    const f2: number | undefined = (prev as any).from2;
    if (typeof f1 === 'number' && matches[f1] && (matches[f1] as any).status !== 'finished') {
      throw new Error('لا يمكن إعلان فائز قبل اكتمال مباراة المصدر الأولى.');
    }
    if (typeof f2 === 'number' && matches[f2] && (matches[f2] as any).status !== 'finished') {
      throw new Error('لا يمكن إعلان فائز قبل اكتمال مباراة المصدر الثانية.');
    }
    const edits = Array.isArray(prev.edits) ? prev.edits : [];
    edits.push({ at: new Date() as any, reason: 'تأكيد النتيجة', previousWinnerId: prev.winnerId ?? null, updatedBy });
    const updated = { ...prev, winnerId, status: 'finished', edits } as any;
    matches[matchIndex] = updated;
    // انشر الفائز إلى المباراة التالية إن كان هناك nextIndex/nextSlot
    if (typeof updated.nextIndex === 'number' && (updated.nextSlot === 1 || updated.nextSlot === 2)) {
      const tIdx = updated.nextIndex as number;
      if (tIdx >= 0 && tIdx < matches.length) {
        const tgt = { ...(matches[tIdx] || {}) } as any;
        // التحقق من أن الفائز ينتمي إلى نفس المجموعة (الفئة/الجنس/الوزن) قبل التقدم
        const sourceGroupKey = (updated as any).groupKey;
        const targetGroupKey = (tgt as any).groupKey;

        // فقط السماح بالتقدم إذا كانت المجموعات متطابقة
        if (sourceGroupKey === targetGroupKey) {
          if (updated.nextSlot === 1) tgt.athlete1Id = winnerId; else tgt.athlete2Id = winnerId;
          matches[tIdx] = tgt;
        }
      }
    }
    // انشر الخاسر إلى مباراة البرونزية إن كانت معرفة
    const a1 = (updated as any).athlete1Id as string | undefined;
    const a2 = (updated as any).athlete2Id as string | undefined | null;
    const loserId = winnerId === a1 ? (a2 || null) : (winnerId === (a2 || undefined) ? (a1 || null) : null);
    if (loserId && typeof updated.loserNextIndex === 'number' && (updated.loserNextSlot === 1 || updated.loserNextSlot === 2)) {
      const lbIdx = updated.loserNextIndex as number;
      if (lbIdx >= 0 && lbIdx < matches.length) {
        const lb = { ...(matches[lbIdx] || {}) } as any;
        // التحقق من أن الخاسر ينتمي إلى نفس المجموعة (الفئة/الجنس/الوزن) قبل التقدم
        const sourceGroupKey = (updated as any).groupKey;
        const targetGroupKey = (lb as any).groupKey;

        // فقط السماح بالتقدم إذا كانت المجموعات متطابقة
        if (sourceGroupKey === targetGroupKey) {
          if (updated.loserNextSlot === 1) lb.athlete1Id = loserId; else lb.athlete2Id = loserId;
          // تأكيد أن مباراة البرونزية تبقى قيد الانتظار حتى تأكيدها يدوياً
          lb.status = 'pending';
          lb.winnerId = null;
          matches[lbIdx] = lb;
        }
      }
    }
    await updateDoc(doc(db, 'pairings', docInfo.id), { matches });
  }

  // تعديل نتيجة مباراة مع سبب تعديل
  static async editMatchWinner(competitionId: string, matchIndex: number, winnerId: string, reason: string, updatedBy?: string): Promise<void> {
    const docInfo = await this.getPairingsDocRef(competitionId);
    if (!docInfo) throw new Error('لا توجد قرعة محفوظة لهذه البطولة');
    const matches = Array.isArray(docInfo.data.matches) ? [...docInfo.data.matches] : [];
    if (matchIndex < 0 || matchIndex >= matches.length) throw new Error('فهرس مباراة غير صالح');
    const prev = matches[matchIndex] || {};
    // منع التعديل على مباراة دور لاحق قبل اكتمال كل مباريات الدور السابق (نفس المرحلة ونفس المجموعة)
    const stage2 = (prev as any).stage || 'main';
    const roundNum2: number | undefined = (prev as any).round;
    const groupKey2: string = (prev as any).groupKey || '';
    if (roundNum2 && roundNum2 > 1) {
      const prevRound = roundNum2 - 1;
      const prevRoundMatches = matches.filter((mm: any) => (
        (mm?.round || 1) === prevRound &&
        ((mm?.stage) || 'main') === stage2 &&
        ((mm?.groupKey) || '') === groupKey2
      ));
      if (prevRoundMatches.length > 0 && prevRoundMatches.some((mm: any) => (mm?.status || 'pending') !== 'finished')) {
        throw new Error('لا يمكن تعديل النتيجة قبل اكتمال جميع مباريات الدور السابق.');
      }
    }
    // تحقق من اكتمال مباريات المصدر from1/from2
    const ef1: number | undefined = (prev as any).from1;
    const ef2: number | undefined = (prev as any).from2;
    if (typeof ef1 === 'number' && matches[ef1] && (matches[ef1] as any).status !== 'finished') {
      throw new Error('لا يمكن تعديل النتيجة قبل اكتمال مباراة المصدر الأولى.');
    }
    if (typeof ef2 === 'number' && matches[ef2] && (matches[ef2] as any).status !== 'finished') {
      throw new Error('لا يمكن تعديل النتيجة قبل اكتمال مباراة المصدر الثانية.');
    }
    const edits = Array.isArray(prev.edits) ? prev.edits : [];
    edits.push({ at: new Date() as any, reason, previousWinnerId: prev.winnerId ?? null, updatedBy });
    const updated = { ...prev, winnerId, status: 'finished', edits } as any;
    matches[matchIndex] = updated;
    // انشر الفائز المعدّل إلى المباراة التالية
    if (typeof updated.nextIndex === 'number' && (updated.nextSlot === 1 || updated.nextSlot === 2)) {
      const tIdx = updated.nextIndex as number;
      if (tIdx >= 0 && tIdx < matches.length) {
        const tgt = { ...(matches[tIdx] || {}) } as any;
        // التحقق من أن الفائز ينتمي إلى نفس المجموعة (الفئة/الجنس/الوزن) قبل التقدم
        const sourceGroupKey = (updated as any).groupKey;
        const targetGroupKey = (tgt as any).groupKey;

        // فقط السماح بالتقدم إذا كانت المجموعات متطابقة
        if (sourceGroupKey === targetGroupKey) {
          if (updated.nextSlot === 1) tgt.athlete1Id = winnerId; else tgt.athlete2Id = winnerId;
          matches[tIdx] = tgt;
        }
      }
    }
    // انشر الخاسر المعدّل إلى مباراة البرونزية إن كانت معرفة
    const a1 = (updated as any).athlete1Id as string | undefined;
    const a2 = (updated as any).athlete2Id as string | undefined | null;
    const loserId = winnerId === a1 ? (a2 || null) : (winnerId === (a2 || undefined) ? (a1 || null) : null);
    if (loserId && typeof updated.loserNextIndex === 'number' && (updated.loserNextSlot === 1 || updated.loserNextSlot === 2)) {
      const lbIdx = updated.loserNextIndex as number;
      if (lbIdx >= 0 && lbIdx < matches.length) {
        const lb = { ...(matches[lbIdx] || {}) } as any;
        // التحقق من أن الخاسر ينتمي إلى نفس المجموعة (الفئة/الجنس/الوزن) قبل التقدم
        const sourceGroupKey = (updated as any).groupKey;
        const targetGroupKey = (lb as any).groupKey;

        // فقط السماح بالتقدم إذا كانت المجموعات متطابقة
        if (sourceGroupKey === targetGroupKey) {
          if (updated.loserNextSlot === 1) lb.athlete1Id = loserId; else lb.athlete2Id = loserId;
          // أبق مباراة البرونزية قيد الانتظار دائماً حتى تأكيدها
          lb.status = 'pending';
          lb.winnerId = null;
          matches[lbIdx] = lb;
        }
      }
    }
    await updateDoc(doc(db, 'pairings', docInfo.id), { matches });
  }
}

// ===== Participations Service =====
export class ParticipationsService {
  static async createParticipation(data: Omit<Participation, 'id' | 'createdAt'>): Promise<string> {
    const payload: any = {
      ...data,
      status: (data as any).status ?? 'approved',
      createdAt: serverTimestamp()
    };
    Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k]; });
    const ref = await addDoc(collection(db, 'participations'), payload);
    return ref.id;
  }

  static async getParticipationsByCompetition(competitionId: string): Promise<Participation[]> {
    const qy = query(collection(db, 'participations'), where('competitionId', '==', competitionId));
    const snap = await getDocs(qy);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any), createdAt: tsToDate((d.data() as any).createdAt) } as Participation));
  }

  static async getParticipationForAthlete(competitionId: string, athleteId: string): Promise<Participation | null> {
    const qy = query(
      collection(db, 'participations'),
      where('competitionId', '==', competitionId),
      where('athleteId', '==', athleteId)
    );
    const snap = await getDocs(qy);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as any), createdAt: tsToDate((d.data() as any).createdAt) } as Participation;
  }

  static async deleteParticipation(id: string): Promise<void> {
    const ref = doc(db, 'participations', id);
    await deleteDoc(ref);
  }
}

function mapLeagueData(id: string, data: any): League {
  return {
    id,
    sportId: data.sportId,
    wilayaId: data.wilayaId,
    wilayaName: data.wilayaName,
    wilayaNameAr: data.wilayaNameAr,
    name: data.name,
    nameAr: data.nameAr,
    description: data.description,
    descriptionAr: data.descriptionAr,
    presidentId: data.presidentId,
    image: data.image,
    isActive: Boolean(data.isActive),
    createdAt: tsToDate(data.createdAt)
  } as League;
}

function mapClubData(id: string, data: any): Club {
  return {
    id,
    leagueId: data.leagueId,
    sportId: data.sportId,
    name: data.name,
    nameAr: data.nameAr,
    description: data.description,
    descriptionAr: data.descriptionAr,
    address: data.address,
    addressAr: data.addressAr,
    phone: data.phone,
    email: data.email,
    coachId: data.coachId,
    physicalTrainerId: data.physicalTrainerId,
    image: data.image,
    isActive: Boolean(data.isActive),
    isFeatured: Boolean(data.isFeatured),
    createdAt: tsToDate(data.createdAt)
  } as Club;
}

function mapUserData(id: string, data: any): User {
  const base: any = {
    id,
    username: data.username,
    password: data.password, // Note: Storing plain text passwords is not secure
    role: data.role,
    firstName: data.firstName,
    lastName: data.lastName,
    firstNameAr: data.firstNameAr,
    lastNameAr: data.lastNameAr,
    email: data.email,
    phone: data.phone,
    image: data.image,
    clubId: data.clubId,
    leagueId: data.leagueId,
    isActive: Boolean(data.isActive),
    lastLogin: data.lastLogin ? tsToDate(data.lastLogin) : undefined,
    createdAt: tsToDate(data.createdAt),
    updatedAt: tsToDate(data.updatedAt),
    // Athlete-related optional fields
    dateOfBirth: data.dateOfBirth ? tsToDate(data.dateOfBirth) : undefined,
    gender: data.gender,
    weight: typeof data.weight === 'number' ? data.weight : undefined,
    height: typeof data.height === 'number' ? data.height : undefined,
    belt: data.belt,
    beltAr: data.beltAr,
    fatherName: data.fatherName,
    motherName: data.motherName,
    birthPlace: data.birthPlace,
    bloodType: data.bloodType
  };
  // Pass-through for new fields (achievements arrays, rankings list, legacy internationalRanking)
  if (data.achievements !== undefined) base.achievements = data.achievements;
  if (data.rankings !== undefined) base.rankings = data.rankings;
  if (data.internationalRanking !== undefined) base.internationalRanking = data.internationalRanking;
  return base as User;
}

// ===== Leagues (rabitât) Service backed by Firestore =====
export class LeaguesService {
  static async getAllLeagues(): Promise<League[]> {
    const snap = await getDocs(collection(db, 'leagues'));
    const items = snap.docs.map(d => mapLeagueData(d.id, d.data()));
    // Fallback to mock leagues to avoid empty UI
    return items.length > 0 ? items : mockLeagues;
  }

  static async getLeagueById(id: string): Promise<League | null> {
    const ref = doc(db, 'leagues', id);
    const ds = await getDoc(ref);
    if (ds.exists()) return mapLeagueData(ds.id, ds.data());
    // Fallback: mock by id
    return mockLeagues.find(l => l.id === id) || null;
  }

  static async getLeaguesBySport(sportId: string): Promise<League[]> {
    const q = query(collection(db, 'leagues'), where('sportId', '==', sportId));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => mapLeagueData(d.id, d.data()));
    return items.length > 0 ? items : mockLeagues.filter(l => l.sportId === sportId);
  }

  static async getLeagueByWilayaId(wilayaId: number): Promise<League | null> {
    const q = query(collection(db, 'leagues'), where('wilayaId', '==', wilayaId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return mapLeagueData(d.id, d.data());
    }
    // Fallback: mock by wilayaId
    return mockLeagues.find(l => l.wilayaId === wilayaId) || null;
  }

  static async createLeague(data: Omit<League, 'id' | 'createdAt'>): Promise<string> {
    const payload = {
      ...data,
      isActive: data.isActive ?? true,
      createdAt: serverTimestamp()
    };
    const ref = await addDoc(collection(db, 'leagues'), payload);
    return ref.id;
  }
}

// ===== Clubs (andiyya) Service backed by Firestore =====
export class ClubsService {
  static async createClub(data: Omit<Club, 'id' | 'createdAt'>): Promise<string> {
    const payload = {
      ...data,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      createdAt: serverTimestamp()
    };
    const ref = await addDoc(collection(db, 'clubs'), payload);
    return ref.id;
  }

  static async getClubById(id: string): Promise<Club | null> {
    console.log('===Firestore Debug: getClubById called with ID===', id);

    try {
      // First try direct ID lookup
      const ref = doc(db, 'clubs', id);
      const ds = await getDoc(ref);

      if (ds.exists()) {
        const club = mapClubData(ds.id, ds.data());
        console.log('===Firestore Debug: Club found by direct ID lookup===', club);
        return club;
      }

      console.warn('===Firestore Debug: Club not found by direct ID lookup===');

      // If not found by direct ID, try to find by comparing with all clubs
      // This helps with potential ID mismatches or data inconsistencies
      const allClubs = await this.getAllClubs();
      console.log('===Firestore Debug: Retrieved all clubs for fallback search===', allClubs.length);

      // Try to find a club where the ID matches in any form
      const matchingClub = allClubs.find(club => {
        return club.id === id ||
          String(club.id) === String(id) ||
          club.leagueId === id ||  // In case the clubId was stored as leagueId by mistake
          String(club.leagueId) === String(id);
      });

      if (matchingClub) {
        console.log('===Firestore Debug: Club found by fallback search===', matchingClub);
        return matchingClub;
      }

      console.warn('===Firestore Debug: Club not found by any search method===', id);
      return null;
    } catch (error) {
      console.error('===Firestore Debug: Error in getClubById===', error);
      return null;
    }
  }

  static async updateClub(id: string, data: Partial<Club>): Promise<void> {
    const ref = doc(db, 'clubs', id);
    const { createdAt, ...rest } = data as any; // do not overwrite createdAt unless explicitly needed
    await updateDoc(ref, rest);
  }

  static async deleteClub(id: string): Promise<void> {
    const ref = doc(db, 'clubs', id);
    await deleteDoc(ref);
  }

  static async getClubsByLeague(leagueId: string): Promise<Club[]> {
    console.log('===Firestore Debug: getClubsByLeague called with ID==>', leagueId);
    console.log('===Firestore Debug: leagueId type===', typeof leagueId);

    try {
      const q = query(collection(db, 'clubs'), where('leagueId', '==', leagueId));
      const snap = await getDocs(q);
      const clubs = snap.docs.map(d => mapClubData(d.id, d.data()));
      console.log('===Firestore Debug: Found clubs for league==>', clubs.length);
      console.log('===Firestore Debug: Clubs data==>', clubs);
      return clubs;
    } catch (error) {
      console.error('===Firestore Debug: Error in getClubsByLeague===', error);

      // Fallback: Get all clubs and filter on client side
      try {
        console.log('===Firestore Debug: Trying fallback getAllClubs + client filter===');
        const allClubs = await this.getAllClubs();
        console.log('===Firestore Debug: Total clubs for filtering===', allClubs.length);

        // Log a sample club to understand the data structure
        if (allClubs.length > 0) {
          console.log('===Firestore Debug: Sample club for comparison===', {
            id: allClubs[0].id,
            name: allClubs[0].nameAr,
            leagueId: allClubs[0].leagueId,
            leagueIdType: typeof allClubs[0].leagueId
          });
        }

        const filteredClubs = allClubs.filter(club => {
          const match = club.leagueId === leagueId;
          if (match) {
            console.log('===Firestore Debug: Club match found===', {
              id: club.id,
              name: club.nameAr,
              clubLeagueId: club.leagueId,
              clubLeagueIdType: typeof club.leagueId,
              targetLeagueId: leagueId
            });
          }
          return match;
        });

        console.log('===Firestore Debug: Fallback found clubs===', filteredClubs.length);
        return filteredClubs;
      } catch (fallbackError) {
        console.error('===Firestore Debug: Fallback also failed===', fallbackError);
        return [];
      }
    }
  }

  // Flexible fetch to support legacy data where leagueId might equal wilayaId (number or string)
  static async getClubsByLeagueFlexible(leagueId: string, wilayaId?: number): Promise<Club[]> {
    console.log('===Firestore Debug: getClubsByLeagueFlexible args===', { leagueId, wilayaId });

    // First try with proper leagueId (string)
    const primary = await this.getClubsByLeague(leagueId);
    console.log('===Firestore Debug: Primary result count===', primary.length);
    if (primary.length > 0) return primary;

    if (wilayaId === undefined) {
      console.warn('===Firestore Debug: wilayaId is undefined. Skipping legacy fallback and returning primary (empty).===');
      return primary;
    }

    console.log('===Firestore Debug: Primary league query empty. Trying legacy wilayaId matching...===');
    const results: Record<string, Club> = {};
    primary.forEach(c => { results[c.id] = c; });

    // Try to generate the expected league ID pattern based on wilayaId
    const expectedLeagueIdPattern = `league-judo-${wilayaId.toString().padStart(2, '0')}`;
    console.log('===Firestore Debug: Expected league ID pattern===', expectedLeagueIdPattern);

    // Try with the expected pattern
    try {
      const patternClubs = await this.getClubsByLeague(expectedLeagueIdPattern);
      console.log('===Firestore Debug: Pattern match result count===', patternClubs.length);
      patternClubs.forEach(c => { results[c.id] = c; });
      if (patternClubs.length > 0) {
        console.log('===Firestore Debug: Found clubs using pattern matching===', patternClubs.length);
        return Object.values(results);
      }
    } catch (e) {
      console.warn('===Firestore Debug: Pattern matching failed===', e);
    }

    try {
      // Try numeric wilayaId
      const qNum = query(collection(db, 'clubs'), where('leagueId', '==', wilayaId as unknown as number));
      const snapNum = await getDocs(qNum);
      snapNum.docs.forEach(d => { const c = mapClubData(d.id, d.data()); results[c.id] = c; });
      console.log('===Firestore Debug: Numeric wilayaId matches===', snapNum.size);
    } catch (e) {
      console.warn('===Firestore Debug: Numeric wilayaId query failed===', e);
    }

    try {
      // Try string wilayaId
      const qStr = query(collection(db, 'clubs'), where('leagueId', '==', String(wilayaId)));
      const snapStr = await getDocs(qStr);
      snapStr.docs.forEach(d => { const c = mapClubData(d.id, d.data()); results[c.id] = c; });
      console.log('===Firestore Debug: String wilayaId matches===', snapStr.size);
    } catch (e) {
      console.warn('===Firestore Debug: String wilayaId query failed===', e);
    }

    // Additional check: try to find clubs by comparing the leagueId field with the leagueId parameter
    // This is a more direct approach that might catch data inconsistencies
    try {
      console.log('===Firestore Debug: Trying direct leagueId comparison===');
      const allClubs = await this.getAllClubs();
      console.log('===Firestore Debug: Total clubs available===', allClubs.length);

      // Log sample clubs to understand the data structure
      if (allClubs.length > 0) {
        console.log('===Firestore Debug: Sample club data===', {
          firstClub: {
            id: allClubs[0].id,
            name: allClubs[0].nameAr,
            leagueId: allClubs[0].leagueId,
            leagueIdType: typeof allClubs[0].leagueId
          }
        });
      }

      // Log all unique leagueId values to understand the data
      const uniqueLeagueIds = [...new Set(allClubs.map(club => club.leagueId))];
      console.log('===Firestore Debug: Unique leagueId values in clubs===', uniqueLeagueIds);

      // As a last resort, try to find clubs by checking if they have any leagueId at all
      // This will help us understand if clubs are missing leagueId entirely
      const clubsWithoutLeagueId = allClubs.filter(club => !club.leagueId || club.leagueId === '');
      console.log('===Firestore Debug: Clubs without leagueId===', clubsWithoutLeagueId.length);

      // Check if there's a pattern in the league IDs that might help us understand the mismatch
      console.log('===Firestore Debug: Target leagueId===', leagueId);
      console.log('===Firestore Debug: Target wilayaId===', wilayaId);

      // Try to find clubs with leagueId that contains the wilayaId
      const clubsWithWilayaInLeagueId = allClubs.filter(club => {
        if (!club.leagueId) return false;
        return String(club.leagueId).includes(String(wilayaId));
      });
      console.log('===Firestore Debug: Clubs with wilayaId in their leagueId===', clubsWithWilayaInLeagueId.length);
      if (clubsWithWilayaInLeagueId.length > 0) {
        console.log('===Firestore Debug: Sample clubs with wilayaId in leagueId===',
          clubsWithWilayaInLeagueId.slice(0, 3).map(club => ({
            id: club.id,
            name: club.nameAr,
            leagueId: club.leagueId
          }))
        );
      }

      // Try different matching strategies
      const potentialMatches = allClubs.filter(club => {
        if (!club.leagueId) return false;

        // Strategy 1: Exact match with leagueId
        if (String(club.leagueId) === String(leagueId)) {
          console.log('===Firestore Debug: Strategy 1 match (exact leagueId)===', {
            id: club.id,
            name: club.nameAr,
            clubLeagueId: club.leagueId,
            targetLeagueId: leagueId
          });
          return true;
        }

        // Strategy 2: Match with wilayaId (for legacy data)
        if (wilayaId !== undefined && (
          String(club.leagueId) === String(wilayaId) ||
          Number(club.leagueId) === wilayaId
        )) {
          console.log('===Firestore Debug: Strategy 2 match (wilayaId)===', {
            id: club.id,
            name: club.nameAr,
            clubLeagueId: club.leagueId,
            targetWilayaId: wilayaId
          });
          return true;
        }

        // Strategy 3: Check if leagueId contains the target leagueId (for potential data format issues)
        if (String(club.leagueId).includes(leagueId) || leagueId.includes(String(club.leagueId))) {
          console.log('===Firestore Debug: Strategy 3 match (contains)===', {
            id: club.id,
            name: club.nameAr,
            clubLeagueId: club.leagueId,
            targetLeagueId: leagueId
          });
          return true;
        }

        // Strategy 4: Check if the leagueId follows the pattern 'league-judo-XX' where XX is the wilayaId
        if (wilayaId !== undefined) {
          const expectedPattern = `league-judo-${wilayaId.toString().padStart(2, '0')}`;
          if (String(club.leagueId) === expectedPattern) {
            console.log('===Firestore Debug: Strategy 4 match (pattern)===', {
              id: club.id,
              name: club.nameAr,
              clubLeagueId: club.leagueId,
              expectedPattern: expectedPattern,
              targetWilayaId: wilayaId
            });
            return true;
          }
        }

        return false;
      });

      console.log('===Firestore Debug: Potential matches count===', potentialMatches.length);
      if (potentialMatches.length > 0) {
        console.log('===Firestore Debug: Match details===',
          potentialMatches.slice(0, 3).map(club => ({
            id: club.id,
            name: club.nameAr,
            leagueId: club.leagueId
          }))
        );

        // Add these potential matches to our results
        potentialMatches.forEach(club => { results[club.id] = club; });
      }
    } catch (e) {
      console.warn('===Firestore Debug: Direct comparison failed===', e);
    }

    const merged = Object.values(results);
    console.log('===Firestore Debug: Merged legacy/primary clubs count===', merged.length);
    console.log('===Firestore Debug: Final club list===', merged.map(c => ({ id: c.id, name: c.nameAr, leagueId: c.leagueId })));
    return merged;
  }

  static async getClubsBySport(sportId: string): Promise<Club[]> {
    const q = query(collection(db, 'clubs'), where('sportId', '==', sportId));
    const snap = await getDocs(q);
    return snap.docs.map(d => mapClubData(d.id, d.data()));
  }

  static async getAllClubs(): Promise<Club[]> {
    const snap = await getDocs(collection(db, 'clubs'));
    return snap.docs.map(d => mapClubData(d.id, d.data()));
  }

  static subscribeToClubs(onData: (data: Club[]) => void, onError: (error: Error) => void): Unsubscribe {
    const unsub = onSnapshot(
      collection(db, 'clubs'),
      (snap) => {
        try {
          const items = snap.docs.map(d => mapClubData(d.id, d.data()));
          onData(items);
        } catch (e) {
          onError(e as Error);
        }
      },
      (err) => onError(err as Error)
    );
    return unsub;
  }
}

// ===== Users Service backed by Firestore =====
export class UsersService {
  // تحذير أمني: الاستخدام الحالي لـ localStorage غير آمن للتطبيقات الحقيقية
  // يُفضل استخدام توكن JWT مع httpOnly cookies للأمان الفعال

  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const usersRef = collection(db, 'users');

    // Resolve leagueId from club if missing but clubId provided
    let resolvedLeagueId = userData.leagueId;
    try {
      if (!resolvedLeagueId && userData.clubId) {
        const club = await ClubsService.getClubById(userData.clubId);
        if (club?.leagueId) {
          resolvedLeagueId = club.leagueId;
        }
      }
    } catch { }

    // Build filters only for defined values to avoid Firestore undefined error
    const filters = [
      where('username', '==', userData.username),
      where('role', '==', userData.role),
    ];
    if (userData.clubId) filters.push(where('clubId', '==', userData.clubId));
    if (resolvedLeagueId) filters.push(where('leagueId', '==', resolvedLeagueId));

    const q = query(usersRef, ...filters);
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error(`اسم المستخدم "${userData.username}" موجود بالفعل في هذا النادي/الرابطة مع هذا الدور`);
    }

    // Prepare payload and strip undefined fields (Firestore does not accept undefined)
    const basePayload: any = {
      ...userData,
      leagueId: resolvedLeagueId ?? undefined,
      isActive: userData.isActive ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    Object.keys(basePayload).forEach((k) => {
      if (basePayload[k] === undefined) delete basePayload[k];
    });

    const ref = await addDoc(usersRef, basePayload);
    return ref.id;
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return mapUserData(userDoc.id, userDoc.data());
  }

  static async getUserById(id: string): Promise<User | null> {
    const ref = doc(db, 'users', id);
    const ds = await getDoc(ref);
    return ds.exists() ? mapUserData(ds.id, ds.data()) : null;
  }

  // Realtime subscription to a user document
  static onUser(id: string, cb: (user: User | null) => void): Unsubscribe {
    const ref = doc(db, 'users', id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        cb(mapUserData(snap.id, snap.data()));
      } else {
        cb(null);
      }
    });
    return unsub;
  }

  static async getAthletesByClub(clubId: string): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('clubId', '==', clubId), where('role', '==', 'athlete'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => mapUserData(doc.id, doc.data()));
  }

  static async updateUser(id: string, data: Partial<User>): Promise<void> {
    const ref = doc(db, 'users', id);
    // Deep remove undefined to satisfy Firestore update rules
    const prune = (val: any): any => {
      if (Array.isArray(val)) return val.map(prune).filter(v => v !== undefined);
      if (val && typeof val === 'object') {
        const out: any = {};
        Object.keys(val).forEach(k => {
          const v = prune(val[k]);
          if (v !== undefined) out[k] = v;
        });
        return out;
      }
      return val === undefined ? undefined : val;
    };
    const payloadRaw = { ...data, updatedAt: serverTimestamp() } as any;
    const payload = prune(payloadRaw);
    await updateDoc(ref, payload);
  }

  static async getAllUsers(): Promise<User[]> {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => mapUserData(d.id, d.data()));
  }

  static async getClubsByLeague(): Promise<Record<string, Club[]>> {
    const clubs = await ClubsService.getAllClubs();
    const leagues = await LeaguesService.getAllLeagues();

    const clubsByLeague: Record<string, Club[]> = {};

    leagues.forEach(league => {
      clubsByLeague[league.id] = clubs.filter(club =>
        String(club.leagueId) === String(league.id) ||
        String(club.leagueId) === String(league.wilayaId)
      );
    });

    return clubsByLeague;
  }

  static async deleteUser(id: string): Promise<void> {
    const ref = doc(db, 'users', id);
    await deleteDoc(ref);
  }

  static async login(username: string, password: string, role?: string, clubId?: string): Promise<User | null> {
    // السماح بأسماء مستخدمين متكررة عبر أندية/رابطات مختلفة
    const usersRef = collection(db, 'users');
    const filters = [where('username', '==', username), where('password', '==', password)];

    // إذا تم تحديد النادي، نبحث داخل النادي المحدد فقط
    if (clubId) {
      filters.push(where('clubId', '==', clubId));
    }

    // إذا تم تحديد الدور، نبحث بالدور المحدد فقط
    if (role) {
      filters.push(where('role', '==', role));
    }

    const q = query(usersRef, ...filters);
    const snap = await getDocs(q);

    if (snap.empty) {
      // إذا لم نجد نتائج مع فلترة النادي، نبحث بدون فلترة النادي لكن مع فلترة الرابطة إن وجدت
      const fallbackFilters = [where('username', '==', username), where('password', '==', password)];
      if (role) fallbackFilters.push(where('role', '==', role));

      const fallbackQ = query(usersRef, ...fallbackFilters);
      const fallbackSnap = await getDocs(fallbackQ);
      if (fallbackSnap.empty) return null;

      const candidates = fallbackSnap.docs.map(d => mapUserData(d.id, d.data()));
      const user = candidates
        .sort((a, b) => {
          const ta = (a.createdAt as any)?.getTime?.() || 0;
          const tb = (b.createdAt as any)?.getTime?.() || 0;
          return tb - ta; // أحدث أولاً
        })[0];

      if (!user.isActive) {
        throw new Error('حسابك غير نشط. يرجى التواصل مع المسؤول');
      }

      localStorage.setItem('current_user', JSON.stringify(user));
      await this.updateUser(user.id, { lastLogin: new Date() });
      return user;
    }

    // اختيار المستخدم المناسب من النتائج
    const candidates = snap.docs.map(d => mapUserData(d.id, d.data()));
    const user = candidates
      .sort((a, b) => {
        const ta = (a.createdAt as any)?.getTime?.() || 0;
        const tb = (b.createdAt as any)?.getTime?.() || 0;
        return tb - ta; // أحدث أولاً
      })[0];

    if (!user.isActive) {
      throw new Error('حسابك غير نشط. يرجى التواصل مع المسؤول');
    }

    localStorage.setItem('current_user', JSON.stringify(user));

    // Update last login time
    await this.updateUser(user.id, { lastLogin: new Date() });

    return user;
  }

  static logout(): void {
    localStorage.removeItem('current_user');
  }

  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('current_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static async getCurrentUserWithDetails(): Promise<User | null> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    // Fetch fresh user data from Firestore
    const freshUserData = await this.getUserById(currentUser.id);
    return freshUserData;
  }
}

// ===== Sports Service backed by Firestore =====
export class SportsService {
  static async createSport(data: any): Promise<string> {
    const payload = {
      ...data,
      isActive: data?.isActive ?? true,
      createdAt: serverTimestamp()
    } as any;
    const ref = await addDoc(collection(db, 'sports'), payload);
    return ref.id;
  }
}

// ===== Athletes Service backed by Firestore (stored under 'users' with role = 'athlete') =====
export class AthletesService {
  static async createAthlete(data: any): Promise<string> {
    const payload = {
      ...data,
      role: 'athlete',
      isActive: data?.isActive ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    } as any;
    const ref = await addDoc(collection(db, 'users'), payload);
    return ref.id;
  }
}
// ===== Training Data Service =====
export class TrainingDataFirestoreService {
  // حفظ توزيع الأحمال التدريبية
  static async saveTrainingLoad(clubId: string, data: any): Promise<void> {
    try {
      const payload = {
        ...data,
        clubId,
        updatedAt: serverTimestamp()
      };

      // البحث عن وثيقة موجودة لهذا النادي
      const q = query(collection(db, 'training_loads'), where('clubId', '==', clubId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // تحديث الوثيقة الموجودة
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, payload);
      } else {
        // إنشاء وثيقة جديدة
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'training_loads'), payload);
      }
    } catch (error) {
      console.error('Error saving training load:', error);
      throw error;
    }
  }

  // تحميل توزيع الأحمال التدريبية
  static async getTrainingLoad(clubId: string): Promise<any> {
    try {
      const q = query(collection(db, 'training_loads'), where('clubId', '==', clubId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();

        // تحويل Timestamps إلى تواريخ
        if (data.createdAt) data.createdAt = tsToDate(data.createdAt);
        if (data.updatedAt) data.updatedAt = tsToDate(data.updatedAt);

        return { id: doc.id, ...data };
      }

      return null;
    } catch (error) {
      console.error('Error loading training load:', error);
      throw error;
    }
  }

  // حفظ الجدول الأسبوعي
  static async saveWeeklySchedule(clubId: string, data: any): Promise<void> {
    try {
      const payload = {
        scheduleData: data,
        clubId,
        updatedAt: serverTimestamp()
      };

      const q = query(collection(db, 'weekly_schedules'), where('clubId', '==', clubId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, payload);
      } else {
        const newPayload = { ...payload, createdAt: serverTimestamp() };
        await addDoc(collection(db, 'weekly_schedules'), newPayload);
      }
    } catch (error) {
      console.error('Error saving weekly schedule:', error);
      throw error;
    }
  }

  // تحميل الجدول الأسبوعي
  static async getWeeklySchedule(clubId: string): Promise<any[]> {
    try {
      const q = query(collection(db, 'weekly_schedules'), where('clubId', '==', clubId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return data.scheduleData || [];
      }

      return [];
    } catch (error) {
      console.error('Error loading weekly schedule:', error);
      throw error;
    }
  }

  // حفظ بيانات الحضور
  static async saveAttendance(clubId: string, data: any): Promise<void> {
    try {
      const payload = {
        attendanceData: data,
        clubId,
        updatedAt: serverTimestamp()
      };

      const q = query(collection(db, 'attendance_records'), where('clubId', '==', clubId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, payload);
      } else {
        const newPayload = { ...payload, createdAt: serverTimestamp() };
        await addDoc(collection(db, 'attendance_records'), newPayload);
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      throw error;
    }
  }

  // تحميل بيانات الحضور
  static async getAttendance(clubId: string): Promise<any[]> {
    try {
      const q = query(collection(db, 'attendance_records'), where('clubId', '==', clubId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return data.attendanceData || [];
      }

      return [];
    } catch (error) {
      console.error('Error loading attendance:', error);
      throw error;
    }
  }

  // حفظ الخطة السنوية
  static async saveAnnualPlan(clubId: string, year: number, data: any): Promise<void> {
    try {
      const payload = {
        planData: data,
        clubId,
        year,
        updatedAt: serverTimestamp()
      };

      const q = query(
        collection(db, 'annual_plans'),
        where('clubId', '==', clubId),
        where('year', '==', year)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, payload);
      } else {
        const newPayload = { ...payload, createdAt: serverTimestamp() };
        await addDoc(collection(db, 'annual_plans'), newPayload);
      }
    } catch (error) {
      console.error('Error saving annual plan:', error);
      throw error;
    }
  }

  // تحميل الخطة السنوية
  static async getAnnualPlan(clubId: string, year: number): Promise<any> {
    try {
      const q = query(
        collection(db, 'annual_plans'),
        where('clubId', '==', clubId),
        where('year', '==', year)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();

        if (data.createdAt) data.createdAt = tsToDate(data.createdAt);
        if (data.updatedAt) data.updatedAt = tsToDate(data.updatedAt);

        return data.planData;
      }

      return null;
    } catch (error) {
      console.error('Error loading annual plan:', error);
      throw error;
    }
  }

  // حفظ تقييم الجلسة
  static async saveSessionEvaluation(clubId: string, data: any): Promise<void> {
    try {
      const payload = {
        evaluationData: data,
        clubId,
        updatedAt: serverTimestamp()
      };

      const q = query(collection(db, 'session_evaluations'), where('clubId', '==', clubId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, payload);
      } else {
        const newPayload = { ...payload, createdAt: serverTimestamp() };
        await addDoc(collection(db, 'session_evaluations'), newPayload);
      }
    } catch (error) {
      console.error('Error saving session evaluation:', error);
      throw error;
    }
  }

  // تحميل تقييم الجلسة
  static async getSessionEvaluation(clubId: string): Promise<any> {
    try {
      const q = query(collection(db, 'session_evaluations'), where('clubId', '==', clubId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();

        if (data.createdAt) data.createdAt = tsToDate(data.createdAt);
        if (data.updatedAt) data.updatedAt = tsToDate(data.updatedAt);

        return data.evaluationData;
      }

      return null;
    } catch (error) {
      console.error('Error loading session evaluation:', error);
      throw error;
    }
  }

  // حفظ البطاقة الفنية
  static async saveTechnicalCard(clubId: string, data: any): Promise<void> {
    try {
      const payload = {
        cardData: data,
        clubId,
        updatedAt: serverTimestamp()
      };

      const q = query(collection(db, 'technical_cards'), where('clubId', '==', clubId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, payload);
      } else {
        const newPayload = { ...payload, createdAt: serverTimestamp() };
        await addDoc(collection(db, 'technical_cards'), newPayload);
      }
    } catch (error) {
      console.error('Error saving technical card:', error);
      throw error;
    }
  }

  // تحميل البطاقة الفنية
  static async getTechnicalCard(clubId: string): Promise<any> {
    try {
      const q = query(collection(db, 'technical_cards'), where('clubId', '==', clubId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();

        if (data.createdAt) data.createdAt = tsToDate(data.createdAt);
        if (data.updatedAt) data.updatedAt = tsToDate(data.updatedAt);

        return data.cardData;
      }

      return null;
    } catch (error) {
      console.error('Error loading technical card:', error);
      throw error;
    }
  }
}