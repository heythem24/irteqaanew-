import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CompetitionsService, UsersService, ClubsService, ParticipationsService } from '../../services/firestoreService';
import type { Competition, User } from '../../types';
import ImageWithFallback from '../../components/shared/ImageWithFallback';

const CoachCompetitionsPage: React.FC = () => {
  const [allCompetitions, setAllCompetitions] = useState<Competition[]>([]);
  const [clubAthletes, setClubAthletes] = useState<User[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [club, setClub] = useState<Club | null>(null); // غير مستخدم حالياً
  const [registrations, setRegistrations] = useState<Record<string, 'none' | 'approved' | 'rejected' | 'loading'>>({});
  const [participationIds, setParticipationIds] = useState<Record<string, string | undefined>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBelt, setSelectedBelt] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | ''>('');
  const [selectedWeightClass, setSelectedWeightClass] = useState<string>('');

  const currentUser = UsersService.getCurrentUser();
  const clubId = currentUser?.clubId || '';

  const levelLabelAr = (lv?: string): string => {
    switch (lv) {
      case 'national': return 'وطنية';
      case 'regional': return 'جهوية';
      case 'league': return 'تابعة لرابطة';
      default: return '';
    }
  };

  const handleUnregisterAthlete = async (athleteId: string) => {
    if (!selectedCompetition || !clubId) return;
    if (!window.confirm('هل تريد إلغاء تسجيل هذا الرياضي؟')) return;
    try {
      setRegistrations(prev => ({ ...prev, [athleteId]: 'loading' }));
      let pid = participationIds[athleteId];
      if (!pid) {
        const part = await ParticipationsService.getParticipationForAthlete(selectedCompetition.id, athleteId);
        pid = part?.id;
      }
      if (pid) {
        await ParticipationsService.deleteParticipation(pid);
      }
      setRegistrations(prev => ({ ...prev, [athleteId]: 'none' }));
      setParticipationIds(prev => ({ ...prev, [athleteId]: undefined }));
    } catch (e) {
      console.error('Failed to unregister athlete:', e);
      setRegistrations(prev => ({ ...prev, [athleteId]: 'approved' }));
    }
  };

  const formatDateAr = (value: unknown): string => {
    try {
      if (!value) return '-';
      const d = value instanceof Date ? value : new Date(value as any);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('ar-DZ');
    } catch {
      return '-';
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!clubId) {
          setError('يجب أن تكون مسجلاً كمدرب مرتبط بنادٍ');
          setLoading(false);
          return;
        }
        const [comps, athletes, clubInfo] = await Promise.all([
          CompetitionsService.getAllCompetitions(),
          UsersService.getAthletesByClub(clubId),
          ClubsService.getClubById(clubId)
        ]);
        // setClub(clubInfo);

        // فلترة البطولات: وطنية + جهوية + التابعة لرابطة النادي
        const filtered = comps.filter(c => {
          if (c.level === 'national') return true;
          if (c.level === 'regional') return true;
          if (c.level === 'league' && clubInfo && c.leagueId === clubInfo.leagueId) return true;
          return false;
        });

        setAllCompetitions(filtered);
        setClubAthletes(athletes);
      } catch (e) {
        console.error('CoachCompetitionsPage load error:', e);
        setError('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clubId]);

  // عند اختيار بطولة، اجلب مشاركات الرياضيين الحالية لبناء خريطة حالات التسجيل
  useEffect(() => {
    const loadRegistrations = async () => {
      if (!selectedCompetition) return;
      try {
        const parts = await ParticipationsService.getParticipationsByCompetition(selectedCompetition.id);
        const statusMap: Record<string, 'none' | 'approved' | 'rejected'> = {};
        const idMap: Record<string, string | undefined> = {};
        clubAthletes.forEach(a => { statusMap[a.id] = 'none'; idMap[a.id] = undefined; });
        parts.forEach(p => { statusMap[p.athleteId] = 'approved'; idMap[p.athleteId] = p.id; });
        setRegistrations(statusMap);
        setParticipationIds(idMap);
      } catch (e) {
        console.error('Failed to load participations:', e);
      }
    };
    loadRegistrations();
  }, [selectedCompetition, clubAthletes]);

  const handleRegisterAthlete = async (athleteId: string) => {
    if (!selectedCompetition || !clubId) return;
    // امنع النقرات المكررة
    if (registrations[athleteId] && registrations[athleteId] !== 'none') return;
    try {
      setRegistrations(prev => ({ ...prev, [athleteId]: 'loading' }));
      const newId = await ParticipationsService.createParticipation({
        competitionId: selectedCompetition.id,
        athleteId,
        clubId,
        status: 'approved'
      } as any);
      setRegistrations(prev => ({ ...prev, [athleteId]: 'approved' }));
      setParticipationIds(prev => ({ ...prev, [athleteId]: newId }));
    } catch (e) {
      console.error('Failed to register athlete:', e);
      setRegistrations(prev => ({ ...prev, [athleteId]: 'none' }));
    }
  };

  const eligibleAthletes = useMemo(() => {
    if (!selectedCompetition) return [] as User[];
    const nowYear = new Date().getFullYear();
    return clubAthletes.filter(a => {
      const dob = a.dateOfBirth instanceof Date ? a.dateOfBirth : (a.dateOfBirth ? new Date(a.dateOfBirth as any) : undefined);
      if (!dob || isNaN(dob.getTime())) return false;
      const age = nowYear - dob.getFullYear();
      // مطابقة تقريبية حسب العمر
      return selectedCompetition.categories.some(cat => {
        switch (cat) {
          case 'مصغر': return age <= 8;
          case 'براعم صغار': return age >= 9 && age <= 10;
          case 'براعم': return age >= 11 && age <= 12;
          case 'أصاغر': return age >= 13 && age <= 14;
          case 'صغار': return age >= 15 && age <= 16;
          case 'ناشئين': return age >= 17 && age <= 18;
          case 'أواسط': return age >= 19 && age <= 20;
          case 'أكابر': return age >= 21;
          default: return false;
        }
      });
    });
  }, [selectedCompetition, clubAthletes]);

  const ageFitsCategory = (cat: string, age: number) => {
    switch (cat) {
      case 'مصغر': return age <= 8;
      case 'براعم صغار': return age >= 9 && age <= 10;
      case 'براعم': return age >= 11 && age <= 12;
      case 'أصاغر': return age >= 13 && age <= 14;
      case 'صغار': return age >= 15 && age <= 16;
      case 'ناشئين': return age >= 17 && age <= 18;
      case 'أواسط': return age >= 19 && age <= 20;
      case 'أكابر': return age >= 21;
      default: return true;
    }
  };

  const availableBelts = useMemo(() => {
    const set = new Set<string>();
    clubAthletes.forEach(a => { if (a.beltAr) set.add(a.beltAr); });
    return Array.from(set);
  }, [clubAthletes]);

  const availableWeightClasses = useMemo(() => {
    if (!selectedCompetition || !selectedCategory) return [] as string[];
    const w = (selectedCompetition as any).weights?.[selectedCategory] as { male: string[]; female: string[] } | undefined;
    if (!w) return [];
    if (selectedGender === 'male') return w.male || [];
    if (selectedGender === 'female') return w.female || [];
    // إن لم يتم اختيار الجنس، اعرض اتحاد القائمتين بدون تكرار
    return Array.from(new Set([...(w.male || []), ...(w.female || [])]));
  }, [selectedCompetition, selectedCategory, selectedGender]);

  const matchesWeightClass = (athleteWeight?: number, cls?: string): boolean => {
    if (!cls) return true;
    if (athleteWeight == null || isNaN(athleteWeight)) return false;
    const s = cls.trim();
    // أمثلة: "-60", "+100", "-66", "-73"
    if (s.startsWith('-')) {
      const n = parseFloat(s.substring(1));
      return athleteWeight <= n;
    }
    if (s.startsWith('+')) {
      const n = parseFloat(s.substring(1));
      return athleteWeight >= n;
    }
    // fallback: تطابق مباشر غير قياسي
    return true;
  };

  const displayedAthletes = useMemo(() => {
    const nowYear = new Date().getFullYear();
    return eligibleAthletes.filter(a => {
      // فلتر الفئة
      if (selectedCategory && selectedCompetition) {
        const dob = a.dateOfBirth instanceof Date ? a.dateOfBirth : (a.dateOfBirth ? new Date(a.dateOfBirth as any) : undefined);
        if (!dob || isNaN(dob.getTime())) return false;
        const age = nowYear - dob.getFullYear();
        if (!ageFitsCategory(selectedCategory, age)) return false;
      }
      // فلتر الجنس
      if (selectedGender && a.gender && a.gender !== selectedGender) return false;
      // فلتر الحزام
      if (selectedBelt && (a.beltAr !== selectedBelt)) return false;
      // فلتر الوزن تبعاً للفئة والأوزان المختارة في البطولة
      if (selectedWeightClass) {
        if (!matchesWeightClass(a.weight as any, selectedWeightClass)) return false;
      }
      return true;
    });
  }, [eligibleAthletes, selectedCategory, selectedBelt, selectedCompetition, selectedGender, selectedWeightClass]);

  const registeredCount = useMemo(() => {
    return displayedAthletes.reduce((acc, a) => acc + (registrations[a.id] === 'approved' ? 1 : 0), 0);
  }, [displayedAthletes, registrations]);

  if (loading) {
    return (
      <Container className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center" dir="rtl">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ marginTop: '4.5rem' }}>
      <h1 className="text-center mb-5">المنافسات المتاحة</h1>

      <Row>
        {allCompetitions.map((c) => (
          <Col key={c.id} md={6} lg={4} className="mb-4">
            <Card className="shadow-sm h-100">
              <div style={{ height: 200, overflow: 'hidden' }}>
                <ImageWithFallback
                  inputSrc={c.image || undefined}
                  fallbackSrc={'/vite.svg'}
                  alt={c.nameAr}
                  boxWidth={'100%'}
                  boxHeight={200}
                  fixedBox
                  style={{ height: '200px', width: '100%', objectFit: 'cover', background: '#007bff' }}
                />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-end" dir="rtl">{c.nameAr}</Card.Title>
                {c.level && (
                  <div className="mb-2">
                    <Badge bg="secondary">{levelLabelAr(c.level)}</Badge>
                  </div>
                )}
                {c.descriptionAr && (
                  <Card.Text className="text-muted text-end" dir="rtl" style={{ minHeight: '2.5em' }}>
                    {c.descriptionAr.length > 110 ? `${c.descriptionAr.slice(0, 110)}…` : c.descriptionAr}
                  </Card.Text>
                )}
                <div className="mt-auto">
                  <p className="text-end mb-1" dir="rtl">
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      {formatDateAr(c.startDate)} - {formatDateAr(c.endDate)}
                    </small>
                  </p>
                  {c.registrationDeadline && (
                    <p className="text-end mb-1" dir="rtl">
                      <small className="text-muted">
                        <i className="fas fa-hourglass-end me-1"></i>
                        انتهاء التسجيل: {formatDateAr(c.registrationDeadline)}
                      </small>
                    </p>
                  )}
                  <p className="text-end" dir="rtl">
                    <small className="text-muted">
                      <i className="fas fa-users me-1"></i>
                      الفئات: {c.categories.join(' - ')}
                    </small>
                  </p>
                  <div className="d-flex justify-content-between">
                    <Link to={`/competitions/${c.id}`} className="btn btn-outline-primary btn-sm">التفاصيل</Link>
                    <Button size="sm" variant="primary" onClick={() => setSelectedCompetition(c)}>اختيار الرياضيين</Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedCompetition && (
        <Row className="mt-5">
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0 text-center" dir="rtl">الرياضيين المؤهلين - {selectedCompetition.nameAr}</h5>
              </Card.Header>
              <Card.Body>
                {/* فلاتر الفئة والحزام + عدّاد المسجلين */}
                <Row className="mb-3" dir="rtl">
                  <Col md={3} className="mb-2">
                    <label className="form-label d-block text-end">تصفية حسب الفئة</label>
                    <select className="form-select text-end" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                      <option value="">كل الفئات</option>
                      {(selectedCompetition?.categories || []).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </Col>
                  <Col md={3} className="mb-2">
                    <label className="form-label d-block text-end">تصفية حسب الحزام</label>
                    <select className="form-select text-end" value={selectedBelt} onChange={(e) => setSelectedBelt(e.target.value)}>
                      <option value="">كل الأحزمة</option>
                      {availableBelts.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </Col>
                  <Col md={3} className="mb-2">
                    <label className="form-label d-block text-end">الجنس</label>
                    <select className="form-select text-end" value={selectedGender} onChange={(e) => setSelectedGender(e.target.value as any)}>
                      <option value="">الكل</option>
                      <option value="male">ذكور</option>
                      <option value="female">إناث</option>
                    </select>
                  </Col>
                  <Col md={3} className="mb-2">
                    <label className="form-label d-block text-end">الوزن</label>
                    <select className="form-select text-end" value={selectedWeightClass} onChange={(e) => setSelectedWeightClass(e.target.value)} disabled={!selectedCategory}>
                      <option value="">كل الأوزان</option>
                      {availableWeightClasses.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </Col>
                  <Col md={12} className="d-flex align-items-end justify-content-end">
                    <Badge bg="info">مسجّلون من ناديك: {registeredCount}</Badge>
                  </Col>
                </Row>
                {eligibleAthletes.length > 0 ? (
                  <Row>
                    {displayedAthletes.map(a => (
                      <Col key={a.id} md={6} lg={4} className="mb-3">
                        <Card className="h-100 shadow-sm">
                          <Card.Body className="text-end d-flex flex-column" dir="rtl">
                            <h6>
                              {(a.firstNameAr || a.firstName) || ''} {(a.lastNameAr || a.lastName) || ''}
                            </h6>
                            <small className="text-muted d-block">العمر: {new Date().getFullYear() - (a.dateOfBirth ? new Date(a.dateOfBirth as any).getFullYear() : 0)} سنة</small>
                            {a.beltAr && <small className="text-muted d-block">الحزام: {a.beltAr}</small>}
                            <div className="mt-auto d-flex justify-content-between align-items-center">
                              {registrations[a.id] === 'approved' && (
                                <>
                                  <Badge bg="success">مسجل</Badge>
                                  <Button 
                                    size="sm" 
                                    variant="outline-danger"
                                    disabled={registrations[a.id] === 'loading'}
                                    onClick={() => handleUnregisterAthlete(a.id)}
                                  >
                                    {registrations[a.id] === 'loading' ? '...جارٍ' : 'إلغاء التسجيل'}
                                  </Button>
                                </>
                              )}
                              {(!registrations[a.id] || registrations[a.id] === 'none') && (
                                <Button 
                                  size="sm" 
                                  variant="primary"
                                  disabled={registrations[a.id] === 'loading'}
                                  onClick={() => handleRegisterAthlete(a.id)}
                                >
                                  {registrations[a.id] === 'loading' ? '...جارٍ' : 'تسجيل'}
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center text-muted" dir="rtl">لا يوجد رياضيون مؤهلون لهذه البطولة</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CoachCompetitionsPage;
