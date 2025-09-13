import React, { useEffect, useRef, useState } from 'react';
import { Card, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { LeaguesService } from '../../../services/firestoreService';
import { LeagueHomepageService, type LeaguePresident } from '../../../services/leagueHomepageService';
import { uploadToCloudinary } from '../../../services/cloudinaryService';

const LeaguePresidentTab: React.FC = () => {
  const [leagues, setLeagues] = useState<{ id: string; nameAr: string; wilayaNameAr?: string }[]>([]);
  const [leagueId, setLeagueId] = useState<string>('');
  const [president, setPresident] = useState<LeaguePresident>({ positionAr: 'رئيس الرابطة الولائية للجودو' });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const all = await LeaguesService.getAllLeagues();
        setLeagues(all.map((l: any) => ({ id: String(l.id), nameAr: l.nameAr || l.name || 'رابطة', wilayaNameAr: l.wilayaNameAr })));
      } catch (e) {
        console.warn('LeaguePresidentTab: failed to load leagues', e);
        setLeagues([]);
      }
    };
    loadLeagues();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!leagueId) return;
      setLoading(true);
      try {
        const content = await LeagueHomepageService.getContent(leagueId);
        setPresident(content.president || { positionAr: 'رئيس الرابطة الولائية للجودو' });
      } catch (e) {
        console.warn('LeaguePresidentTab: failed to load president', e);
        setPresident({ positionAr: 'رئيس الرابطة الولائية للجودو' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [leagueId]);

  const save = async () => {
    if (!leagueId) return;
    setSaving(true);
    try {
      const current = await LeagueHomepageService.getContent(leagueId);
      const payload = { ...current, president: { ...president, updatedAt: new Date() } };
      await LeagueHomepageService.saveContent(leagueId, payload);
      setAlert({ type: 'success', message: 'تم حفظ بيانات رئيس الرابطة.' });
      setTimeout(() => setAlert(null), 3000);
    } catch (e) {
      console.error('LeaguePresidentTab: failed to save', e);
      setAlert({ type: 'danger', message: 'فشل حفظ البيانات.' });
    } finally {
      setSaving(false);
    }
  };

  const handleImagePick = () => fileRef.current?.click();
  const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !leagueId) return;
    setUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: `league/${leagueId}/president` });
      setPresident(prev => ({ ...prev, image: res.secure_url }));
    } catch (err) {
      console.error('LeaguePresidentTab: upload failed', err);
      setAlert({ type: 'danger', message: 'فشل رفع الصورة. تحقق من إعدادات Cloudinary' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const addExperience = () => setPresident(prev => ({ ...prev, experiences: [ ...(prev.experiences || []), '' ] }));
  const addAchievement = () => setPresident(prev => ({ ...prev, achievements: [ ...(prev.achievements || []), '' ] }));

  const updateExperience = (idx: number, value: string) => setPresident(prev => {
    const next = [ ...(prev.experiences || []) ];
    next[idx] = value;
    return { ...prev, experiences: next };
  });
  const updateAchievement = (idx: number, value: string) => setPresident(prev => {
    const next = [ ...(prev.achievements || []) ];
    next[idx] = value;
    return { ...prev, achievements: next };
  });
  const removeExperience = (idx: number) => setPresident(prev => ({ ...prev, experiences: (prev.experiences || []).filter((_, i) => i !== idx) }));
  const removeAchievement = (idx: number) => setPresident(prev => ({ ...prev, achievements: (prev.achievements || []).filter((_, i) => i !== idx) }));

  return (
    <div>
      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">رئيس الرابطة</h5>
          <Button variant="primary" onClick={save} disabled={!leagueId || saving}>
            <i className="fas fa-save me-2"></i>
            {saving ? '...جاري الحفظ' : 'حفظ'}
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>اختر الرابطة</Form.Label>
                <Form.Select value={leagueId} onChange={(e) => setLeagueId(e.target.value)}>
                  <option value="">-- اختر الرابطة --</option>
                  {leagues.map(l => (
                    <option key={l.id} value={l.id}>{l.nameAr} {l.wilayaNameAr ? `(${l.wilayaNameAr})` : ''}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4} className="mb-3 text-center">
              <div className="mb-2">
                <img src={president.image || '/images/default-president.jpg'} alt="president" className="img-fluid rounded-circle shadow" style={{ width: 180, height: 180, objectFit: 'cover' }} />
              </div>
              <Button variant="secondary" onClick={handleImagePick} disabled={!leagueId || uploading}>
                {uploading ? '...جاري الرفع' : 'اختر صورة'}
              </Button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </Col>
            <Col md={8}>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>الاسم (عربي)</Form.Label>
                    <Form.Control value={president.nameAr || ''} onChange={(e) => setPresident(prev => ({ ...prev, nameAr: e.target.value }))} />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>المنصب (عربي)</Form.Label>
                    <Form.Control value={president.positionAr || ''} onChange={(e) => setPresident(prev => ({ ...prev, positionAr: e.target.value }))} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>البريد الإلكتروني</Form.Label>
                    <Form.Control type="email" value={president.email || ''} onChange={(e) => setPresident(prev => ({ ...prev, email: e.target.value }))} />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>الهاتف</Form.Label>
                    <Form.Control value={president.phone || ''} onChange={(e) => setPresident(prev => ({ ...prev, phone: e.target.value }))} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>نبذة مختصرة</Form.Label>
                <Form.Control as="textarea" rows={4} value={president.bioAr || ''} onChange={(e) => setPresident(prev => ({ ...prev, bioAr: e.target.value }))} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">الخبرات</Form.Label>
                <Button size="sm" variant="outline-primary" onClick={addExperience}><i className="fas fa-plus me-2"></i>إضافة</Button>
              </div>
              {(president.experiences || []).map((exp, idx) => (
                <div key={idx} className="d-flex gap-2 mb-2">
                  <Form.Control value={exp} onChange={(e) => updateExperience(idx, e.target.value)} placeholder={`خبرة #${idx + 1}`} />
                  <Button variant="outline-danger" onClick={() => removeExperience(idx)}>حذف</Button>
                </div>
              ))}
              {(president.experiences || []).length === 0 && (
                <div className="text-muted small">لا توجد خبرات مضافة بعد</div>
              )}
            </Col>
            <Col md={6} className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">الإنجازات</Form.Label>
                <Button size="sm" variant="outline-success" onClick={addAchievement}><i className="fas fa-plus me-2"></i>إضافة</Button>
              </div>
              {(president.achievements || []).map((ach, idx) => (
                <div key={idx} className="d-flex gap-2 mb-2">
                  <Form.Control value={ach} onChange={(e) => updateAchievement(idx, e.target.value)} placeholder={`إنجاز #${idx + 1}`} />
                  <Button variant="outline-danger" onClick={() => removeAchievement(idx)}>حذف</Button>
                </div>
              ))}
              {(president.achievements || []).length === 0 && (
                <div className="text-muted small">لا توجد إنجازات مضافة بعد</div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LeaguePresidentTab;
