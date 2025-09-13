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
    if (roundNum > 1) {
      const prevRound = roundNum - 1;
      const prevRoundMatches = pairings.matches.filter(mm => ((mm.round || 1) === prevRound) && (((mm as any).stage || 'main') === stage));
      if (prevRoundMatches.length > 0 && prevRoundMatches.some(mm => (mm.status || 'pending') !== 'finished')) {
        canConfirm = false;
        blockReason = 'هذه المباراة محجوبة حتى اكتمال جميع مباريات الدور السابق.';
      }
    }
    // تحقق من المصدرين from1/from2
    const f1 = (m as any).from1 as number | undefined;
    const f2 = (m as any).from2 as number | undefined;
    if (canConfirm && typeof f1 === 'number') {
      const pm = pairings.matches[f1];
      if (pm && (pm.status || 'pending') !== 'finished') {
        canConfirm = false;
        blockReason = 'بانتظار اكتمال مباراة المصدر الأولى.';
      }
    }
    if (canConfirm && typeof f2 === 'number') {
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
    <div dir="rtl">
      <h5 className="mb-3">{competition.nameAr} — البساط {mat}</h5>
      {errorMsg && (
        <div className="alert alert-warning" onAnimationEnd={() => {}}>{errorMsg}</div>
      )}
      {!nextMatch ? (
        <div className="alert alert-info">لا توجد مباريات قادمة على هذا البساط حالياً.</div>
      ) : (
        <div className="card p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-end">
              <div className="text-end">
                <div className="fw-bold">{`${nextMatch.a1?.firstNameAr || nextMatch.a1?.firstName || ''} ${nextMatch.a1?.lastNameAr || nextMatch.a1?.lastName || ''}`}</div>
                <div className="text-muted small">{(nextMatch.c1?.nameAr || nextMatch.c1?.name || '—')}{nextMatch.l1 ? ` — ${nextMatch.l1.wilayaNameAr || nextMatch.l1.nameAr}` : ''}</div>
              </div>
              <ImageWithFallback inputSrc={nextMatch.a1?.image || undefined} fallbackSrc={'/vite.svg'} alt="a1" boxWidth={40} boxHeight={40} fixedBox style={{ borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div className="mx-3 fw-bold">VS</div>
            <div className="d-flex align-items-center gap-2 flex-grow-1">
              <ImageWithFallback inputSrc={nextMatch.a2?.image || undefined} fallbackSrc={'/vite.svg'} alt="a2" boxWidth={40} boxHeight={40} fixedBox style={{ borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div className="fw-bold">{`${nextMatch.a2?.firstNameAr || nextMatch.a2?.firstName || ''} ${nextMatch.a2?.lastNameAr || nextMatch.a2?.lastName || ''}`}</div>
                <div className="text-muted small">{(nextMatch.c2?.nameAr || nextMatch.c2?.name || '—')}{nextMatch.l2 ? ` — ${nextMatch.l2.wilayaNameAr || nextMatch.l2.nameAr}` : ''}</div>
              </div>
            </div>
          </div>
          <div className="text-center mt-3">
            {!nextMatch.canConfirm && (
              <div className="alert alert-light border text-danger mb-2">
                {nextMatch.blockReason || 'هذه المباراة محجوبة لحين اكتمال الدور السابق.'}
              </div>
            )}
            <Button size="lg" variant="primary" onClick={openConfirm} disabled={!nextMatch.canConfirm}>تأكيد نتيجة المباراة</Button>
          </div>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center" dir="rtl">اختر الفائز</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {nextMatch && (
            <div className="d-grid gap-3">
              <Button size="lg" style={{ padding: '20px', fontSize: '1.25rem' }} variant="success" onClick={() => confirmWinner(nextMatch.a1!.id)}>
                فوز {`${nextMatch.a1?.firstNameAr || nextMatch.a1?.firstName || ''} ${nextMatch.a1?.lastNameAr || nextMatch.a1?.lastName || ''}`}
              </Button>
              <Button size="lg" style={{ padding: '20px', fontSize: '1.25rem' }} variant="danger" onClick={() => confirmWinner(nextMatch.a2!.id)}>
                فوز {`${nextMatch.a2?.firstNameAr || nextMatch.a2?.firstName || ''} ${nextMatch.a2?.lastNameAr || nextMatch.a2?.lastName || ''}`}
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>إلغاء</Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TableOfficialPanel;
