import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import { useRespectCommitmentForm } from '../../hooks/useFirestore';
import './RespectCommitmentForm.css';

interface RespectCommitmentFormProps {
    leagueId?: string;
}

interface FormData {
    clubName: string;
    address: string;
    phone: string;
    email: string;
    accreditationDate: string;
    accreditationNumber: string;
    bankAccountNumber: string;
    // ألقاب وأسماء مسيري النادي
    president: string;
    presidentPhone: string;
    generalSecretary: string;
    generalSecretaryPhone: string;
    treasurer: string;
    treasurerPhone: string;
    // التأطير الفني
    technicalDirector: string;
    technicalDirectorCertificate: string;
    // المدربين
    seniorCoach: string;
    seniorCoachCertificate: string;
    juniorCoach: string;
    juniorCoachCertificate: string;
    youthCoach: string;
    youthCoachCertificate: string;
    // ملاحظة
    note: string;
    // تاريخ الإيداع
    submissionDate: string;
    // السنة الدراسية
    academicYear: string;
}

const RespectCommitmentForm: React.FC<RespectCommitmentFormProps> = ({ leagueId }) => {
    const [formData, setFormData] = useState<FormData>({
        clubName: '',
        address: '',
        phone: '',
        email: '',
        accreditationDate: '',
        accreditationNumber: '',
        bankAccountNumber: '',
        president: '',
        presidentPhone: '',
        generalSecretary: '',
        generalSecretaryPhone: '',
        treasurer: '',
        treasurerPhone: '',
        technicalDirector: '',
        technicalDirectorCertificate: '',
        seniorCoach: '',
        seniorCoachCertificate: '',
        juniorCoach: '',
        juniorCoachCertificate: '',
        youthCoach: '',
        youthCoachCertificate: '',
        note: '',
        submissionDate: new Date().toISOString().split('T')[0],
        academicYear: '2022/2023'
    });

    const updateField = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // استخدام Firestore بدلاً من localStorage
    const { formData: savedData, saveRespectCommitmentForm } = useRespectCommitmentForm(leagueId || '');

    const saveData = async () => {
        const success = await saveRespectCommitmentForm(formData);
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
        <title>الإلتزام - الانخراط للموسم الرياضي 2022/2023</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            direction: rtl;
            line-height: 1.6;
            font-weight: bold;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border: 2px solid #000;
            padding: 20px;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          }
          .header h1 {
            color: #1976d2;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .header h2 {
            color: #333;
            margin: 10px 0;
            font-size: 20px;
          }
          .logos {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .form-section {
            margin-bottom: 25px;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 8px;
          }
          .form-section h3 {
            background: #f5f5f5;
            margin: -15px -15px 15px -15px;
            padding: 10px 15px;
            border-bottom: 1px solid #ddd;
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }
          .form-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            align-items: center;
          }
          .form-field {
            flex: 1;
            margin: 0 10px;
          }
          .form-field label {
            font-weight: bold;
            margin-bottom: 5px;
            display: block;
          }
          .form-field .value {
            border-bottom: 1px dotted #333;
            min-height: 25px;
            padding: 5px 0;
            font-size: 16px;
          }
          .form-field .value.no-border {
            border-bottom: none;
          }
          .signature-section {
            margin-top: 40px;
            text-align: center;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-bottom: 1px solid #333;
            height: 50px;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 2px solid #333;
            padding: 15px 12px;
            text-align: center;
            font-weight: bold;
            font-size: 18px;
          }
          th {
            background-color: #f0f0f0;
            font-size: 16px;
          }
          .contact-info {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .form-section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="text-align: center;">
            <h1>الاتحادية الجزائرية للجودو</h1>
            <h2>رابطة الجودو لولاية قسنطينة</h2>
            <p style="margin: 5px 0; font-size: 14px;">عمارة الأشغال العمومية - قدور بودومة قسنطينة / هاتف/فاكس: 031.98.16.13</p>
          </div>
          
          <div style="background: #2196F3; color: white; padding: 15px; margin: 20px 0; border-radius: 10px;">
            <h2 style="margin: 0; color: white;">الإلتزام - الإنخراط</h2>
            <h3 style="margin: 5px 0; color: white;">الموسم الرياضي ${formData.academicYear}</h3>
          </div>
        </div>

        <div class="form-section">
          
          <div class="form-row">
            <div class="form-field">
              <label>النادي:</label>
              <div class="value">${formData.clubName}</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>العنوان:</label>
              <div class="value">${formData.address}</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>الهاتف:</label>
              <div class="value">${formData.phone}</div>
            </div>
            <div class="form-field">
              <label>البريد الإلكتروني:</label>
              <div class="value">${formData.email}</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>تاريخ ورقم الاعتماد:</label>
              <div class="value">${formData.accreditationDate} - ${formData.accreditationNumber}</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>رقم الحساب البنكي:</label>
              <div class="value">${formData.bankAccountNumber}</div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>ألقاب وأسماء مسيري النادي</h3>
          <table>
            <thead>
              <tr>
                <th>المنصب</th>
                <th>الاسم واللقب</th>
                <th>الهاتف</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>رئيس النادي</td>
                <td>${formData.president}</td>
                <td>${formData.presidentPhone}</td>
              </tr>
              <tr>
                <td>الكاتب العام</td>
                <td>${formData.generalSecretary}</td>
                <td>${formData.generalSecretaryPhone}</td>
              </tr>
              <tr>
                <td>أمين المال</td>
                <td>${formData.treasurer}</td>
                <td>${formData.treasurerPhone}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="form-section">
          <h3>التأطير الفني</h3>
          <div class="form-row">
            <div class="form-field">
              <label>المدير الفني الرياضي:</label>
              <div class="value">${formData.technicalDirector}</div>
            </div>
            <div class="form-field">
              <label>الشهادة:</label>
              <div class="value">${formData.technicalDirectorCertificate}</div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>المدربين</h3>
          <table>
            <thead>
              <tr>
                <th>الصنف</th>
                <th>الاسم واللقب</th>
                <th>الشهادة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>صنف أكابر / أواسط</td>
                <td>${formData.seniorCoach}</td>
                <td>${formData.seniorCoachCertificate}</td>
              </tr>
              <tr>
                <td>صنف أشبال / أصاغر</td>
                <td>${formData.juniorCoach}</td>
                <td>${formData.juniorCoachCertificate}</td>
              </tr>
              <tr>
                <td>صنف مدارس</td>
                <td>${formData.youthCoach}</td>
                <td>${formData.youthCoachCertificate}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="form-section">
          <p><strong>ملاحظة:</strong> على المدربين المدرجين في هذه الاستمارة أن يكونوا حائزين على شهادة معتمدة من وزارة الشباب والرياضة للحصول على ترخيص تدريب مسلم من طرف الرابطة للموسم الرياضي الحالي.</p>
          <div class="form-row">
            <div class="form-field">
              <div class="value no-border">${formData.note}</div>
            </div>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-row">
            <div class="signature-box">
              <strong>ختم وتوقيع الرئيس</strong>
            </div>
            <div class="signature-box">
              <strong>تاريخ الإيداع: ${formData.submissionDate}</strong>
            </div>
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
            <Card.Header className="bg-info text-white">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center" dir="rtl">
                        <i className="fas fa-file-contract me-2"></i>
                        <span className="me-2">إنخراط - إلتزام للموسم الرياضي</span>
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
                {/* تسمية النادي */}
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0" dir="rtl">تسمية النادي</h6>
                    </Card.Header>
                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label dir="rtl">النادي:</Form.Label>
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
                                    <Form.Label dir="rtl">الهاتف:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                        placeholder="رقم الهاتف"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">البريد الإلكتروني:</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        placeholder="البريد الإلكتروني"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">تاريخ الاعتماد:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.accreditationDate}
                                        onChange={(e) => updateField('accreditationDate', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">رقم الاعتماد:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.accreditationNumber}
                                        onChange={(e) => updateField('accreditationNumber', e.target.value)}
                                        placeholder="رقم الاعتماد"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label dir="rtl">رقم الحساب البنكي:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.bankAccountNumber}
                                        onChange={(e) => updateField('bankAccountNumber', e.target.value)}
                                        placeholder="رقم الحساب البنكي"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* ألقاب وأسماء مسيري النادي */}
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0" dir="rtl">ألقاب وأسماء مسيري النادي</h6>
                    </Card.Header>
                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">رئيس النادي:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.president}
                                        onChange={(e) => updateField('president', e.target.value)}
                                        placeholder="اسم رئيس النادي"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">الهاتف:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.presidentPhone}
                                        onChange={(e) => updateField('presidentPhone', e.target.value)}
                                        placeholder="رقم هاتف الرئيس"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">الكاتب العام:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.generalSecretary}
                                        onChange={(e) => updateField('generalSecretary', e.target.value)}
                                        placeholder="اسم الكاتب العام"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">الهاتف:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.generalSecretaryPhone}
                                        onChange={(e) => updateField('generalSecretaryPhone', e.target.value)}
                                        placeholder="رقم هاتف الكاتب العام"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">أمين المال:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.treasurer}
                                        onChange={(e) => updateField('treasurer', e.target.value)}
                                        placeholder="اسم أمين المال"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">الهاتف:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.treasurerPhone}
                                        onChange={(e) => updateField('treasurerPhone', e.target.value)}
                                        placeholder="رقم هاتف أمين المال"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* التأطير الفني */}
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0" dir="rtl">التأطير الفني</h6>
                    </Card.Header>
                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">المدير الفني الرياضي:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.technicalDirector}
                                        onChange={(e) => updateField('technicalDirector', e.target.value)}
                                        placeholder="اسم المدير الفني الرياضي"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">الشهادة:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.technicalDirectorCertificate}
                                        onChange={(e) => updateField('technicalDirectorCertificate', e.target.value)}
                                        placeholder="نوع الشهادة"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* المدربين */}
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0" dir="rtl">المدربين</h6>
                    </Card.Header>
                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">صنف أكابر / أواسط:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.seniorCoach}
                                        onChange={(e) => updateField('seniorCoach', e.target.value)}
                                        placeholder="اسم المدرب"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">الشهادة:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.seniorCoachCertificate}
                                        onChange={(e) => updateField('seniorCoachCertificate', e.target.value)}
                                        placeholder="نوع الشهادة"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">صنف أشبال / أصاغر:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.juniorCoach}
                                        onChange={(e) => updateField('juniorCoach', e.target.value)}
                                        placeholder="اسم المدرب"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">الشهادة:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.juniorCoachCertificate}
                                        onChange={(e) => updateField('juniorCoachCertificate', e.target.value)}
                                        placeholder="نوع الشهادة"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">صنف مدارس:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.youthCoach}
                                        onChange={(e) => updateField('youthCoach', e.target.value)}
                                        placeholder="اسم المدرب"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">الشهادة:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.youthCoachCertificate}
                                        onChange={(e) => updateField('youthCoachCertificate', e.target.value)}
                                        placeholder="نوع الشهادة"
                                        dir="rtl"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* ملاحظة */}
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0" dir="rtl">ملاحظة</h6>
                    </Card.Header>
                    <Card.Body>
                        <div className="alert alert-info" dir="rtl">
                            <strong>ملاحظة:</strong> على المدربين المدرجين في هذه الاستمارة أن يكونوا حائزين على شهادة معتمدة من وزارة الشباب والرياضة للحصول على ترخيص تدريب مسلم من طرف الرابطة للموسم الرياضي الحالي.
                        </div>
                        <Form.Group>
                            <Form.Label dir="rtl">ملاحظات إضافية:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.note}
                                onChange={(e) => updateField('note', e.target.value)}
                                placeholder="أي ملاحظات إضافية..."
                                dir="rtl"
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>

                {/* تاريخ الإيداع */}
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0" dir="rtl">تاريخ الإيداع</h6>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label dir="rtl">تاريخ الإيداع:</Form.Label>
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

export default RespectCommitmentForm;