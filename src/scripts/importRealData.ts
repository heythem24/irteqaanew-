// سكريبت لاستيراد البيانات الحقيقية من mockData إلى Firestore
import { 
  sports, 
  leagues, 
  clubs, 
  staff as mockStaff,
  athletes as mockAthletes 
} from '../data/mockData';
import { 
  SportsService, 
  LeaguesService, 
  ClubsService, 
  AthletesService 
} from '../services/firestoreService';
import { StaffService } from '../services/mockDataService';

export const importRealData = async () => {
  console.log('🚀 بدء استيراد البيانات الحقيقية إلى Firestore...');
  
  try {
    // خرائط لربط معرفات البيانات الجديدة بالقديمة
    const sportIdMap = new Map<string, string>(); // oldSportId -> newSportId
    const leagueIdByWilaya = new Map<number, string>(); // wilayaId -> newLeagueId

    // 1. إضافة الرياضات
    console.log('📋 إضافة الرياضات...');
    for (const sport of sports) {
      const newSportId = await SportsService.createSport({
        name: sport.name,
        nameAr: sport.nameAr,
        description: sport.description,
        descriptionAr: sport.descriptionAr,
        image: sport.image,
        isActive: sport.isActive,
      });
      // اربط المعرّف القديم بالجديد
      sportIdMap.set(sport.id, newSportId);
    }

    // 2. إضافة الرابط
    console.log('🏆 إضافة الرابط...');
    for (const league of leagues) {
      const newLeagueId = await LeaguesService.createLeague({
        name: league.name,
        nameAr: league.nameAr,
        wilayaId: league.wilayaId,
        wilayaName: league.wilayaName,
        wilayaNameAr: league.wilayaNameAr,
        // استخدم معرّف الرياضة الجديد إذا وُجد
        sportId: sportIdMap.get(league.sportId) || league.sportId,
        description: league.description || '',
        descriptionAr: league.descriptionAr || '',
        presidentId: league.presidentId || '', 
        image: league.image || '',
        isActive: league.isActive ?? true,
      });
      // اربط الولاية بالمعرّف الجديد للرابطة
      leagueIdByWilaya.set(league.wilayaId, newLeagueId);
    }

    // 3. إضافة الأندية
    console.log('⚽ إضافة الأندية...');
    for (const club of clubs) {
      // ابحث عن الرابطة الأصلية لهذا النادي لتحديد الولاية ثم المعرّف الجديد للرابطة
      const mockLeague = leagues.find(l => l.id === club.leagueId);
      const mappedLeagueId = mockLeague ? leagueIdByWilaya.get(mockLeague.wilayaId) : undefined;
      await ClubsService.createClub({
        name: club.name,
        nameAr: club.nameAr,
        leagueId: mappedLeagueId || club.leagueId,
        sportId: sportIdMap.get(club.sportId) || club.sportId,
        description: club.description || '',
        descriptionAr: club.descriptionAr || '',
        address: club.address || '',
        addressAr: club.addressAr || '',
        phone: club.phone || '',
        email: club.email || '',
        coachId: club.coachId || '',
        physicalTrainerId: club.physicalTrainerId || '',
        image: club.image || '',
        isActive: club.isActive ?? true,
        isFeatured: club.isFeatured ?? false,
      });
    }

    // 4. إضافة الموظفين
    console.log('👥 إضافة الموظفين...');
    for (const staffMember of mockStaff) {
      await StaffService.createStaff({
        firstName: staffMember.firstName,
        lastName: staffMember.lastName,
        firstNameAr: staffMember.firstNameAr,
        lastNameAr: staffMember.lastNameAr,
        position: staffMember.position,
        positionAr: staffMember.positionAr,
        bio: staffMember.bio || '',
        bioAr: staffMember.bioAr || '',
        image: staffMember.image || '',
        phone: staffMember.phone || '',
        email: staffMember.email || '',
        leagueId: staffMember.leagueId || '',
        clubId: staffMember.clubId || '',
        isActive: staffMember.isActive ?? true,
      });
    }

    // 5. إضافة الرياضيين
    console.log('🏃‍♂️ إضافة الرياضيين...');
    for (const athlete of mockAthletes) {
      await AthletesService.createAthlete({
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        firstNameAr: athlete.firstNameAr,
        lastNameAr: athlete.lastNameAr,
        dateOfBirth: athlete.dateOfBirth,
        gender: athlete.gender,
        belt: athlete.belt,
        beltAr: athlete.beltAr,
        weight: athlete.weight,
        height: athlete.height,
        clubId: athlete.clubId,
        bio: athlete.bio || '',
        bioAr: athlete.bioAr || '',
        image: athlete.image || '',
        phone: athlete.phone || '',
        email: athlete.email || '',
        achievements: athlete.achievements || [],
        achievementsAr: athlete.achievementsAr || [],
        isActive: athlete.isActive ?? true,
      });
    }

    console.log('✅ تم استيراد جميع البيانات بنجاح!');
    return true;
    
  } catch (error) {
    console.error('❌ خطأ في استيراد البيانات:', error);
    throw error;
  }
};

// لتشغيل السكريبت مباشرة
if (typeof window !== 'undefined') {
  (window as any).importRealData = importRealData;
}
