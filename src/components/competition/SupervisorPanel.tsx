import React, { useMemo, useState } from 'react';
import type { Competition, User, Club, League, Pairings } from '../../types';
import ImageWithFallback from '../shared/ImageWithFallback';
import { PairingsService } from '../../services/firestoreService';
import { Modal, Button, Form } from 'react-bootstrap';

interface Props {
  competition: Competition;
  participants: Array<{ athlete: User; club?: Club }>;
  leaguesMap: Record<string, League>;
  pairings: Pairings | null;
}

const SupervisorPanel: React.FC<Props> = ({ competition, participants, leaguesMap, pairings }) => {
  const [selectedMat, setSelectedMat] = useState<1 | 2 | 3>(1);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editWinnerId, setEditWinnerId] = useState<string | null>(null);
  const [editReason, setEditReason] = useState('');
  const [showModal, setShowModal] = useState(false);

  const finishedForMat = useMemo(() => {
    if (!pairings) return [] as number[];
    const idxs: number[] = [];
    pairings.matches.forEach((m, i) => {
      if ((m.mat || 1) === selectedMat && (m.status ?? 'pending') === 'finished') {
        idxs.push(i);
      }
    });
    return idxs;
  }, [pairings, selectedMat]);

  const openEdit = (idx: number) => {
    if (!pairings) return;
    const m = pairings.matches[idx];
    setEditIdx(idx);
    setEditWinnerId(m.winnerId || null);
    setEditReason('');
    setShowModal(true);
  };

  const saveEdit = async () => {
    if (editIdx == null || !editWinnerId) return;
    try {
      await PairingsService.editMatchWinner(competition.id, editIdx, editWinnerId, editReason || 'تعديل نتيجة', 'supervisor');
      setShowModal(false);
    } catch (e) {
      console.error('Failed to edit winner:', e);
    }
  };

  const renderRow = (idx: number) => {
    if (!pairings) return null;
    const m = pairings.matches[idx];
    const a1 = participants.find(r => r.athlete.id === m.athlete1Id)?.athlete;
    const a2 = m.athlete2Id ? participants.find(r => r.athlete.id === m.athlete2Id)?.athlete : undefined;
    const c1 = a1?.clubId ? participants.find(r => r.athlete.id === m.athlete1Id)?.club : undefined;
    const c2 = a2?.clubId ? participants.find(r => r.athlete.id === m.athlete2Id!)?.club : undefined;
    const l1 = c1?.leagueId ? leaguesMap[c1.leagueId] : undefined;
    const l2 = c2?.leagueId ? leaguesMap[c2.leagueId] : undefined;

    return (
      <div key={idx} className="list-group-item d-flex align-items-center justify-content-between" dir="rtl">
        <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-end">
          <div className="text-end">
            <div className="fw-bold">{`${a1?.firstNameAr || a1?.firstName || ''} ${a1?.lastNameAr || a1?.lastName || ''}`}</div>
            <div className="text-muted small">{(c1?.nameAr || c1?.name || '—')}{l1 ? ` — ${l1.wilayaNameAr || l1.nameAr}` : ''}</div>
          </div>
          <ImageWithFallback inputSrc={a1?.image || undefined} fallbackSrc={'/vite.svg'} alt="a1" boxWidth={32} boxHeight={32} fixedBox style={{ borderRadius: '50%', objectFit: 'cover' }} />
        </div>
        <div className="mx-3 fw-bold">VS</div>
        <div className="d-flex align-items-center gap-2 flex-grow-1">
          <ImageWithFallback inputSrc={a2?.image || undefined} fallbackSrc={'/vite.svg'} alt="a2" boxWidth={32} boxHeight={32} fixedBox style={{ borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <div className="fw-bold">{`${a2?.firstNameAr || a2?.firstName || ''} ${a2?.lastNameAr || a2?.lastName || ''}`}</div>
            <div className="text-muted small">{(c2?.nameAr || c2?.name || '—')}{l2 ? ` — ${l2.wilayaNameAr || l2.nameAr}` : ''}</div>
          </div>
        </div>
        <div className="ms-2"><span className="badge bg-primary">البساط {m.mat || 1}</span></div>
        <button className="btn btn-sm btn-outline-secondary ms-2" title="تعديل النتيجة" onClick={() => openEdit(idx)}>
          <i className="fas fa-pencil-alt"></i>
        </button>
      </div>
    );
  };

  return (
    <div dir="rtl">
      <h5 className="mb-3">لوحة مشرف البطولة</h5>
      <div className="d-flex align-items-center gap-2 mb-3">
        <span>اختر البساط:</span>
        <div className="btn-group" role="group">
          {[1,2,3].map(m => (
            <button key={m} className={`btn btn-sm ${selectedMat===m? 'btn-primary':'btn-outline-primary'}`} onClick={() => setSelectedMat(m as 1|2|3)}>البساط {m}</button>
          ))}
        </div>
      </div>
      {!pairings || finishedForMat.length === 0 ? (
        <div className="alert alert-info">لا توجد مباريات منتهية لهذا البساط.</div>
      ) : (
        <div className="list-group">
          {finishedForMat.map(renderRow)}
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title dir="rtl">تعديل النتيجة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pairings && editIdx!=null && (()=>{
            const m = pairings.matches[editIdx];
            const a1 = participants.find(r => r.athlete.id === m.athlete1Id)?.athlete;
            const a2 = m.athlete2Id ? participants.find(r => r.athlete.id === m.athlete2Id)?.athlete : undefined;
            return (
              <div className="d-grid gap-3" dir="rtl">
                <Form.Group>
                  <Form.Label className="d-block text-end">اختر الفائز الصحيح</Form.Label>
                  <div className="d-flex flex-column gap-2">
                    <Form.Check type="radio" name="winner" id="w1" label={`${a1?.firstNameAr || a1?.firstName || ''} ${a1?.lastNameAr || a1?.lastName || ''}`} checked={editWinnerId===a1?.id} onChange={()=>setEditWinnerId(a1?.id||null)} className="text-end" />
                    {a2 && <Form.Check type="radio" name="winner" id="w2" label={`${a2?.firstNameAr || a2?.firstName || ''} ${a2?.lastNameAr || a2?.lastName || ''}`} checked={editWinnerId===a2?.id} onChange={()=>setEditWinnerId(a2?.id||null)} className="text-end" />}
                  </div>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="d-block text-end">سبب التعديل</Form.Label>
                  <Form.Control as="textarea" rows={3} value={editReason} onChange={(e)=>setEditReason(e.target.value)} className="text-end" />
                </Form.Group>
              </div>
            )
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShowModal(false)}>إلغاء</Button>
          <Button variant="primary" onClick={saveEdit} disabled={!editWinnerId}>حفظ</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SupervisorPanel;
