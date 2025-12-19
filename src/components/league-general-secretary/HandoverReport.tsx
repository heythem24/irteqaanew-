import React, { useState } from 'react';
import { Container, Card, Table, Form, Button, Row, Col } from 'react-bootstrap';

const HandoverReport: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        clubName: '', approvalNumber: '', approvalDate: '',
        sessionDate: '', time: '', location: '',
        committeePresident: '', committeeMember1: '', committeeMember2: '', committeeMember3: '',
        formerPresident: '', newPresident: '', dyjsRepresentative: '', wilaya: '',
        generalSecretary: '', treasurer: '', electionDate: '', endTime: ''
    });

    const [assets, setAssets] = useState([{ id: 1, inventoryNum: '', nature: '', quantity: '', condition: '', origin: '', allocation: '', notes: '' }]);
    const [finances, setFinances] = useState([{ id: 1, designation: '', count: '', amount: '', date: '', notes: '' }]);
    const [equipment, setEquipment] = useState([{ id: 1, designation: '', count: '', inventoryNum: '', notes: '' }]);
    const [documents, setDocuments] = useState([{ id: 1, designation: '', count: '', notes: '' }]);
    const [staff, setStaff] = useState([{ id: 1, name: '', rank: '', position: '', workplace: '', notes: '' }]);

    const updateForm = (field: string, value: string) => setFormData({ ...formData, [field]: value });

    const totalPages = 3;

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-end" dir="rtl"><i className="fas fa-file-signature me-3"></i>محضر تسليم واستلام المهام</h2>
                <div className="text-center">
                    <span className="badge bg-primary p-2">الصفحة {currentPage} من {totalPages}</span>
                </div>
            </div>

            <Card className="shadow-sm mb-4">
                <Card.Body className="p-4">
                    {currentPage === 1 && <Page1 formData={formData} updateForm={updateForm} />}
                    {currentPage === 2 && <Page2 assets={assets} setAssets={setAssets} finances={finances} setFinances={setFinances} equipment={equipment} setEquipment={setEquipment} documents={documents} setDocuments={setDocuments} staff={staff} setStaff={setStaff} />}
                    {currentPage === 3 && <Page3 formData={formData} updateForm={updateForm} />}
                </Card.Body>
            </Card>

            <div className="d-flex justify-content-between">
                <Button variant="outline-primary" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                    <i className="fas fa-chevron-right me-2"></i>الصفحة السابقة
                </Button>
                <div className="d-flex gap-2">
                    {[1, 2, 3].map(p => (
                        <Button key={p} variant={currentPage === p ? 'primary' : 'outline-secondary'} size="sm" onClick={() => setCurrentPage(p)}>{p}</Button>
                    ))}
                </div>
                <Button variant="outline-primary" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                    الصفحة التالية<i className="fas fa-chevron-left ms-2"></i>
                </Button>
            </div>
        </Container>
    );
};


interface Page1Props {
    formData: any;
    updateForm: (field: string, value: string) => void;
}

