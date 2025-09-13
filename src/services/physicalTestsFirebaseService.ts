import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types for physical tests data
export interface AthleteRecord {
  id: number;
  name: string;
  // الذراعين
  armsRight: number;
  armsLeft: number;
  armsGrade: number;
  // الجذع
  trunkRight: number;
  trunkLeft: number;
  trunkGrade: number;
  // الرجلين
  legsRight: number;
  legsLeft: number;
  legsGrade: number;
  // التحمل العضلي
  enduranceRight: number;
  enduranceLeft: number;
  enduranceGrade: number;
  // 1RM
  oneRMRight: number;
  oneRMLeft: number;
  oneRMGrade: number;
  // مستوى الرياضي
  totalSum: number;
  totalGrade: number;
  standard: string;
}

export interface AthleteBodyComposition {
  id: number;
  name: string;
  age: number;
  weight: number; // بالكيلوغرام
  weightPounds: number; // بالرطل
  bodyFatPercentage: number; // نسبة الدهون %
  fatWeightPounds: number; // نسبة الدهون بالرطل
  fatWeightKg: number; // نسبة الدهون بالكغ
  leanMassPounds: number; // كتلة الجسم بالرطل
  leanMassKg: number; // كتلة الجسم بالكغ
  standard: string; // المعيار حسب العمر
}

export interface AthleteBodyType {
  id: number;
  name: string;
  age: number;
  height: number;
  weight: number;
  bmi: number;
  bodyType: string;
  bodyTypeAr: string;
}

export interface AthleteMaxStrengthDynamic {
  id: number;
  name: string;
  maxScore: number;
  category: string;
  grade: string;
}

export interface AthleteMaxStrengthStatic {
  id: number;
  name: string;
  maxScore: number;
  category: string;
  grade: string;
}

export interface AthleteSpecialSpeed {
  id: number;
  name: string;
  time10m: number;
  time20m: number;
  time30m: number;
  grade10m: number;
  grade20m: number;
  grade30m: number;
}

export interface AthleteMorphological {
  id: number;
  name: string;
  height: number;
  weight: number;
  segmentLengths: {
    upperArm: number;
    forearm: number;
    upperLeg: number;
    lowerLeg: number;
  };
  bodyMeasurements: {
    chest: number;
    waist: number;
    hips: number;
  };
}

export interface AthleteExplosiveStrengthKumi {
  id: number;
  name: string;
  score: number;
  grade: number;
  category: string;
}

export interface AthleteSpecialEndurance {
  id: number;
  name: string;
  time: number;
  grade: number;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AthleteSpeedStrength {
  id: number;
  name: string;
  test1: number;
  test2: number;
  test3: number;
  average: number;
  grade: number;
}

export interface AthleteGroundworkSkills {
  id: number;
  name: string;
  technique1Score: number;
  technique1Grade: string;
  technique2Score: number;
  technique2Grade: string;
  overallScore: number;
  overallGrade: string;
}

export interface AthleteThrowingSkills {
  id: number;
  name: string;
  distance: number;
  accuracy: number;
  grade: string;
}

export interface AthleteUchiKomi {
  id: number;
  name: string;
  category: string;
  ageGroup: string;
  age: number;
  result10s: number;
  evaluation10s: number;
  result20s: number;
  evaluation20s: number;
  result30s: number;
  evaluation30s: number;
}

export class PhysicalTestsFirebaseService {
  // === Team Record Management ===

  static async getTeamRecord(clubId: string): Promise<AthleteRecord[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_team_records'),
        where('clubId', '==', clubId)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteRecord[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteRecord);
      });

