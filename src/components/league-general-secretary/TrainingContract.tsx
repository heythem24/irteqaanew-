import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';

const TrainingContract: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        leagueName: '', clubName: '', clubCode: '', presidentName: '', clubAddress: '',
        division: '', clubEmail: '', clubBankAccount: '',
        coachFirstName: '', coachLastName: '', birthDate: '', birthPlace: '', coachAddress: '',
        fatherName: '', motherName: '', coachPhone: '', coachEmail: '', certificate: '', coachBankAccount: '',
        position: '', season: '2024-2025', category: '', contractStartDate: '',
        monthlySalary: '', monthlySalaryWords: '',
        homeWinBonus: '', awayWinBonus: '', awayDrawBonus: '', seasonalGoal: '', seasonalBonus: '',
        signPlace: '', signDate: '', licenseNumber: ''
    });

    const updateForm = (field: string, value: string) => setFormData({ ...formData, [field]: value });
    const totalPages = 4;

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-end" dir="rtl"><i className="fas fa-file-contract me-3"></i>عقد تدريب</h2>
                <span className="badge bg-primary p-2">الصفحة {currentPage} من {totalPages}</span>
            </div>
            <Card className="shadow-sm mb-4">
                <Card.Body className="p-4">
                    {currentPage === 1 && <Page1 formData={formData} updateForm={updateForm} />}
                    {currentPage === 2 && <Page2 formData={formData} updateForm={updateForm} />}
                    {currentPage === 3 && <Page3 />}
                    {currentPage === 4 && <Page4 formData={formData} updateForm={updateForm} />}
                </Card.Body>
            </Card>
            <div className="d-flex justify-content-between">
                <Button variant="outline-primary" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                    <i className="fas fa-chevron-right me-2"></i>الصفحة السابقة
                </Button>
                <div className="d-flex gap-2">
                    {[1, 2, 3, 4].map(p => (
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


interface PageProps { formData: any; updateForm: (field: string, value: string) => void; }

const Page1: React.FC<PageProps> = ({ formData, updateForm }) => (
    <div dir="rtl">
        <div className="text-center mb-4">
            <h5>الاتحاد الجزائري لكرة القدم</h5>
            <p>الرابطة <Form.Control type="text" className="d-inline-block mx-1" style={{ width: '200px' }} value={formData.leagueName} onChange={(e) => updateForm('leagueName', e.target.value)} /> لكرة القدم</p>
            <p>النادي الرياضي الهاوي المسمى: <Form.Control type="text" className="d-inline-block mx-1" style={{ width: '250px' }} value={formData.clubName} onChange={(e) => updateForm('clubName', e.target.value)} /></p>
            <h4 className="text-primary my-4">عقد تدريب</h4>
        </div>

        <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white"><h5 className="mb-0">الطرف الأول</h5></Card.Header>
            <Card.Body>
                <Row className="mb-3">
                    <Col md={6}><Form.Group><Form.Label>النادي الرياضي الهاوي المسمى:</Form.Label><Form.Control value={formData.clubName} onChange={(e) => updateForm('clubName', e.target.value)} /></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label>رمزه:</Form.Label><Form.Control value={formData.clubCode} onChange={(e) => updateForm('clubCode', e.target.value)} /></Form.Group></Col>
                </Row>
                <Row className="mb-3">
                    <Col md={6}><Form.Group><Form.Label>ممثلا في رئيسه:</Form.Label><Form.Control value={formData.presidentName} onChange={(e) => updateForm('presidentName', e.target.value)} /></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label>عنوانه:</Form.Label><Form.Control value={formData.clubAddress} onChange={(e) => updateForm('clubAddress', e.target.value)} /></Form.Group></Col>
                </Row>
                <Row className="mb-3">
                    <Col md={4}><Form.Group><Form.Label>المنتمي إلى القسم:</Form.Label><Form.Control value={formData.division} onChange={(e) => updateForm('division', e.target.value)} /></Form.Group></Col>
                    <Col md={4}><Form.Group><Form.Label>البريد الإلكتروني:</Form.Label><Form.Control type="email" value={formData.clubEmail} onChange={(e) => updateForm('clubEmail', e.target.value)} /></Form.Group></Col>
                    <Col md={4}><Form.Group><Form.Label>رقم الحساب البنكي أو البريدي:</Form.Label><Form.Control value={formData.clubBankAccount} onChange={(e) => updateForm('clubBankAccount', e.target.value)} /></Form.Group></Col>
                </Row>
            </Card.Body>
        </Card>

        <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white"><h5 className="mb-0">الطرف الثاني</h5></Card.Header>
            <Card.Body>
                <Row className="mb-3">
                    <Col md={6}><Form.Group><Form.Label>الاسم:</Form.Label><Form.Control value={formData.coachFirstName} onChange={(e) => updateForm('coachFirstName', e.target.value)} /></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label>اللقب:</Form.Label><Form.Control value={formData.coachLastName} onChange={(e) => updateForm('coachLastName', e.target.value)} /></Form.Group></Col>
                </Row>
                <Row className="mb-3">
                    <Col md={4}><Form.Group><Form.Label>تاريخ الميلاد:</Form.Label><Form.Control type="date" value={formData.birthDate} onChange={(e) => updateForm('birthDate', e.target.value)} /></Form.Group></Col>
                    <Col md={4}><Form.Group><Form.Label>بـ:</Form.Label><Form.Control value={formData.birthPlace} onChange={(e) => updateForm('birthPlace', e.target.value)} /></Form.Group></Col>
                    <Col md={4}><Form.Group><Form.Label>الساكن بـ:</Form.Label><Form.Control value={formData.coachAddress} onChange={(e) => updateForm('coachAddress', e.target.value)} /></Form.Group></Col>
                </Row>
                <Row className="mb-3">
                    <Col md={6}><Form.Group><Form.Label>ابن:</Form.Label><Form.Control value={formData.fatherName} onChange={(e) => updateForm('fatherName', e.target.value)} /></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label>و:</Form.Label><Form.Control value={formData.motherName} onChange={(e) => updateForm('motherName', e.target.value)} /></Form.Group></Col>
                </Row>
                <Row className="mb-3">
                    <Col md={4}><Form.Group><Form.Label>رقم الهاتف الشخصي:</Form.Label><Form.Control value={formData.coachPhone} onChange={(e) => updateForm('coachPhone', e.target.value)} /></Form.Group></Col>
                    <Col md={4}><Form.Group><Form.Label>البريد الإلكتروني:</Form.Label><Form.Control type="email" value={formData.coachEmail} onChange={(e) => updateForm('coachEmail', e.target.value)} /></Form.Group></Col>
                    <Col md={4}><Form.Group><Form.Label>الحامل للشهادة التدريبية:</Form.Label><Form.Control value={formData.certificate} onChange={(e) => updateForm('certificate', e.target.value)} /></Form.Group></Col>
                </Row>
                <Row><Col md={6}><Form.Group><Form.Label>رقم الحساب البنكي أو البريدي:</Form.Label><Form.Control value={formData.coachBankAccount} onChange={(e) => updateForm('coachBankAccount', e.target.value)} /></Form.Group></Col></Row>
            </Card.Body>
        </Card>
        <p className="text-center fw-bold">وتم الاتفاق على إمضاء بنود العقد بين الطرف الأول والثاني وفق الشروط التالية:</p>
    </div>
);


const Page2: React.FC<PageProps> = ({ formData, updateForm }) => (
    <div dir="rtl">
        <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white"><h5 className="mb-0">المادة 01: الإطار القانوني والغرض من العقد</h5></Card.Header>
            <Card.Body>
                <p>يحدد هذا العقد علاقة العمل بين الطرف الأول بصفته رب العمل والطرف الثاني بصفته عامل في وظيفة فنية تدريبية لدى الطرف الأول وفق المهام، الحقوق والواجبات المذكورة في بنود العقد الموقعة طبقاً لـ:</p>
                <ul>
                    <li>✓ قانون العمل 90-11 المؤرخ في 21 أفريل 1990.</li>
                    <li>✓ القوانين العامة للاتحاد الجزائري لكرة القدم.</li>
                </ul>
                <p className="text-muted">ويكون هذا العقد هو الإطار القانوني لكل الوظائف الفنية في أندية كرة القدم للهواة، رابطة كرة القدم النسوية ورابطة كرة القدم داخل القاعة.</p>
            </Card.Body>
        </Card>

        <Card className="mb-4 border-warning">
            <Card.Header className="bg-warning text-dark"><h5 className="mb-0">المادة 02: التعيين</h5></Card.Header>
            <Card.Body>
                <p>يعين النادي الرياضي الهاوي المسمى أعلاه الطرف الثاني:</p>
                <Row className="mb-3">
                    <Col md={4}><Form.Group><Form.Label>اسم المدرب:</Form.Label><Form.Control value={`${formData.coachFirstName} ${formData.coachLastName}`} readOnly /></Form.Group></Col>
                    <Col md={4}><Form.Group><Form.Label>في وظيفة:</Form.Label>
                        <Form.Select value={formData.position} onChange={(e) => updateForm('position', e.target.value)}>
                            <option value="">اختر الوظيفة...</option>
                            <option value="مدرب رئيسي">مدرب رئيسي</option>
                            <option value="مدرب مساعد">مدرب مساعد</option>
                            <option value="مدير فني">مدير فني</option>
                            <option value="محضر بدني">محضر بدني</option>
                            <option value="مدرب حراس مرمى">مدرب حراس مرمى</option>
                        </Form.Select>
                    </Form.Group></Col>
                    <Col md={4}><Form.Group><Form.Label>لصنف:</Form.Label><Form.Control value={formData.category} onChange={(e) => updateForm('category', e.target.value)} /></Form.Group></Col>
                </Row>
                <p>للنادي خلال الموسم الرياضي {formData.season}</p>
            </Card.Body>
        </Card>

        <Card className="mb-4 border-secondary">
            <Card.Header className="bg-secondary text-white"><h5 className="mb-0">المادة 03: مدة العقد</h5></Card.Header>
            <Card.Body>
                <p>يوقع العقد بين الطرفين لمدة موسم رياضي واحد ويبدأ من تاريخ توقيع العقد في:</p>
                <Form.Control type="date" className="mb-3" style={{ width: '200px' }} value={formData.contractStartDate} onChange={(e) => updateForm('contractStartDate', e.target.value)} />
                <p>وينتهي بإجراء آخر مقابلة رسمية للنادي في الموسم الرياضي {formData.season}.</p>
            </Card.Body>
        </Card>

        <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white"><h5 className="mb-0">المادة 04: الرواتب الشهرية</h5></Card.Header>
            <Card.Body>
                <p>يتلقى الطرف الثاني خلال مدة قيامه بمهامه راتباً شهرياً صافياً قدره:</p>
                <Row>
                    <Col md={6}><Form.Group><Form.Label>المبلغ (بالأرقام):</Form.Label><Form.Control value={formData.monthlySalary} onChange={(e) => updateForm('monthlySalary', e.target.value)} placeholder="دج" /></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label>المبلغ (بالحروف):</Form.Label><Form.Control value={formData.monthlySalaryWords} onChange={(e) => updateForm('monthlySalaryWords', e.target.value)} /></Form.Group></Col>
                </Row>
                <p className="text-danger mt-2"><strong>ملاحظة:</strong> يتم دفعه إجبارياً في الحساب البنكي أو البريدي الجاري للمدرب، ويمنع منعاً باتاً تسديد الأجور الشهرية نقداً.</p>
            </Card.Body>
        </Card>

        <Card className="border-primary">
            <Card.Header className="bg-primary text-white"><h5 className="mb-0">المادة 04 مكرر: العلاوات والمنح الموسمية</h5></Card.Header>
            <Card.Body>
                <p>ويتلقى الطرف الثاني إضافة إلى الراتب الشهري علاوات المباريات بالشكل التالي:</p>
                <Row className="mb-3">
                    <Col md={4}><Form.Group><Form.Label>فوز داخل الديار:</Form.Label><Form.Control value={formData.homeWinBonus} onChange={(e) => updateForm('homeWinBonus', e.target.value)} /></Form.Group></Col>
                    <Col md={4}><Form.Group><Form.Label>فوز خارج الديار:</Form.Label><Form.Control value={formData.awayWinBonus} onChange={(e) => updateForm('awayWinBonus', e.target.value)} /></Form.Group></Col>
                    <Col md={4}><Form.Group><Form.Label>تعادل خارج الديار:</Form.Label><Form.Control value={formData.awayDrawBonus} onChange={(e) => updateForm('awayDrawBonus', e.target.value)} /></Form.Group></Col>
                </Row>
                <Row>
                    <Col md={6}><Form.Group><Form.Label>منح الهدف الموسمي المحدد بـ:</Form.Label><Form.Control value={formData.seasonalGoal} onChange={(e) => updateForm('seasonalGoal', e.target.value)} /></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label>وقدرها:</Form.Label><Form.Control value={formData.seasonalBonus} onChange={(e) => updateForm('seasonalBonus', e.target.value)} /></Form.Group></Col>
                </Row>
                <p className="text-muted mt-2 small">(تكتب بدقة أي علاوات او تحفيزات أو منح أهداف موسمية ، تشطب المادة 04 مكرر إذا كان اتفاق الطرفين يشمل فقط الراتب الشهري الصافي)</p>
            </Card.Body>
        </Card>
    </div>
);

const Page3: React.FC = () => (
    <div dir="rtl">
        <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white"><h5 className="mb-0">المادة 05: التزامات الطرفين</h5></Card.Header>
            <Card.Body>
                <p>يلتزم المدرب بحضور كل التربصات، الملتقيات التكوينية التي تنظمها الهيئات الرياضية، ويكون النادي الرياضي أيضاً مطالباً من جهته بالترخيص للمدرب بالحضور إلى كل ما له علاقة بالتربصات التكوينية، والأيام البيداغوجية، وأي استدعاءات تصله من الهيئات الكروية.</p>
            </Card.Body>
        </Card>

        <Card className="mb-4 border-danger">
            <Card.Header className="bg-danger text-white"><h5 className="mb-0">المادة 06: النزاعات بين الطرفين</h5></Card.Header>
            <Card.Body>
                <ol style={{ lineHeight: '2.2' }}>
                    <li className="mb-3">في حالة وجود أي خلاف بين الطرفين قبل نهاية مدة العقد بإمكانهما فسخ العقد كتابياً بينهما بالتراضي.</li>
                    <li className="mb-3">وفي حالة رغبة النادي الرياضي للهواة في إنهاء العلاقة التعاقدية من طرف واحد قبل نهاية الموسم فإنه مطالب بتبليغ المدرب بالقرار عن طريق بريده الإلكتروني الشخصي، المحضر القضائي، ثم تقديم نسخة من التبليغ للرابطة المختصة من أجل التعاقد مع المدرب الجديد، ويكون الحق للمدرب في هذه الحالة الحصول على تعويض ضرر مالي بقيمة تعادل راتبين شهريين كشرط جزائي إضافي فوق حقوقه المالية للمدة التي عملها بصفة فعلية (ويكون تعويض متبقي العقد إذا كانت المدة المتبقية منه عند تبليغ القرار أقل من شهرين).</li>
                    <li className="mb-3">لا يحق للطرف الثاني الحصول على التعويض عن الضرر إذا كان إنهاء العلاقة التعاقدية من طرف النادي بسبب تخليه عن مهامه (مع تقديم النادي لكل البيانات والإثباتات من محاضر غياب أو أوراق مباريات تشير لعدم تواجد المدرب خلالها).</li>
                    <li className="mb-3">يحق للطرف الثاني من جهته إنهاء العلاقة التعاقدية من جانب واحد بتقديم الاستقالة للنادي سواء عن طريق البريد الإلكتروني أو المحضر القضائي مع تقديم نسخة من الاستقالة وإثبات تبليغها للنادي إلى الرابطة التابع لها في أجل لا يتعدى 5 أيام من اتخاذ القرار ويحق للنادي في هذه الحالة مطالبة المدرب بإعادة راتب شهري واحد من المدة التي عملها بصفة فعلية.</li>
                </ol>
            </Card.Body>
        </Card>

        <Card className="mb-4 border-dark">
            <Card.Header className="bg-dark text-white"><h5 className="mb-0">المادة 07: النزاعات القضائية</h5></Card.Header>
            <Card.Body>
                <p>أي نزاع مالي بين الطرفين بخصوص الأجور الشهرية، المنح أو تعويضات الضرر المذكورة في المادة 05 يطرح على مستوى القضاء المدني (على مستوى مفتشية العمل والمحكمة المختصة إقليمياً في موطن أحد الطرفين).</p>
                <p className="mt-3">ويكون بإمكان أحد الطرفين تسجيل شكوى مستعجلة على مستوى لجنة القوانين الأساسية وأنظمة اللاعب على مستوى الاتحاد الجزائري لكرة القدم عبر منصة "<strong>faf legal</strong>" لكن في طلب واحد يخص فسخ العقد ولا تدرس اللجنة أي مطالب مادية.</p>
            </Card.Body>
        </Card>

        <Card className="border-primary">
            <Card.Body className="bg-light">
                <p className="text-center fw-bold">ويوقع هذا العقد في <span className="text-primary">03 نسخ أصلية</span> تمنح واحدة منها إجبارياً للطرف الثاني، ويحتفظ النادي بالنسخة الثانية وتودع نسخة ثالثة عبر المنصة الرقمية "<strong>faf-connect</strong>" مرفوقة بملف الطرف الثاني كاملاً من أجل الحصول على الإجازة الموسمية.</p>
            </Card.Body>
        </Card>
    </div>
);

const Page4: React.FC<PageProps> = ({ formData, updateForm }) => (
    <div dir="rtl">
        <Card className="mb-4 border-secondary">
            <Card.Header className="bg-secondary text-white text-center"><h5 className="mb-0">تحرير العقد</h5></Card.Header>
            <Card.Body>
                <Row className="mb-4">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold">حرر في:</Form.Label>
                            <Form.Control type="text" value={formData.signPlace} onChange={(e) => updateForm('signPlace', e.target.value)} placeholder="المدينة / البلدية" />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold">بتاريخ:</Form.Label>
                            <Form.Control type="date" value={formData.signDate} onChange={(e) => updateForm('signDate', e.target.value)} />
                        </Form.Group>
                    </Col>
                </Row>
            </Card.Body>
        </Card>

        <Row className="mb-4">
            <Col md={6}>
                <Card className="h-100 border-primary">
                    <Card.Header className="bg-primary text-white text-center">
                        <h6 className="mb-0">الطرف الأول: رئيس النادي الرياضي الهاوي</h6>
                    </Card.Header>
                    <Card.Body className="text-center">
                        <p className="text-muted mb-3">(ختم النادي، الختم الشخصي، والتوقيع)</p>
                        <div style={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '40px', minHeight: '150px', backgroundColor: '#f8f9fa' }}>
                            <i className="fas fa-stamp fa-3x text-muted mb-2"></i>
                            <p className="text-muted small">مكان الختم والتوقيع</p>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="h-100 border-success">
                    <Card.Header className="bg-success text-white text-center">
                        <h6 className="mb-0">الطرف الثاني: السيد / {formData.coachFirstName} {formData.coachLastName}</h6>
                    </Card.Header>
                    <Card.Body className="text-center">
                        <p className="text-muted mb-3">(التوقيع والبصمة)</p>
                        <div style={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '40px', minHeight: '150px', backgroundColor: '#f8f9fa' }}>
                            <i className="fas fa-fingerprint fa-3x text-muted mb-2"></i>
                            <p className="text-muted small">مكان التوقيع والبصمة</p>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        <Card className="mb-4 border-warning">
            <Card.Header className="bg-warning text-dark text-center">
                <h6 className="mb-0"><i className="fas fa-certificate me-2"></i>إطار مخصص لرابطة {formData.leagueName}</h6>
            </Card.Header>
            <Card.Body>
                <Row className="align-items-center">
                    <Col md={8}>
                        <p className="mb-2"><strong>الموافقة على العقد بعد معاينة الشهادة</strong></p>
                        <Form.Group className="mb-3">
                            <Form.Label>وتمنح للمعني إجازة رقم:</Form.Label>
                            <Form.Control type="text" value={formData.licenseNumber} onChange={(e) => updateForm('licenseNumber', e.target.value)} placeholder="رقم الإجازة" style={{ maxWidth: '300px' }} />
                        </Form.Group>
                    </Col>
                    <Col md={4} className="text-center">
                        <div style={{ border: '2px dashed #ffc107', borderRadius: '8px', padding: '20px', backgroundColor: '#fff8e1' }}>
                            <i className="fas fa-stamp fa-2x text-warning mb-2"></i>
                            <p className="text-muted small mb-0">ختم الرابطة</p>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>

        <Card className="border-danger">
            <Card.Header className="bg-danger text-white">
                <h6 className="mb-0"><i className="fas fa-exclamation-triangle me-2"></i>ملاحظة هامة</h6>
            </Card.Header>
            <Card.Body className="bg-light">
                <p className="mb-0 text-danger fw-bold">تكتب بيانات كل الأطراف وبقية المواد بالإعلام الآلي مع ذكر كل البيانات المطلوبة دون إهمال، ويعتبر العقد ملغى في حالة وجود أي إضافات أو كتابة بالسيالة.</p>
            </Card.Body>
        </Card>
    </div>
);

export default TrainingContract;