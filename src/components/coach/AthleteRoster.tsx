import React, { useState, useMemo, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import type { Club, User } from '../../types';
import { UsersService as UserService } from '../../services/firestoreService';
import { useCoachData } from '../../hooks/useCoachData';
import { getCategoryByDOBToday, getWeightClasses } from '../../utils/categoryUtils';
import './coach-responsive.css';

interface AthleteRosterProps {
  club: Club;
}

const AthleteRoster: React.FC<AthleteRosterProps> = ({ club }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterGender, setFilterGender] = useState('');
  // midnight tick to force re-render so categories update on birthdays
  const [midnightTick, setMidnightTick] = useState<number>(Date.now());

  const [clubAthletes, setClubAthletes] = useState<User[]>([]);
  const [loadingClubAthletes, setLoadingClubAthletes] = useState(true);
  // Local editable fields for inline editing
  const [fatherEdits, setFatherEdits] = useState<Record<string, string>>({});
  const [motherEdits, setMotherEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [dobEdits, setDobEdits] = useState<Record<string, string>>({});
  const [birthPlaceEdits, setBirthPlaceEdits] = useState<Record<string, string>>({});
  const [genderEdits, setGenderEdits] = useState<Record<string, 'male' | 'female'>>({});
  const [weightEdits, setWeightEdits] = useState<Record<string, string>>({});
  const [heightEdits, setHeightEdits] = useState<Record<string, string>>({});
  const [bloodTypeEdits, setBloodTypeEdits] = useState<Record<string, string>>({});
  const [phoneEdits, setPhoneEdits] = useState<Record<string, string>>({});
  const [ageEdits, setAgeEdits] = useState<Record<string, string>>({});

  // Get current user to extract coach ID
  const currentUser = UserService.getCurrentUser();
  const coachId = currentUser?.id || '';

  // Use Firebase hook for coach data
  const {
    athleteRoster,
    loadingAthleteRoster,
    addAthleteToRoster,
    error,
    clearError
  } = useCoachData({
    clubId: club.id,
    coachId: coachId,
    enableRealtime: true
  });

  // Get athletes for this club from user system
  useEffect(() => {
    const fetchAthletes = async () => {
      if (!club.id) return;
      setLoadingClubAthletes(true);
      try {
        const athletes = await UserService.getAthletesByClub(club.id);
        setClubAthletes(athletes);
        // Initialize edit buffers from fetched data
        const fathers: Record<string, string> = {};
        const mothers: Record<string, string> = {};
        const dobs: Record<string, string> = {};
        const bPlaces: Record<string, string> = {};
        const genders: Record<string, 'male' | 'female'> = {};
        const weights: Record<string, string> = {};
        const bloods: Record<string, string> = {};
        const phones: Record<string, string> = {};
        const ages: Record<string, string> = {};
        const heights: Record<string, string> = {};
        athletes.forEach(a => {
          fathers[a.id] = a.fatherName || '';
          // Store mother's full name in motherName (label says الاسم و اللقب)
          mothers[a.id] = a.motherName || '';
          dobs[a.id] = a.dateOfBirth ? formatDate(a.dateOfBirth) : '';
          bPlaces[a.id] = a.birthPlace || '';
          genders[a.id] = (a.gender as 'male' | 'female') || 'male';
          weights[a.id] = (a.weight ?? '').toString();
          heights[a.id] = (a.height ?? '').toString();
          bloods[a.id] = a.bloodType || '';
          phones[a.id] = a.phone || '';
          ages[a.id] = a.dateOfBirth ? String(calculateAge(a.dateOfBirth)) : '';
        });
        setFatherEdits(fathers);
        setMotherEdits(mothers);
        setDobEdits(dobs);
        setBirthPlaceEdits(bPlaces);
        setGenderEdits(genders);
        setWeightEdits(weights);
        setHeightEdits(heights);
        setBloodTypeEdits(bloods);
        setPhoneEdits(phones);
        setAgeEdits(ages);
      } catch (err) {
        console.error("Failed to fetch club athletes:", err);
        // Optionally set an error state here
      } finally {
        setLoadingClubAthletes(false);
      }
    };
    fetchAthletes();
  }, [club.id]);

  // Helpers
  const formatDate = (d: Date) => {
    try {
      const dt = new Date(d);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return '';
    }
  };

  // Save handlers
  const saveField = async (athleteId: string, updates: Partial<User>) => {
    try {
      setSaving(prev => ({ ...prev, [athleteId]: true }));
      await UserService.updateUser(athleteId, updates);
      // Optimistically update local list
      setClubAthletes(prev => prev.map(a => a.id === athleteId ? { ...a, ...updates } : a));
    } catch (e) {
      console.error('Failed to save athlete field', e);
    } finally {
      setSaving(prev => ({ ...prev, [athleteId]: false }));
    }
  };

  // Sync local user athletes with Firebase roster
  useEffect(() => {
    const syncAthletes = async () => {
      try {
        // Check if any athletes from UserService are not in Firebase roster
        for (const athlete of clubAthletes) {
          const existsInRoster = athleteRoster.some(r => r.athleteId === athlete.id);
          if (!existsInRoster) {
            await addAthleteToRoster({
              athleteId: athlete.id,
              clubId: club.id,
              coachId: coachId,
              joinDate: athlete.createdAt || new Date(),
              isActive: true,
              
            });
          }
        }
      } catch (error) {
        console.error('Error syncing athletes with Firebase:', error);
      }
    };

    if (clubAthletes.length > 0 && coachId) {
      syncAthletes();
    }
  }, [clubAthletes, athleteRoster, addAthleteToRoster, club.id, coachId]);

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

  // Parse edited ISO date (yyyy-MM-dd) to Date
  const parseISO = (iso?: string): Date | undefined => {
    if (!iso) return undefined;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? undefined : d;
  };

  // Get effective DOB for an athlete (prefer edited value if present)
  const getEffectiveDob = (athleteId: string, storedDob?: Date): Date | undefined => {
    const iso = dobEdits[athleteId];
    const edited = parseISO(iso);
    return edited ?? (storedDob ? new Date(storedDob) : undefined);
  };

  // Schedule a refresh at next midnight so categories update automatically on birthdays
  useEffect(() => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5); // 5s after midnight
    const ms = next.getTime() - now.getTime();
    const t = window.setTimeout(() => setMidnightTick(Date.now()), ms);
    return () => window.clearTimeout(t);
  }, [midnightTick]);

  // Map weight class labels like "-66", "+78" to a numeric representative to store in user.weight
  const weightClassToNumber = (cls: string): number | undefined => {
    if (!cls) return undefined;
    // Remove any non-digit except leading '+' or '-'
    const m = cls.match(/([+-]?)\d+/);
    if (!m) return undefined;
    const n = Number(m[0].replace(/[^\d]/g, ''));
    // We store the boundary number (e.g., -66 => 66, +100 => 100)
    return isNaN(n) ? undefined : n;
  };

  // طباعة القائمة الاسمية - طباعة الجدول فقط بدون الهيدر والفوتر والقوائم العلوية
  const printAthleteRoster = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>القائمة الاسمية للمصارعين - ${club.nameAr}</title>
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
        <h2>القائمة الاسمية للمصارعين - ${club.nameAr}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
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
              const effDob = (function(){
                const iso = (dobEdits as any)[athlete.id];
                if (iso) { const d = new Date(iso); if (!isNaN(d.getTime())) return d; }
                return athlete.dateOfBirth ? new Date(athlete.dateOfBirth) : undefined;
              })();
              const age = effDob ? calculateAge(effDob) : 0;
              const category = getAgeCategoryLabel(effDob);
              const genderText = athlete.gender === 'male' ? 'ذكر' : 'أنثى';
              
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${athlete.firstNameAr || athlete.firstName || ''} ${athlete.lastNameAr || athlete.lastName || ''}</td>
                  <td>${fatherEdits[athlete.id] || athlete.fatherName || ''}</td>
                  <td>${motherEdits[athlete.id] || athlete.motherName || ''}</td>
                  <td>${dobEdits[athlete.id] || (athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toLocaleDateString('ar-DZ') : '')}</td>
                  <td>${birthPlaceEdits[athlete.id] || athlete.birthPlace || ''}</td>
                  <td>${ageEdits[athlete.id] || age || ''}</td>
                  <td>${category}</td>
                  <td>${genderText}</td>
                  <td>${weightEdits[athlete.id] || athlete.weight || ''}</td>
                  <td>${heightEdits[athlete.id] || athlete.height || ''}</td>
                  <td>${bloodTypeEdits[athlete.id] || athlete.bloodType || ''}</td>
                  <td>${phoneEdits[athlete.id] || athlete.phone || ''}</td>
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

  // Filter athletes based on search and filters, using both local and Firebase data
  const filteredAthletes = useMemo(() => {
    return clubAthletes.filter(athlete => {
      const effDob = getEffectiveDob(athlete.id, athlete.dateOfBirth);
      const category = getAgeCategoryLabel(effDob);
      
      // Check if athlete is active in Firebase roster
      const rosterEntry = athleteRoster.find(r => r.athleteId === athlete.id);
      const isActiveInRoster = rosterEntry?.isActive !== false;

      const matchesSearch = searchTerm === '' ||
        (athlete.firstNameAr && athlete.firstNameAr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (athlete.lastNameAr && athlete.lastNameAr.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = filterCategory === '' || category === filterCategory;
      const matchesGender = filterGender === '' || athlete.gender === filterGender;

      return matchesSearch && matchesCategory && matchesGender && isActiveInRoster;
    });
  }, [clubAthletes, athleteRoster, searchTerm, filterCategory, filterGender, midnightTick, dobEdits]);

  // Show loading state
  if (loadingAthleteRoster || loadingClubAthletes) {
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-info text-white d-flex align-items-center justify-content-between">
          <div className="text-end" dir="rtl">
            <h5 className="mb-0" dir="rtl">
              <i className="fas fa-list me-2"></i>
              القائمة الاسمية للمصارعين - {club.nameAr}
            </h5>
          </div>

        {/* تحسين عرض الأعمدة الواسعة والمحتوى الطويل */}
        <style>
          {`
            .athlete-roster-table th,
            .athlete-roster-table td {
              white-space: normal !important;
              word-break: break-word !important;
              vertical-align: middle !important;
            }
            /* الاسم واللقب */
            .athlete-roster-table th:nth-child(2),
            .athlete-roster-table td:nth-child(2) {
              min-width: 260px;
            }
            /* اسم الأب */
            .athlete-roster-table th:nth-child(3),
            .athlete-roster-table td:nth-child(3) {
              min-width: 220px;
            }
            /* اسم ولقب الأم */
            .athlete-roster-table th:nth-child(4),
            .athlete-roster-table td:nth-child(4) {
              min-width: 280px;
            }
            /* تاريخ الميلاد */
            .athlete-roster-table th:nth-child(5),
            .athlete-roster-table td:nth-child(5) {
              min-width: 180px;
            }
            /* مكان الميلاد */
            .athlete-roster-table th:nth-child(6),
            .athlete-roster-table td:nth-child(6) {
              min-width: 240px;
            }
            /* العمر */
            .athlete-roster-table th:nth-child(7),
            .athlete-roster-table td:nth-child(7) {
              min-width: 130px;
            }
            /* الفئة */
            .athlete-roster-table th:nth-child(8),
            .athlete-roster-table td:nth-child(8) {
              min-width: 160px;
            }
            /* الصنف (الجنس) */
            .athlete-roster-table th:nth-child(9),
            .athlete-roster-table td:nth-child(9) {
              min-width: 160px;
            }
            /* الوزن */
            .athlete-roster-table th:nth-child(10),
            .athlete-roster-table td:nth-child(10) {
              min-width: 200px;
            }
            /* الطول */
            .athlete-roster-table th:nth-child(11),
            .athlete-roster-table td:nth-child(11) {
              min-width: 160px;
            }
            /* فصيلة الدم */
            .athlete-roster-table th:nth-child(12),
            .athlete-roster-table td:nth-child(12) {
              min-width: 170px;
            }
            /* رقم الهاتف */
            .athlete-roster-table th:nth-child(13),
            .athlete-roster-table td:nth-child(13) {
              min-width: 220px;
            }

            @media (max-width: 768px) {
              .athlete-roster-table th,
              .athlete-roster-table td {
                min-width: auto !important;
              }
            }
          `}
        </style>
          <div className="text-start d-flex gap-2">
            <Button
              variant="outline-light"
              size="sm"
              onClick={printAthleteRoster}
              dir="rtl"
            >
              <i className="fas fa-print me-2"></i>
              طباعة القائمة
            </Button>
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

  return (
    <>
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearError}>
          <Alert.Heading>خطأ في قاعدة البيانات</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
      <Card className="shadow-sm">
        <Card.Header className="bg-info text-white d-flex align-items-center justify-content-between">
          <div className="text-end" dir="rtl">
            <h5 className="mb-0" dir="rtl">
              <i className="fas fa-list me-2"></i>
              القائمة الاسمية للمصارعين - {club.nameAr}
            </h5>
          </div>
          <div className="text-start d-flex gap-2">
            <Button
              variant="outline-light"
              size="sm"
              onClick={printAthleteRoster}
              dir="rtl"
            >
              <i className="fas fa-print me-2"></i>
              طباعة القائمة
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {/* Filters */}
          <Row className="mb-4">
            <Col md={4}>
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
            <Col md={4}>
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
            <Col md={4}>
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
              className="text-center align-middle athlete-roster-table coach-table"
              style={{ tableLayout: 'auto', width: '100%' }}
            >
              <thead>
                <tr>
                  <th className="text-center" dir="rtl">#</th>
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
                const effDob = getEffectiveDob(athlete.id, athlete.dateOfBirth);
                const age = effDob ? calculateAge(effDob) : 0;
                const category = getAgeCategoryLabel(effDob);

                return (
                  <tr key={athlete.id}>
                    <td>{index + 1}</td>
                    <td className="text-end" dir="rtl">
                      <div className="fw-semibold">
                        {athlete.firstNameAr || athlete.firstName || ''} {athlete.lastNameAr || athlete.lastName || ''}
                      </div>
                    </td>
                    <td className="text-end" dir="rtl">
                      <Form.Control
                        type="text"
                        value={fatherEdits[athlete.id] ?? athlete.fatherName ?? ''}
                        placeholder="اسم الأب"
                        className="text-end"
                        onChange={(e) => setFatherEdits(prev => ({ ...prev, [athlete.id]: e.target.value }))}
                        onBlur={() => saveField(athlete.id, { fatherName: fatherEdits[athlete.id] ?? '' })}
                        disabled={!!saving[athlete.id]}
                      />
                    </td>
                    <td className="text-end" dir="rtl">
                      <Form.Control
                        type="text"
                        value={motherEdits[athlete.id] ?? athlete.motherName ?? ''}
                        placeholder="اسم ولقب الأم"
                        className="text-end"
                        onChange={(e) => setMotherEdits(prev => ({ ...prev, [athlete.id]: e.target.value }))}
                        onBlur={() => saveField(athlete.id, { motherName: (motherEdits[athlete.id] ?? '').trim() })}
                        disabled={!!saving[athlete.id]}
                      />
                      {/* ملاحظة: يتم حفظ الاسم الكامل للأم في حقل motherName */}
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        value={dobEdits[athlete.id] ?? ''}
                        onChange={(e) => {
                          const iso = e.target.value;
                          setDobEdits(prev => ({ ...prev, [athlete.id]: iso }));
                          const d = parseISO(iso);
                          const newAge = d ? String(calculateAge(d)) : '';
                          setAgeEdits(prev => ({ ...prev, [athlete.id]: newAge }));
                        }}
                        onBlur={() => {
                          const iso = dobEdits[athlete.id] ?? '';
                          if (iso) {
                            saveField(athlete.id, { dateOfBirth: new Date(iso) });
                          }
                        }}
                        disabled={!!saving[athlete.id]}
                      />
                    </td>
                    <td className="text-end" dir="rtl">
                      <Form.Control
                        type="text"
                        value={birthPlaceEdits[athlete.id] ?? ''}
                        placeholder="مكان الميلاد"
                        className="text-end"
                        onChange={(e) => setBirthPlaceEdits(prev => ({ ...prev, [athlete.id]: e.target.value }))}
                        onBlur={() => saveField(athlete.id, { birthPlace: (birthPlaceEdits[athlete.id] ?? '').trim() })}
                        disabled={!!saving[athlete.id]}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <Form.Control
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={ageEdits[athlete.id] ?? (age ? String(age) : '')}
                          onChange={(e) => setAgeEdits(prev => ({ ...prev, [athlete.id]: e.target.value }))}
                          onBlur={() => {
                            const v = (ageEdits[athlete.id] ?? '').trim();
                            const num = Number(v);
                            if (!isNaN(num) && num > 0) {
                              const today = new Date();
                              const existing = athlete.dateOfBirth ? new Date(athlete.dateOfBirth) : undefined;
                              const month = existing ? existing.getMonth() : 5; // June (0-based)
                              const day = existing ? existing.getDate() : 15;
                              const newDob = new Date(today.getFullYear() - num, month, day);
                              saveField(athlete.id, { dateOfBirth: newDob });
                            }
                          }}
                          disabled={!!saving[athlete.id]}
                        />
                      </div>
                    </td>
                    <td>
                      <Badge bg="success">{category}</Badge>
                    </td>
                    <td>
                      <Form.Select
                        value={genderEdits[athlete.id] ?? athlete.gender ?? 'male'}
                        onChange={(e) => {
                          const val = (e.target.value as 'male' | 'female');
                          setGenderEdits(prev => ({ ...prev, [athlete.id]: val }));
                          saveField(athlete.id, { gender: val });
                        }}
                        disabled={!!saving[athlete.id]}
                      >
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </Form.Select>
                    </td>
                    <td>
                      {(() => {
                        const effDob = getEffectiveDob(athlete.id, athlete.dateOfBirth);
                        const comp = getCategoryByDOBToday(effDob);
                        const g = (genderEdits[athlete.id] ?? athlete.gender ?? 'male') as 'male' | 'female';
                        const options = comp ? getWeightClasses(comp.id, g) : [];
                        // Derive selected class from current numeric weight if possible (avoid treating empty as 0)
                        const raw = (weightEdits[athlete.id] ?? athlete.weight) as unknown;
                        const currentNum = (raw === '' || raw === undefined) ? NaN : Number(raw);
                        const currentClass = options.find(o => weightClassToNumber(o) === (isNaN(currentNum) ? undefined : currentNum)) || '';
                        if (options.length > 0) {
                          return (
                            <Form.Select
                              value={currentClass}
                              onChange={(e) => {
                                const cls = e.target.value;
                                const num = weightClassToNumber(cls);
                                setWeightEdits(prev => ({ ...prev, [athlete.id]: num !== undefined ? String(num) : '' }));
                                if (num !== undefined) {
                                  saveField(athlete.id, { weight: num });
                                }
                              }}
                              disabled={!!saving[athlete.id]}
                            >
                              <option value="">اختر صنف الوزن</option>
                              {options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </Form.Select>
                          );
                        }
                        // Fallback numeric input when no predefined classes for this category/gender
                        return (
                          <Form.Control
                            type="number"
                            inputMode="decimal"
                            value={weightEdits[athlete.id] ?? ''}
                            placeholder="الوزن"
                            onChange={(e) => setWeightEdits(prev => ({ ...prev, [athlete.id]: e.target.value }))}
                            onBlur={() => {
                              const v = weightEdits[athlete.id];
                              const num = v === '' ? undefined : Number(v);
                              if (!isNaN(num as number)) {
                                saveField(athlete.id, { weight: num as number });
                              }
                            }}
                            disabled={!!saving[athlete.id]}
                          />
                        );
                      })()}
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        inputMode="decimal"
                        value={heightEdits[athlete.id] ?? ''}
                        placeholder="الطول"
                        onChange={(e) => setHeightEdits(prev => ({ ...prev, [athlete.id]: e.target.value }))}
                        onBlur={() => {
                          const v = heightEdits[athlete.id];
                          const num = v === '' ? undefined : Number(v);
                          if (!isNaN(num as number)) {
                            saveField(athlete.id, { height: num as number });
                          }
                        }}
                        disabled={!!saving[athlete.id]}
                      />
                    </td>
                    <td>
                      <Form.Select
                        value={bloodTypeEdits[athlete.id] ?? ''}
                        onChange={(e) => {
                          const bt = e.target.value;
                          setBloodTypeEdits(prev => ({ ...prev, [athlete.id]: bt }));
                          saveField(athlete.id, { bloodType: bt });
                        }}
                        disabled={!!saving[athlete.id]}
                      >
                        <option value="">—</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </Form.Select>
                    </td>
                    <td className="text-end" dir="rtl">
                      <Form.Control
                        type="text"
                        value={phoneEdits[athlete.id] ?? ''}
                        placeholder="رقم الهاتف"
                        className="text-end"
                        onChange={(e) => setPhoneEdits(prev => ({ ...prev, [athlete.id]: e.target.value }))}
                        onBlur={() => saveField(athlete.id, { phone: (phoneEdits[athlete.id] ?? '').trim() })}
                        disabled={!!saving[athlete.id]}
                      />
                      {/* Add coach notes from Firebase if available */}
                      {(() => {
                        const rosterEntry = athleteRoster.find(r => r.athleteId === athlete.id);
                        return rosterEntry?.notes && (
                          <div className="small text-muted mt-1">
                            <i className="fas fa-sticky-note me-1"></i>
                            {rosterEntry.notes.substring(0, 50)}{rosterEntry.notes.length > 50 ? '...' : ''}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {filteredAthletes.length === 0 && (
          <div className="text-center text-muted py-4">
            <i className="fas fa-search fa-3x mb-3"></i>
            <h5>لا توجد نتائج</h5>
            <p>لم يتم العثور على رياضيين يطابقون معايير البحث</p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 p-3 bg-light rounded">
          <Row className="text-center">
            <Col md={3}>
              <h6 className="text-primary">إجمالي الرياضيين</h6>
              <h4 className="text-primary">{filteredAthletes.length}</h4>
            </Col>
            <Col md={3}>
              <h6 className="text-info">الذكور</h6>
              <h4 className="text-info">
                {filteredAthletes.filter(a => a.gender === 'male').length}
              </h4>
            </Col>
            <Col md={3}>
              <h6 className="text-warning">الإناث</h6>
              <h4 className="text-warning">
                {filteredAthletes.filter(a => a.gender === 'female').length}
              </h4>
            </Col>
            <Col md={3}>
              <h6 className="text-success">متوسط العمر</h6>
              <h4 className="text-success">
                {filteredAthletes.length > 0
                  ? Math.round(filteredAthletes.reduce((sum, a) => sum + (a.dateOfBirth ? calculateAge(a.dateOfBirth) : 0), 0) / filteredAthletes.length)
                  : 0
                } سنة
              </h4>
            </Col>
          </Row>
          {/* Add Firebase sync status */}
         
        </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default AthleteRoster;