const Page1: React.FC<Page1Props> = ({ formData, updateForm }) => {
    return (
        <div dir="rtl">
            <div className="text-center mb-4">
                <h5 className="text-muted">الجمهورية الجزائرية الديمقراطية الشعبية</h5>
                <h6 className="text-muted">وزارة الشباب والرياضة</h6>
            </div>
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Group><Form.Label>النادي الرياضي الهاوي / رابطة:</Form.Label>
                        <Form.Control type="text" value={formData.clubName} onChange={(e) => updateForm('clubName', e.target.value)} /></Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group><Form.Label>معتمدة تحت رقم:</Form.Label>
                        <Form.Control type="text" value={formData.approvalNumber} onChange={(e) => updateForm('approvalNumber', e.target.value)} /></Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group><Form.Label>بتاريخ:</Form.Label>
                        <Form.Control type="date" value={formData.approvalDate} onChange={(e) => updateForm('approvalDate', e.target.value)} /></Form.Group>
                </Col>
            </Row>
            <h4 className="text-center text-primary my-4">محضر تسليم واستلام المهام</h4>
            <Card className="mb-4">
                <Card.Body>
                    <p>بتاريخ: <Form.Control type="date" className="d-inline-block mx-1" style={{ width: '160px' }} value={formData.sessionDate} onChange={(e) => updateForm('sessionDate', e.target.value)} />
                        وعلى الساعة <Form.Control type="time" className="d-inline-block mx-1" style={{ width: '120px' }} value={formData.time} onChange={(e) => updateForm('time', e.target.value)} />
                        في جلسة رسمية بمقر النادي / الرابطة: <Form.Control type="text" className="d-inline-block mx-1" style={{ width: '200px' }} value={formData.location} onChange={(e) => updateForm('location', e.target.value)} /></p>
                    <p>تحت رئاسة السيد: <Form.Control type="text" className="d-inline-block mx-1" style={{ width: '200px' }} value={formData.committeePresident} onChange={(e) => updateForm('committeePresident', e.target.value)} /> رئيس اللجنة الخاصة المكلفة بمتابعة نقل المهام</p>
                    <p className="fw-bold">وبحضور السادة:</p>
                    <ul className="list-unstyled">
                        <li className="mb-2"><Form.Control type="text" className="d-inline-block" style={{ width: '300px' }} value={formData.committeeMember1} onChange={(e) => updateForm('committeeMember1', e.target.value)} placeholder="عضو اللجنة 1" /> عضو اللجنة الخاصة المكلفة بمتابعة نقل المهام</li>
                        <li className="mb-2"><Form.Control type="text" className="d-inline-block" style={{ width: '300px' }} value={formData.committeeMember2} onChange={(e) => updateForm('committeeMember2', e.target.value)} placeholder="عضو اللجنة 2" /> عضو اللجنة الخاصة المكلفة بمتابعة نقل المهام</li>
                        <li className="mb-2"><Form.Control type="text" className="d-inline-block" style={{ width: '300px' }} value={formData.committeeMember3} onChange={(e) => updateForm('committeeMember3', e.target.value)} placeholder="عضو اللجنة 3" /> عضو اللجنة الخاصة المكلفة بمتابعة نقل المهام</li>
                        <li className="mb-2"><Form.Control type="text" className="d-inline-block" style={{ width: '300px' }} value={formData.formerPresident} onChange={(e) => updateForm('formerPresident', e.target.value)} placeholder="الرئيس السابق" /> رئيس النادي / الرابطة سابقاً</li>
                        <li className="mb-2"><Form.Control type="text" className="d-inline-block" style={{ width: '300px' }} value={formData.newPresident} onChange={(e) => updateForm('newPresident', e.target.value)} placeholder="الرئيس الجديد" /> رئيس النادي / الرابطة الجديد</li>
                        <li className="mb-2"><Form.Control type="text" className="d-inline-block" style={{ width: '300px' }} value={formData.dyjsRepresentative} onChange={(e) => updateForm('dyjsRepresentative', e.target.value)} placeholder="ممثل المديرية" /> ممثل المعين من طرف مديرية الشباب والرياضة لولاية <Form.Control type="text" className="d-inline-block mx-1" style={{ width: '150px' }} value={formData.wilaya} onChange={(e) => updateForm('wilaya', e.target.value)} /></li>
                        <li className="mb-2"><Form.Control type="text" className="d-inline-block" style={{ width: '300px' }} value={formData.generalSecretary} onChange={(e) => updateForm('generalSecretary', e.target.value)} placeholder="الأمين العام" /> الأمين العام (الكاتب)</li>
                        <li className="mb-2"><Form.Control type="text" className="d-inline-block" style={{ width: '300px' }} value={formData.treasurer} onChange={(e) => updateForm('treasurer', e.target.value)} placeholder="أمين المال" /> أمين المال (أمين الخزينة)</li>
                    </ul>
                </Card.Body>
            </Card>
            <Card>
                <Card.Body>
                    <p>وبناءً على المذكرة المنهجية رقم 001 المؤرخة في 25 جويلية 2024 المتعلقة بمسار تجديد هيئات هياكل التنظيم والتنشيط الرياضيين المحلية 2024 – 2028 ومحضر الجمعية العامة الانتخابية المؤرخة في <Form.Control type="date" className="d-inline-block mx-1" style={{ width: '150px' }} value={formData.electionDate} onChange={(e) => updateForm('electionDate', e.target.value)} /> والخاصة بتجديد الهيئة المسيرة لنادي / لرابطة: <Form.Control type="text" className="d-inline-block mx-1" style={{ width: '200px' }} value={formData.clubName} onChange={(e) => updateForm('clubName', e.target.value)} /></p>
                    <p>تمت مراسيم تسليم واستلام المهام من طرف الرئيس السابق السيد: <strong>{formData.formerPresident || '.....................'}</strong> والرئيس الجديد السيد: <strong>{formData.newPresident || '.....................'}</strong></p>
                    <p>وأشرف على هذه المراسيم كل من السادة: رئيس اللجنة الخاصة المكلفة بمتابعة نقل المهام وأعضاءه والممثل المعين من طرف مديرية الشباب والرياضة، حيث تم تسليم واستلام ما يلي:</p>
                </Card.Body>
            </Card>
        </div>
    );
};


