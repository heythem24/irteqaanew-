import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table, Button } from 'react-bootstrap';

interface EquipmentItem {
  id: string;
  order: string;
  designation: string;
  quantity: string;
  unitValue: string;
  total: string;
  notes: string;
}

const PhysicalDischarge: React.FC = () => {
  const [formData, setFormData] = useState({
    associationName: '',
    address: '',
    witnessName: '',
    witnessPosition: '',
    idNumber: '',
    idIssueDate: '',
    idIssuingAuthority: '',
    receivedFrom: '',
    equipment: [
      {
        id: '1',
        order: '',
        designation: '',
        quantity: '',
        unitValue: '',
        total: '',
        notes: ''
      }
    ],
    place: '',
    date: '',
    municipalityApproval: false,
    institutionApproval: false
  });

  const updateForm = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateEquipment = (id: string, field: string, value: string) => {
    const updated = formData.equipment.map(eq => {
      if (eq.id === id) {
        const newEq = { ...eq, [field]: value };
        // حساب المجموع تلقائياً
        if (field === 'quantity' || field === 'unitValue') {
          const qty = parseFloat(newEq.quantity) || 0;
          const price = parseFloat(newEq.unitValue) || 0;
          newEq.total = (qty * price).toFixed(2);
        }
        return newEq;
      }
      return eq;
    });
    setFormData({ ...formData, equipment: updated });
  };

  const addEquipment = () => {
    setFormData({
      ...formData,
      equipment: [
        ...formData.equipment,
        {
          id: Date.now().toString(),
          order: '',
          designation: '',
          quantity: '',
          unitValue: '',
          total: '',
          notes: ''
        }
      ]
    });
  };

  const deleteEquipment = (id: string) => {
    if (formData.equipment.length > 1) {
      setFormData({
        ...formData,
        equipment: formData.equipment.filter(eq => eq.id !== id)
      });
    }
  };

  const calculateGrandTotal = () => {
    return formData.equipment.reduce((sum, eq) => {
      return sum + (parseFloat(eq.total) || 0);
    }, 0).toFixed(2);
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="text-center mb-3">مخالصة مادية - Décharge physique</h2>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4" dir="rtl">
          {/* معلومات الرأس */}
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">معلومات عامة</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>تعيين الجمعية/ الهيئة/ المؤسسة:</Form.Label>
                    <Form.Control
                      value={formData.associationName}
                      onChange={(e) => updateForm('associationName', e.target.value)}
                      placeholder="أدخل اسم الجمعية"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>العنوان:</Form.Label>
                    <Form.Control
                      value={formData.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      placeholder="أدخل العنوان"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* بيانات الشاهد */}
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">بيانات الشاهد / المستلم</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>يشهد السيد (ة):</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.witnessName}
                      onChange={(e) => updateForm('witnessName', e.target.value)}
                      placeholder="اسم الشاهد"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الصفة:</Form.Label>
                    <Form.Control
                      value={formData.witnessPosition}
                      onChange={(e) => updateForm('witnessPosition', e.target.value)}
                      placeholder="الصفة"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>رقم بطاقة التعريف:</Form.Label>
                    <Form.Control
                      value={formData.idNumber}
                      onChange={(e) => updateForm('idNumber', e.target.value)}
                      placeholder="رقم البطاقة"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الصادرة بتاريخ:</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.idIssueDate}
                      onChange={(e) => updateForm('idIssueDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>من طرف دائرة:</Form.Label>
                    <Form.Control
                      value={formData.idIssuingAuthority}
                      onChange={(e) => updateForm('idIssuingAuthority', e.target.value)}
                      placeholder="جهة الإصدار"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>بأنني استلمت من لدن:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.receivedFrom}
                      onChange={(e) => updateForm('receivedFrom', e.target.value)}
                      placeholder="من استلمت منه"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* جدول العتاد */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">العتاد، الوسائل أو اللوازم</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table bordered hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>الترتيب</th>
                      <th>التعيين</th>
                      <th>الكمية</th>
                      <th>قيمة الوحدة</th>
                      <th>المجموع</th>
                      <th>الملاحظات</th>
                      <th>الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.equipment.map((eq) => (
                      <tr key={eq.id}>
                        <td>
                          <Form.Control
                            size="sm"
                            value={eq.order}
                            onChange={(e) => updateEquipment(eq.id, 'order', e.target.value)}
                            placeholder="الترتيب"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={eq.designation}
                            onChange={(e) => updateEquipment(eq.id, 'designation', e.target.value)}
                            placeholder="التعيين"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={eq.quantity}
                            onChange={(e) => updateEquipment(eq.id, 'quantity', e.target.value)}
                            placeholder="الكمية"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={eq.unitValue}
                            onChange={(e) => updateEquipment(eq.id, 'unitValue', e.target.value)}
                            placeholder="القيمة"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={eq.total}
                            readOnly
                            className="bg-light"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={eq.notes}
                            onChange={(e) => updateEquipment(eq.id, 'notes', e.target.value)}
                            placeholder="ملاحظات"
                          />
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => deleteEquipment(eq.id)}
                            disabled={formData.equipment.length === 1}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <button
                className="btn btn-sm btn-outline-success mt-2"
                onClick={addEquipment}
              >
                <i className="fas fa-plus me-2"></i>
                إضافة عتاد
              </button>

              <div className="alert alert-info mt-3">
                <strong>المجموع الإجمالي:</strong>
                <h5 className="text-success mt-2">{calculateGrandTotal()} دج</h5>
              </div>
            </Card.Body>
          </Card>

          {/* ملاحظات */}
          <Card className="mb-4 border-warning">
            <Card.Header className="bg-warning text-dark">
              <h6 className="mb-0">ملاحظات مهمة</h6>
            </Card.Header>
            <Card.Body className="bg-light">
              <p className="mb-2">
                <strong>يشهد المستلم الممضي أسفله على صحة المعلومات المدونة بالمخالصة، وبذلك تمنح تبرئة الذمة للجهة المانحة.</strong>
              </p>
              <p className="mb-0">
                <strong>تم تحرير هذه المخالصة في 03 نسخ أصلية:</strong>
              </p>
              <ul className="mb-0 mt-2">
                <li>كل جهة تحتفظ بواحدة</li>
                <li>النسخة الأخرى يتم حفظها بالأرشيف للجهة المستلمة أو تسلم لجهة أخرى تكون طرف مباشر في هذه العملية</li>
              </ul>
            </Card.Body>
          </Card>

          {/* التوقيعات والمصادقة */}
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

              <div className="alert alert-info mb-3">
                <strong>المصادقة:</strong>
              </div>

              <Row className="mb-3">
                <Col md={6}>
                  <Card className="border-info">
                    <Card.Header className="bg-info text-white">
                      <Form.Check
                        type="checkbox"
                        label="المصادقة لدى مصالح البلدية (بالنسبة للأشخاص الطبيعيين)"
                        checked={formData.municipalityApproval}
                        onChange={(e) => updateForm('municipalityApproval', e.target.checked)}
                      />
                    </Card.Header>
                    <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-success">
                    <Card.Header className="bg-success text-white">
                      <Form.Check
                        type="checkbox"
                        label="بالنسبة للمؤسسات / الهيئات (الإمضاء والختم)"
                        checked={formData.institutionApproval}
                        onChange={(e) => updateForm('institutionApproval', e.target.checked)}
                      />
                    </Card.Header>
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

export default PhysicalDischarge;
