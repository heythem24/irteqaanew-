import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Competition, Category, Match } from '../types/firestoreModels';

const COMPETITIONS_COLLECTION = 'competitions';
const CATEGORIES_SUBCOLLECTION = 'categories';
const MATCHES_SUBCOLLECTION = 'matches';

// Base operations
const getCompetitionDoc = (competitionId: string) =>
  doc(db, COMPETITIONS_COLLECTION, competitionId);

const getCategoryDoc = (competitionId: string, categoryId: string) =>
  doc(db, `${COMPETITIONS_COLLECTION}/${competitionId}/${CATEGORIES_SUBCOLLECTION}`, categoryId);

const getMatchDoc = (competitionId: string, categoryId: string, matchId: string) =>
  doc(db, `${COMPETITIONS_COLLECTION}/${competitionId}/${CATEGORIES_SUBCOLLECTION}/${categoryId}/${MATCHES_SUBCOLLECTION}`, matchId);

// Competition operations
export const getCompetition = async (competitionId: string): Promise<Competition | null> => {
  try {
    const competitionDoc = await getDoc(getCompetitionDoc(competitionId));
    return competitionDoc.exists() ? ({ id: competitionDoc.id, ...competitionDoc.data() } as Competition) : null;
  } catch (error) {
    console.error('Error fetching competition:', error);
    return null;
  }
};

export const getAllCompetitions = async (): Promise<Competition[]> => {
  try {
    const competitionsSnapshot = await getDocs(collection(db, COMPETITIONS_COLLECTION));
    return competitionsSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Competition)
    );
  } catch (error) {
    console.error('Error fetching all competitions:', error);
    return [];
  }
};

export const createCompetition = async (competitionData: Omit<Competition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    const now = Timestamp.now();
    const competitionWithMeta = {
      ...competitionData,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    const newCompetitionRef = await addDoc(collection(db, COMPETITIONS_COLLECTION), competitionWithMeta);
    return newCompetitionRef.id;
  } catch (error) {
    console.error('Error creating competition:', error);
    return null;
  }
};

export const updateCompetition = async (
  competitionId: string,
  updateData: Partial<Omit<Competition, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> => {
  try {
    const updateWithMeta = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(getCompetitionDoc(competitionId), updateWithMeta);
    return true;
  } catch (error) {
    console.error('Error updating competition:', error);
    return false;
  }
};

export const deleteCompetition = async (competitionId: string): Promise<boolean> => {
  try {
    await deleteDoc(getCompetitionDoc(competitionId));
    return true;
  } catch (error) {
    console.error('Error deleting competition:', error);
    return false;
  }
};

// Category operations
export const getCompetitionCategories = async (competitionId: string): Promise<Category[]> => {
  try {
    const categoriesSnapshot = await getDocs(
      collection(db, `${COMPETITIONS_COLLECTION}/${competitionId}/${CATEGORIES_SUBCOLLECTION}`)
    );
    return categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category));
  } catch (error) {
    console.error('Error fetching competition categories:', error);
    return [];
  }
};

export const getCategory = async (competitionId: string, categoryId: string): Promise<Category | null> => {
  try {
    const categoryDoc = await getDoc(getCategoryDoc(competitionId, categoryId));
    return categoryDoc.exists() ? ({ id: categoryDoc.id, ...categoryDoc.data() } as Category) : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};

export const createCategory = async (
  competitionId: string,
  categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | null> => {
  try {
    const now = Timestamp.now();
    const categoryWithMeta = {
      ...categoryData,
      competitionId,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    const newCategoryRef = await addDoc(
      collection(db, `${COMPETITIONS_COLLECTION}/${competitionId}/${CATEGORIES_SUBCOLLECTION}`),
      categoryWithMeta
    );
    return newCategoryRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    return null;
  }
};

export const updateCategory = async (
  competitionId: string,
  categoryId: string,
  updateData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> => {
  try {
    const updateWithMeta = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(getCategoryDoc(competitionId, categoryId), updateWithMeta);
    return true;
  } catch (error) {
    console.error('Error updating category:', error);
    return false;
  }
};

export const deleteCategory = async (competitionId: string, categoryId: string): Promise<boolean> => {
  try {
    await deleteDoc(getCategoryDoc(competitionId, categoryId));
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};

// Match operations
export const getMatchesForCategory = async (competitionId: string, categoryId: string): Promise<Match[]> => {
  try {
    const matchesSnapshot = await getDocs(
      collection(db, `${COMPETITIONS_COLLECTION}/${competitionId}/${CATEGORIES_SUBCOLLECTION}/${categoryId}/${MATCHES_SUBCOLLECTION}`)
    );
    return matchesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Match));
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

export const updateMatch = async (
  competitionId: string,
  categoryId: string,
  matchId: string,
  updateData: Partial<Omit<Match, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> => {
  try {
    const updateWithMeta = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(getMatchDoc(competitionId, categoryId, matchId), updateWithMeta);
    return true;
  } catch (error) {
    console.error('Error updating match:', error);
    return false;
  }
};