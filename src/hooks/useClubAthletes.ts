import { useEffect, useState } from 'react';
import { UsersService } from '../services/firestoreService';
import type { User } from '../types';

export interface ClubAthleteOption {
  id: string;
  fullNameAr: string;
  fullNameEn: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female';
  weight?: number;
  height?: number;
}

export const useClubAthletes = (clubId: string) => {
  const [athletes, setAthletes] = useState<ClubAthleteOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!clubId) {
        setAthletes([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const users: User[] = await UsersService.getAthletesByClub(clubId);
        if (!mounted) return;
        const options: ClubAthleteOption[] = users.map(u => ({
          id: u.id,
          fullNameAr: `${u.firstNameAr || u.firstName || ''} ${u.lastNameAr || u.lastName || ''}`.trim(),
          fullNameEn: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          dateOfBirth: u.dateOfBirth,
          gender: (u.gender as any) || undefined,
          weight: typeof u.weight === 'number' ? u.weight : undefined,
          height: typeof u.height === 'number' ? u.height : undefined,
        }));
        setAthletes(options);
      } catch (e) {
        if (!mounted) return;
        console.error('useClubAthletes: failed to fetch athletes by club', e);
        setError('تعذر تحميل قائمة الرياضيين');
        setAthletes([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [clubId]);

  return { athletes, loading, error };
};
