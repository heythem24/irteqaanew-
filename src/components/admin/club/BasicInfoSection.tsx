import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { LeaguesService } from '../../../services/firestoreService';
import type { League } from '../../../types';
import type { ClubManagementData } from '../../../types/clubManagement';

interface BasicInfoSectionProps {
  data: ClubManagementData;
  onUpdate: (data: Partial<ClubManagementData>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ data, onUpdate }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      setLoadingLeagues(true);
      const leaguesData = await LeaguesService.getAllLeagues();
      setLeagues(leaguesData);
    } catch (err) {
      console.error('Failed to load leagues:', err);
    } finally {
      setLoadingLeagues(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div>
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">المعلومات الأساسية للنادي</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>اسم النادي (بالعربية) *</Form.Label>
                <Form.Control
                  type="text"
                  value={data.nameAr || ''}
                  onChange={(e) => handleChange('nameAr', e.target.value)}
                  placeholder="مثال: نادي الأبطال للجودو"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>اسم النادي (بالإنجليزية) *</Form.Label>
                <Form.Control
                  type="text"
                  value={data.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Champions Judo Club"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>الرابطة *</Form.Label>
                <Form.Select
                  value={data.leagueId || ''}
                  onChange={(e) => handleChange('leagueId', e.target.value)}
                  required
                >
                  <option value="">اختر الرابطة...</option>
                  {leagues.map(league => (
                    <option key={league.id} value={league.id}>
                      {league.nameAr} ({league.wilayaNameAr})
                    </option>
                  ))}
                </Form.Select>
                {loadingLeagues && <Form.Text muted>جاري تحميل الرابطات...</Form.Text>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>صورة النادي</Form.Label>
                <Form.Control
                  type="text"
                  value={data.image || ''}
                  onChange={(e) => handleChange('image', e.target.value)}
                  placeholder="رابط الصورة أو حدد من المعرض"
                />
                {data.image && (
                  <div className="mt-2">
                    <img 
                      src={data.image} 
                      alt="Club" 
                      style={{ maxWidth: '100px', maxHeight: '100px' }}
                      className="rounded"
                    />
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>الوصف (بالعربية)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={data.descriptionAr || ''}
                  onChange={(e) => handleChange('descriptionAr', e.target.value)}
                  placeholder="وصف شامل عن النادي، تاريخه، وأهدافه..."
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>الوصف (بالإنجليزية)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={data.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Comprehensive description about the club, its history, and goals..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>العنوان (بالعربية)</Form.Label>
                <Form.Control
                  type="text"
                  value={data.addressAr || ''}
                  onChange={(e) => handleChange('addressAr', e.target.value)}
                  placeholder="مثال: المجمع الرياضي، حي الرياض، الجزائر"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>العنوان (بالإنجليزية)</Form.Label>
                <Form.Control
                  type="text"
                  value={data.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="e.g., Sports Complex, Sports District, Algiers"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>البريد الإلكتروني</Form.Label>
                <Form.Control
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contact@club.dz"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>رقم الهاتف</Form.Label>
                <Form.Control
                  type="tel"
                  value={data.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+213 21 555 0000"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>الموقع الإلكتروني</Form.Label>
                <Form.Control
                  type="url"
                  value={data.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.club.dz"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>وسائل التواصل الاجتماعي</Form.Label>
                <Form.Control
                  type="text"
                  value={data.socialMedia || ''}
                  onChange={(e) => handleChange('socialMedia', e.target.value)}
                  placeholder="Facebook, Instagram, Twitter..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="النادي نشط"
                  checked={data.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="نادي مميز"
                  checked={data.isFeatured}
                  onChange={(e) => handleChange('isFeatured', e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>الكلمات المفتاحية</Form.Label>
                <Form.Control
                  type="text"
                  value={data.keywords || ''}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  placeholder="الجودو، الرياضة، النادي، التدريب..."
                />
                <Form.Text muted>
                  افصل بين الكلمات بفواصل
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>ملاحظات إضافية</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={data.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="أي ملاحظات أو معلومات إضافية..."
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0">إحصائيات النادي</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <div className="text-center">
                <h4 className="text-primary">{data.statistics?.totalMembers || 0}</h4>
                <p className="text-muted">إجمالي الأعضاء</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h4 className="text-success">{data.statistics?.totalAthletes || 0}</h4>
                <p className="text-muted">الرياضيون</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h4 className="text-warning">{data.statistics?.totalStaff || 0}</h4>
                <p className="text-muted">الطاقم</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h4 className="text-info">{data.statistics?.totalAchievements || 0}</h4>
                <p className="text-muted">الإنجازات</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BasicInfoSection;
