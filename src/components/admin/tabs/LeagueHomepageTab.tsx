import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import { leagues as mockLeagues } from '../../../data/mockData';
import { LeagueHomepageService, type LeagueHomepageContent, type LeagueAthleteCard, type LeagueAchievementItem, type LeagueEventItem, type LeagueManagementMember, type LeagueClubCard } from '../../../services/leagueHomepageService';
import { uploadToCloudinary } from '../../../services/cloudinaryService';
import { ClubsService, LeaguesService } from '../../../services/firestoreService';

const LeagueHomepageTab: React.FC = () => {
  const [leagueId, setLeagueId] = useState<string>('');
  const [content, setContent] = useState<LeagueHomepageContent>({ standoutAthletes: [], achievements: [], upcomingEvents: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const [availableClubs, setAvailableClubs] = useState<{ id: string; nameAr: string }[]>([]);

  // Hidden inputs for gallery picker
  const athleteFileRef = useRef<HTMLInputElement | null>(null);
  const achievementFileRef = useRef<HTMLInputElement | null>(null);
  const eventFileRef = useRef<HTMLInputElement | null>(null);
  const mgmtFileRef = useRef<HTMLInputElement | null>(null);
  const clubFileRef = useRef<HTMLInputElement | null>(null);
  const headerLogoFileRef = useRef<HTMLInputElement | null>(null);

  const [leagues, setLeagues] = useState<{ id: string; nameAr: string; wilayaNameAr?: string }[]>([]);

  // Load leagues from Firestore (fallback to mock)
  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const all = await LeaguesService.getAllLeagues();
        setLeagues(all.map((l: any) => ({ id: String(l.id), nameAr: l.nameAr || l.name || `رابطة ${l.wilayaNameAr || ''}`, wilayaNameAr: l.wilayaNameAr })));
      } catch (e) {
        console.warn('LeagueHomepageTab: failed to load leagues from Firestore, using mock', e);
        setLeagues(mockLeagues.map((l: any) => ({ id: String(l.id), nameAr: l.nameAr, wilayaNameAr: l.wilayaNameAr })));
      }
    };
    loadLeagues();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!leagueId) return;
      // Reset any upload state when changing league to avoid stuck disabled save
      setUploadingSection(null);
      setLoading(true);
      try {
        const data = await LeagueHomepageService.getContent(leagueId);
        setContent(data);
        // load clubs for this league (names for dropdown)
        try {
          const clubs = await ClubsService.getClubsByLeague(leagueId);
          setAvailableClubs(clubs.map(c => ({ id: c.id, nameAr: c.nameAr })));
        } catch {
          setAvailableClubs([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [leagueId]);

  const anyUploading = !!uploadingSection;

  const saveAll = async () => {
    if (!leagueId) return;
    if (anyUploading) {
      setAlert({ type: 'info', message: 'الرجاء انتظار اكتمال رفع الصور قبل الحفظ.' });
      return;
    }
    setSaving(true);
    try {
      await LeagueHomepageService.saveContent(leagueId.trim(), content);
      setAlert({ type: 'success', message: 'تم حفظ جميع الأقسام بنجاح.' });
      setTimeout(() => setAlert(null), 3000);
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('leagueHomepageUpdated', { detail: { leagueId } }));
        }
      } catch {
        // ignore event dispatch errors
      }
    } catch (e) {
      console.error('LeagueHomepageTab: failed to save content', e);
      setAlert({ type: 'danger', message: 'فشل حفظ البيانات. تحقق من الاتصال ثم حاول مرة أخرى.' });
    } finally {
      setSaving(false);
    }
  };

  const addAthlete = () => {
    const item: LeagueAthleteCard = {
      id: `ath_${Date.now()}`,
      name: '',
      nameAr: '',
      belt: '',
      beltAr: '',
      highlight: '',
      image: '',
      createdAt: new Date(),
    };
    setContent((prev) => ({ ...prev, standoutAthletes: [...prev.standoutAthletes, item] }));
  };

  const addAchievement = () => {
    const item: LeagueAchievementItem = {
      id: `ach_${Date.now()}`,
      title: '',
      titleAr: '',
      subtitle: '',
      subtitleAr: '',
      date: new Date(),
      image: '',
      createdAt: new Date(),
    };
    setContent((prev) => ({ ...prev, achievements: [item, ...prev.achievements] }));
  };

  const addEvent = () => {
    const item: LeagueEventItem = {
      id: `evt_${Date.now()}`,
      title: '',
      titleAr: '',
      date: new Date(),
      image: '',
      createdAt: new Date(),
    };
    setContent((prev) => ({ ...prev, upcomingEvents: [item, ...prev.upcomingEvents] }));
  };

  const addManagementMember = () => {
    const m: LeagueManagementMember = {
      id: `mgmt_${Date.now()}`,
      nameAr: '',
      positionAr: '',
      image: '',
      createdAt: new Date(),
    };
    setContent(prev => ({ ...prev, managementTeam: [...(prev.managementTeam || []), m] }));
  };

  const addLeagueClub = () => {
    const c: LeagueClubCard = {
      id: `club_${Date.now()}`,
      clubId: availableClubs[0]?.id || '',
      image: '',
      createdAt: new Date(),
    };
    setContent(prev => ({ ...prev, leagueClubs: [...(prev.leagueClubs || []), c] }));
  };

  const toDateInputValue = (value?: Date) => {
    if (!value) return new Date().toISOString().substring(0, 10);
    const d = value instanceof Date ? value : new Date(value as any);
    return isNaN(d.getTime()) ? new Date().toISOString().substring(0, 10) : d.toISOString().substring(0, 10);
  };

  // Upload helpers
  const uploadImage = async (file: File, folder: string) => {
    const res = await uploadToCloudinary(file, { folder });
    return res.secure_url;
  };

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type}`} role="alert">{alert.message}</div>
      )}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>اختر الرابطة</Form.Label>
            <Form.Select value={leagueId} onChange={(e) => setLeagueId(e.target.value)}>
              <option value="">-- اختر الرابطة --</option>
              {leagues.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nameAr} ({l.wilayaNameAr})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-end">
          <Button variant="primary" className="ms-auto" onClick={saveAll} disabled={!leagueId || saving || anyUploading}>
            <i className="fas fa-save me-2"></i>
            {saving ? '...جاري الحفظ' : 'حفظ كل الأقسام'}
          </Button>
        </Col>
      </Row>

      {/* Global Images Toggle */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">إعدادات عامة للصور</h5>
        </Card.Header>
        <Card.Body>
          <Form.Check
            type="switch"
            id="toggle-hide-images"
            label="إخفاء الصور في صفحة الرابطة (تظهر أيقونات بديلة)"
            checked={!!content.hideImages}
            onChange={(e) => setContent(prev => ({ ...prev, hideImages: e.currentTarget.checked }))}
            disabled={!leagueId}
          />
          <div className="text-muted small mt-2" dir="rtl">
            في حال عدم توفر صور حالياً، يمكنك إخفاء الصور من الواجهة العامة لتجنّب طلبات صور غير متوفرة.
          </div>
        </Card.Body>
      </Card>

      {/* League Header Logo */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">شعار الرابطة (أعلى الصفحة)</h5>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={!leagueId}
              onClick={() => (headerLogoFileRef.current as HTMLInputElement)?.click()}
            >
              <i className="fas fa-upload me-2"></i>
              رفع شعار
            </Button>
            {content.headerLogo && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setContent(prev => ({ ...prev, headerLogo: undefined }))}
              >
                إزالة الشعار
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4} className="text-center mb-3 mb-md-0">
              {content.headerLogo ? (
                <img src={content.headerLogo} alt="شعار الرابطة" style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: '50%', boxShadow: '0 0 12px rgba(0,0,0,0.15)' }} />
              ) : (
                <div className="text-muted">لم يتم تعيين شعار بعد</div>
              )}
            </Col>
            <Col md={8}>
              <div className="text-muted small" dir="rtl">
                يظهر هذا الشعار في رأس صفحة الرابطة بجانب اسم الرابطة الكبير.
              </div>
            </Col>
          </Row>
          <input
            ref={headerLogoFileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (!file) return;
              setUploadingSection('headerLogo');
              try {
                const url = await uploadImage(file, `league/${leagueId}/header`);
                setContent(prev => ({ ...prev, headerLogo: url }));
              } finally {
                setUploadingSection(null);
                if (headerLogoFileRef.current) headerLogoFileRef.current.value = '';
              }
            }}
          />
        </Card.Body>
      </Card>

      {/* Standout Athletes */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">الرياضيون البارزون <Badge bg="info">{content.standoutAthletes.length}</Badge></h5>
          <Button variant="info" size="sm" onClick={addAthlete} disabled={!leagueId}>
            <i className="fas fa-user-plus me-2"></i> إضافة رياضي
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>صورة</th>
                <th>الاسم (عربي)</th>
                <th>الحزام</th>
                <th>وسم/تمييز</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {content.standoutAthletes.map((a, idx) => (
                <tr key={a.id}>
                  <td style={{ width: 140 }}>
                    <div className="d-flex align-items-center gap-2">
                      {a.image ? (
                        <img src={a.image} alt="athlete" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div className="text-muted small">لا توجد صورة</div>
                      )}
                      <div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setUploadingSection(`ath_${idx}`);
                            (athleteFileRef.current as HTMLInputElement)?.click();
                          }}
                        >
                          اختر صورة
                        </Button>
                        {uploadingSection === `ath_${idx}` && <div className="small text-muted">...جاري الرفع</div>}
                        <input
                          ref={athleteFileRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) {
                              setUploadingSection(null);
                              return;
                            }
                            try {
                              const url = await uploadImage(file, `league/${leagueId}/standoutAthletes`);
                              setContent((prev) => {
                                const next = [...prev.standoutAthletes];
                                next[idx] = { ...next[idx], image: url };
                                return { ...prev, standoutAthletes: next };
                              });
                            } finally {
                              setUploadingSection(null);
                              if (athleteFileRef.current) athleteFileRef.current.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <Form.Control
                      placeholder="الاسم بالعربية"
                      value={a.nameAr || ''}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.standoutAthletes];
                          next[idx] = { ...next[idx], nameAr: e.target.value };
                          return { ...prev, standoutAthletes: next };
                        })
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      placeholder="الحزام (عربي)"
                      value={a.beltAr || ''}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.standoutAthletes];
                          next[idx] = { ...next[idx], beltAr: e.target.value };
                          return { ...prev, standoutAthletes: next };
                        })
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      placeholder="وسم/تمييز"
                      value={a.highlight || ''}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.standoutAthletes];
                          next[idx] = { ...next[idx], highlight: e.target.value };
                          return { ...prev, standoutAthletes: next };
                        })
                      }
                    />
                  </td>
                  <td style={{ width: 120 }}>
                    <Button variant="outline-danger" size="sm" onClick={() => {
                      setContent((prev) => ({ ...prev, standoutAthletes: prev.standoutAthletes.filter((x) => x.id !== a.id) }));
                    }}>
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
              {content.standoutAthletes.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">لا يوجد عناصر</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Management Team */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">إدارة الرابطة <Badge bg="warning">{(content.managementTeam || []).length}</Badge></h5>
          <Button variant="warning" size="sm" onClick={addManagementMember} disabled={!leagueId}>
            <i className="fas fa-user-tie me-2"></i> إضافة عضو إدارة
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>صورة</th>
                <th>الاسم (عربي)</th>
                <th>المنصب (عربي)</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {(content.managementTeam || []).map((m, idx) => (
                <tr key={m.id}>
                  <td style={{ width: 140 }}>
                    <div className="d-flex align-items-center gap-2">
                      {m.image ? (
                        <img src={m.image} alt="member" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div className="text-muted small">لا توجد صورة</div>
                      )}
                      <div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setUploadingSection(`mgmt_${idx}`);
                            (mgmtFileRef.current as HTMLInputElement)?.click();
                          }}
                        >
                          اختر صورة
                        </Button>
                        {uploadingSection === `mgmt_${idx}` && <div className="small text-muted">...جاري الرفع</div>}
                        <input
                          ref={mgmtFileRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) {
                              setUploadingSection(null);
                              return;
                            }
                            try {
                              const url = await uploadImage(file, `league/${leagueId}/management`);
                              setContent((prev) => {
                                const next = [...(prev.managementTeam || [])];
                                next[idx] = { ...next[idx], image: url };
                                return { ...prev, managementTeam: next };
                              });
                            } finally {
                              setUploadingSection(null);
                              if (mgmtFileRef.current) mgmtFileRef.current.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <Form.Control
                      placeholder="الاسم بالعربية"
                      value={m.nameAr || ''}
                      onChange={(e) => setContent(prev => {
                        const next = [...(prev.managementTeam || [])];
                        next[idx] = { ...next[idx], nameAr: e.target.value };
                        return { ...prev, managementTeam: next };
                      })}
                    />
                  </td>
                  <td>
                    <Form.Control
                      placeholder="المنصب بالعربية"
                      value={m.positionAr || ''}
                      onChange={(e) => setContent(prev => {
                        const next = [...(prev.managementTeam || [])];
                        next[idx] = { ...next[idx], positionAr: e.target.value };
                        return { ...prev, managementTeam: next };
                      })}
                    />
                  </td>
                  <td style={{ width: 120 }}>
                    <Button variant="outline-danger" size="sm" onClick={() => setContent(prev => ({ ...prev, managementTeam: (prev.managementTeam || []).filter(x => x.id !== m.id) }))}>حذف</Button>
                  </td>
                </tr>
              ))}
              {(content.managementTeam || []).length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">لا يوجد عناصر</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* League Clubs */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">أندية الرابطة <Badge bg="primary">{(content.leagueClubs || []).length}</Badge></h5>
          <Button variant="primary" size="sm" onClick={addLeagueClub} disabled={!leagueId || availableClubs.length === 0}>
            <i className="fas fa-plus me-2"></i> إضافة نادي
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>صورة</th>
                <th>النادي</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {(content.leagueClubs || []).map((c, idx) => (
                <tr key={c.id}>
                  <td style={{ width: 140 }}>
                    <div className="d-flex align-items-center gap-2">
                      {c.image ? (
                        <img src={c.image} alt="club" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div className="text-muted small">لا توجد صورة</div>
                      )}
                      <div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setUploadingSection(`club_${idx}`);
                            (clubFileRef.current as HTMLInputElement)?.click();
                          }}
                        >
                          اختر صورة
                        </Button>
                        {uploadingSection === `club_${idx}` && <div className="small text-muted">...جاري الرفع</div>}
                        <input
                          ref={clubFileRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) {
                              setUploadingSection(null);
                              return;
                            }
                            try {
                              const url = await uploadImage(file, `league/${leagueId}/clubs`);
                              setContent((prev) => {
                                const next = [...(prev.leagueClubs || [])];
                                next[idx] = { ...next[idx], image: url };
                                return { ...prev, leagueClubs: next };
                              });
                            } finally {
                              setUploadingSection(null);
                              if (clubFileRef.current) clubFileRef.current.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <Form.Select
                      value={c.clubId}
                      onChange={(e) => setContent(prev => {
                        const next = [...(prev.leagueClubs || [])];
                        next[idx] = { ...next[idx], clubId: e.target.value };
                        return { ...prev, leagueClubs: next };
                      })}
                    >
                      {availableClubs.length === 0 && <option value="">لا توجد أندية</option>}
                      {availableClubs.map(cl => (
                        <option key={cl.id} value={cl.id}>{cl.nameAr}</option>
                      ))}
                    </Form.Select>
                  </td>
                  <td style={{ width: 120 }}>
                    <Button variant="outline-danger" size="sm" onClick={() => setContent(prev => ({ ...prev, leagueClubs: (prev.leagueClubs || []).filter(x => x.id !== c.id) }))}>حذف</Button>
                  </td>
                </tr>
              ))}
              {(content.leagueClubs || []).length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-4">لا يوجد عناصر</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Achievements */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">إنجازات الرابطة <Badge bg="danger">{content.achievements.length}</Badge></h5>
          <Button variant="danger" size="sm" onClick={addAchievement} disabled={!leagueId}>
            <i className="fas fa-trophy me-2"></i> إضافة إنجاز
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>صورة</th>
                <th>العنوان (عربي)</th>
                <th>الوصف المختصر</th>
                <th>التاريخ</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {content.achievements.map((a, idx) => (
                <tr key={a.id}>
                  <td style={{ width: 140 }}>
                    <div className="d-flex align-items-center gap-2">
                      {a.image ? (
                        <img src={a.image} alt="achievement" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div className="text-muted small">لا توجد صورة</div>
                      )}
                      <div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setUploadingSection(`ach_${idx}`);
                            (achievementFileRef.current as HTMLInputElement)?.click();
                          }}
                        >
                          اختر صورة
                        </Button>
                        {uploadingSection === `ach_${idx}` && <div className="small text-muted">...جاري الرفع</div>}
                        <input
                          ref={achievementFileRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) {
                              setUploadingSection(null);
                              return;
                            }
                            try {
                              const url = await uploadImage(file, `league/${leagueId}/achievements`);
                              setContent((prev) => {
                                const next = [...prev.achievements];
                                next[idx] = { ...next[idx], image: url };
                                return { ...prev, achievements: next };
                              });
                            } finally {
                              setUploadingSection(null);
                              if (achievementFileRef.current) achievementFileRef.current.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <Form.Control
                      placeholder="العنوان بالعربية"
                      value={a.titleAr || ''}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.achievements];
                          next[idx] = { ...next[idx], titleAr: e.target.value };
                          return { ...prev, achievements: next };
                        })
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      placeholder="الوصف المختصر"
                      value={a.subtitleAr || ''}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.achievements];
                          next[idx] = { ...next[idx], subtitleAr: e.target.value };
                          return { ...prev, achievements: next };
                        })
                      }
                    />
                  </td>
                  <td style={{ width: 180 }}>
                    <Form.Control
                      type="date"
                      value={toDateInputValue(a.date)}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.achievements];
                          next[idx] = { ...next[idx], date: new Date(e.target.value) };
                          return { ...prev, achievements: next };
                        })
                      }
                    />
                  </td>
                  <td style={{ width: 120 }}>
                    <Button variant="outline-danger" size="sm" onClick={() => {
                      setContent((prev) => ({ ...prev, achievements: prev.achievements.filter((x) => x.id !== a.id) }));
                    }}>
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
              {content.achievements.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">لا يوجد عناصر</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Upcoming Events */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">الأحداث القادمة <Badge bg="dark">{content.upcomingEvents.length}</Badge></h5>
          <Button variant="dark" size="sm" onClick={addEvent} disabled={!leagueId}>
            <i className="fas fa-calendar-plus me-2"></i> إضافة حدث
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>صورة</th>
                <th>العنوان (عربي)</th>
                <th>التاريخ</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {content.upcomingEvents.map((ev, idx) => (
                <tr key={ev.id}>
                  <td style={{ width: 140 }}>
                    <div className="d-flex align-items-center gap-2">
                      {ev.image ? (
                        <img src={ev.image} alt="event" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div className="text-muted small">لا توجد صورة</div>
                      )}
                      <div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setUploadingSection(`evt_${idx}`);
                            (eventFileRef.current as HTMLInputElement)?.click();
                          }}
                        >
                          اختر صورة
                        </Button>
                        {uploadingSection === `evt_${idx}` && <div className="small text-muted">...جاري الرفع</div>}
                        <input
                          ref={eventFileRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) {
                              setUploadingSection(null);
                              return;
                            }
                            try {
                              const url = await uploadImage(file, `league/${leagueId}/events`);
                              setContent((prev) => {
                                const next = [...prev.upcomingEvents];
                                next[idx] = { ...next[idx], image: url };
                                return { ...prev, upcomingEvents: next };
                              });
                            } finally {
                              setUploadingSection(null);
                              if (eventFileRef.current) eventFileRef.current.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <Form.Control
                      placeholder="العنوان بالعربية"
                      value={ev.titleAr || ''}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.upcomingEvents];
                          next[idx] = { ...next[idx], titleAr: e.target.value };
                          return { ...prev, upcomingEvents: next };
                        })
                      }
                    />
                  </td>
                  <td style={{ width: 180 }}>
                    <Form.Control
                      type="date"
                      value={toDateInputValue(ev.date)}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.upcomingEvents];
                          next[idx] = { ...next[idx], date: new Date(e.target.value) };
                          return { ...prev, upcomingEvents: next };
                        })
                      }
                    />
                  </td>
                  <td style={{ width: 120 }}>
                    <Button variant="outline-danger" size="sm" onClick={() => {
                      setContent((prev) => ({ ...prev, upcomingEvents: prev.upcomingEvents.filter((x) => x.id !== ev.id) }));
                    }}>
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
              {content.upcomingEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">لا يوجد عناصر</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LeagueHomepageTab;
