import React, { useState } from 'react';
import { Container, Card, Row, Col, Nav, Badge } from 'react-bootstrap';
import './InternalRegulations.css';

const InternalRegulations: React.FC = () => {
    const [activeSection, setActiveSection] = useState('intro');
    const sections = [
        { id: 'intro', title: 'المقدمة والفهرس', icon: 'fas fa-home' },
        { id: 'chapter1', title: 'الباب الأول: أحكام عامة', icon: 'fas fa-gavel' },
        { id: 'chapter2', title: 'الباب الثاني: الجمعية العامة', icon: 'fas fa-users' },
        { id: 'chapter3', title: 'الباب الثالث: الآداب العامة', icon: 'fas fa-tasks' },
        { id: 'chapter4', title: 'الباب الرابع: أحكام نهائية', icon: 'fas fa-flag-checkered' },
    ];
    const renderContent = () => {
        switch (activeSection) {
            case 'intro': return <IntroSection />;
            case 'chapter1': return <Chapter1 />;
            case 'chapter2': return <Chapter2 />;
            case 'chapter3': return <Chapter3 />;
            case 'chapter4': return <Chapter4 />;
            default: return <IntroSection />;
        }
    };
    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-end" dir="rtl"><i className="fas fa-gavel me-3"></i>النظام الداخلي للرابطة الولائية للجيدو</h2>
            </div>
            <Row>
                <Col lg={3}>
                    <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
                        <Card.Header className="bg-success text-white">
                            <h6 className="mb-0 text-end" dir="rtl"><i className="fas fa-list me-2"></i>فهرس النظام الداخلي</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Nav variant="pills" className="flex-column">
                                {sections.map((section) => (
                                    <Nav.Item key={section.id}>
                                        <Nav.Link className={`text-end border-0 rounded-0 ${activeSection === section.id ? 'active bg-success' : ''}`} dir="rtl" onClick={() => setActiveSection(section.id)} style={{ cursor: 'pointer' }}>
                                            <i className={`${section.icon} me-2`}></i>{section.title}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={9}>
                    <Card className="shadow-sm"><Card.Body className="p-4">{renderContent()}</Card.Body></Card>
                </Col>
            </Row>
        </Container>
    );
};


const IntroSection: React.FC = () => {
    return (
        <div className="regulation-content" dir="rtl">
            <div className="text-center mb-5">
                <h4 className="text-muted mb-3">الجمهورية الجزائرية الديمقراطية الشعبية</h4>
                <h3 className="text-success mb-3">الرابطة الولائية للجيدو  </h3>
                <hr className="w-50 mx-auto" />
                <h2 className="text-primary">النظام الداخلي</h2>
            </div>
            <Card className="border-success mb-4">
                <Card.Header className="bg-success text-white">
                    <h5 className="mb-0"><i className="fas fa-list-ol me-2"></i> الفهرس</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <div className="p-3 border-bottom"><Badge bg="primary" className="me-2">01</Badge><strong>الباب الأول:</strong> أحكام عامة</div>
                            <div className="p-3 border-bottom"><Badge bg="info" className="me-2">02</Badge><strong>الباب الثاني:</strong> الجمعية العامة</div>
                        </Col>
                        <Col md={6}>
                            <div className="p-3 border-bottom"><Badge bg="warning" className="me-2">03</Badge><strong>الباب الثالث:</strong> الآداب العامة</div>
                            <div className="p-3"><Badge bg="danger" className="me-2">04</Badge><strong>الباب الرابع:</strong> أحكام نهائية</div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            <Card className="border-info">
                <Card.Header className="bg-info text-white"><h5 className="mb-0"><i className="fas fa-info-circle me-2"></i> مقدمة</h5></Card.Header>
                <Card.Body>
                    <p className="lead">بناء على مراسلة الاتحادية الجزائرية للجيدو:</p>
                    <ul className="list-unstyled">
                        <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>المصادقة على القانون الأساسي للرابطة الولائية للجيدو.</li>
                        <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>تمت دراسة القانون الأساسي النموذجي بالتفصيل.</li>
                        <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>تم إعداد نظام داخلي من طرف أعضاء المكتب التنفيذي.</li>
                    </ul>
                </Card.Body>
            </Card>
        </div>
    );
};


const Chapter1: React.FC = () => {
    return (
        <div className="regulation-content" dir="rtl">
            <div className="text-center mb-4">
                <h3 className="text-primary"><i className="fas fa-gavel me-2"></i>الباب الأول: أحكام عامة</h3>
                <hr className="w-25 mx-auto" />
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-success"><i className="fas fa-bookmark me-2"></i>المادة 01:</h5>
                <p>تسمى الرابطة الولائية: <strong>الرابطة الولائية للجيدو  </strong>.</p>
                <p>المعتمدة والمسجلة تحت رقم <strong>006</strong> بتاريخ <strong>12/05/2019</strong>.</p>
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-success"><i className="fas fa-bookmark me-2"></i>المادة 02:</h5>
                <p>تطبق الرابطة نشاطاتها تحت إشراف ومراقبة الاتحادية الجزائرية للجيدو.</p>
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-success"><i className="fas fa-bookmark me-2"></i>المادة 03:</h5>
                <p>تحرص على تطبيق القانون الأساسي النموذجي الجديد.</p>
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-success"><i className="fas fa-bookmark me-2"></i>المادة 04:</h5>
                <p>مقر الرابطة متواجد بـ<strong>نهج زروال الطاهر ببلدية </strong>.</p>
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-success"><i className="fas fa-bookmark me-2"></i>المادة 05:</h5>
                <p>مدة شرعية عمل الرابطة هي <strong>عهدة أولمبية أي 04 سنوات</strong> قابلة للتجديد.</p>
            </div>
        </div>
    );
};


const Chapter2: React.FC = () => {
    return (
        <div className="regulation-content" dir="rtl">
            <div className="text-center mb-4">
                <h3 className="text-info"><i className="fas fa-users me-2"></i>الباب الثاني: الجمعية العامة</h3>
                <hr className="w-25 mx-auto" />
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-info"><i className="fas fa-bookmark me-2"></i>المادة 06:</h5>
                <p>تتشكل الرابطة الولائية للجيدو من: الجمعية العامة، الرئيس، المكتب التنفيذي، النوادي والفروع، اللجان المتخصصة.</p>
            </div>
            <Card className="mb-4 border-info">
                <Card.Header className="bg-info text-white"><h5 className="mb-0">الفقرة 01: الجمعية العامة</h5></Card.Header>
                <Card.Body>
                    <p>الجمعية العامة هي جهاز مراقبة ومداولة الرابطة الولائية وتضم أعضاء مستوفون لشروط معينة.</p>
                </Card.Body>
            </Card>
            <Card className="mb-4 border-primary">
                <Card.Header className="bg-primary text-white"><h5 className="mb-0">الفقرة 02: الرئيس</h5></Card.Header>
                <Card.Body>
                    <p><strong>المادة 12:</strong> رئيس الرابطة هو حلقة تواصل بين الرابطة والإدارة الخارجية.</p>
                    <p><strong>المادة 13:</strong> ينتخب رئيس الرابطة في اقتراع سري.</p>
                    <p><strong>المادة 14:</strong> رئيس الرابطة هو الآمر بالصرف.</p>
                </Card.Body>
            </Card>
            <Card className="mb-4 border-success">
                <Card.Header className="bg-success text-white"><h5 className="mb-0">الفقرة 03: المكتب التنفيذي</h5></Card.Header>
                <Card.Body>
                    <p><strong>المادة 15:</strong> ينتخب أعضاء المكتب التنفيذي في اقتراع سري.</p>
                    <p><strong>المادة 17:</strong> يجتمع المكتب التنفيذي مرة كل شهر.</p>
                </Card.Body>
            </Card>
            <Card className="mb-4 border-secondary">
                <Card.Header className="bg-secondary text-white"><h5 className="mb-0">الفقرة 05: اللجان المتخصصة</h5></Card.Header>
                <Card.Body>
                    <p><strong>المادة 21:</strong> من بين اللجان الرئيسية: اللجنة التقنية، لجنة التحكيم، لجنة التنظيم، اللجنة الطبية، لجنة الأحزمة والتثبيت، لجنة المراقبة المالية، لجنة التأديب، لجنة الإدارة والمالية.</p>
                </Card.Body>
            </Card>
        </div>
    );
};


const Chapter3: React.FC = () => {
    return (
        <div className="regulation-content" dir="rtl">
            <div className="text-center mb-4">
                <h3 className="text-warning"><i className="fas fa-tasks me-2"></i>الباب الثالث: الآداب العامة</h3>
                <hr className="w-25 mx-auto" />
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-warning"><i className="fas fa-bookmark me-2"></i>المادة 23:</h5>
                <p>يتولى الأمر بالصرف رئيس الرابطة لتسيير نفقات الرابطة بعد المداولة داخل المكتب التنفيذي.</p>
            </div>
            <Card className="mb-4 border-info">
                <Card.Header className="bg-info text-white"><h5 className="mb-0"><i className="fas fa-user-tie me-2"></i>مهام الكاتب العام</h5></Card.Header>
                <Card.Body>
                    <p><strong>المادة 27:</strong> تتمثل مهمة الكاتب العام في: تحضير المجالس والاجتماعات، تحضير الدعوات وجدول الأعمال، تحضير التقرير الأدبي.</p>
                </Card.Body>
            </Card>
            <Card className="mb-4 border-success">
                <Card.Header className="bg-success text-white"><h5 className="mb-0"><i className="fas fa-coins me-2"></i>مهام أمين المال</h5></Card.Header>
                <Card.Body>
                    <p><strong>المادة 29:</strong> تتمحور مهمة أمين المال في: تحضير التقرير المالي والميزانية، تقديم الموارد المالية، جرد المعدات الرياضية.</p>
                </Card.Body>
            </Card>
            <Card className="mb-4 border-primary">
                <Card.Header className="bg-primary text-white"><h5 className="mb-0"><i className="fas fa-hand-holding-usd me-2"></i>المنح والتعويضات</h5></Card.Header>
                <Card.Body>
                    <p><strong>المادة 32:</strong> تتقاضى منحة: الكاتب العام، المدير التقني الولائي، المكلف المساعد الإداري والمالي.</p>
                    <p><strong>المادة 33:</strong> تعتبر وظيفة تطوعية: رئيس الرابطة، نواب الرئيس، أمين المال، رؤساء اللجان.</p>
                </Card.Body>
            </Card>
        </div>
    );
};


const Chapter4: React.FC = () => {
    return (
        <div className="regulation-content" dir="rtl">
            <div className="text-center mb-4">
                <h3 className="text-danger"><i className="fas fa-flag-checkered me-2"></i>الباب الرابع: أحكام نهائية</h3>
                <hr className="w-25 mx-auto" />
            </div>
            <Card className="mb-4 border-danger">
                <Card.Header className="bg-danger text-white"><h5 className="mb-0"><i className="fas fa-gavel me-2"></i>السلطة التأديبية</h5></Card.Header>
                <Card.Body>
                    <p><strong>المادة 34:</strong> تمارس الرابطة سلطة تأديبية على:</p>
                    <ul>
                        <li>كل من يخالف القانون الأساسي والنظام الداخلي</li>
                        <li>عدم احترام المسؤولين</li>
                        <li>المساس باستقرار الرابطة</li>
                        <li>التغيب المتكرر (ثلاث غيابات غير مبررة تلغي العضوية آلياً)</li>
                        <li>إفشاء أسرار المداولات</li>
                    </ul>
                </Card.Body>
            </Card>
            <Card className="mb-4 border-success">
                <Card.Header className="bg-success text-white"><h5 className="mb-0"><i className="fas fa-file-signature me-2"></i>الخاتمة</h5></Card.Header>
                <Card.Body>
                    <p className="lead text-center">إن هذا النظام الداخلي للرابطة الولائية للجيدو   هو إضافة لكل ما جاء في النصوص التشريعية للقانون الأساسي النموذجي.</p>
                </Card.Body>
            </Card>
            <Card className="border-dark">
                <Card.Body>
                    <Row className="text-center">
                        <Col md={4}><div className="p-3"><p><strong>الكاتب العام</strong></p><p className="text-muted mt-4">...........................</p></div></Col>
                        <Col md={4}><div className="p-3"><p><strong>رئيس الرابطة</strong></p><p className="text-muted mt-4">...........................</p></div></Col>
                        <Col md={4}><div className="p-3"><p><strong>مصادقة البلدية</strong></p><p className="text-muted mt-4">...........................</p></div></Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default InternalRegulations;
