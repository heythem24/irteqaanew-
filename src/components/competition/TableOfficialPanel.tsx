import React, { useMemo, useState } from 'react';
import type { Competition, User, Club, League, Pairings } from '../../types';
import ImageWithFallback from '../shared/ImageWithFallback';
import { PairingsService } from '../../services/firestoreService';
import { Modal, Button } from 'react-bootstrap';

interface Props {
  competition: Competition;
  participants: Array<{ athlete: User; club?: Club }>;
  leaguesMap: Record<string, League>;
  pairings: Pairings | null;
  mat: 1 | 2 | 3;
  onAfterUpdate?: () => void;
}

const TableOfficialPanel: React.FC<Props> = ({ competition, participants, leaguesMap, pairings, mat, onAfterUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nextMatch = useMemo(() => {
    if (!pairings) return null;
    const idx = pairings.matches.findIndex(m => (m.mat || 1) === mat && (m.status ?? 'pending') === 'pending' && m.athlete2Id);
    if (idx === -1) return null;
    const m = pairings.matches[idx];
    const a1 = participants.find(r => r.athlete.id === m.athlete1Id)?.athlete;
    const a2 = m.athlete2Id ? participants.find(r => r.athlete.id === m.athlete2Id)?.athlete : undefined;
    const c1 = a1?.clubId ? participants.find(r => r.athlete.id === m.athlete1Id)?.club : undefined;
    const c2 = a2?.clubId ? participants.find(r => r.athlete.id === m.athlete2Id!)?.club : undefined;
    const l1 = c1?.leagueId ? leaguesMap[c1.leagueId] : undefined;
    const l2 = c2?.leagueId ? leaguesMap[c2.leagueId] : undefined;

    // احسب إمكانية التأكيد وفق اكتمال الدور السابق ومباريات المصدر
    let canConfirm = true;
    let blockReason: string | undefined;
    const stage = (m as any).stage || 'main';
    const roundNum = (m as any).round || 1;
    
    // التحقق من اكتمال الدور السابق (للجولات > 1 فقط) مع مراعاة نفس المجموعة فقط
    if (roundNum > 1) {
      const prevRound = roundNum - 1;
      const groupKey = (m as any).groupKey || '';
      const prevRoundMatches = pairings.matches.filter(mm => (
        ((mm.round || 1) === prevRound) &&
        (((mm as any).stage || 'main') === stage) &&
        (((mm as any).groupKey || '') === groupKey)
      ));
      if (prevRoundMatches.length > 0 && prevRoundMatches.some(mm => (mm.status || 'pending') !== 'finished')) {
        canConfirm = false;
        blockReason = 'هذه المباراة محجوبة حتى اكتمال جميع مباريات الدور السابق.';
      }
    }
    
    // التحقق من مباريات المصدر (فقط للجولات التي لها مصدر)
    const f1 = (m as any).from1 as number | undefined;
    const f2 = (m as any).from2 as number | undefined;
    
    // التحقق من مصدر 1 (فقط إذا كان موجوداً ورقمياً)
    if (canConfirm && typeof f1 === 'number' && f1 >= 0 && f1 < pairings.matches.length) {
      const pm = pairings.matches[f1];
      if (pm && (pm.status || 'pending') !== 'finished') {
        canConfirm = false;
        blockReason = 'بانتظار اكتمال مباراة المصدر الأولى.';
      }
    }
    
    // التحقق من مصدر 2 (فقط إذا كان موجوداً ورقمياً)
    if (canConfirm && typeof f2 === 'number' && f2 >= 0 && f2 < pairings.matches.length) {
      const pm = pairings.matches[f2];
      if (pm && (pm.status || 'pending') !== 'finished') {
        canConfirm = false;
        blockReason = 'بانتظار اكتمال مباراة المصدر الثانية.';
      }
    }

    return { idx, m, a1, a2, c1, c2, l1, l2, canConfirm, blockReason } as const;
  }, [pairings, mat, participants, leaguesMap]);

  const openConfirm = () => {
    if (!nextMatch) return;
    if (!nextMatch.canConfirm) {
      setErrorMsg(nextMatch.blockReason || 'لا يمكن تأكيد نتيجة هذه المباراة حالياً. يرجى انتظار اكتمال الدور السابق.');
      return;
    }
    setActiveIdx(nextMatch.idx);
    setShowModal(true);
  };

  const confirmWinner = async (winnerId: string) => {
    try {
      if (activeIdx == null) return;
      await PairingsService.setMatchWinner(competition.id, activeIdx, winnerId, 'table_official');
      setShowModal(false);
      setErrorMsg(null);
      if (onAfterUpdate) onAfterUpdate();
    } catch (e) {
      console.error('Failed to set winner:', e);
      setErrorMsg((e as Error)?.message || 'فشل في تأكيد النتيجة.');
    }
  };

  return (
    <div dir="rtl" className="table-official-panel">
      <h5 className="mb-3 px-2">{competition.nameAr} — البساط {mat}</h5>
      {errorMsg && (
        <div className="alert alert-warning mx-2" onAnimationEnd={() => {}}>{errorMsg}</div>
      )}
      {!nextMatch ? (
        <div className="alert alert-info mx-2">لا توجد مباريات قادمة على هذا البساط حالياً.</div>
      ) : (
        <div className="card border-0 shadow-sm rounded-0">
          <div className="card-body p-2">
            <div className="d-flex flex-column flex-md-row align-items-stretch gap-2">
              {/* Athlete 1 */}
              <div className="d-flex align-items-center justify-content-between flex-grow-1 bg-light rounded p-2">
                <div className="d-flex align-items-center gap-2 overflow-hidden">
                  <div className="text-truncate text-end flex-grow-1">
                    <div className="fw-bold text-truncate" dir="rtl">
                      {nextMatch.a1?.firstNameAr || nextMatch.a1?.firstName || ''} {nextMatch.a1?.lastNameAr || nextMatch.a1?.lastName || ''}
                    </div>
                    <div className="text-muted small text-truncate" dir="rtl">
                      {nextMatch.c1?.nameAr || nextMatch.c1?.name || '—'}
                      {nextMatch.l1 && (
                        <span className="d-block text-truncate">
                          {nextMatch.l1.wilayaNameAr || nextMatch.l1.nameAr}
                        </span>
                      )}
                    </div>
                  </div>
                  <ImageWithFallback 
                    inputSrc={nextMatch.a1?.image} 
                    fallbackSrc={'/vite.svg'} 
                    alt="a1" 
                    boxWidth={50} 
                    boxHeight={50} 
                    fixedBox 
                    className="flex-shrink-0"
                    style={{ borderRadius: '50%', objectFit: 'cover' }} 
                  />
                </div>
              </div>

              {/* VS Badge */}
              <div className="d-flex align-items-center justify-content-center px-2">
                <span className="badge bg-secondary rounded-pill px-2 py-1">
                  VS
                </span>
              </div>

              {/* Athlete 2 */}
              <div className="d-flex align-items-center justify-content-between flex-grow-1 bg-light rounded p-2">
                <ImageWithFallback 
                  inputSrc={nextMatch.a2?.image} 
                  fallbackSrc={'/vite.svg'} 
                  alt="a2" 
                  boxWidth={50} 
                  boxHeight={50} 
                  fixedBox 
                  className="flex-shrink-0"
                  style={{ borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div className="d-flex align-items-center gap-2 overflow-hidden">
                  <div className="text-truncate flex-grow-1">
                    <div className="fw-bold text-truncate" dir="rtl">
                      {nextMatch.a2?.firstNameAr || nextMatch.a2?.firstName || ''} {nextMatch.a2?.lastNameAr || nextMatch.a2?.lastName || ''}
                    </div>
                    <div className="text-muted small text-truncate" dir="rtl">
                      {nextMatch.c2?.nameAr || nextMatch.c2?.name || '—'}
                      {nextMatch.l2 && (
                        <span className="d-block text-truncate">
                          {nextMatch.l2.wilayaNameAr || nextMatch.l2.nameAr}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-3 px-2">
              {!nextMatch.canConfirm && (
                <div className="alert alert-light border text-danger mb-2 p-2 small">
                  {nextMatch.blockReason || 'هذه المباراة محجوبة لحين اكتمال الدور السابق.'}
                </div>
              )}
              <Button 
                size="lg" 
                variant="primary" 
                className="w-100"
                onClick={openConfirm} 
                disabled={!nextMatch.canConfirm}
              >
                تأكيد نتيجة المباراة
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="w-100 text-center" dir="rtl">
            <h5 className="mb-0">تأكيد نتيجة المباراة</h5>
            <p className="text-muted small mb-0">اختر اللاعب الفائز</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {nextMatch && (
            <div className="d-grid gap-3">
              {/* Athlete 1 Button */}
              <Button 
                size="lg" 
                className="d-flex align-items-center justify-content-between p-3"
                variant="outline-success" 
                onClick={() => confirmWinner(nextMatch.a1!.id)}
              >
                <div className="d-flex align-items-center gap-2">
                  <ImageWithFallback 
                    inputSrc={nextMatch.a1?.image} 
                    fallbackSrc={'/vite.svg'} 
                    alt="a1" 
                    boxWidth={40} 
                    boxHeight={40} 
                    fixedBox 
                    className="flex-shrink-0"
                    style={{ borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <div className="text-start">
                    <div className="fw-bold">
                      {nextMatch.a1?.firstNameAr || nextMatch.a1?.firstName} {nextMatch.a1?.lastNameAr || nextMatch.a1?.lastName}
                    </div>
                    <div className="small text-muted">
                      {nextMatch.c1?.nameAr || nextMatch.c1?.name}
                    </div>
                  </div>
                </div>
                <span className="ms-2">✓</span>
              </Button>

              {/* Athlete 2 Button */}
              <Button 
                size="lg" 
                className="d-flex align-items-center justify-content-between p-3"
                variant="outline-danger" 
                onClick={() => confirmWinner(nextMatch.a2!.id)}
              >
                <div className="d-flex align-items-center gap-2">
                  <ImageWithFallback 
                    inputSrc={nextMatch.a2?.image} 
                    fallbackSrc={'/vite.svg'} 
                    alt="a2" 
                    boxWidth={40} 
                    boxHeight={40} 
                    fixedBox 
                    className="flex-shrink-0"
                    style={{ borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <div className="text-start">
                    <div className="fw-bold">
                      {nextMatch.a2?.firstNameAr || nextMatch.a2?.firstName} {nextMatch.a2?.lastNameAr || nextMatch.a2?.lastName}
                    </div>
                    <div className="small text-muted">
                      {nextMatch.c2?.nameAr || nextMatch.c2?.name}
                    </div>
                  </div>
                </div>
                <span className="ms-2">✓</span>
              </Button>

              <Button 
                variant="outline-secondary" 
                className="mt-2"
                onClick={() => setShowModal(false)}
              >
                إلغاء
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TableOfficialPanel;
