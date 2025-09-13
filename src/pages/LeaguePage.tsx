import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
// Local-only data (mock)
import { leagues as mockLeagues, clubs as mockClubs, staff as mockStaff } from '../data/mockData';
import { ClubsService, LeaguesService } from '../services/firestoreService';
import CustomCarousel from '../components/shared/CustomCarousel';
import type { League, Staff, CarouselItem, Club } from '../types';
import { LeagueHomepageService, type LeagueHomepageContent } from '../services/leagueHomepageService';
import { StaffPosition } from '../types';
import ImageWithFallback from '../components/shared/ImageWithFallback';
import './LeaguePage.css';

const LeaguePage: React.FC = () => {
  const { wilayaId } = useParams<{ wilayaId: string }>();
  const [league, setLeague] = useState<League | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [president, setPresident] = useState<Staff | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [leagueContent, setLeagueContent] = useState<LeagueHomepageContent>({ standoutAthletes: [], achievements: [], upcomingEvents: [], managementTeam: [], leagueClubs: [] });

  // Image URLs are handled via ImageWithFallback to ensure HTTPS and fallbacks

  useEffect(() => {
    const loadLocal = async () => {
      if (!wilayaId) {
        setError('Wilaya ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // League from Firestore first, then fallback to mock
        const leagueData = await LeaguesService.getLeagueByWilayaId(parseInt(wilayaId, 10)) ||
                          mockLeagues.find(l => String(l.wilayaId) === String(wilayaId)) || null;
        setLeague(leagueData || null);

        // Clubs for that league - combine dynamic and mock data
        console.log('===LeaguePage Debug: Starting clubs fetch for league===');
        console.log('League ID:', leagueData?.id);
        
        let dynamicClubs = leagueData
          ? await ClubsService.getClubsByLeagueFlexible(leagueData.id, leagueData.wilayaId)
          : [];
        console.log('===LeaguePage Debug: Dynamic clubs fetched from Firestore==>');
        console.log('Raw dynamic clubs data:', dynamicClubs);
        console.log('Dynamic clubs count:', dynamicClubs.length);

        if (leagueData && dynamicClubs.length === 0) {
          console.warn('===LeaguePage Debug: No clubs from flexible fetch. Falling back to getAllClubs()+client filter===');
          try {
            const all = await ClubsService.getAllClubs();
            const filtered = all.filter((c: any) =>
              c.leagueId === leagueData.id ||
              c.leagueId === leagueData.wilayaId ||
              String(c.leagueId) === String(leagueData.wilayaId)
            );
            console.log('===LeaguePage Debug: Client-filtered clubs count===', filtered.length);
            
            // The clubs are already filtered by getClubsByLeagueFlexible, so we don't need additional filtering
            // This was causing all clubs to be filtered out
            console.log('===LeaguePage Debug: Using filtered clubs without additional filtering===', filtered.length);
            dynamicClubs = filtered as any;
          } catch (err) {
            console.error('===LeaguePage Debug: Fallback getAllClubs failed===', err);
          }
        } else {
          // The clubs are already filtered by getClubsByLeagueFlexible, so we don't need additional filtering
          // This was causing all clubs to be filtered out
          console.log('===LeaguePage Debug: Using filtered clubs without additional filtering===', dynamicClubs.length);
        }
        
        const mockClubsForLeague = leagueData
          ? mockClubs.filter(c => c.leagueId === leagueData.id)
          : [];
        console.log('===LeaguePage Debug: Mock clubs filtered for league===');
        console.log('Mock clubs count for this league:', mockClubsForLeague.length);
        
        // Combine dynamic clubs with mock clubs, avoiding duplicates
        const allClubs = [...dynamicClubs];
        mockClubsForLeague.forEach(mockClub => {
          if (!allClubs.find(club => club.id === mockClub.id)) {
            allClubs.push(mockClub);
          }
        });
        
        console.log('===LeaguePage Debug: Combined clubs result==>');
        console.log('Total clubs count:', allClubs.length);
        console.log('Final clubs list:', allClubs.map(c => ({ id: c.id, nameAr: c.nameAr, leagueId: c.leagueId })));
        
        setClubs(allClubs);

        // President from mock staff if available
        const pres = leagueData
          ? (mockStaff.find(s => s.leagueId === leagueData.id && s.position === StaffPosition.LEAGUE_PRESIDENT) as Staff | undefined)
          : undefined;
        setPresident(pres || null);
      } catch (e) {
        console.error(e);
        setError('Failed to load local data.');
      } finally {
        setLoading(false);
      }
    };
    loadLocal();
  }, [wilayaId]);

  // Load dynamic homepage content for this league
  useEffect(() => {
    const fetchContent = async () => {
      if (!league?.id) return;
      try {
        const primaryId = String(league.id);
        const altId = league.wilayaId != null ? String(league.wilayaId) : '';
        console.log('[LeaguePage] Fetching league homepage content. Primary:', primaryId, 'Alt:', altId);
        let data = await LeagueHomepageService.getContent(primaryId);
        // If president or headerLogo not present via primary key, try alternate key based on wilayaId
        if (((!data.president || !data.president.image) || !(data as any).headerLogo) && altId && altId !== primaryId) {
          try {
            const altData = await LeagueHomepageService.getContent(altId);
            // Prefer president/headerLogo from whichever document has the data
            if (altData) {
              const merged: any = { ...data };
              if ((!data.president || !data.president.image) && altData.president) merged.president = altData.president;
              if (!(data as any).headerLogo && (altData as any).headerLogo) (merged as any).headerLogo = (altData as any).headerLogo;
              data = merged;
            }
          } catch (e) {
            // ignore alt fetch errors
          }
        }
        console.log('[LeaguePage] Content sizes => athletes:', (data.standoutAthletes || []).length,
          'achievements:', (data.achievements || []).length,
          'events:', (data.upcomingEvents || []).length,
          'management:', (data.managementTeam || []).length,
          'leagueClubs:', (data.leagueClubs || []).length);
        setLeagueContent({
          standoutAthletes: data.standoutAthletes || [],
          achievements: data.achievements || [],
          upcomingEvents: data.upcomingEvents || [],
          managementTeam: data.managementTeam || [],
          leagueClubs: data.leagueClubs || [],
          president: data.president,
          headerLogo: (data as any).headerLogo,
        });
      } catch (e) {
        // Keep defaults on failure
        console.warn('Failed to load league homepage content:', e);
      }
    };
    fetchContent();

    // Listen to admin updates and refresh
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail;
        if (!detail || !detail.leagueId) {
          // If leagueId unknown, still refresh for safety
          fetchContent();
        } else if (String(detail.leagueId) === String(league?.id)) {
          fetchContent();
        }
      } catch {
        fetchContent();
      }
    };
    window.addEventListener('leagueHomepageUpdated', handler as EventListener);
    return () => {
      window.removeEventListener('leagueHomepageUpdated', handler as EventListener);
    };
  }, [league?.id]);

  // Prefer president from dedicated league homepage content (admin-managed via Cloudinary),
  // then fallback to managementTeam, then mock Staff
  const presidentFromContent = leagueContent.president;
  const presidentFromManagement = useMemo(() => {
    const list = leagueContent.managementTeam || [];
    // Try exact Arabic match first, then contains "رئيس"
    return list.find(m => (m.positionAr || '').trim() === 'رئيس الرابطة')
      || list.find(m => (m.positionAr || '').includes('رئيس'))
      || null;
  }, [leagueContent.managementTeam]);

  const displayNameAr = useMemo(() => {
    if (presidentFromContent?.nameAr) return presidentFromContent.nameAr;
    if (presidentFromManagement?.nameAr) return presidentFromManagement.nameAr;
    if (president) return `${president.firstNameAr || ''} ${president.lastNameAr || ''}`.trim();
    return 'رئيس الرابطة';
  }, [presidentFromContent, presidentFromManagement, president]);

  const displayPositionAr = useMemo(() => {
    if (presidentFromContent?.positionAr) return presidentFromContent.positionAr;
    if (presidentFromManagement?.positionAr) return presidentFromManagement.positionAr;
    return president?.positionAr || 'رئيس الرابطة الولائية للجودو';
  }, [presidentFromContent, presidentFromManagement, president]);

  const displayImage = useMemo(() => {
    if (presidentFromContent?.image) return presidentFromContent.image;
    if (presidentFromManagement?.image) return presidentFromManagement.image;
    return president?.image || '/images/default-president.jpg';
  }, [presidentFromContent, presidentFromManagement, president]);

  const displayBioAr = useMemo(() => {
    if (presidentFromContent?.bioAr) return presidentFromContent.bioAr;
    if (presidentFromManagement && (presidentFromManagement as any).bioAr) return (presidentFromManagement as any).bioAr as string;
    return president?.bioAr || '';
  }, [presidentFromContent, presidentFromManagement, president]);

  const displayEmail = useMemo(() => {
    if (presidentFromContent?.email) return presidentFromContent.email;
    if (presidentFromManagement && (presidentFromManagement as any).email) return (presidentFromManagement as any).email as string;
    return president?.email;
  }, [presidentFromContent, presidentFromManagement, president]);

  const displayPhone = useMemo(() => {
    if (presidentFromContent?.phone) return presidentFromContent.phone;
    if (presidentFromManagement && (presidentFromManagement as any).phone) return (presidentFromManagement as any).phone as string;
    return president?.phone;
  }, [presidentFromContent, presidentFromManagement, president]);

  // President dynamic lists (experiences & achievements)
  const presidentExperiences = useMemo(() => {
    const list = presidentFromContent?.experiences
      || (presidentFromManagement && (presidentFromManagement as any).experiences)
      || [];
    return Array.isArray(list) ? list : [];
  }, [presidentFromContent, presidentFromManagement]);

  const presidentAchievements = useMemo(() => {
    const list = presidentFromContent?.achievements
      || (presidentFromManagement && (presidentFromManagement as any).achievements)
      || [];
    return Array.isArray(list) ? list : [];
  }, [presidentFromContent, presidentFromManagement]);

  // Helper: render any bullet item safely as text
  const bulletToText = (v: any): string => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) {
      const parts = v.map(bulletToText).filter((s) => typeof s === 'string');
      const allSingleChars = parts.length > 0 && parts.every((p) => p.length === 1);
      return allSingleChars ? parts.join('') : parts.join(' ');
    }
    if (typeof v === 'object') {
      // If this is a String object (boxed string), return its primitive value directly
      try {
        if (v instanceof String) return v.toString();
        const prim = (v as any).valueOf?.();
        if (typeof prim === 'string') return prim;
      } catch {}
      // Try common fields
      const candidates = [
        (v as any).titleAr,
        (v as any).title,
        (v as any).textAr,
        (v as any).text,
        (v as any).nameAr,
        (v as any).name,
      ].filter((x) => typeof x === 'string' && x.trim().length > 0) as string[];
      if (candidates.length > 0) return candidates[0];
      // Handle indexed object {0:'ر',1:'ي',...} or String-like object
      const keys = Object.keys(v);
      const allNumeric = keys.length > 0 && keys.every(k => /^\d+$/.test(k));
      if (allNumeric) {
        const indices = keys.map(Number).sort((a, b) => a - b);
        let out = '';
        for (const idx of indices) {
          const val = (v as any)[idx];
          if (typeof val === 'string') out += val;
        }
        return out;
      }
      // Fallback for other objects
      const values = Object.values(v).filter((x) => typeof x === 'string' && (x as string).trim().length > 0) as string[];
      if (values.length > 0) return values.join(' ');
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
    }
    return String(v);
  };

  // Build clubs carousel from admin-selected leagueClubs; fallback to all clubs if none selected
  const clubsCarouselItems: CarouselItem[] = useMemo(() => {
    const byId = new Map<string, Club>(clubs.map(c => [c.id, c]));
    const selected = leagueContent.leagueClubs || [];
    const source = selected.length > 0 ? selected
      .map(card => {
        const c = byId.get(card.clubId);
        if (!c) return null;
        return {
          id: c.id,
          title: c.name,
          titleAr: c.nameAr,
          description: c.description,
          descriptionAr: c.descriptionAr,
          image: card.image || c.image || '/images/default-club.jpg',
          link: `/club/${c.id}`
        } as CarouselItem;
      })
      .filter(Boolean) as CarouselItem[]
      : clubs.map(c => ({
        id: c.id,
        title: c.name,
        titleAr: c.nameAr,
        description: c.description,
        descriptionAr: c.descriptionAr,
        image: c.image || '/images/default-club.jpg',
        link: `/club/${c.id}`
      }));
    return source;
  }, [clubs, leagueContent.leagueClubs]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!league) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2>الرابطة غير موجودة</h2>
          <p className="text-muted">لم يتم العثور على الرابطة المطلوبة.</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="league-page">
      {/* League Header */}
      <section className="bg-gradient-primary text-white py-5 position-relative overflow-hidden" style={{ paddingTop: '4.5rem' }}>
        <div className="header-overlay"></div>
        <Container className="position-relative">
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-3 animate__animated animate__fadeInLeft" dir="rtl">
                رابطة <span className="text-warning">{league.wilayaNameAr}</span> للجودو
              </h1>
              <p className="lead mb-4 animate__animated animate__fadeInLeft animate__delay-1s" dir="rtl">
                {league.descriptionAr || `الرابطة الرسمية للجودو في ولاية ${league.wilayaNameAr}`}
              </p>
              <div className="animate__animated animate__fadeInLeft animate__delay-2s">
                <Button variant="light" size="lg" className="rounded-pill px-4 me-3">
                  <i className="fas fa-info-circle me-2"></i>
                  معرفة المزيد
                </Button>
                <Button variant="outline-light" size="lg" className="rounded-pill px-4">
                  <i className="fas fa-phone-alt me-2"></i>
                  اتصل بنا
                </Button>
              </div>
            </Col>
            <Col lg={4} className="text-center animate__animated animate__fadeInRight">
              <ImageWithFallback
                inputSrc={leagueContent.headerLogo || league.image}
                fallbackSrc={'/images/default-league.jpg'}
                alt={`رابطة ${league.wilayaNameAr}`}
                className="img-fluid rounded-circle shadow-lg border border-4 border-white"
                boxWidth={200}
                boxHeight={200}
                fixedBox
                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        {/* President Section */}
        {president && (
          <section className="mb-5 animate__animated animate__fadeInUp">
            <Card className="shadow-lg border-success rounded-3 overflow-hidden">
              <Card.Header className="bg-gradient-success text-white py-3">
                <h3 className="mb-0 text-center fw-bold" dir="rtl">رئيس الرابطة</h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={3} className="text-center">
                    <ImageWithFallback
                      inputSrc={president.image}
                      fallbackSrc={'/images/default-president.jpg'}
                      alt={`رئيس الرابطة ${president.firstNameAr} ${president.lastNameAr}`}
                      className="img-fluid rounded-circle shadow-lg border border-3 border-success"
                      boxWidth={180}
                      boxHeight={180}
                      fixedBox
                      style={{ width: '180px', height: '180px', objectFit: 'cover' }}
                    />
                  </Col>
                  <Col md={9}>
                    <h4 className="text-end text-success fw-bold" dir="rtl">
                      {`${president.firstNameAr} ${president.lastNameAr}`}
                    </h4>
                    <p className="text-end text-muted" dir="rtl">
                      {president.positionAr || 'رئيس الرابطة الولائية للجودو'}
                    </p>
                    <p className="text-end" dir="rtl">
                      {president.bioAr || 'كلمة رئيس الرابطة...'}
                    </p>
                    <Button variant="outline-success" className="float-end rounded-pill px-4" dir="rtl">
                      اقرأ المزيد
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </section>
        )}

        {/* Clubs Carousel Section */}
        <section className="mb-5 animate__animated animate__fadeInUp animate__delay-1s">
          <h2 className="text-center mb-4 text-primary fw-bold" dir="rtl">أندية الرابطة</h2>
          {clubsCarouselItems.length > 0 ? (
            <CustomCarousel
              items={clubsCarouselItems}
              title="أندية الرابطة"
              titleAr="أندية الرابطة"
              controls={false}
              indicators={true}
              interval={5000}
            />
          ) : (
            <Alert variant="info" className="text-center">لا توجد أندية مسجلة في هذه الرابطة حاليًا.</Alert>
          )}
        </section>

        {/* President Profile (final) under Clubs section */}
        <section className="mb-5 animate__animated animate__fadeInUp animate__delay-2s">
          <Card className="shadow-lg border-success rounded-3 overflow-hidden">
            <Card.Header className="bg-gradient-success text-white py-3">
              <h3 className="mb-0 text-center fw-bold" dir="rtl">رئيس الرابطة الولائية للجودو</h3>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="align-items-center">
                {/* Left: Large circular image */}
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <ImageWithFallback
                    inputSrc={displayImage}
                    fallbackSrc={'/images/default-president.jpg'}
                    alt={displayNameAr}
                    className="img-fluid rounded-circle shadow-lg border border-4 border-success"
                    boxWidth={250}
                    boxHeight={250}
                    fixedBox
                    style={{ width: '250px', height: '250px', objectFit: 'cover' }}
                  />
                </Col>
                {/* Right: Details, achievements, experience */}
                <Col md={8}>
                  <div className="text-end" dir="rtl">
                    <h3 className="mb-1 text-success fw-bold">{displayNameAr}</h3>
                    <p className="text-muted mb-3">{displayPositionAr}</p>

                    {(displayBioAr || '').trim().length > 0 && (
                      <>
                        <h5 className="mt-3 fw-bold">نبذة مختصرة</h5>
                        <p className="mb-3">{displayBioAr}</p>
                      </>
                    )}
                    <div className="mt-3">
                      <h5 className="mb-2 fw-bold">الخبرات</h5>
                      {presidentExperiences.length > 0 ? (
                        <ul className="list-unstyled">
                          {presidentExperiences.map((exp, idx) => (
                            <li className="mb-2" key={`exp-${idx}`}>
                              <i className="fas fa-check-circle text-success ms-2"></i>
                              {bulletToText(exp)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="list-unstyled">
                          <li className="mb-2">
                            <i className="fas fa-check-circle text-success ms-2"></i>
                            {`قيادة رابطة ${league.wilayaNameAr} للجودو`}
                          </li>
                          <li className="mb-2">
                            <i className="fas fa-users text-success ms-2"></i>
                            {`الإشراف على ${clubs.length} ناديًا ضمن الرابطة`}
                          </li>
                        </ul>
                      )}
                    </div>

                    <div className="mt-3">
                      <h5 className="mb-2 fw-bold">الإنجازات</h5>
                      {presidentAchievements.length > 0 ? (
                        <ul className="list-unstyled">
                          {presidentAchievements.map((ach, idx) => (
                            <li className="mb-2" key={`ach-${idx}`}>
                              <i className="fas fa-trophy text-success ms-2"></i>
                              {bulletToText(ach)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="list-unstyled">
                          <li className="mb-2">
                            <i className="fas fa-trophy text-success ms-2"></i>
                            {`المساهمة في ${leagueContent.achievements?.length || 0} من إنجازات الرابطة`}
                          </li>
                          <li className="mb-2">
                            <i className="fas fa-calendar text-success ms-2"></i>
                            {`تنسيق ${leagueContent.upcomingEvents?.length || 0} فعالية/أحداث قادمة`}
                          </li>
                        </ul>
                      )}
                    </div>

                    {(displayEmail || displayPhone) && (
                      <ul className="list-unstyled mt-3">
                        {displayEmail && (
                          <li className="mb-2">
                            <i className="fas fa-envelope text-success ms-2"></i>
                            البريد: {displayEmail}
                          </li>
                        )}
                        {displayPhone && (
                          <li className="mb-2">
                            <i className="fas fa-phone text-success ms-2"></i>
                            الهاتف: {displayPhone}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </section>

        {/* Management Team Section (dynamic) */}
        {leagueContent.managementTeam && leagueContent.managementTeam.length > 0 && (
          <section className="mb-5 animate__animated animate__fadeInUp">
            <Card className="shadow-lg border-warning rounded-3 overflow-hidden">
              <Card.Header className="bg-gradient-warning text-dark py-3">
                <h3 className="mb-0 text-center fw-bold" dir="rtl">إدارة الرابطة</h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  {leagueContent.managementTeam.map((m, i) => (
                    <Col md={4} className="mb-4" key={m.id || i}>
                      <Card className="h-100 border-0 shadow-sm rounded-3 overflow-hidden team-card">
                        <div className="team-card-img">
                          <ImageWithFallback
                            inputSrc={m.image}
                            fallbackSrc={'/images/default-avatar.jpg'}
                            alt={m.nameAr || 'عضو إدارة'}
                            className="img-fluid"
                            boxWidth={'100%'}
                            boxHeight={200}
                            fixedBox
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                          />
                        </div>
                        <Card.Body className="text-center">
                          {m.positionAr && <h6 className="text-warning fw-bold">{m.positionAr}</h6>}
                          <p className="text-muted small">{m.nameAr || ''}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </section>
        )}

        {/* Standout Athletes Section (dynamic) */}
        {leagueContent.standoutAthletes && leagueContent.standoutAthletes.length > 0 && (
          <section className="mb-5 animate__animated animate__fadeInUp animate__delay-1s">
            <Card className="shadow-lg border-info rounded-3 overflow-hidden">
              <Card.Header className="bg-gradient-info text-white py-3">
                <h3 className="mb-0 text-center fw-bold" dir="rtl">الرياضيون البارزون</h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  {leagueContent.standoutAthletes.map((a, i) => (
                    <Col md={3} className="mb-4" key={a.id || i}>
                      <Card className="h-100 border-0 shadow-sm rounded-3 overflow-hidden athlete-card">
                        <div className="athlete-card-img">
                          <div style={{ width: '100%', height: 150, overflow: 'hidden' }}>
                            <ImageWithFallback
                              inputSrc={a.image}
                              fallbackSrc={'/images/default-athlete.jpg'}
                              alt={a.nameAr || 'رياضي'}
                              className="img-fluid"
                              boxWidth={'100%'}
                              boxHeight={150}
                              fixedBox
                              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                            />
                          </div>
                        </div>
                        <Card.Body className="text-center">
                          {a.nameAr && <h6 className="text-info fw-bold">{a.nameAr}</h6>}
                          {a.beltAr && <p className="text-muted small">{a.beltAr}</p>}
                          {a.highlight && <span className="badge bg-info">{a.highlight}</span>}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </section>
        )}

        {/* Achievements and Upcoming Events Section (dynamic) */}
        {(leagueContent.achievements?.length || leagueContent.upcomingEvents?.length) ? (
          <section className="mb-5 animate__animated animate__fadeInUp animate__delay-2s">
            <Row>
              <Col md={6} className="mb-4 mb-md-0">
                <Card className="shadow-lg border-danger h-100 rounded-3 overflow-hidden">
                  <Card.Header className="bg-gradient-danger text-white py-3">
                    <h4 className="mb-0 text-center fw-bold" dir="rtl">إنجازات الرابطة</h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {(leagueContent.achievements || []).map((a, i) => (
                      <div className="achievement-item mb-3 p-3 rounded-3 shadow-sm" key={a.id || i}>
                        <div className="d-flex align-items-center">
                          <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="me-3">
                            {a.image ? (
                              <ImageWithFallback
                                inputSrc={a.image}
                                fallbackSrc={'/images/default-achievement.jpg'}
                                alt="ach"
                                boxWidth={60}
                                boxHeight={60}
                                fixedBox
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <i className="fas fa-trophy text-danger" style={{ fontSize: 28 }}></i>
                            )}
                          </div>
                          <div className="text-end ms-3" dir="rtl">
                            {a.titleAr && <h6 className="mb-1 fw-bold">{a.titleAr}</h6>}
                            {a.subtitleAr && <p className="text-muted small mb-0">{a.subtitleAr}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(leagueContent.achievements || []).length === 0 && (
                      <div className="text-center text-muted">لا توجد إنجازات</div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="shadow-lg border-dark h-100 rounded-3 overflow-hidden">
                  <Card.Header className="bg-gradient-dark text-white py-3">
                    <h4 className="mb-0 text-center fw-bold" dir="rtl">الأحداث القادمة</h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {(leagueContent.upcomingEvents || []).map((ev, i) => (
                      <div className="event-item mb-3 p-3 rounded-3 shadow-sm" key={ev.id || i}>
                        <div className="d-flex align-items-center">
                          <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="me-3">
                            {ev.image ? (
                              <ImageWithFallback
                                inputSrc={ev.image}
                                fallbackSrc={'/images/default-league.jpg'}
                                alt="event"
                                boxWidth={60}
                                boxHeight={60}
                                fixedBox
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <i className="fas fa-calendar text-dark" style={{ fontSize: 28 }}></i>
                            )}
                          </div>
                          <div className="text-end ms-3" dir="rtl">
                            {ev.titleAr && <h6 className="mb-1 fw-bold">{ev.titleAr}</h6>}
                            {ev.date && <p className="text-muted small mb-0">{new Date(ev.date as any).toLocaleDateString('ar-DZ')}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(leagueContent.upcomingEvents || []).length === 0 && (
                      <div className="text-center text-muted">لا توجد أحداث</div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </section>
        ) : null}
      </Container>
    </div>
  );
};

export default LeaguePage;