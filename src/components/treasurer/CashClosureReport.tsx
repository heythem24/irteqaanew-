import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table } from 'react-bootstrap';

const CashClosureReport: React.FC = () => {
  const [formData, setFormData] = useState({
    season: '',
    periodFrom: '',
    periodTo: '',
    exercice: '',
    designation: '',
    associationName: '',
    closureDate: '',
    balance: '',
    balanceWords: '',
    place: '',
    date: ''
  });

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="text-center mb-3">محضر قفل الصندوق - PV de clôture de la caisse</h2>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4" dir="rtl">
          {/* جدول المعلومات العامة */}
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">معلومات عامة</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table bordered size="sm" style={{ minWidth: '750px' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: '120px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>الموسم</th>
                      <th style={{ minWidth: '140px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>الفترة من</th>
                      <th style={{ minWidth: '140px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>الفترة إلى</th>
                      <th style={{ minWidth: '150px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>Exercice</th>
                      <th style={{ minWidth: '200px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>Désignation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <Form.Control
                          size="sm"
                          value={formData.season}
                          onChange={(e) => updateForm('season', e.target.value)}
                          placeholder="الموسم"
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="date"
                          value={formData.periodFrom}
                          onChange={(e) => updateForm('periodFrom', e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="date"
                          value={formData.periodTo}
                          onChange={(e) => updateForm('periodTo', e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          value={formData.exercice}
                          onChange={(e) => updateForm('exercice', e.target.value)}
                          placeholder="Exercice"
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          value={formData.designation}
                          onChange={(e) => updateForm('designation', e.target.value)}
                          placeholder="Désignation"
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* محتوى المحضر */}
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">محتوى المحضر</h5>
            </Card.Header>
            <Card.Body>
              <div className="alert alert-light">
                <p className="mb-3">
                  <strong>يشهد رئيس و أمين مال:</strong>
                </p>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>اسم الجمعية / المؤسسة:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.associationName}
                        onChange={(e) => updateForm('associationName', e.target.value)}
                        placeholder="اسم الجمعية"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="alert alert-warning">
                  <p className="mb-3">
                    <strong>أن الرصيد المتبقي بحساب الصندوق لتاريخ قفله، يقدر بـ:</strong>
                  </p>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label><strong>المبلغ (دج):</strong></Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type="number"
                            value={formData.balance}
                            onChange={(e) => updateForm('balance', e.target.value)}
                            placeholder="0.00"
                          />
                          <span className="input-group-text">دج</span>
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label><strong>بالأحرف:</strong></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={formData.balanceWords}
                          onChange={(e) => updateForm('balanceWords', e.target.value)}
                          placeholder="اكتب المبلغ بالحروف"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="alert alert-info">
                  <p className="mb-0">
                    <strong>وهو مطابق لما تم تقييده على سجل الصندوق و التقرير المالي للفترة المشار إليها في الأعلى.</strong>
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* التوقيعات */}
          <Card className="border-secondary">
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>حرر بـ:</Form.Label>
                    <Form.Control
                      value={formData.place}
                      onChange={(e) => updateForm('place', e.target.value)}
                      placeholder="المدينة"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>في:</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateForm('date', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">أمين المال</Card.Header>
                    <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">الرئيس</Card.Header>
                    <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CashClosureReport;
