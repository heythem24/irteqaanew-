import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table, Button } from 'react-bootstrap';

interface ExpenseItem {
    id: string;
    number: string;
    chapitre: string;
    chapter: string;
    accountNumber: string;
    amount: string;
    beneficiaryName: string;
}

const OperationReport: React.FC = () => {
    const [formData, setFormData] = useState({
        associationName: '',
        mandatNumber: '',
        accountNumber: '',
        year: '',
        chapitre: 'CAISSE',
        operationType: '',
        operationDate: '',
        transportMeans: '',
        operationPlace: '',
        supervisor: '',
        supervisorPosition: '',
        beneficiariesCount: '',
        accompaniesCount: '',
        totalPersons: '',
        care: '',
        coordination: '',
        results: '',
        foodCost: '',
        accommodationCost: '',
        otherCosts: '',
        operationEndDate: '',
        expenses: [
            {
                id: '1',
                number: '',
                chapitre: '',
                chapter: '',
                accountNumber: '',
                amount: '',
                beneficiaryName: ''
            }
        ],
        place: '',
        date: ''
    });

    const updateForm = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const updateExpense = (id: string, field: string, value: string) => {
        const updated = formData.expenses.map(exp => {
            if (exp.id === id) {
                return { ...exp, [field]: value };
            }
            return exp;
        });
        setFormData({ ...formData, expenses: updated });
    };

    const addExpense = () => {
        setFormData({
            ...formData,
            expenses: [
                ...formData.expenses,
                {
                    id: Date.now().toString(),
                    number: '',
                    chapitre: '',
                    chapter: '',
                    accountNumber: '',
                    amount: '',
                    beneficiaryName: ''
                }
            ]
        });
    };

    const deleteExpense = (id: string) => {
        if (formData.expenses.length > 1) {
            setFormData({
                ...formData,
                expenses: formData.expenses.filter(exp => exp.id !== id)
            });
        }
    };

    const calculateTotal = () => {
        return formData.expenses.reduce((sum, exp) => {
            return sum + (parseFloat(exp.amount) || 0);
        }, 0).toFixed(2);
    };

    return (
        <Container fluid className="py-4">
            <div className="mb-4">
                <h2 className="text-center mb-3">عرض حال - Compte rendu</h2>
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
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>حوالة رقم / Mandat N°:</Form.Label>
                                        <Form.Control
                                            value={formData.mandatNumber}
                                            onChange={(e) => updateForm('mandatNumber', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>N° de compte:</Form.Label>
                                        <Form.Control
                                            value={formData.accountNumber}
                                            onChange={(e) => updateForm('accountNumber', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>ANNEE:</Form.Label>
                                        <Form.Control
                                            value={formData.year}
                                            onChange={(e) => updateForm('year', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>CHAPITRE:</Form.Label>
                                        <Form.Control
                                            value={formData.chapitre}
                                            onChange={(e) => updateForm('chapitre', e.target.value)}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* تفاصيل العملية */}
                    <Card className="mb-4 border-info">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">تفاصيل العملية</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>طبيعة العملية:</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={formData.operationType}
                                            onChange={(e) => updateForm('operationType', e.target.value)}
                                            placeholder="وصف طبيعة العملية"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>تاريخ العملية:</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={formData.operationDate}
                                            onChange={(e) => updateForm('operationDate', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>وسائل النقل المستعملة:</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={formData.transportMeans}
                                            onChange={(e) => updateForm('transportMeans', e.target.value)}
                                            placeholder="وسائل النقل"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>مكان إجراء العملية:</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={formData.operationPlace}
                                            onChange={(e) => updateForm('operationPlace', e.target.value)}
                                            placeholder="مكان العملية"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>المشرف على العملية:</Form.Label>
                                        <Form.Control
                                            value={formData.supervisor}
                                            onChange={(e) => updateForm('supervisor', e.target.value)}
                                            placeholder="اسم المشرف"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>الصفة:</Form.Label>
                                        <Form.Control
                                            value={formData.supervisorPosition}
                                            onChange={(e) => updateForm('supervisorPosition', e.target.value)}
                                            placeholder="الصفة"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>عدد المستفيدين:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={formData.beneficiariesCount}
                                            onChange={(e) => updateForm('beneficiariesCount', e.target.value)}
                                            placeholder="0"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>عدد المؤطرين أو المرافقين:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={formData.accompaniesCount}
                                            onChange={(e) => updateForm('accompaniesCount', e.target.value)}
                                            placeholder="0"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>العدد الإجمالي للأشخاص:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={formData.totalPersons}
                                            onChange={(e) => updateForm('totalPersons', e.target.value)}
                                            placeholder="0"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>عناية:</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={formData.care}
                                            onChange={(e) => updateForm('care', e.target.value)}
                                            placeholder="تفاصيل العناية"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>مساهمة و بالتنسيق مع:</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={formData.coordination}
                                            onChange={(e) => updateForm('coordination', e.target.value)}
                                            placeholder="جهات التنسيق"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>النتائج المسجلة أو المتحصل عليها:</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={formData.results}
                                            onChange={(e) => updateForm('results', e.target.value)}
                                            placeholder="النتائج"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>التكفل بالإطعام:</Form.Label>
                                        <div className="input-group">
                                            <Form.Control
                                                type="number"
                                                value={formData.foodCost}
                                                onChange={(e) => updateForm('foodCost', e.target.value)}
                                                placeholder="0.00"
                                            />
                                            <span className="input-group-text">دج</span>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>التكفل بالمبيت:</Form.Label>
                                        <div className="input-group">
                                            <Form.Control
                                                type="number"
                                                value={formData.accommodationCost}
                                                onChange={(e) => updateForm('accommodationCost', e.target.value)}
                                                placeholder="0.00"
                                            />
                                            <span className="input-group-text">دج</span>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>مصاريف أخرى:</Form.Label>
                                        <div className="input-group">
                                            <Form.Control
                                                type="number"
                                                value={formData.otherCosts}
                                                onChange={(e) => updateForm('otherCosts', e.target.value)}
                                                placeholder="0.00"
                                            />
                                            <span className="input-group-text">دج</span>
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>تاريخ نهاية العملية:</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={formData.operationEndDate}
                                            onChange={(e) => updateForm('operationEndDate', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* جدول النفقات */}
                    <Card className="mb-4 border-success">
                        <Card.Header className="bg-success text-white">
                            <h5 className="mb-0">البيانات المالية للنفقات</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                <Table bordered hover size="sm" style={{ minWidth: '1000px', marginBottom: 0 }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: '80px', textAlign: 'center' }}>
                                                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الرقم</div>
                                            </th>
                                            <th style={{ width: '100px', textAlign: 'center' }}>
                                                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>Chapitre</div>
                                            </th>
                                            <th style={{ width: '100px', textAlign: 'center' }}>
                                                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الباب</div>
                                            </th>
                                            <th style={{ width: '110px', textAlign: 'center' }}>
                                                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>رقم الحساب</div>
                                            </th>
                                            <th style={{ width: '110px', textAlign: 'center' }}>
                                                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>المبلغ المسدد</div>
                                            </th>
                                            <th style={{ width: '150px', textAlign: 'center' }}>
                                                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>اسم ولقب التاجر أو المستفيد</div>
                                            </th>
                                            <th style={{ width: '60px', textAlign: 'center' }}>الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.expenses.map((expense) => (
                                            <tr key={expense.id}>
                                                <td style={{ width: '80px' }}>
                                                    <Form.Control
                                                        size="sm"
                                                        value={expense.number}
                                                        onChange={(e) => updateExpense(expense.id, 'number', e.target.value)}
                                                        placeholder="الرقم"
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ width: '100px' }}>
                                                    <Form.Control
                                                        size="sm"
                                                        value={expense.chapitre}
                                                        onChange={(e) => updateExpense(expense.id, 'chapitre', e.target.value)}
                                                        placeholder="Chapitre"
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ width: '100px' }}>
                                                    <Form.Control
                                                        size="sm"
                                                        value={expense.chapter}
                                                        onChange={(e) => updateExpense(expense.id, 'chapter', e.target.value)}
                                                        placeholder="الباب"
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ width: '110px' }}>
                                                    <Form.Control
                                                        size="sm"
                                                        value={expense.accountNumber}
                                                        onChange={(e) => updateExpense(expense.id, 'accountNumber', e.target.value)}
                                                        placeholder="رقم الحساب"
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ width: '110px' }}>
                                                    <Form.Control
                                                        size="sm"
                                                        type="number"
                                                        value={expense.amount}
                                                        onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                                                        placeholder="0.00"
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ width: '150px' }}>
                                                    <Form.Control
                                                        size="sm"
                                                        value={expense.beneficiaryName}
                                                        onChange={(e) => updateExpense(expense.id, 'beneficiaryName', e.target.value)}
                                                        placeholder="الاسم"
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ width: '60px', textAlign: 'center' }}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        onClick={() => deleteExpense(expense.id)}
                                                        disabled={formData.expenses.length === 1}
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
                                onClick={addExpense}
                            >
                                <i className="fas fa-plus me-2"></i>
                                إضافة نفقة
                            </button>

                            <div className="alert alert-info mt-3">
                                <strong>مجموع نفقات العملية:</strong>
                                <h5 className="text-success mt-2">{calculateTotal()} دج</h5>
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
                                <Col md={4}>
                                    <Card className="text-center">
                                        <Card.Header className="bg-light">الرئيس</Card.Header>
                                        <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="text-center">
                                        <Card.Header className="bg-light">أمين المال</Card.Header>
                                        <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="text-center">
                                        <Card.Header className="bg-light">منفذ المصاريف</Card.Header>
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

export default OperationReport;
