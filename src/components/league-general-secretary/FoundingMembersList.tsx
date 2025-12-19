import React, { useState } from 'react';
import { Container, Card, Table, Form, Button, Row, Col } from 'react-bootstrap';

interface FoundingMember {
    id: number;
    fullName: string;
    birthDatePlace: string;
    fatherName: string;
    motherName: string;
    nationality: string;
    profession: string;
    employer: string;
    address: string;
    educationLevel: string;
}

const FoundingMembersList: React.FC = () => {
    const [clubName, setClubName] = useState('');
    const [date, setDate] = useState('');
    const [members, setMembers] = useState<FoundingMember[]>([
        { id: 1, fullName: '', birthDatePlace: '', fatherName: '', motherName: '', nationality: 'جزائرية', profession: '', employer: '', address: '', educationLevel: '' },
        { id: 2, fullName: '', birthDatePlace: '', fatherName: '', motherName: '', nationality: 'جزائرية', profession: '', employer: '', address: '', educationLevel: '' },
        { id: 3, fullName: '', birthDatePlace: '', fatherName: '', motherName: '', nationality: 'جزائرية', profession: '', employer: '', address: '', educationLevel: '' },
        { id: 4, fullName: '', birthDatePlace: '', fatherName: '', motherName: '', nationality: 'جزائرية', profession: '', employer: '', address: '', educationLevel: '' },
        { id: 5, fullName: '', birthDatePlace: '', fatherName: '', motherName: '', nationality: 'جزائرية', profession: '', employer: '', address: '', educationLevel: '' },
    ]);

    const addMember = () => {
        const newId = members.length + 1;
        setMembers([...members, { id: newId, fullName: '', birthDatePlace: '', fatherName: '', motherName: '', nationality: 'جزائرية', profession: '', employer: '', address: '', educationLevel: '' }]);
    };

    const updateMember = (id: number, field: keyof FoundingMember, value: string) => {
        setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
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
                    <i className="fas fa-users me-3"></i>قائمة الأعضاء المؤسسين
                </h2>
            </div>
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0 text-end" dir="rtl">
                        <i className="fas fa-file-alt me-2"></i>معلومات القائمة
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Row className="mb-4" dir="rtl">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">قائمة الأعضاء المؤسسين بتاريخ:</Form.Label>
                                <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">النادي الرياضي للهواة:</Form.Label>
                                <Form.Control type="text" placeholder="اسم النادي..." value={clubName} onChange={(e) => setClubName(e.target.value)} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="table-responsive" dir="rtl">
                        <Table bordered hover className="text-center" style={{ minWidth: '1800px' }}>
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ minWidth: '60px', whiteSpace: 'nowrap' }}>الرقم</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>اللقب و الاسم</th>
                                    <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>تاريخ ومكان الازدياد</th>
                                    <th style={{ minWidth: '120px', whiteSpace: 'nowrap' }}>اسم الأب</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>اسم ولقب الأم</th>
                                    <th style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>الجنسية</th>
                                    <th style={{ minWidth: '120px', whiteSpace: 'nowrap' }}>المهنة</th>
                                    <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>صاحب العمل</th>
                                    <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>العنوان الشخصي</th>
                                    <th style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>المستوى الدراسي</th>
                                    <th style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>الإمضاء</th>
                                    <th style={{ minWidth: '60px', whiteSpace: 'nowrap' }}>حذف</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td className="align-middle fw-bold">{member.id}</td>
                                        <td><Form.Control size="sm" type="text" value={member.fullName} onChange={(e) => updateMember(member.id, 'fullName', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.birthDatePlace} onChange={(e) => updateMember(member.id, 'birthDatePlace', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.fatherName} onChange={(e) => updateMember(member.id, 'fatherName', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.motherName} onChange={(e) => updateMember(member.id, 'motherName', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.nationality} onChange={(e) => updateMember(member.id, 'nationality', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.profession} onChange={(e) => updateMember(member.id, 'profession', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.employer} onChange={(e) => updateMember(member.id, 'employer', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.address} onChange={(e) => updateMember(member.id, 'address', e.target.value)} /></td>
                                        <td><Form.Control size="sm" type="text" value={member.educationLevel} onChange={(e) => updateMember(member.id, 'educationLevel', e.target.value)} /></td>
                                        <td></td>
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
                    <Card className="border-warning mt-4">
                        <Card.Body className="text-center" dir="rtl">
                            <h5 className="text-warning mb-3">
                                <i className="fas fa-stamp me-2"></i>تأشيرة المحضر القضائي
                            </h5>
                            <div className="border border-2 border-warning p-5 mx-auto" style={{ maxWidth: '400px', minHeight: '150px' }}></div>
                        </Card.Body>
                    </Card>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default FoundingMembersList;