      // Sort client-side by createdAt desc to avoid composite index requirement
      return records.sort((a: any, b: any) => {
        const at = a.createdAt?.getTime?.() || 0;
        const bt = b.createdAt?.getTime?.() || 0;
        return bt - at;
      });
    } catch (error) {
      console.error('Error fetching team record:', error);
      return [];
    }
  }

  static async saveTeamRecord(clubId: string, athletes: AthleteRecord[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_team_records'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_team_records'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving team record:', error);
      throw error;
    }
  }

  // === Body Composition Management ===

  static async getBodyCompositionCalculator(clubId: string): Promise<AthleteBodyComposition[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_body_composition'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteBodyComposition[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteBodyComposition);
      });

      return records;
    } catch (error) {
      console.error('Error fetching body composition data:', error);
      return [];
    }
  }

  static async saveBodyCompositionCalculator(clubId: string, athletes: AthleteBodyComposition[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_body_composition'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_body_composition'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving body composition data:', error);
      throw error;
    }
  }

  // === Body Type Calculator Management ===

  static async getBodyTypeCalculator(clubId: string): Promise<AthleteBodyType[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_body_type'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteBodyType[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteBodyType);
      });

      return records;
    } catch (error) {
      console.error('Error fetching body type data:', error);
      return [];
    }
  }

  static async saveBodyTypeCalculator(clubId: string, athletes: AthleteBodyType[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_body_type'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_body_type'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving body type data:', error);
      throw error;
    }
  }

  // === Uchi Komi Test Management ===

  static async getUchiKomiTest(clubId: string): Promise<AthleteUchiKomi[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_uchi_komi'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteUchiKomi[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteUchiKomi);
      });

      return records;
    } catch (error) {
      console.error('Error fetching Uchi Komi test data:', error);
      return [];
    }
  }

  static async saveUchiKomiTest(clubId: string, athletes: AthleteUchiKomi[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_uchi_komi'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_uchi_komi'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving Uchi Komi test data:', error);
      throw error;
    }
  }

  // === Max Dynamic Strength Test Management ===

  static async getMaxDynamicStrengthTest(clubId: string): Promise<AthleteMaxStrengthDynamic[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_max_dynamic_strength'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteMaxStrengthDynamic[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteMaxStrengthDynamic);
      });

      return records;
    } catch (error) {
      console.error('Error fetching max dynamic strength test data:', error);
      return [];
    }
  }

  static async saveMaxDynamicStrengthTest(clubId: string, athletes: AthleteMaxStrengthDynamic[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_max_dynamic_strength'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_max_dynamic_strength'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving max dynamic strength test data:', error);
      throw error;
    }
  }

  // === Max Static Strength Test Management ===

  static async getMaxStaticStrengthTest(clubId: string): Promise<AthleteMaxStrengthStatic[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_max_static_strength'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteMaxStrengthStatic[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteMaxStrengthStatic);
      });

      return records;
    } catch (error) {
      console.error('Error fetching max static strength test data:', error);
      return [];
    }
  }

  static async saveMaxStaticStrengthTest(clubId: string, athletes: AthleteMaxStrengthStatic[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_max_static_strength'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_max_static_strength'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving max static strength test data:', error);
      throw error;
    }
  }

  // === Special Speed Test Management ===

  static async getSpecialSpeedTest(clubId: string): Promise<AthleteSpecialSpeed[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_special_speed'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteSpecialSpeed[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteSpecialSpeed);
      });

      return records;
    } catch (error) {
      console.error('Error fetching special speed test data:', error);
      return [];
    }
  }

  static async saveSpecialSpeedTest(clubId: string, athletes: AthleteSpecialSpeed[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_special_speed'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_special_speed'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving special speed test data:', error);
      throw error;
    }
  }

  // === Morphological Traits Management ===

  static async getMorphologicalTraits(clubId: string): Promise<AthleteMorphological[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_morphological'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteMorphological[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteMorphological);
      });

      return records;
    } catch (error) {
      console.error('Error fetching morphological traits data:', error);
      return [];
    }
  }

  static async saveMorphologicalTraits(clubId: string, athletes: AthleteMorphological[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_morphological'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_morphological'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving morphological traits data:', error);
      throw error;
    }
  }

  // === Explosive Strength Kumi Test Management ===

  static async getExplosiveStrengthKumiTest(clubId: string): Promise<AthleteExplosiveStrengthKumi[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_explosive_strength_kumi'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteExplosiveStrengthKumi[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteExplosiveStrengthKumi);
      });

      return records;
    } catch (error) {
      console.error('Error fetching explosive strength kumi test data:', error);
      return [];
    }
  }

  static async saveExplosiveStrengthKumiTest(clubId: string, athletes: AthleteExplosiveStrengthKumi[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_explosive_strength_kumi'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_explosive_strength_kumi'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving explosive strength kumi test data:', error);
      throw error;
    }
  }

  // === Special Endurance Test Management ===

  static async getSpecialEnduranceTest(clubId: string): Promise<AthleteSpecialEndurance[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_special_endurance'),
        where('clubId', '==', clubId)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteSpecialEndurance[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteSpecialEndurance);
      });

      // Sort by createdAt in descending order on the client side
      return records.sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime; // Newest first
      });
    } catch (error) {
      console.error('Error fetching special endurance test data:', error);
      return [];
    }
  }

  static async saveSpecialEnduranceTest(clubId: string, athletes: AthleteSpecialEndurance[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_special_endurance'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_special_endurance'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving special endurance test data:', error);
      throw error;
    }
  }

  // === Speed Strength Tests Management ===

  static async getSpeedStrengthTests(clubId: string): Promise<AthleteSpeedStrength[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_speed_strength'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteSpeedStrength[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteSpeedStrength);
      });

      return records;
    } catch (error) {
      console.error('Error fetching speed strength tests data:', error);
      return [];
    }
  }

  static async saveSpeedStrengthTests(clubId: string, athletes: AthleteSpeedStrength[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_speed_strength'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_speed_strength'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving speed strength tests data:', error);
      throw error;
    }
  }

  // === Groundwork Skills Test Management ===

  static async getGroundworkSkillsTest(clubId: string): Promise<AthleteGroundworkSkills[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_groundwork_skills'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteGroundworkSkills[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteGroundworkSkills);
      });

      return records;
    } catch (error) {
      console.error('Error fetching groundwork skills test data:', error);
      return [];
    }
  }

  static async saveGroundworkSkillsTest(clubId: string, athletes: AthleteGroundworkSkills[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_groundwork_skills'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_groundwork_skills'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving groundwork skills test data:', error);
      throw error;
    }
  }

  // === Throwing Skills Test Management ===

  static async getThrowingSkillsTest(clubId: string): Promise<AthleteThrowingSkills[]> {
    try {
      const q = query(
        collection(db, 'physical_tests_throwing_skills'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: AthleteThrowingSkills[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as AthleteThrowingSkills);
      });

      return records;
    } catch (error) {
      console.error('Error fetching throwing skills test data:', error);
      return [];
    }
  }

  static async saveThrowingSkillsTest(clubId: string, athletes: AthleteThrowingSkills[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, 'physical_tests_throwing_skills'),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, 'physical_tests_throwing_skills'));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving throwing skills test data:', error);
      throw error;
    }
  }

  // === Generic methods for any test type ===

  static async getTestResults(testType: string, clubId: string): Promise<any[]> {
    try {
      const collectionName = `physical_tests_${testType}`;
      // For now, use a simple where query to avoid composite index requirement
      // Later you can create indexes in Firebase console if needed
      const q = query(
        collection(db, collectionName),
        where('clubId', '==', clubId)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const records: any[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          ...data.athleteData,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        });
      });

      // Sort by createdAt in descending order on the client side
      return records.sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime; // Newest first
      });
    } catch (error) {
      console.error(`Error fetching ${testType} test data:`, error);
      return [];
    }
  }

  static async saveTestResults(testType: string, clubId: string, athletes: any[]): Promise<void> {
    try {
      const collectionName = `physical_tests_${testType}`;
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, collectionName),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new records
      athletes.forEach(athlete => {
        const docRef = doc(collection(db, collectionName));
        const data = {
          clubId,
          athleteData: athlete,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error(`Error saving ${testType} test data:`, error);
      throw error;
    }
  }

  static async deleteTestResults(testType: string, clubId: string): Promise<void> {
    try {
      const collectionName = `physical_tests_${testType}`;
      const batch = writeBatch(db);

      // Delete existing records for this club
      const existingQuery = query(
        collection(db, collectionName),
        where('clubId', '==', clubId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error(`Error deleting ${testType} test data:`, error);
      throw error;
    }
  }
}
