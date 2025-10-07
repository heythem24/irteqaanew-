import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Table } from 'react-bootstrap';
import { useSeasonCommitmentForm } from '../../hooks/useFirestore';
import './SeasonCommitmentForm.css';

interface SeasonCommitmentFormProps {
  leagueId?: string;
}

interface FormData {
  clubName: string;
  address: string;
  clubColor: string;
  clubRepresentative: string;
  trainingLocation: string;
  // الفئات العمرية المدرجة للمشاركة في المنافسة الفردية وحسب الفرق
  seniorMale: number;
  seniorFemale: number;
  juniorMale: number;
  juniorFemale: number;
  youthMale: number;
  youthFemale: number;
  cadetMale: number;
  cadetFemale: number;
  schoolMale: number;
  schoolFemale: number;
  // مواقيت التدريب
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  // تأشيرة رئيس النادي
  presidentSignature: string;
  submissionDate: string;
  // السنة الدراسية
  academicYear: string;
}

const SeasonCommitmentForm: React.FC<SeasonCommitmentFormProps> = ({ leagueId }) => {
  const [formData, setFormData] = useState<FormData>({
    clubName: '',
    address: '',
    clubColor: '',
    clubRepresentative: '',
    trainingLocation: '',
    seniorMale: 0,
    seniorFemale: 0,
    juniorMale: 0,
    juniorFemale: 0,
    youthMale: 0,
    youthFemale: 0,
    cadetMale: 0,
    cadetFemale: 0,
    schoolMale: 0,
    schoolFemale: 0,
    sunday: '',
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    presidentSignature: '',
    submissionDate: new Date().toISOString().split('T')[0],
    academicYear: '2022/2023'
  });

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // استخدام Firestore بدلاً من localStorage
  const { formData: savedData, saveSeasonCommitmentForm } = useSeasonCommitmentForm(leagueId || '');

  const saveData = async () => {
    const success = await saveSeasonCommitmentForm(formData);
    if (success) {
      alert('تم حفظ البيانات بنجاح');
    } else {
      alert('حدث خطأ في حفظ البيانات');
    }
  };

  // تحميل البيانات المحفوظة
  useEffect(() => {
    if (savedData) {
      setFormData(savedData);
    }
  }, [savedData]);

  const printForm = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>التزام للموسم الرياضي 2022/2023</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            direction: rtl;
            line-height: 1.2;
            font-size: 14px;
            font-weight: bold;
          }
          
          .page-container {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .header {
            border: 3px solid #000;
            padding: 10px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            flex-shrink: 0;
          }
          
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 10px;
            text-align: center;
            line-height: 1.1;
          }
          
          .logo-left {
            background: #FF5722;
            color: white;
          }
          
          .logo-right {
            background: #4CAF50;
            color: white;
          }
          
          .header-text {
            text-align: center;
            flex: 1;
            margin: 0 20px;
          }
          
          .header-text h1 {
            margin: 0;
            font-size: 16px;
            color: #1976d2;
            font-weight: bold;
          }
          
          .header-text h2 {
            margin: 5px 0;
            font-size: 14px;
            color: #333;
          }
          
          .header-text p {
            margin: 2px 0;
            font-size: 10px;
          }
          
          .commitment-title {
            border: 2px solid #000;
            padding: 8px;
            text-align: center;
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: bold;
            background: #f8f9fa;
            flex-shrink: 0;
          }
          
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            flex-shrink: 0;
          }
          
          .info-table th, .info-table td {
            border: 2px solid #000;
            padding: 12px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
          }
          
          .info-table th {
            background-color: #f5f5f5;
            width: 40%;
          }
          
          .categories-section {
            margin-bottom: 10px;
            flex-shrink: 0;
          }
          
          .categories-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
            text-decoration: underline;
          }
          
          .categories-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .categories-table th, .categories-table td {
            border: 2px solid #000;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
          }
          
          .categories-table .category-header {
            background-color: #90EE90;
            font-size: 12px;
          }
          
          .categories-table .gender-header {
            background-color: #90EE90;
            font-size: 10px;
            width: 10%;
          }
          
          .schedule-section {
            margin-bottom: 10px;
            flex-shrink: 0;
          }
          
          .schedule-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
            text-decoration: underline;
          }
          
          .schedule-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .schedule-table th, .schedule-table td {
            border: 2px solid #000;
            padding: 12px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
          }
          
          .schedule-table th {
            background-color: #f0f0f0;
          }
          
          .signature-section {
            text-align: center;
            margin-top: 20px;
            flex-shrink: 0;
          }
          
          .signature-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            text-decoration: underline;
          }
          
          .signature-line {
            height: 40px;
            border-bottom: 2px solid #000;
            margin: 10px auto 5px auto;
            width: 200px;
          }
          
          @media print {
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .page-container {
              height: 100vh !important;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="header">
            <div class="header-content">
              <div class="header-text">
                <h1>الاتحادية الجزائرية للجودو</h1>
                <h2>رابطة الجودو لولاية قسنطينة</h2>
                <p>عمارة الأشغال العمومية - قدور بودومة قسنطينة / هاتف/فاكس: 031.98.16.13</p>
              </div>
            </div>
          </div>

          <div class="commitment-title">
            التزام للموسم الرياضي<br/>
            ${formData.academicYear}
          </div>

          <table class="info-table">
            <tr>
              <th>اسم النادي</th>
              <td>${formData.clubName}</td>
            </tr>
            <tr>
              <th>العنوان</th>
              <td>${formData.address}</td>
            </tr>
            <tr>
              <th>لون النادي</th>
              <td>${formData.clubColor}</td>
            </tr>
            <tr>
              <th>اسم مندوب النادي لدى الرابطة</th>
              <td>${formData.clubRepresentative}</td>
            </tr>
            <tr>
              <th>مكان قاعة التدريب</th>
              <td>${formData.trainingLocation}</td>
            </tr>
          </table>

          <div class="categories-section">
            <div class="categories-title">الفئات العمرية المدرجة للمشاركة في المنافسة الفردية وحسب الفرق</div>
            <table class="categories-table">
              <thead>
                <tr>
                  <th class="category-header" colspan="2">فئة أكابر</th>
                  <th class="category-header" colspan="2">فئة أواسط</th>
                  <th class="category-header" colspan="2">فئة أشبال</th>
                  <th class="category-header" colspan="2">فئة أصاغر</th>
                  <th class="category-header" colspan="2">فئة مدرسة</th>
                </tr>
                <tr>
                  <td class="gender-header">ذ</td>
                  <td class="gender-header">أ</td>
                  <td class="gender-header">ذ</td>
                  <td class="gender-header">أ</td>
                  <td class="gender-header">ذ</td>
                  <td class="gender-header">أ</td>
                  <td class="gender-header">ذ</td>
                  <td class="gender-header">أ</td>
                  <td class="gender-header">ذ</td>
                  <td class="gender-header">أ</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${formData.seniorMale}</td>
                  <td>${formData.seniorFemale}</td>
                  <td>${formData.juniorMale}</td>
                  <td>${formData.juniorFemale}</td>
                  <td>${formData.youthMale}</td>
                  <td>${formData.youthFemale}</td>
                  <td>${formData.cadetMale}</td>
                  <td>${formData.cadetFemale}</td>
                  <td>${formData.schoolMale}</td>
                  <td>${formData.schoolFemale}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="schedule-section">
            <div class="schedule-title">مواقيت التدريب</div>
            <table class="schedule-table">
              <thead>
                <tr>
                  <th>الأحد</th>
                  <th>الاثنين</th>
                  <th>الثلاثاء</th>
                  <th>الأربعاء</th>
                  <th>الخميس</th>
                  <th>الجمعة</th>
                  <th>السبت</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${formData.sunday}</td>
                  <td>${formData.monday}</td>
                  <td>${formData.tuesday}</td>
                  <td>${formData.wednesday}</td>
                  <td>${formData.thursday}</td>
                  <td>${formData.friday}</td>
                  <td>${formData.saturday}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="signature-section">
            <div class="signature-title">تأشيرة رئيس النادي</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 100);
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-success text-white">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center" dir="rtl">
            <i className="fas fa-file-signature me-2"></i>
            <span className="me-2">التزام للموسم الرياضي</span>
            <Form.Control
              type="text"
              value={formData.academicYear}
              onChange={(e) => updateField('academicYear', e.target.value)}
              style={{ width: '120px', fontSize: '1rem', fontWeight: 'bold' }}
              className="text-center"
            />
          </div>
          <div>
            <Button variant="outline-light" size="sm" onClick={() => window.history.back()} className="me-2">
              <i className="fas fa-arrow-right me-2"></i>
              العودة
            </Button>
            <Button variant="outline-light" size="sm" onClick={saveData} className="me-2">
              <i className="fas fa-save me-2"></i>
              حفظ
            </Button>
            <Button variant="outline-light" size="sm" onClick={printForm}>
              <i className="fas fa-print me-2"></i>
              طباعة
            </Button>
          </div>
        </div>
      </Card.Header>

      <Card.Body className="p-4">
        {/* معلومات النادي الأساسية */}
        <Card className="mb-4">
          <Card.Header className="bg-light">
            <h6 className="mb-0" dir="rtl">معلومات النادي</h6>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label dir="rtl">اسم النادي:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.clubName}
                    onChange={(e) => updateField('clubName', e.target.value)}
                    placeholder="اسم النادي"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label dir="rtl">العنوان:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="عنوان النادي"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label dir="rtl">لون النادي:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.clubColor}
                    onChange={(e) => updateField('clubColor', e.target.value)}
                    placeholder="لون النادي"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label dir="rtl">اسم مندوب النادي لدى الرابطة:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.clubRepresentative}
                    onChange={(e) => updateField('clubRepresentative', e.target.value)}
                    placeholder="اسم المندوب"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label dir="rtl">مكان قاعة التدريب:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.trainingLocation}
                    onChange={(e) => updateField('trainingLocation', e.target.value)}
                    placeholder="مكان قاعة التدريب"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* الفئات العمرية */}
        <Card className="mb-4">
          <Card.Header className="bg-light">
            <h6 className="mb-0" dir="rtl">الفئات العمرية المدرجة للمشاركة في المنافسة الفردية وحسب الفرق</h6>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table bordered className="text-center">
                <thead>
                  <tr>
                    <th colSpan={2} className="bg-success text-white">فئة أكابر</th>
                    <th colSpan={2} className="bg-success text-white">فئة أواسط</th>
                    <th colSpan={2} className="bg-success text-white">فئة أشبال</th>
                    <th colSpan={2} className="bg-success text-white">فئة أصاغر</th>
                    <th colSpan={2} className="bg-success text-white">فئة مدرسة</th>
                  </tr>
                  <tr>
                    <th className="bg-light">ذ</th>
                    <th className="bg-light">أ</th>
                    <th className="bg-light">ذ</th>
                    <th className="bg-light">أ</th>
                    <th className="bg-light">ذ</th>
                    <th className="bg-light">أ</th>
                    <th className="bg-light">ذ</th>
                    <th className="bg-light">أ</th>
                    <th className="bg-light">ذ</th>
                    <th className="bg-light">أ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.seniorMale}
                        onChange={(e) => updateField('seniorMale', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.seniorFemale}
                        onChange={(e) => updateField('seniorFemale', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.juniorMale}
                        onChange={(e) => updateField('juniorMale', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.juniorFemale}
                        onChange={(e) => updateField('juniorFemale', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.youthMale}
                        onChange={(e) => updateField('youthMale', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.youthFemale}
                        onChange={(e) => updateField('youthFemale', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.cadetMale}
                        onChange={(e) => updateField('cadetMale', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.cadetFemale}
                        onChange={(e) => updateField('cadetFemale', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.schoolMale}
                        onChange={(e) => updateField('schoolMale', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.schoolFemale}
                        onChange={(e) => updateField('schoolFemale', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* مواقيت التدريب */}
        <Card className="mb-4">
          <Card.Header className="bg-light">
            <h6 className="mb-0" dir="rtl">مواقيت التدريب</h6>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table bordered className="text-center">
                <thead>
                  <tr>
                    <th className="bg-light">الأحد</th>
                    <th className="bg-light">الاثنين</th>
                    <th className="bg-light">الثلاثاء</th>
                    <th className="bg-light">الأربعاء</th>
                    <th className="bg-light">الخميس</th>
                    <th className="bg-light">الجمعة</th>
                    <th className="bg-light">السبت</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Form.Control
                        type="text"
                        value={formData.sunday}
                        onChange={(e) => updateField('sunday', e.target.value)}
                        placeholder="مثال: 16:00-18:00"
                        className="text-center"
                        dir="rtl"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={formData.monday}
                        onChange={(e) => updateField('monday', e.target.value)}
                        placeholder="مثال: 16:00-18:00"
                        className="text-center"
                        dir="rtl"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={formData.tuesday}
                        onChange={(e) => updateField('tuesday', e.target.value)}
                        placeholder="مثال: 16:00-18:00"
                        className="text-center"
                        dir="rtl"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={formData.wednesday}
                        onChange={(e) => updateField('wednesday', e.target.value)}
                        placeholder="مثال: 16:00-18:00"
                        className="text-center"
                        dir="rtl"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={formData.thursday}
                        onChange={(e) => updateField('thursday', e.target.value)}
                        placeholder="مثال: 16:00-18:00"
                        className="text-center"
                        dir="rtl"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={formData.friday}
                        onChange={(e) => updateField('friday', e.target.value)}
                        placeholder="مثال: 16:00-18:00"
                        className="text-center"
                        dir="rtl"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={formData.saturday}
                        onChange={(e) => updateField('saturday', e.target.value)}
                        placeholder="مثال: 16:00-18:00"
                        className="text-center"
                        dir="rtl"
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* تأشيرة رئيس النادي */}
        <Card className="mb-4">
          <Card.Header className="bg-light">
            <h6 className="mb-0" dir="rtl">تأشيرة رئيس النادي</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label dir="rtl">التاريخ:</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.submissionDate}
                    onChange={(e) => updateField('submissionDate', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
};

export default SeasonCommitmentForm;