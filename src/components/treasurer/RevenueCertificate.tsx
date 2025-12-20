import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table, Button } from 'react-bootstrap';

const RevenueCertificate: React.FC = () => {
    const [formData, setFormData] = useState({
        associationName: '',
        address: '',
        season: '',
        totalAmount: '',
        totalAmountWords: '',
        accountType: '',
        revenueDescription: '',
        documentType: '',
        otherReason: '',
        missingDocumentation: '',
        revenues: [
            {
                id: '1',
                date: '',
                source: '',
                amount: '',
                accountNumber: ''
            }
        ],
        place: '',
        date: ''
    });

    const updateForm = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const updateRevenue = (id: string, field: string, value: string) => {
        const updated = formData.revenues.map(rev => {
            if (rev.id === id) {
                return { ...rev, [field]: value };
            }
            return rev;
        });
        setFormData({ ...formData, revenues: updated });
    };

    const addRevenue = () => {
        setFormData({
            ...formData,
            revenues: [
                ...formData.revenues,
                {
                    id: Date.now().toString(),
                    date: '',
                    source: '',
                    amount: '',
                    accountNumber: ''
                }
            ]
        });
    };

    const deleteRevenue = (id: string) => {
        if (formData.revenues.length > 1) {
            setFormData({
                ...formData,
                revenues: formData.revenues.filter(rev => rev.id !== id)
            });
        }
    };

    const calculateTotal = () => {
        return formData.revenues.reduce((sum, rev) => {
            return sum + (parseFloat(rev.amount) || 0);
        }, 0).toFixed(2);
    };

    return (
        <Container fluid className="py-4">
            <div className="mb-4">
                <h2 className="text-center mb-3">شهادة إدارية لإثبات مصدر الإيرادات</h2>
            </div>

            <Card className="shadow-sm">
                <Card.Body className="p-4" dir="rtl">
                    {/* رأس الشهادة */}
                    <Card className="mb-4 border-primary">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">معلومات الشهادة</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>إسم الجمعية:</Form.Label>
                                        <Form.Control
                                            value={formData.associationName}
                                            onChange={(e) => updateForm('associationName', e.target.value)}
                                            placeholder="أدخل اسم الجمعية"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>العنوان (المقر):</Form.Label>
                                        <Form.Control
                                            value={formData.address}
                                            onChange={(e) => updateForm('address', e.target.value)}
                                            placeholder="أدخل العنوان"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>الموسم:</Form.Label>
                                        <Form.Control
                                            value={formData.season}
                                            onChange={(e) => updateForm('season', e.target.value)}
                                            placeholder="أدخل الموسم"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* بيانات الإيرادات */}
                    <Card className="mb-4 border-info">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">بيانات الإيرادات</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="alert alert-light">
                                <p className="mb-3">
                                    <strong>يشهد كل من رئيس و أمين مال الـ:</strong>
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

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label><strong>المبلغ المحصل:</strong></Form.Label>
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
                                            <Form.Label><strong>بالأحرف:</strong></Form.Label>
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

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label><strong>نوع الحساب:</strong></Form.Label>
                                            <Form.Select
                                                value={formData.accountType}
                                                onChange={(e) => updateForm('accountType', e.target.value)}
                                            >
                                                <option value="">اختر نوع الحساب</option>
                                                <option value="bank">البنكي</option>
                                                <option value="treasury">الخزينة</option>
                                                <option value="postal">الحساب الجاري البريدي</option>
                                                <option value="cash">الصندوق</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label><strong>يمثل:</strong></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                value={formData.revenueDescription}
                                                onChange={(e) => updateForm('revenueDescription', e.target.value)}
                                                placeholder="وصف مصدر الإيراد"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label><strong>من:</strong></Form.Label>
                                            <Form.Select
                                                value={formData.documentType}
                                                onChange={(e) => updateForm('documentType', e.target.value)}
                                            >
                                                <option value="">اختر نوع الوثيقة</option>
                                                <option value="contract">العقد</option>
                                                <option value="agreement">الاتفاقية</option>
                                                <option value="transfer">أمر بالتحويل</option>
                                                <option value="other">أخرى</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>تفاصيل أخرى:</Form.Label>
                                            <Form.Control
                                                value={formData.otherReason}
                                                onChange={(e) => updateForm('otherReason', e.target.value)}
                                                placeholder="تفاصيل إضافية"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label><strong>ملاحظات حول الوثائق:</strong></Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.missingDocumentation}
                                        onChange={(e) => updateForm('missingDocumentation', e.target.value)}
                                        placeholder="لم نستلم نسخة من أجل إثبات ذلك، و هو أمر خارج عن إرادتنا"
                                    />
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* جدول الإيرادات */}
                    <Card className="mb-4 border-success">
                        <Card.Header className="bg-success text-white">
                            <h5 className="mb-0">تفاصيل الإيرادات</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                <Table bordered hover size="sm" style={{ minWidth: '900px', marginBottom: 0 }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: '80px', textAlign: 'center' }}>
                                                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>التاريخ</div>
                                            </th>
                                            <th style={{ width: '150px', textAlign: 'center' }}>
                                                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>مصدر الإيرادات / الجهة الممولة</div>
                                            </th>
                                            <th style={{ width: '120px', textAlign: 'center' }}>
                                                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>المبلغ المحصل</div>
                                            </th>
                                            <th style={{ width: '130px', textAlign: 'center' }}>
                                                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>رقم الحساب المدون به</div>
                                            </th>
                                            <th style={{ width: '60px', textAlign: 'center' }}>الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.revenues.map((revenue) => (
                                            <tr key={revenue.id}>
                                                <td style={{ width: '80px' }}>
                                                    <Form.Control
                                                        size="sm"
                                                        type="date"
                                                        value={revenue.date}
                                                        onChange={(e) => updateRevenue(revenue.id, 'date', e.target.value)}
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ width: '150px' }}>
                                                    <Form.Control
                                                        size="sm"
                                                        value={revenue.source}
                                                        onChange={(e) => updateRevenue(revenue.id, 'source', e.target.value)}
                                                        placeholder="مصدر الإيراد"
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ width: '120px' }}>
                                                    <Form.Control
                                                        size="sm"
                                                        type="number"
                                                        value={revenue.amount}
                                                        onChange={(e) => updateRevenue(revenue.id, 'amount', e.target.value)}
                                                        placeholder="0.00"
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ width: '130px' }}>
                                                    <Form.Control
                                                        size="sm"
                                                        value={revenue.accountNumber}
                                                        onChange={(e) => updateRevenue(revenue.id, 'accountNumber', e.target.value)}
                                                        placeholder="رقم الحساب"
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ width: '60px', textAlign: 'center' }}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        onClick={() => deleteRevenue(revenue.id)}
                                                        disabled={formData.revenues.length === 1}
                                                        style={{ padding: '0.25rem 0.5rem' }}
                                                    >
                                                        <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="table-light fw-bold">
                                            <td colSpan={2}>المجموع</td>
                                            <td>{calculateTotal()} دج</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                            <button
                                className="btn btn-sm btn-outline-success mt-2"
                                onClick={addRevenue}
                            >
                                <i className="fas fa-plus me-2"></i>
                                إضافة إيراد
                            </button>
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
                                <Col md={4}>
                                    <Card className="text-center">
                                        <Card.Header className="bg-light">تأشيرة أمين المال</Card.Header>
                                        <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="text-center">
                                        <Card.Header className="bg-light">الرئيس</Card.Header>
                                        <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="text-center">
                                        <Card.Header className="bg-light">ملاحظات</Card.Header>
                                        <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <div className="alert alert-info mt-3">
                                <strong>ملاحظة مهمة:</strong> نتحمل كامل المسؤولية بموجب هذه الشهادة الإدارية.
                            </div>
                        </Card.Body>
                    </Card>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RevenueCertificate;
