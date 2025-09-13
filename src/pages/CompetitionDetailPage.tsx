import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CompetitionsService, ParticipationsService, UsersService, ClubsService, PairingsService, LeaguesService, CompetitionOrganizersService } from '../services/firestoreService';
import type { Competition, User, Club, League, Participation, Pairings } from '../types';
import { getCategoryByDOBToday } from '../utils/categoryUtils';
import ImageWithFallback from '../components/shared/ImageWithFallback';
import TableOfficialPanel from '../components/competition/TableOfficialPanel';
import SupervisorPanel from '../components/competition/SupervisorPanel';
import './CompetitionDetailPage.css';

const CompetitionDetailPage: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [participants, setParticipants] = useState<Array<{ athlete: User; club?: Club }>>([]);
  const [loadingParticipants, setLoadingParticipants] = useState<boolean>(false);
  const [pairings, setPairings] = useState<Pairings | null>(null);
  const [leaguesMap, setLeaguesMap] = useState<Record<string, League>>({});
  // Organizer (left tab) state
  const [showOrganizers, setShowOrganizers] = useState<boolean>(false);
  const [orgLoggedIn, setOrgLoggedIn] = useState<boolean>(false);
  const [orgRole, setOrgRole] = useState<'table_official' | 'supervisor' | ''>('');
  const [orgUsername, setOrgUsername] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [orgMat, setOrgMat] = useState<1 | 2 | 3>(1);
  const [orgError, setOrgError] = useState<string>('');
  const [orgDisplayName, setOrgDisplayName] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        if (!competitionId) return;
        setLoading(true);
        const comp = await CompetitionsService.getCompetitionById(competitionId);
        setCompetition(comp);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [competitionId]);

  useEffect(() => {
    const loadParticipants = async () => {
      if (!competition) return;
      try {
        setLoadingParticipants(true);
        const [parts, users, clubs, prs, leagues] = await Promise.all([
          ParticipationsService.getParticipationsByCompetition(competition.id),
          UsersService.getAllUsers(),
          ClubsService.getAllClubs(),
          PairingsService.getPairingsByCompetition(competition.id),
          LeaguesService.getAllLeagues()
        ]);
        const clubsMap = new Map<string, Club>();
        clubs.forEach((c: Club) => clubsMap.set(c.id, c));
        const usersMap = new Map<string, User>();
        users.forEach((u: User) => usersMap.set(u.id, u));
        const rows: Array<{ athlete: User; club?: Club }> = [];
        parts.forEach((p: Participation) => {
          const a = usersMap.get(p.athleteId);
          if (!a) return;
          rows.push({ athlete: a, club: a.clubId ? clubsMap.get(a.clubId) : undefined });
        });
        setParticipants(rows);
        setPairings(prs);
        const lmap: Record<string, League> = {};
        leagues.forEach((l: League) => { lmap[l.id] = l; });
        setLeaguesMap(lmap);
      } catch (e) {
        console.error('Failed to load participants:', e);
      } finally {
        setLoadingParticipants(false);
      }
    };
    loadParticipants();
  }, [competition]);

  const refreshPairingsOnly = async () => {
    if (!competition) return;
    try {
      const prs = await PairingsService.getPairingsByCompetition(competition.id);
      setPairings(prs);
    } catch (e) {
      console.error('Failed to refresh pairings:', e);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (!competition) return <div>البطولة غير موجودة</div>;

  return (
    <div className="competition-detail-page">
      <div className="competition-header">
        {competition.image && (
          <img src={competition.image} alt={competition.nameAr} className="competition-logo" />
        )}
        <h1>{competition.nameAr}</h1>
        <p className="competition-dates">
          {new Date(competition.startDate).toLocaleDateString('ar-DZ')} - {new Date(competition.endDate).toLocaleDateString('ar-DZ')}
        </p>
        <p className="competition-location">{competition.placeAr || competition.place || ''}</p>
      </div>

      {/* تبويب رئيسي: تفاصيل / منظمو البطولة */}
      <div className="d-flex justify-content-between align-items-center mb-3" dir="rtl">
        <div className="btn-group" role="group">
          <button className={`btn ${!showOrganizers ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setShowOrganizers(false)}>تفاصيل البطولة</button>
          <button className={`btn ${showOrganizers ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setShowOrganizers(true)}>منظمو البطولة</button>
        </div>
      </div>

      {!showOrganizers ? (
        (() => {
          const safeStatus = (competition.status || 'upcoming').toLowerCase();
          return (
            <>
              {/* تنبيه حالة البطولة يظهر دائماً */}
              {safeStatus !== 'upcoming' && (
                <div className={`alert ${safeStatus==='ongoing' ? 'alert-info' : 'alert-secondary'} mt-3`} dir="rtl">
                  {safeStatus==='ongoing'
                    ? 'هذه البطولة جارية حالياً. تم إغلاق التسجيل، لكن يمكنك استعراض الجداول والنتائج أدناه.'
                    : 'هذه البطولة منتهية. يمكنك استعراض الجداول والنتائج النهائية أدناه.'}
                </div>
              )}

              <div className="competition-tabs">
                <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'active' : ''}>
                  نظرة عامة
                </button>
                <button onClick={() => setActiveTab('categories')} className={activeTab === 'categories' ? 'active' : ''}>
                  الفئات
                </button>
                <button onClick={() => setActiveTab('brackets')} className={activeTab === 'brackets' ? 'active' : ''}>
                  الجداول
                </button>
                <button onClick={() => setActiveTab('weights')} className={activeTab === 'weights' ? 'active' : ''}>
                  الأوزان
                </button>
          </div>

          <div className="competition-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <h2>عن البطولة</h2>
                <p>{competition.descriptionAr || competition.description || 'لا يوجد وصف متوفر لهذه البطولة.'}</p>
                <div className="registration-info">
                  <h3>تسجيل الرياضيين</h3>
                  <p>آخر موعد للتسجيل: {competition.registrationDeadline ? new Date(competition.registrationDeadline).toLocaleDateString('ar-DZ') : '-'}</p>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="categories-tab">
                <h2>الفئات المتاحة</h2>
                <div className="categories-list">
                  {Array.isArray(competition.categories) && competition.categories.length > 0 ? (
                    competition.categories.map((cat) => {
                      const w = (competition.weights || {})[cat] || { male: [], female: [] };
                      const hasAny = (w.male?.length || 0) + (w.female?.length || 0) > 0;
                      return (
                        <div key={cat} className="category-card">
                          <h3>{cat}</h3>
                          {hasAny ? (
                            <div className="mt-2">
                              <div><strong>أوزان الذكور:</strong> {w.male?.length ? w.male.join(', ') : '—'}</div>
                              <div><strong>أوزان الإناث:</strong> {w.female?.length ? w.female.join(', ') : '—'}</div>
                            </div>
                          ) : (
                            <p className="text-muted">لا توجد أوزان محددة لهذه الفئة</p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p>لا توجد فئات متاحة لهذه البطولة.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'brackets' && (
              <div className="brackets-tab">
                <h2>جداول المنافسة</h2>
                <div className="bracket-container" dir="rtl">
                  {loadingParticipants ? (
                    <div>جاري تحميل المشاركين...</div>
                  ) : pairings && pairings.matches.length > 0 ? (
                    <div>
                      <h4 className="mb-3">القرعة الحالية</h4>
                      {/* لوحة الميداليات (تظهر إن توفرت نتائج) */}
                      {(() => {
                        const finalRound = Math.max(...pairings.matches.map(m => m.round || 1));
                        const finalIdx = pairings.matches.findIndex(m => (m.round || 1) === finalRound && (m.stage || 'main') === 'main');
                        const bronzeIdx = pairings.matches.findIndex(m => (m.stage || 'main') === 'bronze');
                        const getAth = (id?: string | null) => id ? participants.find(r=>r.athlete.id===id)?.athlete : undefined;
                        const getName = (a?: User) => a ? `${a.firstNameAr || a.firstName || ''} ${a.lastNameAr || a.lastName || ''}` : '';
                        const panel: React.ReactNode[] = [];
                        if (finalIdx >= 0) {
                          const fm = pairings.matches[finalIdx];
                          const a1 = getAth(fm.athlete1Id);
                          const a2 = getAth(fm.athlete2Id);
                          if ((fm.status ?? 'pending') === 'finished' && fm.winnerId) {
                            const winner = getAth(fm.winnerId);
                            const loser = fm.winnerId === a1?.id ? a2 : a1;
                            panel.push(
                              <div key="gold-silver" className="alert alert-warning d-flex flex-wrap gap-3 align-items-center" dir="rtl">
                                <div className="fw-bold">نتيجة النهائي:</div>
                                <span className="badge bg-warning text-dark">ذهبية: {getName(winner)}</span>
                                {loser && <span className="badge bg-secondary">فضية: {getName(loser)}</span>}
                              </div>
                            );
                          } else if (a1 || a2) {
                            panel.push(
                              <div key="gold-upcoming" className="alert alert-light border" dir="rtl">
                                مباراة الذهبية: {getName(a1)} ضد {getName(a2)}
                              </div>
                            );
                          }
                        }
                        if (bronzeIdx >= 0) {
                          const bm = pairings.matches[bronzeIdx];
                          const a1 = getAth(bm.athlete1Id);
                          const a2 = getAth(bm.athlete2Id);
                          if ((bm.status ?? 'pending') === 'finished' && bm.winnerId) {
                            const winner = getAth(bm.winnerId);
                            const loser = bm.winnerId === a1?.id ? a2 : a1;
                            panel.push(
                              <div key="bronze" className="alert alert-bronze alert-secondary d-flex flex-wrap gap-3 align-items-center" dir="rtl">
                                <div className="fw-bold">نتيجة مباراة البرونزية:</div>
                                <span className="badge bg-danger">برونزية: {getName(winner)}</span>
                                {loser && <span className="badge bg-light text-dark">مركز رابع: {getName(loser)}</span>}
                              </div>
                            );
                          } else if (a1 || a2) {
                            panel.push(
                              <div key="bronze-upcoming" className="alert alert-light border" dir="rtl">
                                مباراة البرونزية: {getName(a1)} ضد {getName(a2)}
                              </div>
                            );
                          }
                        }
                        return panel.length ? <div className="mb-3">{panel}</div> : null;
                      })()}
                      {(() => {
                        const byRound = new Map<number, number[]>();
                        pairings.matches.forEach((m, i) => {
                          const r = m.round || 1;
                          if (!byRound.has(r)) byRound.set(r, []);
                          byRound.get(r)!.push(i);
                        });
                        const maxRound = Math.max(...Array.from(byRound.keys()));
                        const roundName = (r: number) => {
                          const dist = maxRound - r;
                          if (dist === 0) return 'النهائي';
                          if (dist === 1) return 'نصف النهائي';
                          if (dist === 2) return 'ربع النهائي';
                          return `الدور ${r}`;
                        };
                        const renderMatch = (idx: number) => {
                          const m = pairings.matches[idx];
                          const a1 = m.athlete1Id ? participants.find(r => r.athlete.id === m.athlete1Id)?.athlete : undefined;
                          const a2 = m.athlete2Id ? participants.find(r => r.athlete.id === m.athlete2Id)?.athlete : undefined;
                          const c1 = a1?.clubId ? participants.find(r => r.athlete.id === (a1?.id || ''))?.club : undefined;
                          const c2 = a2?.clubId ? participants.find(r => r.athlete.id === (a2?.id || ''))?.club : undefined;
                          const l1 = c1?.leagueId ? leaguesMap[c1.leagueId] : undefined;
                          const l2 = c2?.leagueId ? leaguesMap[c2.leagueId] : undefined;
                          const finished = (m.status ?? 'pending') === 'finished';
                          const wId = m.winnerId;
                          const isFinal = (m.round || 1) === maxRound && (m.stage || 'main') === 'main';
                          const isBronze = (m.stage || 'main') === 'bronze';
                          const placeholder1 = (m.from1 != null)
                            ? (isBronze ? `الخاسر من مباراة #${(m.from1 as number) + 1}` : `الفائز من مباراة #${(m.from1 as number) + 1}`)
                            : '—';
                          const placeholder2 = (m.from2 != null)
                            ? (isBronze ? `الخاسر من مباراة #${(m.from2 as number) + 1}` : `الفائز من مباراة #${(m.from2 as number) + 1}`)
                            : '—';
                          const a1Label = a1
                            ? `${a1.firstNameAr || a1.firstName || ''} ${a1.lastNameAr || a1.lastName || ''}`
                            : placeholder1;
                          const a2Label = a2
                            ? `${a2.firstNameAr || a2.firstName || ''} ${a2.lastNameAr || a2.lastName || ''}`
                            : (m.athlete2Id === null ? 'باي (يتأهل تلقائياً)' : placeholder2);
                          return (
                            <div key={idx} className="list-group-item d-flex justify-content-between align-items-center" dir="rtl">
                              <div className="d-flex align-items-center gap-2 text-end flex-grow-1 justify-content-end">
                                <div>
                                  <div className="fw-bold">
                                    {a1Label}
                                    {finished && wId && a1 && wId === a1.id && (
                                      isFinal ? <span className="badge bg-warning text-dark ms-2">ذهبية</span> : isBronze ? <span className="badge bg-danger ms-2">برونزية</span> : <span className="badge bg-success ms-2">فائز</span>
                                    )}
                                    {finished && wId && a1 && wId !== a1.id && (
                                      isFinal ? <span className="badge bg-secondary ms-2">فضية</span> : isBronze ? <span className="badge bg-light text-dark ms-2">مركز رابع</span> : <span className="badge bg-secondary ms-2">خاسر</span>
                                    )}
                                  </div>
                                  {a1 && <div className="text-muted small">{(c1?.nameAr || c1?.name || '—')}{l1 ? ` — ${l1.wilayaNameAr || l1.nameAr}` : ''}</div>}
                                </div>
                                <ImageWithFallback inputSrc={a1?.image || undefined} fallbackSrc={'/vite.svg'} alt="a1" boxWidth={36} boxHeight={36} fixedBox style={{ borderRadius: '50%', objectFit: 'cover' }} />
                              </div>
                              <div className="mx-3 fw-bold">VS</div>
                              <div className="d-flex align-items-center gap-2 flex-grow-1">
                                <ImageWithFallback inputSrc={a2?.image || undefined} fallbackSrc={'/vite.svg'} alt="a2" boxWidth={36} boxHeight={36} fixedBox style={{ borderRadius: '50%', objectFit: 'cover' }} />
                                <div className="text-end">
                                  <div className="fw-bold">
                                    {a2Label}
                                    {finished && wId && a2 && wId === a2.id && (
                                      isFinal ? <span className="badge bg-warning text-dark ms-2">ذهبية</span> : isBronze ? <span className="badge bg-danger ms-2">برونزية</span> : <span className="badge bg-success ms-2">فائز</span>
                                    )}
                                    {finished && wId && a2 && wId !== a2.id && (
                                      isFinal ? <span className="badge bg-secondary ms-2">فضية</span> : isBronze ? <span className="badge bg-light text-dark ms-2">مركز رابع</span> : <span className="badge bg-secondary ms-2">خاسر</span>
                                    )}
                                  </div>
                                  {a2 && <div className="text-muted small">{(c2?.nameAr || c2?.name || '—')}{l2 ? ` — ${l2.wilayaNameAr || l2.nameAr}` : ''}</div>}
                                </div>
                              </div>
                              <div className="ms-3">
                                {/* شارة نوع المباراة */}
                                {isFinal && <span className="badge bg-warning text-dark me-2">مباراة الذهبية</span>}
                                {isBronze && <span className="badge bg-danger me-2">مباراة البرونزية</span>}
                                {m.mat && <span className="badge bg-primary">البساط {m.mat}</span>}
                                {finished && <span className="badge bg-info ms-2">تمت</span>}
                                <span className="badge bg-light text-dark ms-2">مباراة #{idx+1}</span>
                              </div>
                            </div>
                          );
                        };
                        return Array.from(byRound.keys()).sort((a,b)=>a-b).map(r => (
                          <div key={`round-${r}`} className="mb-4">
                            <h5 className="mb-2">{roundName(r)}</h5>
                            <div className="list-group">
                              {byRound.get(r)!.map(renderMatch)}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : participants.length === 0 ? (
                    <div className="text-muted">لا يوجد مشاركون مسجلون بعد.</div>
                  ) : (
                    <div>
                      {(() => {
                        const catMap = new Map<string, Array<{ athlete: User; club?: Club }>>();
                        participants.forEach(r => {
                          const cat = getCategoryByDOBToday(r.athlete.dateOfBirth as any);
                          const key = cat?.nameAr || 'فئة غير محددة';
                          if (!catMap.has(key)) catMap.set(key, []);
                          catMap.get(key)!.push(r);
                        });

                        return Array.from(catMap.entries()).map(([catName, rowsInCat]) => {
                          const clubMap = rowsInCat.reduce((m, r) => {
                            const key = r.club?.id || 'no-club';
                            if (!m.has(key)) m.set(key, [] as Array<{ athlete: User; club?: Club }>);
                            m.get(key)!.push(r);
                            return m;
                          }, new Map<string, Array<{ athlete: User; club?: Club }>>());

                          return (
                            <div key={catName} className="mb-5">
                              <h3 className="mb-3">الفئة: {catName}</h3>
                              {Array.from(clubMap.entries()).map(([clubId, rows]) => (
                                <div key={`${catName}-${clubId}`} className="mb-4">
                                  <h5 className="mb-3">{rows[0]?.club?.nameAr || rows[0]?.club?.name || 'نادي غير محدد'}</h5>
                                  <div className="row">
                                    {rows.map(({ athlete }) => {
                                      const cat = getCategoryByDOBToday(athlete.dateOfBirth as any);
                                      const age = (() => {
                                        const dob = athlete.dateOfBirth ? new Date(athlete.dateOfBirth as any) : undefined;
                                        if (!dob || isNaN(dob.getTime())) return '-';
                                        const today = new Date();
                                        let a = today.getFullYear() - dob.getFullYear();
                                        const m = today.getMonth() - dob.getMonth();
                                        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
                                        return a;
                                      })();
                                      return (
                                        <div key={athlete.id} className="col-md-6 col-lg-4 mb-3">
                                          <div className="card h-100 shadow-sm">
                                            <div className="card-body d-flex align-items-center gap-3">
                                              <div style={{ width: 56, height: 56 }}>
                                                <ImageWithFallback inputSrc={athlete.image || ''} fallbackSrc="/vite.svg" alt={athlete.firstNameAr || athlete.firstName || ''} boxWidth={56} boxHeight={56} className="rounded-circle" />
                                              </div>
                                              <div className="flex-grow-1 text-end">
                                                <div className="fw-bold">{(athlete.firstNameAr || athlete.firstName || '')} {(athlete.lastNameAr || athlete.lastName || '')}</div>
                                                <div className="text-muted small">العمر: {age} سنة</div>
                                                <div className="text-muted small">الفئة: {cat?.nameAr || '-'}</div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                  <p className="text-muted mt-3">ستظهر الجداول التنافسية لكل فئة/وزن بعد إجراء القرعة.</p>
                </div>
              </div>
            )}

            {activeTab === 'weights' && (
              <div className="weights-tab">
                <h2>الأوزان المعتمدة</h2>
                {Array.isArray(competition.categories) && competition.categories.length > 0 ? (
                  <div className="weights-list">
                    {competition.categories.map((cat) => {
                      const w = (competition.weights || {})[cat] || { male: [], female: [] };
                      return (
                        <div key={cat} className="category-weights-card">
                          <h3>{cat}</h3>
                          <div className="gender-weights">
                            <div>
                              <h4>ذكور</h4>
                              {w.male && w.male.length > 0 ? (
                                <ul>
                                  {w.male.map((x: string) => (<li key={`m-${cat}-${x}`}>{x}</li>))}
                                </ul>
                              ) : (
                                <p className="text-muted">لا توجد أوزان محددة</p>
                              )}
                            </div>
                            <div>
                              <h4>إناث</h4>
                              {w.female && w.female.length > 0 ? (
                                <ul>
                                  {w.female.map((x: string) => (<li key={`f-${cat}-${x}`}>{x}</li>))}
                                </ul>
                              ) : (
                                <p className="text-muted">لا توجد أوزان محددة</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p>لا توجد فئات مسجلة لهذه البطولة.</p>
                )}
              </div>
            )}
          </div>
            </>
          );
        })()
      ) : null}

      {/* لوحة منظمي البطولة */}
      {showOrganizers && (
        <div className="organizers-panel" dir="rtl">
          {!orgLoggedIn ? (
            <div className="card p-3" style={{ maxWidth: 560, marginInlineStart: 'auto' }}>
              <h5 className="mb-3 text-end">تسجيل الدخول — منظمو البطولة</h5>
              <div className="mb-3">
                <label className="form-label d-block text-end">اسم المستخدم</label>
                <input className="form-control text-end" value={orgUsername} onChange={(e)=>setOrgUsername(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label d-block text-end">كلمة المرور</label>
                <input type="password" className="form-control text-end" value={orgPassword} onChange={(e)=>setOrgPassword(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label d-block text-end">الدور</label>
                <select className="form-select text-end" value={orgRole} onChange={(e)=>setOrgRole(e.target.value as any)}>
                  <option value="">اختر الدور</option>
                  <option value="table_official">مسؤول الطاولة</option>
                  <option value="supervisor">مشرف البطولة</option>
                </select>
              </div>
              {orgError && <div className="alert alert-danger text-end">{orgError}</div>}
              <div className="text-center">
                <button
                  className="btn btn-success"
                  onClick={async ()=>{
                    try {
                      setOrgError('');
                      if (!competition) return;
                      if (!orgRole || !orgUsername || !orgPassword) {
                        setOrgError('يرجى إدخال اسم المستخدم وكلمة المرور واختيار الدور');
                        return;
                      }
                      const account = await CompetitionOrganizersService.login(competition.id, orgUsername, orgPassword, orgRole as any);
                      if (!account) {
                        setOrgError('بيانات الدخول غير صحيحة أو الحساب غير نشط');
                        return;
                      }
                      // تعيين البساط من الحساب لمسؤول الطاولة
                      if (account.role === 'table_official' && account.mat) {
                        setOrgMat(account.mat as 1|2|3);
                      }
                      setOrgDisplayName(`${account.username}`);
                      setOrgLoggedIn(true);
                    } catch (e) {
                      console.error('Organizer login failed', e);
                      setOrgError('فشل في تسجيل الدخول');
                    }
                  }}
                  disabled={!orgRole}
                >
                  دخول
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              {orgRole === 'table_official' ? (
                <TableOfficialPanel
                  competition={competition}
                  participants={participants}
                  leaguesMap={leaguesMap}
                  pairings={pairings}
                  mat={orgMat}
                  onAfterUpdate={refreshPairingsOnly}
                />
              ) : (
                <SupervisorPanel
                  competition={competition}
                  participants={participants}
                  leaguesMap={leaguesMap}
                  pairings={pairings}
                />
              )}
              <div className="mt-3 text-end">
                <span className="me-2 text-muted">دخول: {orgDisplayName || (orgRole==='table_official' ? 'مسؤول الطاولة' : 'مشرف')}</span>
                <button className="btn btn-outline-secondary" onClick={()=>{ setOrgLoggedIn(false); setOrgUsername(''); setOrgPassword(''); setOrgRole(''); setOrgError(''); }}>تسجيل خروج</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="back-link">
        <Link to="/competitions">← العودة إلى البطولات</Link>
      </div>
    </div>
  );
};

export default CompetitionDetailPage;
