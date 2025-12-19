import React, { useState } from 'react';
import { Container, Card, Row, Col, Nav, Badge } from 'react-bootstrap';
import './InternalRegulations.css';

const DisciplinarySystem: React.FC = () => {
    const [activeSection, setActiveSection] = useState('intro');
    const sections = [
        { id: 'intro', title: 'المقدمة', icon: 'fas fa-home' },
        { id: 'chapter1', title: 'الفصل الأول: الأجهزة التأديبية', icon: 'fas fa-balance-scale' },
        { id: 'chapter2', title: 'الفصل الثاني: الأخطاء الجسيمة', icon: 'fas fa-exclamation-triangle' },
    ];
    const renderContent = () => {
        switch (activeSection) {
            case 'intro': return <IntroSection />;
            case 'chapter1': return <Chapter1 />;
            case 'chapter2': return <Chapter2 />;
            default: return <IntroSection />;
        }
    };
    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-end" dir="rtl"><i className="fas fa-balance-scale me-3"></i>النظام التأديبي النموذجي</h2>
            </div>
            <Row>
                <Col lg={3}>
                    <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
                        <Card.Header className="bg-danger text-white">
                            <h6 className="mb-0 text-end" dir="rtl"><i className="fas fa-list me-2"></i>فهرس النظام التأديبي</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Nav variant="pills" className="flex-column">
                                {sections.map((section) => (
                                    <Nav.Item key={section.id}>
                                        <Nav.Link className={`text-end border-0 rounded-0 ${activeSection === section.id ? 'active bg-danger' : ''}`} dir="rtl" onClick={() => setActiveSection(section.id)} style={{ cursor: 'pointer' }}>
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
                <h3 className="text-danger mb-3">النادي الرياضي الهاوي</h3>
                <hr className="w-50 mx-auto" />
                <h2 className="text-primary">النظام التأديبي النموذجي</h2>
            </div>
            <Card className="border-danger mb-4">
                <Card.Header className="bg-danger text-white">
                    <h5 className="mb-0"><i className="fas fa-info-circle me-2"></i> تقديم</h5>
                </Card.Header>
                <Card.Body>
                    <p className="lead">النظام التأديبي النموذجي هذا معد تطبيقاً لأحكام المادة 51 من المرسوم التنفيذي رقم 15-74 المؤرخ في 26 ربيع الثاني عام 1436 الموافق 16 فبراير 2015 الذي يحدد الأحكام والقانون الأساسي النموذجي المطبق على النادي الرياضي الهاوي.</p>
                    <p className="text-muted">ويلحق بالقانون الأساسي للنادي الرياضي الهاوي.</p>
                </Card.Body>
            </Card>
            <Card className="border-primary mb-4">
                <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0"><i className="fas fa-list-ol me-2"></i> الفهرس</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <div className="p-3 border-bottom">
                                <Badge bg="danger" className="me-2">01</Badge>
                                <strong>الفصل الأول:</strong> الأجهزة التأديبية للنادي الرياضي الهاوي
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="p-3">
                                <Badge bg="warning" className="me-2">02</Badge>
                                <strong>الفصل الثاني:</strong> الأخطاء الجسيمة
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};


const Chapter1: React.FC = () => {
    return (
        <div className="regulation-content" dir="rtl">
            <div className="text-center mb-4">
                <h3 className="text-danger"><i className="fas fa-balance-scale me-2"></i>الفصل الأول: الأجهزة التأديبية للنادي الرياضي الهاوي</h3>
                <hr className="w-25 mx-auto" />
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-danger"><i className="fas fa-bookmark me-2"></i>المادة الأولى:</h5>
                <p>دون الإخلال بالتنظيمات المسنة من طرف الاتحادية الرياضية الوطنية والرابطات الرياضية المنظم إليها النادي الرياضي الهاوي، تؤسس ضمن النادي الرياضي الهاوي:</p>
                <ul><li>لجنة تأديب</li><li>لجنة طعن</li></ul>
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-danger"><i className="fas fa-bookmark me-2"></i>المادة 2:</h5>
                <p>تختص لجنة التأديب ولجنة الطعن لممارسة السلطة التأديبية على الرياضيين أو مجموعة الرياضيين ومستخدمي التأطير المنصوص عليهم في المادتين 59 و60 من القانون رقم 13-05 المؤرخ في 23 يوليو سنة 2015 والمتعلق بتنظيم الأنشطة البدنية والرياضية وتطويرها.</p>
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-danger"><i className="fas fa-bookmark me-2"></i>المادة 3:</h5>
                <p>تتشكل لجنة التأديب ولجنة الطعن كل واحدة منها من <strong>ثلاثة (3) أعضاء</strong> يختارون لكفاءتهم ويساعدهم الأمين العام للنادي لضمان أمانة أشغال كل لجنة.</p>
                <p className="text-muted">لا يجب أن ينتمي هؤلاء الأعضاء إلى المكتب التنفيذي للنادي الرياضي الهاوي ويمكن اختيارهم خارج الجمعية العامة نظراً لكفاءتهم.</p>
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-danger"><i className="fas fa-bookmark me-2"></i>المادة 4:</h5>
                <p>يعين أعضاء اللجنتين من طرف رئيس النادي بعد أخذ رأي المكتب التنفيذي للنادي الرياضي الهاوي. وتحدد عهدتيهما بـ<strong>أربع (04) سنوات</strong>. وينتخب رئيس كل لجنة من وبين أعضاء اللجنة.</p>
            </div>
            <Card className="mb-4 border-info">
                <Card.Header className="bg-info text-white"><h5 className="mb-0">إجراءات العمل</h5></Card.Header>
                <Card.Body>
                    <p><strong>المادة 5:</strong> تجتمع اللجنتين باستدعاء من رئيسها، واللذان يحددان تاريخ الجلسة كل على حدى.</p>
                    <p><strong>المادة 6:</strong> لا يمكن لأي أحد الاجتماع في لجنة الطعن إذا كان عضواً في لجنة التأديب.</p>
                    <p><strong>المادة 7:</strong> يرتبط أعضاء اللجنتين بالتزام السرية عن كل الأفعال والمعلومات التي اطلعوا عليها.</p>
                    <p><strong>المادة 8:</strong> يختار رئيس لجنة التأديب من بين أعضاء اللجنة أشخاص مكلفون بالتحقيق في القضية.</p>
                    <p><strong>المادة 9:</strong> يباشر رئيس النادي المتابعات التأديبية.</p>
                </Card.Body>
            </Card>
            <Card className="mb-4 border-warning">
                <Card.Header className="bg-warning text-dark"><h5 className="mb-0">الإخطار والتبليغ</h5></Card.Header>
                <Card.Body>
                    <p><strong>المادة 10:</strong> يقوم الأمين العام بإخطار الأعضاء المتابعين بالتدابير التأديبية بواسطة خطاب موصى عليه مرفوقاً بالشكاوى المرفوعة ضدهم في أجل <strong>عشرة (10) أيام</strong> قبل تاريخ الجلسة على الأقل. يمكن تقليص هذا الأجل إلى <strong>خمسة (05) أيام</strong> في حالة الاستعجال.</p>
                    <p><strong>المادة 11:</strong> يمكن أن يساعد المعني بالأمر أي شخص يقوم باختياره كما يمكنه الاطلاع على كل محتوى الملف قبل الجلسة.</p>
                    <p><strong>المادة 12:</strong> تتم مداولة لجنة التأديب في جلسة سرية وتبت بقرار معلل.</p>
                </Card.Body>
            </Card>
            <Card className="mb-4 border-success">
                <Card.Header className="bg-success text-white"><h5 className="mb-0">القرارات والطعن</h5></Card.Header>
                <Card.Body>
                    <p><strong>المادة 13:</strong> يتعين على لجنة التأديب النطق بقرارها في أجل <strong>واحد وعشرون (21) يوماً</strong> كأقصى حد ابتداءً من مباشرة المتابعات التأديبية.</p>
                    <p><strong>المادة 14:</strong> يمكن أن يكون قرار لجنة التأديب محل طعن لدى لجنة الطعن في أجل <strong>عشرة (10) أيام</strong> ابتداءً من تبليغه للمعني بالأمر. <strong>يوقف الطعن تنفيذ العقوبة.</strong></p>
                    <p><strong>المادة 15:</strong> يتعين على لجنة الطعن النطق بقرارها في أجل <strong>خمسة عشر (15) يوماً</strong> على الأكثر ابتداءً من إخطارها.</p>
                </Card.Body>
            </Card>
        </div>
    );
};


const Chapter2: React.FC = () => {
    return (
        <div className="regulation-content" dir="rtl">
            <div className="text-center mb-4">
                <h3 className="text-warning"><i className="fas fa-exclamation-triangle me-2"></i>الفصل الثاني: الأخطاء الجسيمة</h3>
                <hr className="w-25 mx-auto" />
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-warning"><i className="fas fa-bookmark me-2"></i>المادة 16:</h5>
                <p>زيادة على العقوبات المنصوص عليها في التشريع والتنظيم والأنظمة المعمول بهم، حالات الأخطاء الجسيمة تصنف كما يأتي:</p>
            </div>
            <Card className="mb-4 border-success">
                <Card.Header className="bg-success text-white"><h5 className="mb-0">الأخطاء من الدرجة الأولى</h5></Card.Header>
                <Card.Body>
                    <ul>
                        <li>التغيب كما هو منصوص عليه في القوانين الأساسية وأنظمة النادي</li>
                        <li>عدم تسديد الاشتراكات</li>
                    </ul>
                </Card.Body>
            </Card>
            <Card className="mb-4 border-warning">
                <Card.Header className="bg-warning text-dark"><h5 className="mb-0">الأخطاء من الدرجة الثانية</h5></Card.Header>
                <Card.Body>
                    <ul>
                        <li>عدم احترام القوانين والأنظمة الرياضية المعمول بها</li>
                        <li>الأعمال المخالفة لأخلاقيات الرياضة</li>
                        <li>المساس باستقرار النادي</li>
                        <li>خرق قواعد مكافحة تعاطي المنشطات</li>
                        <li>عدم احترام قواعد المراسيم والتشريفات الرسمية المتعلقة بالمنافسات والتظاهرات الرياضية</li>
                    </ul>
                </Card.Body>
            </Card>
            <Card className="mb-4 border-danger">
                <Card.Header className="bg-danger text-white"><h5 className="mb-0">الأخطاء من الدرجة الثالثة</h5></Card.Header>
                <Card.Body>
                    <ul>
                        <li>أعمال العنف البدنية أو اللفظية</li>
                        <li>المخالفات المنصوص عليها في القانون رقم 13-05 المؤرخ في 23 يوليو 2013</li>
                        <li>عدم تلبية طلب الاستدعاء إلى المنتخب الوطني</li>
                        <li>عدم احترام بنود الاتفاقيات</li>
                    </ul>
                </Card.Body>
            </Card>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-danger"><i className="fas fa-bookmark me-2"></i>المادة 17: العقوبات</h5>
                <p>تصنف العقوبات التي بإمكان تسليطها من طرف لجنة التأديب كما يأتي:</p>
                <Row>
                    <Col md={4}>
                        <Card className="border-success h-100">
                            <Card.Header className="bg-success text-white text-center">الدرجة الأولى</Card.Header>
                            <Card.Body className="text-center">
                                <p>توقيف مؤقت لمدة</p>
                                <h5>6 إلى 12 شهراً</h5>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="border-warning h-100">
                            <Card.Header className="bg-warning text-dark text-center">الدرجة الثانية</Card.Header>
                            <Card.Body className="text-center">
                                <p>توقيف مؤقت لمدة</p>
                                <h5>13 إلى 24 شهراً</h5>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="border-danger h-100">
                            <Card.Header className="bg-danger text-white text-center">الدرجة الثالثة</Card.Header>
                            <Card.Body className="text-center">
                                <p>توقيف لأكثر من 24 شهراً</p>
                                <h5>أو الطرد من النادي</h5>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-danger"><i className="fas fa-bookmark me-2"></i>المادة 18:</h5>
                <p>لا يمكن لعقوبة الطرد لعضو في النادي الهاوي الصادر عن الجمعية العامة باقتراح من المكتب التنفيذي للنادي أن تكون محل طعن لدى لجنة الطعن.</p>
            </div>
            <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-danger"><i className="fas fa-bookmark me-2"></i>المادة 19:</h5>
                <p>طبقاً لأحكام المادة 52 من القانون الأساسي النموذجي للنادي الرياضي الهاوي، تتخذ الإدارة المحلية المكلفة بالرياضة العقوبات ضد المستخدمين الموضوعين تحت تصرف النادي الهاوي بناءً على تقرير من الرابطة أو الاتحادية أو مصالح الإدارة المحلية المكلفة بالرياضة.</p>
            </div>
            <Card className="border-dark">
                <Card.Body>
                    <Row className="text-center">
                        <Col md={6}><div className="p-3"><p>حرر بـ................في:.........................</p></div></Col>
                        <Col md={6}><div className="p-3"><p><strong>صودق عليه من طرف رئيس النادي</strong></p><p className="text-muted mt-4">الإمضاء: ...........................</p></div></Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default DisciplinarySystem;
