import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table } from 'react-bootstrap';

const MissionExpenseStatus: React.FC = () => {
  const [formData, setFormData] = useState({
    state: '',
    clubName: '',
    missionDescription: '',
    lastName: '',
    firstName: '',
    position: '',
    transportExpenses: '',
    foodExpenses: '',
    accommodationExpenses: '',
    totalAmount: '',
    totalAmountWords: '',
    missions: [
      {
        mission: '',
        route: '',
        departureDate: '',
        returnDate: '',
        transportMethod: '',
        kilometers: '',
        days: '',
        nights: '',
        meals: ''
      }
    ]
  });

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateMission = (index: number, field: string, value: string) => {
    const newMissions = [...formData.missions];
    newMissions[index] = { ...newMissions[index], [field]: value };
    setFormData({ ...formData, missions: newMissions });
  };

  const addMission = () => {
    setFormData({
      ...formData,
      missions: [
        ...formData.missions,
        {
          mission: '',
          route: '',
          departureDate: '',
          returnDate: '',
          transportMethod: '',
          kilometers: '',
          days: '',
          nights: '',
          meals: ''
        }
      ]
    });
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="text-center mb-3">حالة مصاريف الأمر بمهمة</h2>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4" dir="rtl">
          {/* رأس الصفحة */}
          <div className="text-center mb-4 pb-3 border-bottom">
            <p className="mb-2"><strong>الجمهورية الجزائرية الديمقراطية الشعبية</strong></p>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>ولاية:</Form.Label>
                  <Form.Control
                    value={formData.state}
                    onChange={(e) => updateForm('state', e.target.value)}
                    placeholder="أدخل اسم الولاية"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>النادي الرياضي الهاوي:</Form.Label>
                  <Form.Control
                    value={formData.clubName}
                    onChange={(e) => updateForm('clubName', e.target.value)}
                    placeholder="أدخل اسم النادي"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* معلومات المستفيد */}
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">معلومات المستفيد</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>الاسم الأول:</Form.Label>
                    <Form.Control
                      value={formData.firstName}
                      onChange={(e) => updateForm('firstName', e.target.value)}
                      placeholder="الاسم الأول"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>اللقب:</Form.Label>
                    <Form.Control
                      value={formData.lastName}
                      onChange={(e) => updateForm('lastName', e.target.value)}
                      placeholder="اللقب"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>الصفة:</Form.Label>
                    <Form.Control
                      value={formData.position}
                      onChange={(e) => updateForm('position', e.target.value)}
                      placeholder="الصفة"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>وصف المهمة:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.missionDescription}
                      onChange={(e) => updateForm('missionDescription', e.target.value)}
                      placeholder="وصف المهمة"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* جدول المهام */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">تفاصيل المهام</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <Table bordered hover size="sm" style={{ minWidth: '1200px', marginBottom: 0 }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '100px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>المهمة</div>
                      </th>
                      <th style={{ width: '120px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>تعيين المسار</div>
                      </th>
                      <th style={{ width: '110px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>تاريخ الذهاب</div>
                      </th>
                      <th style={{ width: '120px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>وسيلة النقل</div>
                      </th>
                      <th style={{ width: '110px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>تاريخ الرجوع</div>
                      </th>
                      <th style={{ width: '100px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الكيلومترات</div>
                      </th>
                      <th style={{ width: '80px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الأيام</div>
                      </th>
                      <th style={{ width: '80px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الليالي</div>
                      </th>
                      <th style={{ width: '80px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الوجبات</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.missions.map((mission, index) => (
                      <tr key={index}>
                        <td style={{ width: '100px' }}>
                          <Form.Control
                            size="sm"
                            value={mission.mission}
                            onChange={(e) => updateMission(index, 'mission', e.target.value)}
                            placeholder="المهمة"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '120px' }}>
                          <Form.Control
                            size="sm"
                            value={mission.route}
                            onChange={(e) => updateMission(index, 'route', e.target.value)}
                            placeholder="المسار"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '110px' }}>
                          <Form.Control
                            size="sm"
                            type="date"
                            value={mission.departureDate}
                            onChange={(e) => updateMission(index, 'departureDate', e.target.value)}
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '120px' }}>
                          <Form.Control
                            size="sm"
                            value={mission.transportMethod}
                            onChange={(e) => updateMission(index, 'transportMethod', e.target.value)}
                            placeholder="وسيلة النقل"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '110px' }}>
                          <Form.Control
                            size="sm"
                            type="date"
                            value={mission.returnDate}
                            onChange={(e) => updateMission(index, 'returnDate', e.target.value)}
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '100px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={mission.kilometers}
                            onChange={(e) => updateMission(index, 'kilometers', e.target.value)}
                            placeholder="كم"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '80px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={mission.days}
                            onChange={(e) => updateMission(index, 'days', e.target.value)}
                            placeholder="أيام"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '80px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={mission.nights}
                            onChange={(e) => updateMission(index, 'nights', e.target.value)}
                            placeholder="ليالي"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '80px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={mission.meals}
                            onChange={(e) => updateMission(index, 'meals', e.target.value)}
                            placeholder="وجبات"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <button
                className="btn btn-sm btn-outline-success mt-2"
                onClick={addMission}
              >
                <i className="fas fa-plus me-2"></i>
                إضافة مهمة
              </button>
            </Card.Body>
          </Card>

          {/* ملخص المصاريف */}
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">ملخص المصاريف</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>1- المصاريف الإجمالية للنقل:</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="number"
                        value={formData.transportExpenses}
                        onChange={(e) => updateForm('transportExpenses', e.target.value)}
                        placeholder="0.00"
                      />
                      <span className="input-group-text">دج</span>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>2- المصاريف الإجمالية للإطعام:</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="number"
                        value={formData.foodExpenses}
                        onChange={(e) => updateForm('foodExpenses', e.target.value)}
                        placeholder="0.00"
                      />
                      <span className="input-group-text">دج</span>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>3- المصاريف الإجمالية للإيواء:</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="number"
                        value={formData.accommodationExpenses}
                        onChange={(e) => updateForm('accommodationExpenses', e.target.value)}
                        placeholder="0.00"
                      />
                      <span className="input-group-text">دج</span>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <div className="alert alert-warning mt-3">
                <strong>المبلغ الإجمالي للمهمة:</strong>
                <Row className="mt-2">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>بالأرقام:</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          value={formData.totalAmount}
                          onChange={(e) => updateForm('totalAmount', e.target.value)}
                          placeholder="0.00"
                        />
                        <span className="input-group-text">دج</span>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>بالأحرف:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.totalAmountWords}
                        onChange={(e) => updateForm('totalAmountWords', e.target.value)}
                        placeholder="اكتب المبلغ بالحروف"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>

          {/* التوقيعات */}
          <Card className="border-secondary">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">توقيع المستفيد (ة)</Card.Header>
                    <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">توقيع رئيس النادي</Card.Header>
                    <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">توقيع أمين المال</Card.Header>
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

export default MissionExpenseStatus;
