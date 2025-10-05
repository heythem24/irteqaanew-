// This file is now a pass-through to the real Firestore services.
// It maintains the original export structure for compatibility with other parts of the app.

import {
  UsersService,
  ClubsService,
  LeaguesService,
} from './firestoreService';
import { db } from '../config/firebase';
import type { Staff } from '../types';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

// Re-export the actual services
export {
  UsersService as AthletesService, // Assuming Athletes are Users
  ClubsService,
  LeaguesService,
};

// Real StaffService backed by the 'users' collection with staff fields
export class StaffService {
  static async createStaff(data: Omit<Staff, 'id' | 'createdAt'>): Promise<string> {
    const payload = {
      ...data,
      isActive: data.isActive ?? true,
      createdAt: serverTimestamp()
    } as any;
    const ref = await addDoc(collection(db, 'users'), payload);
    return ref.id;
  }

  static async getStaffByLeague(leagueId: string): Promise<Staff[]> {
    const q = query(collection(db, 'users'), where('leagueId', '==', leagueId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Staff[];
  }

  static async getStaffByClub(clubId: string): Promise<Staff[]> {
    const q = query(collection(db, 'users'), where('clubId', '==', clubId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Staff[];
  }

  static async getStaffMemberById(id: string): Promise<Staff | null> {
    const ref = doc(db, 'users', id);
    const ds = await getDoc(ref);
    return ds.exists() ? ({ id: ds.id, ...(ds.data() as any) } as Staff) : null;
  }
}

// --- Dummy services for parts of the app not yet migrated ---

class MockDelay {
  static delay(ms: number = 50): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

import { TrainingDataFirestoreService } from './firestoreService';

// Training Data Service now uses real Firestore implementation
export const TrainingDataService = TrainingDataFirestoreService;

import { PhysicalTestsFirebaseService } from './physicalTestsFirebaseService';

// Physical Tests Service now uses real Firestore implementation
export const PhysicalTestsService = PhysicalTestsFirebaseService;

export class SportsService {
  static async createSport(__data: any): Promise<string> {
    await MockDelay.delay();
    console.warn("SportsService.createSport is a mock.");
    return 'mock-sport-id';
  }
}

// Re-export a generic "FirestoreService" for any remaining legacy imports.
// This is not ideal and should be phased out.
export const FirestoreService = {
  // Add passthrough methods here if needed, or just leave it as a warning.
  // For now, other services are exported directly.
  async getAll<T>(_collectionName: string): Promise<T[]> {
    await MockDelay.delay();
    console.warn("FirestoreService.getAll is a mock and returns no data.");
    return [];
  },

  async getWhere<T>(_collectionName: string, _field: string, _operator: string, _value: any): Promise<T[]> {
    await MockDelay.delay();
    console.warn("FirestoreService.getWhere is a mock and returns no data.");
    return [];
  }
};
