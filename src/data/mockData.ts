import type { Sport, League, Club, Staff, News, Athlete } from '../types';
import { StaffPosition } from '../types';
import { wilayas } from './wilayas';

// Re-export wilayas for use in other components
export { wilayas };

// Sports data - starting with Judo as the initial model
export const sports: Sport[] = [
  {
    id: 'judo-001',
    name: 'Judo',
    nameAr: 'الجودو',
    description: 'Japanese martial art and combat sport',
    descriptionAr: 'فن قتالي ياباني ورياضة قتالية',
    image: '/images/sports/judo.jpg',
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
];

// Generate leagues for all 58 wilayas for Judo
export const leagues: League[] = wilayas.map(wilaya => ({
  id: `league-judo-${wilaya.id.toString().padStart(2, '0')}`,
  sportId: 'judo-001',
  wilayaId: wilaya.id,
  wilayaName: wilaya.name,
  wilayaNameAr: wilaya.nameAr,
  name: `${wilaya.name} Judo League`,
  nameAr: `رابطة الجودو لولاية ${wilaya.nameAr}`,
  description: `Official Judo League for ${wilaya.name} province`,
  descriptionAr: `الرابطة الرسمية للجودو لولاية ${wilaya.nameAr}`,
  isActive: true,
  createdAt: new Date('2024-01-01')
}));

// Generate clubs for all leagues - EMPTY BY DEFAULT
const generateClubsForAllLeagues = (): Club[] => {
  // Return empty array - clubs will be created by admin through the dashboard
  return [];
};

export const clubs: Club[] = generateClubsForAllLeagues();

// Generate staff for all leagues
const generateStaffForAllLeagues = (): Staff[] => {
  const allStaff: Staff[] = [];
  
  // Sample names for different positions
  const presidentNames = [
    { ar: 'أحمد بن علي', en: 'Ahmed Benali' },
    { ar: 'محمد الصالح', en: 'Mohamed Salah' },
    { ar: 'عبد الرحمن زيدان', en: 'Abderrahmane Zidane' },
    { ar: 'يوسف منصوري', en: 'Youcef Mansouri' },
    { ar: 'كريم بوعزة', en: 'Karim Bouazza' },
    { ar: 'سمير بلعيد', en: 'Samir Belaid' },
    { ar: 'رشيد حمادي', en: 'Rachid Hammadi' },
    { ar: 'طارق بن سالم', en: 'Tarek Ben Salem' }
  ];

  const technicalDirectorNames = [
    { ar: 'فاطمة خليفي', en: 'Fatima Khelifi' },
    { ar: 'عائشة بلقاسم', en: 'Aicha Belkacem' },
    { ar: 'نادية شريف', en: 'Nadia Cherif' },
    { ar: 'سعاد مرابط', en: 'Souad Merabit' },
    { ar: 'خديجة بن عمر', en: 'Khadija Ben Omar' },
    { ar: 'زينب الهاشمي', en: 'Zineb Hashemi' },
    { ar: 'أمينة قاسمي', en: 'Amina Kasemi' },
    { ar: 'ليلى بوشامة', en: 'Leila Bouchama' }
  ];

  const secretaryNames = [
    { ar: 'عمر بن حاج', en: 'Omar Benhadj' },
    { ar: 'رشيد بوعزة', en: 'Rachid Bouazza' },
    { ar: 'سعيد مرزوق', en: 'Said Merzouk' },
    { ar: 'حسام الدين', en: 'Hossam Eddine' },
    { ar: 'بلال شعبان', en: 'Bilal Chaaban' },
    { ar: 'فريد بن يوسف', en: 'Farid Ben Youcef' },
    { ar: 'نبيل حداد', en: 'Nabil Haddad' },
    { ar: 'وليد قرقور', en: 'Walid Karkour' }
  ];

  const treasurerNames = [
    { ar: 'عبد الرحمن زيدان', en: 'Abderrahmane Zidane' },
    { ar: 'نادية شريف', en: 'Nadia Cherif' },
    { ar: 'حكيم بوضياف', en: 'Hakim Boudiaf' },
    { ar: 'سليمة بن علي', en: 'Selima Ben Ali' },
    { ar: 'مراد عثماني', en: 'Mourad Othmani' },
    { ar: 'فوزية حمدي', en: 'Fawzia Hamdi' },
    { ar: 'جمال بوقرة', en: 'Jamal Bouguerra' },
    { ar: 'صبرينة مقراني', en: 'Sabrina Mokrani' }
  ];

  leagues.forEach((league, index) => {
    const nameIndex = index % 8; // Cycle through the 8 names
    
    // League President
    allStaff.push({
      id: `staff-president-${league.wilayaId}`,
      firstName: presidentNames[nameIndex].en.split(' ')[0],
      lastName: presidentNames[nameIndex].en.split(' ')[1],
      firstNameAr: presidentNames[nameIndex].ar.split(' ')[0],
      lastNameAr: presidentNames[nameIndex].ar.split(' ')[1],
      position: StaffPosition.LEAGUE_PRESIDENT,
      positionAr: 'رئيس الرابطة',
      bio: `Experienced sports administrator and leader of ${league.wilayaName} Judo League with extensive background in sports development.`,
      bioAr: `مدير رياضي مخضرم وقائد رابطة الجودو في ${league.wilayaNameAr} مع خلفية واسعة في تطوير الرياضة.`,
      image: `/images/staff/president-${league.wilayaId}.jpg`,
      phone: `+213 ${(20 + league.wilayaId).toString().padStart(2, '0')} 111 222`,
      email: `president@judo${league.wilayaId}.dz`,
      leagueId: league.id,
      isActive: true,
      createdAt: new Date('2024-01-01')
    });

    // Technical Director
    allStaff.push({
      id: `staff-technical-${league.wilayaId}`,
      firstName: technicalDirectorNames[nameIndex].en.split(' ')[0],
      lastName: technicalDirectorNames[nameIndex].en.split(' ')[1],
      firstNameAr: technicalDirectorNames[nameIndex].ar.split(' ')[0],
      lastNameAr: technicalDirectorNames[nameIndex].ar.split(' ')[1],
      position: StaffPosition.TECHNICAL_DIRECTOR,
      positionAr: 'المدير التقني',
      bio: `Technical expert and former athlete specializing in judo development and coaching methodologies in ${league.wilayaName}.`,
      bioAr: `خبير تقني ورياضي سابق متخصص في تطوير الجودو ومنهجيات التدريب في ${league.wilayaNameAr}.`,
      image: `/images/staff/technical-${league.wilayaId}.jpg`,
      phone: `+213 ${(20 + league.wilayaId).toString().padStart(2, '0')} 333 444`,
      email: `technical@judo${league.wilayaId}.dz`,
      leagueId: league.id,
      isActive: true,
      createdAt: new Date('2024-01-01')
    });

    // General Secretary
    allStaff.push({
      id: `staff-secretary-${league.wilayaId}`,
      firstName: secretaryNames[nameIndex].en.split(' ')[0],
      lastName: secretaryNames[nameIndex].en.split(' ')[1],
      firstNameAr: secretaryNames[nameIndex].ar.split(' ')[0],
      lastNameAr: secretaryNames[nameIndex].ar.split(' ')[1],
      position: StaffPosition.GENERAL_SECRETARY,
      positionAr: 'الكاتب العام',
      bio: `Administrative professional responsible for documentation and coordination of all league activities in ${league.wilayaName}.`,
      bioAr: `مهني إداري مسؤول عن التوثيق وتنسيق جميع أنشطة الرابطة في ${league.wilayaNameAr}.`,
      image: `/images/staff/secretary-${league.wilayaId}.jpg`,
      phone: `+213 ${(20 + league.wilayaId).toString().padStart(2, '0')} 555 666`,
      email: `secretary@judo${league.wilayaId}.dz`,
      leagueId: league.id,
      isActive: true,
      createdAt: new Date('2024-01-01')
    });

    // Treasurer
    allStaff.push({
      id: `staff-treasurer-${league.wilayaId}`,
      firstName: treasurerNames[nameIndex].en.split(' ')[0],
      lastName: treasurerNames[nameIndex].en.split(' ')[1],
      firstNameAr: treasurerNames[nameIndex].ar.split(' ')[0],
      lastNameAr: treasurerNames[nameIndex].ar.split(' ')[1],
      position: StaffPosition.TREASURER,
      positionAr: 'أمين المال',
      bio: `Financial expert and certified accountant managing the budget and financial operations of ${league.wilayaName} Judo League.`,
      bioAr: `خبير مالي ومحاسب معتمد يدير الميزانية والعمليات المالية لرابطة الجودو في ${league.wilayaNameAr}.`,
      image: `/images/staff/treasurer-${league.wilayaId}.jpg`,
      phone: `+213 ${(20 + league.wilayaId).toString().padStart(2, '0')} 777 888`,
      email: `treasurer@judo${league.wilayaId}.dz`,
      leagueId: league.id,
      isActive: true,
      createdAt: new Date('2024-01-01')
    });
  });

  return allStaff;
};

// Generate club staff for all clubs
const generateClubStaffForAllClubs = (): Staff[] => {
  const allClubStaff: Staff[] = [];

  // Sample names for club presidents
  const clubPresidentNames = [
    { ar: 'عبد الله بن سالم', en: 'Abdullah Ben Salem' },
    { ar: 'فاروق حمادي', en: 'Farouk Hammadi' },
    { ar: 'نور الدين زيدان', en: 'Noureddine Zidane' },
    { ar: 'محمود بلعيد', en: 'Mahmoud Belaid' },
    { ar: 'إبراهيم قاسمي', en: 'Ibrahim Kasemi' },
    { ar: 'عثمان بوشامة', en: 'Othman Bouchama' },
    { ar: 'حسن منصوري', en: 'Hassan Mansouri' },
    { ar: 'علي بن علي', en: 'Ali Ben Ali' }
  ];

  // Sample names for coaches
  const coachNames = [
    { ar: 'محمد سعيدي', en: 'Mohamed Saidi' },
    { ar: 'أحمد بلعيد', en: 'Ahmed Belaid' },
    { ar: 'يوسف حمادي', en: 'Youcef Hammadi' },
    { ar: 'رشيد قاسمي', en: 'Rachid Kasemi' },
    { ar: 'سمير بوشامة', en: 'Samir Bouchama' },
    { ar: 'طارق زيدان', en: 'Tarek Zidane' },
    { ar: 'فريد منصوري', en: 'Farid Mansouri' },
    { ar: 'نبيل بن علي', en: 'Nabil Ben Ali' }
  ];

  // Sample names for physical trainers
  const trainerNames = [
    { ar: 'كريم بومدين', en: 'Karim Boumediene' },
    { ar: 'سعيد مرابط', en: 'Said Merabit' },
    { ar: 'حسام بوعزة', en: 'Hossam Bouazza' },
    { ar: 'بلال شعبان', en: 'Bilal Chaaban' },
    { ar: 'وليد قرقور', en: 'Walid Karkour' },
    { ar: 'جمال حداد', en: 'Jamal Haddad' },
    { ar: 'مراد عثماني', en: 'Mourad Othmani' },
    { ar: 'حكيم بوضياف', en: 'Hakim Boudiaf' }
  ];

  // Sample names for technical directors
  const technicalDirectorNames = [
    { ar: 'خالد بن عمر', en: 'Khaled Ben Omar' },
    { ar: 'سليم حداد', en: 'Selim Haddad' },
    { ar: 'رضا بوعزة', en: 'Reda Bouazza' },
    { ar: 'مصطفى زيدان', en: 'Mustapha Zidane' },
    { ar: 'عماد قاسمي', en: 'Imad Kasemi' },
    { ar: 'جمال بوشامة', en: 'Jamal Bouchama' },
    { ar: 'هشام منصوري', en: 'Hicham Mansouri' },
    { ar: 'كمال بن علي', en: 'Kamal Ben Ali' }
  ];

  // Sample names for general secretaries
  const secretaryNames = [
    { ar: 'فاطمة بن حاج', en: 'Fatima Benhadj' },
    { ar: 'عائشة بوعزة', en: 'Aicha Bouazza' },
    { ar: 'خديجة مرزوق', en: 'Khadija Merzouk' },
    { ar: 'زينب الدين', en: 'Zineb Eddine' },
    { ar: 'أمينة شعبان', en: 'Amina Chaaban' },
    { ar: 'سعاد بن يوسف', en: 'Souad Ben Youcef' },
    { ar: 'نادية حداد', en: 'Nadia Haddad' },
    { ar: 'ليلى قرقور', en: 'Leila Karkour' }
  ];

  // Sample names for treasurers
  const treasurerNames = [
    { ar: 'حسام زيدان', en: 'Hossam Zidane' },
    { ar: 'صبرينة شريف', en: 'Sabrina Cherif' },
    { ar: 'مراد بوضياف', en: 'Mourad Boudiaf' },
    { ar: 'سليمة بن علي', en: 'Selima Ben Ali' },
    { ar: 'فوزي عثماني', en: 'Fawzi Othmani' },
    { ar: 'نورة حمدي', en: 'Noura Hamdi' },
    { ar: 'عادل بوقرة', en: 'Adel Bouguerra' },
    { ar: 'سامية مقراني', en: 'Samia Mokrani' }
  ];

  clubs.forEach((club, clubIndex) => {
    const nameIndex = clubIndex % 8; // Cycle through the 8 names

    // Club President
    allClubStaff.push({
      id: `staff-club-president-${club.id}`,
      firstName: clubPresidentNames[nameIndex].en.split(' ')[0],
      lastName: clubPresidentNames[nameIndex].en.split(' ')[1],
      firstNameAr: clubPresidentNames[nameIndex].ar.split(' ')[0],
      lastNameAr: clubPresidentNames[nameIndex].ar.split(' ')[1],
      position: StaffPosition.CLUB_PRESIDENT,
      positionAr: 'رئيس النادي',
      bio: `Experienced club administrator and leader of ${club.name} with extensive background in sports management and development.`,
      bioAr: `مدير نادي مخضرم وقائد ${club.nameAr} مع خلفية واسعة في إدارة وتطوير الرياضة.`,
      image: `/images/staff/club-president-${club.id}.jpg`,
      phone: `+213 ${club.phone?.split(' ')[1] || '21'} 111 ${(100 + clubIndex).toString().padStart(3, '0')}`,
      email: `president@${club.email?.split('@')[1] || 'judo.dz'}`,
      clubId: club.id,
      isActive: true,
      createdAt: new Date('2024-01-01')
    });

    // Coach
    allClubStaff.push({
      id: `staff-coach-${club.id}`,
      firstName: coachNames[nameIndex].en.split(' ')[0],
      lastName: coachNames[nameIndex].en.split(' ')[1],
      firstNameAr: coachNames[nameIndex].ar.split(' ')[0],
      lastNameAr: coachNames[nameIndex].ar.split(' ')[1],
      position: StaffPosition.COACH,
      positionAr: 'مدرب',
      bio: `Experienced judo coach specializing in technical development and competition preparation at ${club.name}.`,
      bioAr: `مدرب جودو مخضرم متخصص في التطوير التقني وإعداد المسابقات في ${club.nameAr}.`,
      image: `/images/staff/coach-${club.id}.jpg`,
      phone: `+213 ${club.phone?.split(' ')[1] || '21'} 555 ${(600 + clubIndex).toString().padStart(3, '0')}`,
      email: `coach@${club.email?.split('@')[1] || 'judo.dz'}`,
      clubId: club.id,
      isActive: true,
      createdAt: new Date('2024-01-01')
    });

    // Physical Trainer
    allClubStaff.push({
      id: `staff-trainer-${club.id}`,
      firstName: trainerNames[nameIndex].en.split(' ')[0],
      lastName: trainerNames[nameIndex].en.split(' ')[1],
      firstNameAr: trainerNames[nameIndex].ar.split(' ')[0],
      lastNameAr: trainerNames[nameIndex].ar.split(' ')[1],
      position: StaffPosition.PHYSICAL_TRAINER,
      positionAr: 'محضر بدني',
      bio: `Certified physical trainer specializing in combat sports conditioning and injury prevention at ${club.name}.`,
      bioAr: `محضر بدني معتمد متخصص في إعداد الرياضات القتالية والوقاية من الإصابات في ${club.nameAr}.`,
      image: `/images/staff/trainer-${club.id}.jpg`,
      phone: `+213 ${club.phone?.split(' ')[1] || '21'} 777 ${(800 + clubIndex).toString().padStart(3, '0')}`,
      email: `trainer@${club.email?.split('@')[1] || 'judo.dz'}`,
      clubId: club.id,
      isActive: true,
      createdAt: new Date('2024-01-01')
    });

    // Technical Director
    allClubStaff.push({
      id: `staff-club-technical-${club.id}`,
      firstName: technicalDirectorNames[nameIndex].en.split(' ')[0],
      lastName: technicalDirectorNames[nameIndex].en.split(' ')[1],
      firstNameAr: technicalDirectorNames[nameIndex].ar.split(' ')[0],
      lastNameAr: technicalDirectorNames[nameIndex].ar.split(' ')[1],
      position: StaffPosition.TECHNICAL_DIRECTOR,
      positionAr: 'المدير التقني',
      bio: `Technical expert and former athlete specializing in judo development and coaching methodologies at ${club.name}.`,
      bioAr: `خبير تقني ورياضي سابق متخصص في تطوير الجودو ومنهجيات التدريب في ${club.nameAr}.`,
      image: `/images/staff/club-technical-${club.id}.jpg`,
      phone: `+213 ${club.phone?.split(' ')[1] || '21'} 333 ${(300 + clubIndex).toString().padStart(3, '0')}`,
      email: `technical@${club.email?.split('@')[1] || 'judo.dz'}`,
      clubId: club.id,
      isActive: true,
      createdAt: new Date('2024-01-01')
    });

    // General Secretary
    allClubStaff.push({
      id: `staff-club-secretary-${club.id}`,
      firstName: secretaryNames[nameIndex].en.split(' ')[0],
      lastName: secretaryNames[nameIndex].en.split(' ')[1],
      firstNameAr: secretaryNames[nameIndex].ar.split(' ')[0],
      lastNameAr: secretaryNames[nameIndex].ar.split(' ')[1],
      position: StaffPosition.GENERAL_SECRETARY,
      positionAr: 'الكاتب العام',
      bio: `Administrative professional responsible for documentation and coordination of all club activities at ${club.name}.`,
      bioAr: `مهني إداري مسؤول عن التوثيق وتنسيق جميع أنشطة النادي في ${club.nameAr}.`,
      image: `/images/staff/club-secretary-${club.id}.jpg`,
      phone: `+213 ${club.phone?.split(' ')[1] || '21'} 444 ${(400 + clubIndex).toString().padStart(3, '0')}`,
      email: `secretary@${club.email?.split('@')[1] || 'judo.dz'}`,
      clubId: club.id,
      isActive: true,
      createdAt: new Date('2024-01-01')
    });

    // Treasurer
    allClubStaff.push({
      id: `staff-club-treasurer-${club.id}`,
      firstName: treasurerNames[nameIndex].en.split(' ')[0],
      lastName: treasurerNames[nameIndex].en.split(' ')[1],
      firstNameAr: treasurerNames[nameIndex].ar.split(' ')[0],
      lastNameAr: treasurerNames[nameIndex].ar.split(' ')[1],
      position: StaffPosition.TREASURER,
      positionAr: 'أمين المال',
      bio: `Financial expert and certified accountant managing the budget and financial operations of ${club.name}.`,
      bioAr: `خبير مالي ومحاسب معتمد يدير الميزانية والعمليات المالية لـ ${club.nameAr}.`,
      image: `/images/staff/club-treasurer-${club.id}.jpg`,
      phone: `+213 ${club.phone?.split(' ')[1] || '21'} 666 ${(600 + clubIndex).toString().padStart(3, '0')}`,
      email: `treasurer@${club.email?.split('@')[1] || 'judo.dz'}`,
      clubId: club.id,
      isActive: true,
      createdAt: new Date('2024-01-01')
    });
  });

  return allClubStaff;
};

// Generate athletes for all clubs - EMPTY BY DEFAULT
const generateAthletesForAllClubs = (): Athlete[] => {
  // Return empty array - athletes will be created by admin through the dashboard
  return [] as Athlete[];
};

// Generate staff for all leagues and clubs
export const staff: Staff[] = [
  ...generateStaffForAllLeagues(),
  ...generateClubStaffForAllClubs()
];

// Generate athletes for all clubs
export const athletes: Athlete[] = generateAthletesForAllClubs();

// Sample news articles
export const news: News[] = [
  {
    id: 'news-001',
    title: 'New Training Facility Opens in Algiers',
    titleAr: 'افتتاح مرفق تدريبي جديد في الجزائر',
    content: 'A state-of-the-art judo training facility has opened in Algiers, featuring modern equipment and professional coaching staff.',
    contentAr: 'تم افتتاح مرفق تدريبي حديث للجودو في الجزائر، يضم معدات حديثة وطاقم تدريبي محترف.',
    excerpt: 'Modern training facility enhances judo development in the capital.',
    excerptAr: 'مرفق تدريبي حديث يعزز تطوير الجودو في العاصمة.',
    image: '/images/news/new-facility.jpg',
    author: 'Ahmed Benali',
    authorAr: 'أحمد بن علي',
    leagueId: 'league-judo-16',
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date('2024-03-10'),
    createdAt: new Date('2024-03-10')
  }
];