interface Page2Props {
    assets: any[]; setAssets: React.Dispatch<React.SetStateAction<any[]>>;
    finances: any[]; setFinances: React.Dispatch<React.SetStateAction<any[]>>;
    equipment: any[]; setEquipment: React.Dispatch<React.SetStateAction<any[]>>;
    documents: any[]; setDocuments: React.Dispatch<React.SetStateAction<any[]>>;
    staff: any[]; setStaff: React.Dispatch<React.SetStateAction<any[]>>;
}

const Page2: React.FC<Page2Props> = ({ assets, setAssets, finances, setFinances, equipment, setEquipment, documents, setDocuments, staff, setStaff }) => {
    const addRow = (arr: any[], setArr: any, template: any) => setArr([...arr, { ...template, id: arr.length + 1 }]);

    return (
        <div dir="rtl">
            <h5 className="text-primary mb-3">1- الممتلكات المنقولة والعقارية:</h5>
            <p className="text-muted small">(المقر، قاعات، ملاعب، مسابح، التجهيزات والعتاد الرياضي، التجهيزات المكتبية، المكاتب، الكراسي...الخ)</p>
            <div className="table-responsive mb-4">
                <Table bordered size="sm" style={{ minWidth: '1000px' }}>
                    <thead className="table-dark">
                        <tr><th>الرقم</th><th>رقم الجرد</th><th>طبيعة الأملاك</th><th>عددها</th><th>حالتها</th><th>أصل الأملاك</th><th>التخصيص</th><th>الملاحظات</th></tr>
                    </thead>
                    <tbody>
                        {assets.map((a, i) => (
                            <tr key={a.id}>
                                <td>{i + 1}</td>
                                <td><Form.Control size="sm" value={a.inventoryNum} onChange={(e) => { const n = [...assets]; n[i].inventoryNum = e.target.value; setAssets(n); }} /></td>
                                <td><Form.Control size="sm" value={a.nature} onChange={(e) => { const n = [...assets]; n[i].nature = e.target.value; setAssets(n); }} /></td>
                                <td><Form.Control size="sm" value={a.quantity} onChange={(e) => { const n = [...assets]; n[i].quantity = e.target.value; setAssets(n); }} /></td>
                                <td><Form.Control size="sm" value={a.condition} onChange={(e) => { const n = [...assets]; n[i].condition = e.target.value; setAssets(n); }} /></td>
                                <td><Form.Control size="sm" value={a.origin} onChange={(e) => { const n = [...assets]; n[i].origin = e.target.value; setAssets(n); }} /></td>
                                <td><Form.Control size="sm" value={a.allocation} onChange={(e) => { const n = [...assets]; n[i].allocation = e.target.value; setAssets(n); }} /></td>
                                <td><Form.Control size="sm" value={a.notes} onChange={(e) => { const n = [...assets]; n[i].notes = e.target.value; setAssets(n); }} /></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Button size="sm" variant="success" onClick={() => addRow(assets, setAssets, { inventoryNum: '', nature: '', quantity: '', condition: '', origin: '', allocation: '', notes: '' })}><i className="fas fa-plus me-1"></i>إضافة</Button>
            </div>

            <h5 className="text-primary mb-3">2- الوضعية المالية:</h5>
            <p className="text-muted small">(كشف الحساب البنكي، سجلات البنك والصندوق، دفاتر الشيكات، سجل المخالصات المالية...الخ)</p>
            <div className="table-responsive mb-4">
                <Table bordered size="sm" style={{ minWidth: '750px' }}>
                    <thead className="table-dark">
                        <tr>
                            <th style={{ width: '40px' }}>الرقم</th>
                            <th style={{ width: '120px' }}>التعيين</th>
                            <th style={{ width: '50px' }}>العدد</th>
                            <th style={{ width: '200px', whiteSpace: 'nowrap' }}>المبلغ الموجود أو المتبقي</th>
                            <th style={{ width: '100px' }}>بتاريخ</th>
                            <th style={{ width: '100px' }}>الملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finances.map((f, i) => (
                            <tr key={f.id}>
                                <td>{i + 1}</td>
                                <td><Form.Control size="sm" value={f.designation} onChange={(e) => { const n = [...finances]; n[i].designation = e.target.value; setFinances(n); }} /></td>
                                <td><Form.Control size="sm" value={f.count} onChange={(e) => { const n = [...finances]; n[i].count = e.target.value; setFinances(n); }} /></td>
                                <td><Form.Control size="sm" value={f.amount} onChange={(e) => { const n = [...finances]; n[i].amount = e.target.value; setFinances(n); }} /></td>
                                <td><Form.Control size="sm" type="date" value={f.date} onChange={(e) => { const n = [...finances]; n[i].date = e.target.value; setFinances(n); }} /></td>
                                <td><Form.Control size="sm" value={f.notes} onChange={(e) => { const n = [...finances]; n[i].notes = e.target.value; setFinances(n); }} /></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Button size="sm" variant="success" onClick={() => addRow(finances, setFinances, { designation: '', count: '', amount: '', date: '', notes: '' })}><i className="fas fa-plus me-1"></i>إضافة</Button>
            </div>

            <h5 className="text-primary mb-3">3- التعدادات المتكفل بها من قبل الرئيس الجديد:</h5>
            <div className="table-responsive mb-4">
                <Table bordered size="sm" style={{ minWidth: '600px' }}>
                    <thead className="table-dark">
                        <tr><th>الرقم</th><th>التعيين</th><th>العدد</th><th>رقم الجرد</th><th>الملاحظات</th></tr>
                    </thead>
                    <tbody>
                        {equipment.map((eq, i) => (
                            <tr key={eq.id}>
                                <td>{i + 1}</td>
                                <td><Form.Control size="sm" value={eq.designation} onChange={(e) => { const n = [...equipment]; n[i].designation = e.target.value; setEquipment(n); }} /></td>
                                <td><Form.Control size="sm" value={eq.count} onChange={(e) => { const n = [...equipment]; n[i].count = e.target.value; setEquipment(n); }} /></td>
                                <td><Form.Control size="sm" value={eq.inventoryNum} onChange={(e) => { const n = [...equipment]; n[i].inventoryNum = e.target.value; setEquipment(n); }} /></td>
                                <td><Form.Control size="sm" value={eq.notes} onChange={(e) => { const n = [...equipment]; n[i].notes = e.target.value; setEquipment(n); }} /></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Button size="sm" variant="success" onClick={() => addRow(equipment, setEquipment, { designation: '', count: '', inventoryNum: '', notes: '' })}><i className="fas fa-plus me-1"></i>إضافة</Button>
            </div>

            <h5 className="text-primary mb-3">4- الوثائق الإدارية:</h5>
            <p className="text-muted small">(البريد الصادر والوارد، ختم النادي، القانون الأساسي، النظام الداخلي، النظام التأديبي...الخ)</p>
            <div className="table-responsive mb-4">
                <Table bordered size="sm" style={{ minWidth: '500px' }}>
                    <thead className="table-dark">
                        <tr><th>الرقم</th><th>التعيين</th><th>العدد</th><th>الملاحظات</th></tr>
                    </thead>
                    <tbody>
                        {documents.map((d, i) => (
                            <tr key={d.id}>
                                <td>{i + 1}</td>
                                <td><Form.Control size="sm" value={d.designation} onChange={(e) => { const n = [...documents]; n[i].designation = e.target.value; setDocuments(n); }} /></td>
                                <td><Form.Control size="sm" value={d.count} onChange={(e) => { const n = [...documents]; n[i].count = e.target.value; setDocuments(n); }} /></td>
                                <td><Form.Control size="sm" value={d.notes} onChange={(e) => { const n = [...documents]; n[i].notes = e.target.value; setDocuments(n); }} /></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Button size="sm" variant="success" onClick={() => addRow(documents, setDocuments, { designation: '', count: '', notes: '' })}><i className="fas fa-plus me-1"></i>إضافة</Button>
            </div>

            <h5 className="text-primary mb-3">5- الأفراد العاملين بالنادي / الرابطة:</h5>
            <div className="table-responsive">
                <Table bordered size="sm" style={{ minWidth: '700px' }}>
                    <thead className="table-dark">
                        <tr><th>الرقم</th><th>الاسم واللقب</th><th>الرتبة</th><th>الوظيفة</th><th>مكان العمل</th><th>الملاحظات</th></tr>
                    </thead>
                    <tbody>
                        {staff.map((s, i) => (
                            <tr key={s.id}>
                                <td>{i + 1}</td>
                                <td><Form.Control size="sm" value={s.name} onChange={(e) => { const n = [...staff]; n[i].name = e.target.value; setStaff(n); }} /></td>
                                <td><Form.Control size="sm" value={s.rank} onChange={(e) => { const n = [...staff]; n[i].rank = e.target.value; setStaff(n); }} /></td>
                                <td><Form.Control size="sm" value={s.position} onChange={(e) => { const n = [...staff]; n[i].position = e.target.value; setStaff(n); }} /></td>
                                <td><Form.Control size="sm" value={s.workplace} onChange={(e) => { const n = [...staff]; n[i].workplace = e.target.value; setStaff(n); }} /></td>
                                <td><Form.Control size="sm" value={s.notes} onChange={(e) => { const n = [...staff]; n[i].notes = e.target.value; setStaff(n); }} /></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Button size="sm" variant="success" onClick={() => addRow(staff, setStaff, { name: '', rank: '', position: '', workplace: '', notes: '' })}><i className="fas fa-plus me-1"></i>إضافة</Button>
            </div>
        </div>
    );
};


interface Page3Props {
    formData: any;
    updateForm: (field: string, value: string) => void;
}

const Page3: React.FC<Page3Props> = ({ formData, updateForm }) => {
    return (
        <div dir="rtl">
            <Card className="mb-4">
                <Card.Body>
                    <p>رفعت الجلسة في حدود الساعة <Form.Control type="time" className="d-inline-block mx-1" style={{ width: '120px' }} value={formData.endTime} onChange={(e) => updateForm('endTime', e.target.value)} /> من نفس اليوم والشهر والسنة المذكورين أعلاه.</p>
                </Card.Body>
            </Card>

            <Card className="border-warning mb-4">
                <Card.Header className="bg-warning text-dark"><h5 className="mb-0"><i className="fas fa-exclamation-triangle me-2"></i>ملاحظات هامة:</h5></Card.Header>
                <Card.Body>
                    <ul>
                        <li>تتم مراسيم تسليم واستلام المهام في أجل <strong>10 أيام</strong> التي تلي الإعلان النهائي لنتائج الانتخاب.</li>
                        <li>تحرر هذه الوثيقة في <strong>03 نسخ أصلية</strong> للتوقيع عليها.</li>
                    </ul>
                </Card.Body>
            </Card>

            <Row className="mb-4">
                <Col md={6}>
                    <Card className="border-primary h-100">
                        <Card.Body className="text-center">
                            <h6 className="text-primary mb-3">توقيع الرئيس السابق</h6>
                            <p className="text-muted">{formData.formerPresident || '.....................'}</p>
                            <div className="border border-2 border-primary p-4 mx-auto" style={{ maxWidth: '250px', minHeight: '100px' }}></div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="border-success h-100">
                        <Card.Body className="text-center">
                            <h6 className="text-success mb-3">توقيع الرئيس الجديد</h6>
                            <p className="text-muted">{formData.newPresident || '.....................'}</p>
                            <div className="border border-2 border-success p-4 mx-auto" style={{ maxWidth: '250px', minHeight: '100px' }}></div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Card className="border-info h-100">
                        <Card.Body className="text-center">
                            <h6 className="text-info mb-3">توقيع الأمين العام (الكاتب)</h6>
                            <p className="text-muted">{formData.generalSecretary || '.....................'}</p>
                            <div className="border border-2 border-info p-4 mx-auto" style={{ maxWidth: '250px', minHeight: '100px' }}></div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="border-secondary h-100">
                        <Card.Body className="text-center">
                            <h6 className="text-secondary mb-3">توقيع أمين المال (أمين الخزينة)</h6>
                            <p className="text-muted">{formData.treasurer || '.....................'}</p>
                            <div className="border border-2 border-secondary p-4 mx-auto" style={{ maxWidth: '250px', minHeight: '100px' }}></div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default HandoverReport;
