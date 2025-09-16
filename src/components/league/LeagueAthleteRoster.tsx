import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, Table, Form, Row, Col, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import type { League, Club, User } from '../../types';
import { UsersService, ClubsService } from '../../services/firestoreService';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface LeagueAthleteRosterProps {
  league: League;
}

const LeagueAthleteRoster: React.FC<LeagueAthleteRosterProps> = ({ league }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClub, setFilterClub] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [midnightTick, setMidnightTick] = useState<number>(Date.now());
  const [reloadTick, setReloadTick] = useState<number>(0);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [allAthletes, setAllAthletes] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Realtime subscriptions holders
  const clubsUnsubsRef = useRef<Unsubscribe[]>([]);
  const usersUnsubsRef = useRef<Record<string, Unsubscribe>>({});
  const athletesByClubRef = useRef<Record<string, User[]>>({});

  // Helpers to normalize strings (remove accents/diacritics and unify cases)
  // Remove Latin combining accents safely (no Unicode property escapes)
  const stripAccents = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const stripArabicDiacritics = (str: string) => str.replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, '');
  const stripTatweel = (str: string) => str.replace(/[\u0640]/g, '');
  const hasMaleSymbol = (str: string) => /[♂]/.test(str);
  const hasFemaleSymbol = (str: string) => /[♀]/.test(str);

  // Normalize gender from various possible values to "male" | "female" | null
  const normalizeGender = (raw: any): 'male' | 'female' | null => {
    try {
      if (raw === undefined || raw === null) return null;
      if (typeof raw === 'boolean') return raw ? 'male' : 'female';
      // Numeric encodings commonly used: 1=>male, 2=>female or 0=>female, 1=>male
      if (typeof raw === 'number') {
        if (raw === 1) return 'male';
        if (raw === 2 || raw === 0) return 'female';
      }
      // String numeric encodings
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed === '1') return 'male';
        if (trimmed === '2' || trimmed === '0') return 'female';
      }
      const rawStr = String(raw);
      if (hasMaleSymbol(rawStr)) return 'male';
      if (hasFemaleSymbol(rawStr)) return 'female';
      const lowered = stripAccents(stripTatweel(rawStr)).trim().toLowerCase();
      const loweredNoArabicMarks = stripArabicDiacritics(lowered);

      // Heuristic: allow substrings and mixed labels (e.g., "ذكر - صغار")
      // IMPORTANT: evaluate female patterns BEFORE male to avoid 'female' matching 'male' as a substring
      const isClearlyFemale = (
        loweredNoArabicMarks === 'female' || loweredNoArabicMarks === 'f' ||
        loweredNoArabicMarks.includes('female') || loweredNoArabicMarks.includes('feminin') || loweredNoArabicMarks.includes('féminin') || loweredNoArabicMarks.includes('feminino') || loweredNoArabicMarks.includes('femme') || loweredNoArabicMarks.includes('fille') || loweredNoArabicMarks.includes('femelle') || loweredNoArabicMarks.includes('hembra') ||
        loweredNoArabicMarks.includes('انث') || loweredNoArabicMarks.includes('أنث') || loweredNoArabicMarks.includes('بنت') || loweredNoArabicMarks.includes('نساء') || loweredNoArabicMarks.includes('بنات')
      );

      if (isClearlyFemale) return 'female';

      const isClearlyMale = (
        loweredNoArabicMarks === 'male' || loweredNoArabicMarks === 'm' ||
        loweredNoArabicMarks.includes(' male') || loweredNoArabicMarks.startsWith('male') || loweredNoArabicMarks.endsWith('male') || loweredNoArabicMarks.includes('masculin') || loweredNoArabicMarks.includes('masculino') || loweredNoArabicMarks.includes('homme') || loweredNoArabicMarks.includes('garcon') || loweredNoArabicMarks.includes('garçon') || loweredNoArabicMarks.includes('macho') ||
        loweredNoArabicMarks.includes('ذكر') || loweredNoArabicMarks.includes('ولد') || loweredNoArabicMarks.includes('اولاد') || loweredNoArabicMarks.includes('أولاد')
      );

      if (isClearlyMale) return 'male';
      return null;
    } catch {
      return null;
    }
  };

  // Fetch clubs and athletes for the league
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('=== LeagueAthleteRoster Debug ===');
        console.log('League ID:', league.id);
        console.log('League Name:', league.nameAr);

        // Get all clubs for this league
        console.log('Fetching clubs for league:', league.id);
        const leagueClubs = await ClubsService.getClubsByLeague(league.id);
        console.log('Found clubs:', leagueClubs.length, leagueClubs);

        if (leagueClubs.length === 0) {
          console.warn('No clubs found for league:', league.id);
          // Try with wilayaId as fallback
          console.log('Trying fallback with wilayaId:', league.wilayaId);
          const fallbackClubs = await ClubsService.getClubsByLeagueFlexible(league.id, league.wilayaId);
          console.log('Fallback clubs found:', fallbackClubs.length, fallbackClubs);
          setClubs(fallbackClubs);
        } else {
          setClubs(leagueClubs);
        }

        // Get athletes for all clubs
        const currentClubs = leagueClubs.length > 0 ? leagueClubs : await ClubsService.getClubsByLeagueFlexible(league.id, league.wilayaId);
        console.log('Getting athletes for clubs:', currentClubs.length);

        const athletesPromises = currentClubs.map(async (club) => {
          console.log('Fetching athletes for club:', club.id, club.nameAr);
          try {
            const athletes = await UsersService.getAthletesByClub(club.id);
            console.log('Athletes found for club', club.nameAr, ':', athletes.length);
            return athletes;
          } catch (err) {
            console.error('Error fetching athletes for club', club.id, err);
            return [];
          }
        });

        const athletesArrays = await Promise.all(athletesPromises);
        const allAthletes = athletesArrays.flat();
        console.log('Total athletes found:', allAthletes.length);

        // If no athletes found, add some mock data for testing
        if (allAthletes.length === 0 && currentClubs.length > 0) {
          console.warn('No athletes found, adding mock data for testing');
          const mockAthletes: User[] = currentClubs.flatMap((club, clubIndex) => [
            {
              id: `mock-athlete-${clubIndex}-1`,
              username: `ahmed.ali${clubIndex}`,
              password: 'password123',
              role: 'athlete' as const,
              firstName: 'أحمد',
              lastName: 'علي',
              firstNameAr: 'أحمد',
              lastNameAr: 'علي',
              dateOfBirth: new Date('2008-01-15'),
              gender: 'male' as const,
              weight: 45,
              height: 150,
              clubId: club.id,
              leagueId: league.id,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              fatherName: 'محمد علي',
              motherName: 'فاطمة سالم',
              birthPlace: 'الجزائر',
              bloodType: 'O+',
              phone: '0555123456'
            },
            {
              id: `mock-athlete-${clubIndex}-2`,
              username: `sara.mohamed${clubIndex}`,
              password: 'password123',
              role: 'athlete' as const,
              firstName: 'سارة',
              lastName: 'محمد',
              firstNameAr: 'سارة',
              lastNameAr: 'محمد',
              dateOfBirth: new Date('2009-03-20'),
              gender: 'female' as const,
              weight: 42,
              height: 145,
              clubId: club.id,
              leagueId: league.id,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              fatherName: 'علي محمد',
              motherName: 'مريم أحمد',
              birthPlace: 'وهران',
              bloodType: 'A+',
              phone: '0555789012'
            }
          ]);
          console.log('Adding mock athletes:', mockAthletes.length);
          setAllAthletes(mockAthletes);
        } else {
          setAllAthletes(allAthletes);
        }

        // If no clubs found at all, add a mock club
        if (currentClubs.length === 0) {
          console.warn('No clubs found at all, adding mock club');
          const mockClub = {
            id: 'mock-club-1',
            leagueId: league.id,
            sportId: 'judo',
            name: 'Mock Club',
            nameAr: 'النادي التجريبي',
            description: 'Mock club for testing',
            descriptionAr: 'نادي تجريبي للاختبار',
            isActive: true,
            isFeatured: false,
            createdAt: new Date()
          };
          setClubs([mockClub]);
        }

      } catch (err) {
        console.error('Error fetching league roster data:', err);
        setError(`حدث خطأ أثناء تحميل بيانات الرياضيين: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`);
      } finally {
        setLoading(false);
      }
    };

    if (league?.id) {
      fetchData();
    }
  }, [league.id, league.wilayaId, league.nameAr, reloadTick]);

  // Setup realtime subscriptions with onSnapshot (clubs and athletes)
  useEffect(() => {
    if (!league?.id) return;

    // Cleanup helpers
    const clearUsersSubs = () => {
      Object.values(usersUnsubsRef.current).forEach(unsub => {
        try { unsub(); } catch {}
      });
      usersUnsubsRef.current = {};
      athletesByClubRef.current = {};
    };
    const clearClubsSubs = () => {
      clubsUnsubsRef.current.forEach(unsub => {
        try { unsub(); } catch {}
      });
      clubsUnsubsRef.current = [];
    };

    clearClubsSubs();
    clearUsersSubs();

    // Merge clubs from multiple snapshots (leagueId exact + wilaya fallback)
    let latestClubsMap: Record<string, Club> = {};
    const emitClubs = () => {
      const unique = Object.values(latestClubsMap);
      setClubs(unique);

      // Ensure we have user subscriptions for all current clubs
      const currentClubIds = new Set(unique.map(c => c.id));
      // Unsubscribe removed clubs
      Object.keys(usersUnsubsRef.current).forEach(clubId => {
        if (!currentClubIds.has(clubId)) {
          try { usersUnsubsRef.current[clubId]!(); } catch {}
          delete usersUnsubsRef.current[clubId];
          delete athletesByClubRef.current[clubId];
        }
      });
      // Subscribe new clubs
      unique.forEach(club => {
        if (usersUnsubsRef.current[club.id]) return;
        const uq = query(
          collection(db, 'users'),
          where('clubId', '==', club.id),
          where('role', '==', 'athlete')
        );
        const unsub = onSnapshot(uq, (snap) => {
          try {
            const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as User[];
            athletesByClubRef.current[club.id] = items;
            const merged = Object.values(athletesByClubRef.current).flat();
            setAllAthletes(merged);
          } catch (e) {
            console.warn('Users snapshot parse error for club', club.id, e);
          }
        }, (err) => {
          console.warn('Users snapshot error for club', club.id, err);
        });
        usersUnsubsRef.current[club.id] = unsub;
      });
    };

    // Primary clubs by leagueId
    const q1 = query(collection(db, 'clubs'), where('leagueId', '==', String(league.id)));
    const unsub1 = onSnapshot(q1, (snap) => {
      snap.docs.forEach(d => {
        const data = d.data() as any;
        latestClubsMap[d.id] = { id: d.id, ...(data as any) } as Club;
      });
      emitClubs();
    }, (err) => console.warn('Clubs snapshot (leagueId) error', err));

    clubsUnsubsRef.current.push(unsub1);

    // Fallback clubs by wilayaId if present (legacy data)
    if (league.wilayaId !== undefined && league.wilayaId !== null) {
      const q2 = query(collection(db, 'clubs'), where('leagueId', '==', String(league.wilayaId)));
      const unsub2 = onSnapshot(q2, (snap) => {
        snap.docs.forEach(d => {
          const data = d.data() as any;
          latestClubsMap[d.id] = { id: d.id, ...(data as any) } as Club;
        });
        emitClubs();
      }, (err) => console.warn('Clubs snapshot (wilaya fallback) error', err));
      clubsUnsubsRef.current.push(unsub2);
    }

    return () => {
      clearUsersSubs();
      clearClubsSubs();
    };
  }, [league.id, league.wilayaId, reloadTick]);

  // Calculate age function
  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Get age category (Arabic label) based on DOB using unified 2025 rules
  const getAgeCategoryLabel = (dob?: Date) => {
    const comp = getCategoryByDOBToday(dob);
    return comp?.nameAr || '';
  };

  // Schedule a refresh at next midnight so categories update automatically on birthdays
  useEffect(() => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
    const ms = next.getTime() - now.getTime();
    const t = window.setTimeout(() => setMidnightTick(Date.now()), ms);
    return () => window.clearTimeout(t);
  }, [midnightTick]);

  // Filter athletes based on search and filters
  const filteredAthletes = useMemo(() => {
    return allAthletes.filter(athlete => {
      const effDob = athlete.dateOfBirth ? new Date(athlete.dateOfBirth) : undefined;
      const category = getAgeCategoryLabel(effDob);

      const matchesSearch = searchTerm === '' ||
        (athlete.firstNameAr && athlete.firstNameAr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (athlete.lastNameAr && athlete.lastNameAr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (athlete.firstName && athlete.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (athlete.lastName && athlete.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesClub = filterClub === '' || athlete.clubId === filterClub;
      const g = normalizeGender(athlete.gender);
      const matchesGender = filterGender === '' || g === (filterGender as any);

      const matchesCategory = filterCategory === '' || category === filterCategory;

      return matchesSearch && matchesClub && matchesGender && matchesCategory;
    });
  }, [allAthletes, clubs, searchTerm, filterClub, filterGender, filterCategory, midnightTick]);

  // Print the athlete roster
  const printAthleteRoster = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>القائمة الاسمية للمصارعين - ${league.nameAr}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            direction: rtl;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 0 auto;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
          }
          th {
            background-color: #e3f2fd;
            font-weight: bold;
            font-size: 11px;
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
            color: #1976d2;
            font-size: 16px;
          }
          @media print {
            body { margin: 0; }
            table { font-size: 10px; }
            th, td { padding: 4px; }
          }
        </style>
      </head>
      <body>
        <h2>القائمة الاسمية للمصارعين - ${league.nameAr}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>النادي</th>
              <th>الاسم واللقب</th>
              <th>اسم الأب</th>
              <th>اسم ولقب الأم</th>
              <th>تاريخ الميلاد</th>
              <th>مكان الميلاد</th>
              <th>العمر</th>
              <th>الفئة</th>
              <th>الصنف</th>
              <th>الوزن (كغ)</th>
              <th>الطول (سم)</th>
              <th>فصيلة الدم</th>
              <th>رقم الهاتف</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAthletes.map((athlete, index) => {
              const club = clubs.find(c => c.id === athlete.clubId);
              const effDob = athlete.dateOfBirth ? new Date(athlete.dateOfBirth) : undefined;
              const age = effDob ? calculateAge(effDob) : 0;
              const category = getAgeCategoryLabel(effDob);
              const g = normalizeGender(athlete.gender);
              const genderText = g === 'male' ? 'ذكر' : g === 'female' ? 'أنثى' : '';

              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${club?.nameAr || 'غير محدد'}</td>
                  <td>${athlete.firstNameAr || athlete.firstName || ''} ${athlete.lastNameAr || athlete.lastName || ''}</td>
                  <td>${athlete.fatherName || ''}</td>
                  <td>${athlete.motherName || ''}</td>
                  <td>${effDob ? effDob.toLocaleDateString('ar-DZ') : ''}</td>
                  <td>${athlete.birthPlace || ''}</td>
                  <td>${age || ''}</td>
                  <td>${category}</td>
                  <td>${genderText}</td>
                  <td>${athlete.weight || ''}</td>
                  <td>${athlete.height || ''}</td>
                  <td>${athlete.bloodType || ''}</td>
                  <td>${athlete.phone || ''}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(tableContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 100);
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-info text-white d-flex align-items-center justify-content-between">
          <div className="text-end" dir="rtl">
            <h5 className="mb-0">
              <i className="fas fa-list me-2"></i>
              القائمة الاسمية للمصارعين - {league.nameAr}
            </h5>
          </div>
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">جاري التحميل...</span>
            </Spinner>
            <div>جاري تحميل قائمة الرياضيين...</div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>خطأ في تحميل البيانات</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-info text-white d-flex align-items-center justify-content-between">
        <div className="text-end" dir="rtl">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>
            القائمة الاسمية للمصارعين - {league.nameAr}
          </h5>
        </div>
        <div className="text-start d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setReloadTick(v => v + 1)}
            dir="rtl"
          >
            <i className="fas fa-refresh me-2"></i>
            تحديث
          </Button>
          <Button
            variant="outline-light"
            size="sm"
            onClick={printAthleteRoster}
            dir="rtl"
            disabled={filteredAthletes.length === 0}
          >
            <i className="fas fa-print me-2"></i>
            طباعة القائمة
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-3 p-2 bg-light rounded small">
            <strong>معلومات التصحيح:</strong><br/>
            League ID: {league.id}<br/>
            League Name: {league.nameAr}<br/>
            Clubs Count: {clubs.length}<br/>
            Athletes Count: {allAthletes.length}<br/>
            Loading: {loading ? 'نعم' : 'لا'}
          </div>
        )}

        {/* Filters */}
        <Row className="mb-4">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="text-end d-block" dir="rtl">البحث بالاسم</Form.Label>
              <Form.Control
                type="text"
                placeholder="ابحث بالاسم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-end"
                dir="rtl"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="text-end d-block" dir="rtl">النادي</Form.Label>
              <Form.Select
                value={filterClub}
                onChange={(e) => setFilterClub(e.target.value)}
                className="text-end"
                dir="rtl"
              >
                <option value="">جميع الأندية</option>
                {clubs.length > 0 ? clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.nameAr}</option>
                )) : (
                  <option disabled>لا توجد أندية متاحة</option>
                )}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="text-end d-block" dir="rtl">الفئة</Form.Label>
              <Form.Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-end"
                dir="rtl"
              >
                <option value="">جميع الفئات</option>
                <option value="مصغر">مصغر</option>
                <option value="براعم صغار">براعم صغار</option>
                <option value="براعم">براعم</option>
                <option value="أصاغر">أصاغر</option>
                <option value="صغار">صغار</option>
                <option value="ناشئين">ناشئين</option>
                <option value="أواسط">أواسط</option>
                <option value="أكابر">أكابر</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="text-end d-block" dir="rtl">الصنف</Form.Label>
              <Form.Select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="text-end"
                dir="rtl"
              >
                <option value="">الكل</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="table-responsive">
          <Table
            striped
            bordered
            hover
            responsive
            dir="rtl"
            className="text-center align-middle athlete-roster-table"
            style={{ tableLayout: 'auto', width: '100%', minWidth: '2200px' }}
          >
            <thead>
              <tr>
                <th className="text-center" dir="rtl">#</th>
                <th className="text-center" dir="rtl">النادي</th>
                <th className="text-center" dir="rtl">الاسم واللقب</th>
                <th className="text-center" dir="rtl">اسم الأب</th>
                <th className="text-center" dir="rtl">اسم ولقب الأم</th>
                <th className="text-center" dir="rtl">تاريخ الميلاد</th>
                <th className="text-center" dir="rtl">مكان الميلاد</th>
                <th className="text-center" dir="rtl">العمر</th>
                <th className="text-center" dir="rtl">الفئة</th>
                <th className="text-center" dir="rtl">الصنف</th>
                <th className="text-center" dir="rtl">الوزن (كغ)</th>
                <th className="text-center" dir="rtl">الطول (سم)</th>
                <th className="text-center" dir="rtl">فصيلة الدم</th>
                <th className="text-center" dir="rtl">رقم الهاتف</th>
              </tr>
            </thead>
            <tbody>
              {filteredAthletes.map((athlete, index) => {
                const club = clubs.find(c => c.id === athlete.clubId);
                const effDob = athlete.dateOfBirth ? new Date(athlete.dateOfBirth) : undefined;
                const age = effDob ? calculateAge(effDob) : 0;
                const category = getAgeCategoryLabel(effDob);

                return (
                  <tr key={athlete.id}>
                    <td>{index + 1}</td>
                    <td className="text-end" dir="rtl">
                      <div className="fw-semibold">
                        {club?.nameAr || 'غير محدد'}
                      </div>
                    </td>
                    <td className="text-end" dir="rtl">
                      <div className="fw-semibold">
                        {athlete.firstNameAr || athlete.firstName || ''} {athlete.lastNameAr || athlete.lastName || ''}
                      </div>
                    </td>
                    <td className="text-end" dir="rtl">
                      {athlete.fatherName || ''}
                    </td>
                    <td className="text-end" dir="rtl">
                      {athlete.motherName || ''}
                    </td>
                    <td>
                      {effDob ? effDob.toLocaleDateString('ar-DZ') : ''}
                    </td>
                    <td className="text-end" dir="rtl">
                      {athlete.birthPlace || ''}
                    </td>
                    <td>
                      {age || ''}
                    </td>
                    <td>
                      <Badge bg="success">{category}</Badge>
                    </td>
                    <td>
                      {(() => {
                        const g = normalizeGender(athlete.gender);
                        return g === 'male' ? 'ذكر' : g === 'female' ? 'أنثى' : '';
                      })()}
                    </td>
                    <td>
                      {athlete.weight || ''}
                    </td>
                    <td>
                      {athlete.height || ''}
                    </td>
                    <td>
                      {athlete.bloodType || ''}
                    </td>
                    <td className="text-end" dir="rtl">
                      {athlete.phone || ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {filteredAthletes.length === 0 && !loading && (
          <div className="text-center text-muted py-4">
            <i className="fas fa-search fa-3x mb-3"></i>
            {allAthletes.length === 0 ? (
              <div>
                <h5>لا توجد رياضيين مسجلين</h5>
                <p>لم يتم العثور على أي رياضيين في الأندية التابعة لهذه الرابطة</p>
                <p className="small text-muted">يمكنك إضافة رياضيين من خلال صفحات الأندية أو تحديث الصفحة</p>
              </div>
            ) : (
              <div>
                <h5>لا توجد نتائج</h5>
                <p>لم يتم العثور على رياضيين يطابقون معايير البحث المحددة</p>
                <p className="small text-muted">جرب تغيير معايير البحث أو إزالة بعض الفلاتر</p>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 p-3 bg-light rounded">
          <Row className="text-center">
            <Col md={2}>
              <h6 className="text-primary">إجمالي الرياضيين</h6>
              <h4 className="text-primary">{filteredAthletes.length}</h4>
            </Col>
            <Col md={2}>
              <h6 className="text-info">عدد الأندية</h6>
              <h4 className="text-info">{clubs.length}</h4>
            </Col>
            <Col md={2}>
              <h6 className="text-info">الذكور</h6>
              <h4 className="text-info">
                {filteredAthletes.filter(a => normalizeGender(a.gender) === 'male').length}
              </h4>
            </Col>
            <Col md={2}>
              <h6 className="text-warning">الإناث</h6>
              <h4 className="text-warning">
                {filteredAthletes.filter(a => normalizeGender(a.gender) === 'female').length}
              </h4>
            </Col>
            <Col md={2}>
              <h6 className="text-success">متوسط العمر</h6>
              <h4 className="text-success">
                {filteredAthletes.length > 0
                  ? Math.round(filteredAthletes.reduce((sum, a) => sum + (a.dateOfBirth ? calculateAge(a.dateOfBirth) : 0), 0) / filteredAthletes.length)
                  : 0
                } سنة
              </h4>
            </Col>
            <Col md={2}>
              <h6 className="text-secondary">الأندية النشطة</h6>
              <h4 className="text-secondary">
                {clubs.filter(c => c.isActive).length}
              </h4>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LeagueAthleteRoster;
