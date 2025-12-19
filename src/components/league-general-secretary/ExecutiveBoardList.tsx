import React, { useState } from 'react';
import { Container, Card, Table, Form, Button, Row, Col } from 'react-bootstrap';

interface BoardMember {
    id: number;
    fullNameAr: string;
    fullNameFr: string;
    birthDatePlace: string;
    fatherName: string;
    motherName: string;
    address: string;
    educationLevel: string;
    position: string;
}

const ExecutiveBoardList: React.FC = () => {
    const [clubName, setClubName] = useState('');
    const [electionDate, setElectionDate] = useState('');
    const [mandateStartDate, setMandateStartDate] = useState('');
    
    const [members, setMembers] = useState<BoardMember[]>([
        { id: 1, fullNameAr: '', fullNameFr: '', birthDatePlace: '', fatherName: '', motherName: '', address: '', educationLevel: '', position: 'الرئيس' },
        { id: 2, fullNameAr: '', fullNameFr: '', birthDatePlace: '', fatherName: '', motherName: '', address: '', educationLevel: '', position: 'نائب أول للرئيس' },
        { id: 3, fullNameAr: '', fullNameFr: '', birthDatePlace: '', fatherName: '', motherName: '', address: '', educationLevel: '', position: 'نائب ثاني للرئيس' },
        { id: 4, fullNameAr: '', fullNameFr: '', birthDatePlace: '', fatherName: '', motherName: '', address: '', educationLevel: '', position: 'أمين عام' },
        { id: 5, fullNameAr: '', fullNameFr: '', birthDatePlace: '', fatherName: '', motherName: '', address: '', educationLevel: '', position: 'مساعد الأمين العام' },
        { id: 6, fullNameAr: '', fullNameFr: '', birthDatePlace: '', fatherName: '', motherName: '', address: '', educationLevel: '', position: 'أمين المال' },
        { id: 7, fullNameAr: '', fullNameFr: '', birthDatePlace: '', fatherName: '', motherName: '', address: '', educationLevel: '', position: 'مساعد أمين المال' },
        { id: 8, fullNameAr: '', fullNameFr: '', birthDatePlace: '', fatherName: '', motherName: '', address: '', educationLevel: '', position: 'مساعد' },
    ]);

    const updateMember = (id: number, field: keyof BoardMember, value: string) => {
        setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const addMember = () => {
        const newId = members.length + 1;
        setMembers([...members, { id: newId, fullNameAr: '', fullNameFr: '', birthDatePlace: '', fatherName: '', motherName: '', address: '', educationLevel: '', position: 'مساعد' }]);
    };

    const removeMember = (id: number) => {
        if (members.length > 1) {
            setMembers(members.filter(m => m.id !== id).map((m, idx) => ({ ...m, id: idx + 1 })));
        }
    };

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-end" dir="rtl">
                    <i className="fas fa-user-tie me-3"></i>قائمة أعضاء المكتب التنفيذي
                </h2>
            </div>

            <Card className="shadow-sm">
                <Card.Header className="bg-info text-white">
                    <h5 className="mb-0 text-end" dir="rtl">
                        <i className="fas fa-file-alt me-2"></i>معلومات المكتب التنفيذي
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Row className="mb-4" dir="rtl">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">النادي الرياضي للهواة:</Form.Label>
                                <Form.Control type="text" placeholder="اسم النادي..." value={clubName} onChange={(e) => setClubName(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">المنتخب بتاريخ:</Form.Label>
                                <Form.Control type="date" value={electionDate} onChange={(e) => setElectionDate(e.target.value)} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="table-responsive" dir="rtl">
                        <Table bordered hover className="text-center" style={{ minWidth: '1600px' }}>
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ minWidth: '60px', whiteSpace: 'nowrap' }}>الرقم</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>اللقب و الاسم</th>
                                    <th style={{ minWidth: '250px', whiteSpace: 'nowrap' }}>اللقب و الاسم بالفرنسية</th>
                                    <th style={{ minWidth: '220px', whiteSpace: 'nowrap' }}>تاريخ ومكان الميلاد</th>
                                    <th style={{ minWidth: '120px', whiteSpace: 'nowrap' }}>اسم الأب</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>اسم ولقب الأم</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>العنوان الشخصي</th>
                                    <th style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>المستوى الدراسي</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>الوظيفة في الجمعية</th>
                                    <th style={{ minWidth: '60px', whiteSpace: 'nowrap' }}>حذف</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td className="align-middle fw-bold">{member.id}</td>
                                        <td><Form.Control size="sm" type="text" value={member.fullNameAr} onChange={(e) => updateMember(member.id, 'fullNameAr', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" dir="ltr" value={member.fullNameFr} onChange={(e) => updateMember(member.id, 'fullNameFr', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.birthDatePlace} onChange={(e) => updateMember(member.id, 'birthDatePlace', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.fatherName} onChange={(e) => updateMember(member.id, 'fatherName', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.motherName} onChange={(e) => updateMember(member.id, 'motherName', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.address} onChange={(e) => updateMember(member.id, 'address', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.educationLevel} onChange={(e) => updateMember(member.id, 'educationLevel', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.position} onChange={(e) => updateMember(member.id, 'position', e.target.value)} className="fw-bold text-primary" /></td>
                                        <td>
                                            <Button variant="outline-danger" size="sm" onClick={() => removeMember(member.id)}>
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    <div className="d-flex justify-content-center mb-4">
                        <Button variant="success" onClick={addMember}>
                            <i className="fas fa-plus me-2"></i>إضافة عضو جديد
                        </Button>
                    </div>

                    <Card className="border-info mt-4">
                        <Card.Body dir="rtl">
                            <Row className="align-items-center">
                                <Col md={8}>
                                    <p className="mb-0 fw-bold">
                                        العهدة الانتخابية لهذا المكتب <span className="text-primary">04 سنوات</span> ابتداءً من تاريخ:
                                        <Form.Control type="date" className="d-inline-block mx-2" style={{ width: '200px' }} value={mandateStartDate} onChange={(e) => setMandateStartDate(e.target.value)} />
                                        طبقاً للقانون الأساسي للنادي.
                                    </p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Row className="mt-4">
                        <Col md={6}>
                            <Card className="border-primary">
                                <Card.Body className="text-center" dir="rtl">
                                    <h5 className="text-primary mb-3">
                                        <i className="fas fa-signature me-2"></i>إمضاء الرئيس
                                    </h5>
                                    <div className="border border-2 border-primary p-5 mx-auto" style={{ maxWidth: '300px', minHeight: '120px' }}></div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="border-warning">
                                <Card.Body className="text-center" dir="rtl">
                                    <h5 className="text-warning mb-3">
                                        <i className="fas fa-stamp me-2"></i>تأشيرة المحضر القضائي
                                    </h5>
                                    <div className="border border-2 border-warning p-5 mx-auto" style={{ maxWidth: '300px', minHeight: '120px' }}></div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ExecutiveBoardList;
