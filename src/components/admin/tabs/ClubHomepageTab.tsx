import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { ClubsService, UsersService } from '../../../services/firestoreService';
import { ClubHomepageService, type ClubHomepageContent } from '../../../services/clubHomepageService';

interface Props { clubsProp?: { id: string; nameAr: string }[] }
const ClubHomepageTab: React.FC<Props> = ({ clubsProp }) => {
  const [clubs, setClubs] = useState<{ id: string; nameAr: string }[]>([]);
  const [clubId, setClubId] = useState<string>('');
  const [content, setContent] = useState<ClubHomepageContent>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (clubsProp && clubsProp.length > 0) {
      setClubs(clubsProp);
      return;
    }
    const loadClubs = async () => {
      try {
        const all = await ClubsService.getAllClubs();
        setClubs(all.map((c: any) => ({ id: String(c.id), nameAr: c.nameAr || c.name })));
      } catch (e) {
        console.warn('ClubHomepageTab: failed to load clubs', e);
        setClubs([]);
      }
    };
    loadClubs();
  }, [clubsProp]);

  useEffect(() => {
    const load = async () => {
      if (!clubId) return;
      setLoading(true);
      try {
        const data = await ClubHomepageService.getContent(clubId);
        setContent(data || {});
      } catch (e) {
        console.warn('ClubHomepageTab: failed to load content', e);
        setContent({});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clubId]);

  const save = async () => {
    if (!clubId) return;
    setSaving(true);
    try {
      await ClubHomepageService.saveContent(clubId, content);
      setAlert({ type: 'success', message: 'تم حفظ بيانات الصفحة الرئيسية للنادي.' });
      setTimeout(() => setAlert(null), 3000);
    } catch (e) {
      console.error('ClubHomepageTab: failed to save', e);
      setAlert({ type: 'danger', message: 'فشل حفظ البيانات. حاول مرة أخرى.' });
    } finally {
      setSaving(false);
    }
  };

  const autoCountAthletes = async () => {
    if (!clubId) return;
    try {
      const list = await UsersService.getAthletesByClub(clubId);
      setContent((prev) => ({ ...prev, athletesCount: list?.length || 0 }));
    } catch (e) {
      console.warn('ClubHomepageTab: failed to count athletes', e);
    }
  };

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type}`} role="alert">{alert.message}</div>
      )}

      <Card className="mb-4">
        <Card.Header className="d-flex align-items-center">
          <h5 className="mb-0">إعدادات صفحة النادي</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>اختر النادي</Form.Label>
                <Form.Select value={clubId} onChange={(e) => setClubId(e.target.value)}>
                  <option value="">-- اختر النادي --</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.nameAr}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <Button className="ms-auto" variant="primary" onClick={save} disabled={!clubId || saving}>
                <i className="fas fa-save me-2"></i>
                {saving ? '...جاري الحفظ' : 'حفظ'}
              </Button>
            </Col>
          </Row>

          <Row>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>سنة التأسيس</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="مثال: 2010"
                  value={content.foundedYear as any || ''}
                  onChange={(e) => setContent((prev) => ({ ...prev, foundedYear: e.target.value ? Number(e.target.value) : undefined }))}
                  disabled={!clubId || loading}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>عدد الرياضيين</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    placeholder="مثال: 120"
                    value={content.athletesCount as any || ''}
                    onChange={(e) => setContent((prev) => ({ ...prev, athletesCount: e.target.value ? Number(e.target.value) : undefined }))}
                    disabled={!clubId || loading}
                  />
                  <Button variant="secondary" onClick={autoCountAthletes} disabled={!clubId || loading}>
                    احسب تلقائياً
                  </Button>
                </div>
              </Form.Group>
            </Col>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>عن النادي (عربي)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="نبذة عن النادي..."
                  value={content.aboutAr || ''}
                  onChange={(e) => setContent((prev) => ({ ...prev, aboutAr: e.target.value }))}
                  disabled={!clubId || loading}
                />
              </Form.Group>
            </Col>

            {/* Extra paragraphs */}
            <Col md={12} className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label className="mb-0">فقرات إضافية في نبذة النادي</Form.Label>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => setContent(prev => ({ ...prev, aboutExtraAr: [...(prev.aboutExtraAr || []), ''] }))}
                  disabled={!clubId || loading}
                >
                  إضافة فقرة
                </Button>
              </div>
            </Col>
            {(content.aboutExtraAr || []).map((para, idx) => (
              <Col md={12} key={idx} className="mb-2">
                <div className="d-flex gap-2">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder={`فقرة إضافية #${idx + 1}`}
                    value={para}
                    onChange={(e) => setContent(prev => {
                      const next = [...(prev.aboutExtraAr || [])];
                      next[idx] = e.target.value;
                      return { ...prev, aboutExtraAr: next };
                    })}
                    disabled={!clubId || loading}
                  />
                  <Button
                    variant="outline-danger"
                    onClick={() => setContent(prev => ({ ...prev, aboutExtraAr: (prev.aboutExtraAr || []).filter((_, i) => i !== idx) }))}
                    disabled={!clubId || loading}
                  >
                    حذف
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ClubHomepageTab;
