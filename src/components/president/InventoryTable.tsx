import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table, Button } from 'react-bootstrap';

interface InventoryItem {
  id: string;
  orderNumber: string;
  registrationNumber: string;
  assetName: string;
  theoreticalCount: string;
  actualCount: string;
  difference: string;
  analysis: string;
  assetOrigin: string;
  allocation: string;
}

const InventoryTable: React.FC = () => {
  const [formData, setFormData] = useState({
    state: 'سطيف',
    associationName: '',
    season: '',
    year: '',
    items: [
      {
        id: '1',
        orderNumber: '',
        registrationNumber: '',
        assetName: '',
        theoreticalCount: '',
        actualCount: '',
        difference: '',
        analysis: '',
        assetOrigin: '',
        allocation: ''
      }
    ]
  });

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateItem = (id: string, field: string, value: string) => {
    const updated = formData.items.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        // حساب الفرق تلقائياً
        if (field === 'theoreticalCount' || field === 'actualCount') {
          const theoretical = parseFloat(newItem.theoreticalCount) || 0;
          const actual = parseFloat(newItem.actualCount) || 0;
          newItem.difference = (theoretical - actual).toString();
        }
        return newItem;
      }
      return item;
    });
    setFormData({ ...formData, items: updated });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: Date.now().toString(),
          orderNumber: '',
          registrationNumber: '',
          assetName: '',
          theoreticalCount: '',
          actualCount: '',
          difference: '',
          analysis: '',
          assetOrigin: '',
          allocation: ''
        }
      ]
    });
  };

  const deleteItem = (id: string) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter(item => item.id !== id)
      });
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <div className="text-center mb-3">
          <p className="mb-2"><strong>الجمهورية الجزائرية الديمقراطية الشعبية</strong></p>
          <p className="mb-3"><strong></strong></p>
          <h2>جدول الجرد</h2>
        </div>
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
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>تعيين الجمعية:</Form.Label>
                    <Form.Control
                      value={formData.associationName}
                      onChange={(e) => updateForm('associationName', e.target.value)}
                      placeholder="أدخل اسم الجمعية"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الموسم:</Form.Label>
                    <Form.Control
                      value={formData.season}
                      onChange={(e) => updateForm('season', e.target.value)}
                      placeholder="الموسم"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>السنة:</Form.Label>
                    <Form.Control
                      value={formData.year}
                      onChange={(e) => updateForm('year', e.target.value)}
                      placeholder="السنة"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* جدول الجرد */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">تفاصيل الجرد</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <Table bordered hover size="sm" style={{ minWidth: '1400px', marginBottom: 0 }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '70px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>رقم الترتيب</div>
                      </th>
                      <th style={{ width: '110px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>رقم التسجيل على السجل</div>
                      </th>
                      <th style={{ width: '140px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>تعيين الأملاك المجرودة</div>
                      </th>
                      <th style={{ width: '90px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>العدد النظري</div>
                      </th>
                      <th style={{ width: '90px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>العدد المادي</div>
                      </th>
                      <th style={{ width: '70px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الفرق</div>
                      </th>
                      <th style={{ width: '150px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>تحليل الفوارق إن وجدت</div>
                      </th>
                      <th style={{ width: '120px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>أصل الأملاك</div>
                      </th>
                      <th style={{ width: '120px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>التخصيص</div>
                      </th>
                      <th style={{ width: '60px', textAlign: 'center' }}>الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ width: '70px' }}>
                          <Form.Control
                            size="sm"
                            value={item.orderNumber}
                            onChange={(e) => updateItem(item.id, 'orderNumber', e.target.value)}
                            placeholder="الرقم"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '110px' }}>
                          <Form.Control
                            size="sm"
                            value={item.registrationNumber}
                            onChange={(e) => updateItem(item.id, 'registrationNumber', e.target.value)}
                            placeholder="الرقم"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '140px' }}>
                          <Form.Control
                            size="sm"
                            value={item.assetName}
                            onChange={(e) => updateItem(item.id, 'assetName', e.target.value)}
                            placeholder="التعيين"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '90px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={item.theoreticalCount}
                            onChange={(e) => updateItem(item.id, 'theoreticalCount', e.target.value)}
                            placeholder="0"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '90px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={item.actualCount}
                            onChange={(e) => updateItem(item.id, 'actualCount', e.target.value)}
                            placeholder="0"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '70px' }}>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={item.difference}
                            readOnly
                            className="bg-light"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '150px' }}>
                          <Form.Control
                            size="sm"
                            as="textarea"
                            rows={1}
                            value={item.analysis}
                            onChange={(e) => updateItem(item.id, 'analysis', e.target.value)}
                            placeholder="التحليل"
                            style={{ fontSize: '0.85rem', resize: 'vertical' }}
                          />
                        </td>
                        <td style={{ width: '120px' }}>
                          <Form.Control
                            size="sm"
                            value={item.assetOrigin}
                            onChange={(e) => updateItem(item.id, 'assetOrigin', e.target.value)}
                            placeholder="الأصل"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '120px' }}>
                          <Form.Control
                            size="sm"
                            value={item.allocation}
                            onChange={(e) => updateItem(item.id, 'allocation', e.target.value)}
                            placeholder="التخصيص"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '60px', textAlign: 'center' }}>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => deleteItem(item.id)}
                            disabled={formData.items.length === 1}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <button
                className="btn btn-sm btn-outline-success mt-2"
                onClick={addItem}
              >
                <i className="fas fa-plus me-2"></i>
                إضافة عنصر
              </button>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InventoryTable;
