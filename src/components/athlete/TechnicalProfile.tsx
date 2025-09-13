import React from 'react';
import { Card, Row, Col, Table, Container } from 'react-bootstrap';
import type { Athlete } from '../../types';
import { useEffect, useState } from 'react';
import { UsersService } from '../../services/firestoreService';

interface TechnicalProfileProps {
  athlete: Athlete;
}

const TechnicalProfile: React.FC<TechnicalProfileProps> = ({ athlete }) => {
  // Local state to hold freshest personal info from Firestore
  const [fatherName, setFatherName] = useState<string>('');
  const [motherName, setMotherName] = useState<string>('');
  const [birthPlace, setBirthPlace] = useState<string>('');
  const [bloodType, setBloodType] = useState<string>('');
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Compute display name from Arabic if available
  const displayName = (athlete.name && athlete.name.trim().length > 0)
    ? athlete.name
    : `${athlete.firstNameAr || athlete.firstName || ''} ${athlete.lastNameAr || athlete.lastName || ''}`.trim();

  // Fetch Firestore-backed user details by athlete.id
  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        if (!athlete?.id) return;
        const user = await UsersService.getUserById(athlete.id);
        if (!mounted || !user) return;
        setFatherName(user.fatherName || '');
        setMotherName(user.motherName || '');
        setBirthPlace(user.birthPlace || athlete.placeOfBirth || '');
        setBloodType(user.bloodType || '');
        setDob(user.dateOfBirth ? new Date(user.dateOfBirth) : (athlete.dateOfBirth ? new Date(athlete.dateOfBirth) : undefined));
        setGender((user.gender as 'male' | 'female') || athlete.gender || 'male');
      } catch (e) {
        // On error, fall back to whatever is in athlete prop
        setFatherName((athlete as any).fatherName || '');
        setMotherName((athlete as any).motherName || '');
        setBirthPlace(athlete.placeOfBirth || '');
        setBloodType((athlete as any).bloodType || '');
        setDob(athlete.dateOfBirth ? new Date(athlete.dateOfBirth) : undefined);
        setGender(athlete.gender || 'male');
      }
    };
    fetchUser();
    return () => { mounted = false; };
  }, [athlete]);

  const calculateAge = (date?: Date) => {
    if (!date) return undefined;
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getAgeCategory = (age?: number) => {
    if (age === undefined) return '';
    if (age <= 6) return 'مصغر';
    if (age <= 8) return 'براعم صغار';
    if (age <= 10) return 'براعم';
    if (age <= 12) return 'أصاغر';
    if (age <= 14) return 'صغار';
    if (age <= 17) return 'ناشئين';
    if (age <= 20) return 'أواسط';
    return 'أكابر';
  };

  const getGenderClass = (g: 'male' | 'female') => (g === 'male' ? 'ذكر' : 'أنثى');

  const age = calculateAge(dob ?? (athlete.dateOfBirth ? new Date(athlete.dateOfBirth) : undefined));
  const ageCategory = getAgeCategory(age);
  const classLabel = getGenderClass(gender || athlete.gender || 'male');

  // طباعة القياسات البدنية - طباعة الجدول فقط بدون الهيدر والفوتر والقوائم العلوية
  const printPhysicalMeasurements = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>القياسات البدنية - ${displayName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            direction: rtl;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 0 auto;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #e3f2fd;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; }
            table { font-size: 12px; }
          }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>الطول /سم</th>
              <th>الوزن /كلغ</th>
              <th>الفئة الوزنية</th>
              <th>مؤشر كتلة الجسم BMI</th>
              <th>نسبة الدهون %</th>
              <th>كتلة العضلات %</th>
              <th>العرض بين الكتفين</th>
              <th>طول الذراع</th>
              <th>طول الفخذ</th>
              <th>محيط الصدر</th>
              <th>محيط الذراع</th>
              <th>محيط الفخذ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${athlete.height || ''}</td>
              <td>${athlete.weight || ''}</td>
              <td>${athlete.weightCategory || ''}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(tableContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 100);
  };

  const sectionHeaderStyle = {
    backgroundColor: '#7DB8DE',
    borderRadius: '25px',
    padding: '10px 30px',
    margin: '20px auto',
    textAlign: 'center' as const,
    color: 'red',
    fontWeight: 'bold',
    fontSize: '18px',
    width: 'fit-content'
  };

  const cardStyle = {
    border: '2px solid #000',
    borderRadius: '0px',
    margin: '20px 0'
  };

  return (
    <Container fluid className="p-4" dir="rtl">
      {/* البطاقة الفنية للمصارع - Header */}
      <div style={{
        ...sectionHeaderStyle,
        backgroundColor: '#7DB8DE',
        fontSize: '24px',
        marginBottom: '30px'
      }}>
        البطاقة الفنية للمصارع
      </div>

      {/* 01- المعلومات الشخصية */}
      <div style={{
        ...sectionHeaderStyle,
        width: '300px'
      }}>
        01- المعلومات الشخصية
      </div>

      <Card style={cardStyle} className="mb-4">
        <Card.Body className="p-4">
          <Row className="mb-3">
            <Col md={12}>
              <div className="d-flex align-items-center justify-content-center">
                <span style={{fontWeight: 'bold', marginLeft: '10px'}}>الإسم واللقب:</span>
                <div style={{borderBottom: '1px dotted #000', flex: 1, minHeight: '20px'}}>
                  {displayName}
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <span style={{fontWeight: 'bold', marginLeft: '10px'}}>إسم الأب:</span>
                <div style={{borderBottom: '1px dotted #000', flex: 1, minHeight: '20px'}}>
                  {fatherName}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-center">
                <span style={{fontWeight: 'bold', marginLeft: '10px'}}>إسم ولقب الأم:</span>
                <div style={{borderBottom: '1px dotted #000', flex: 1, minHeight: '20px'}}>
                  {motherName}
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <span style={{fontWeight: 'bold', marginLeft: '10px'}}>تاريخ الميلاد:</span>
                <div style={{borderBottom: '1px dotted #000', flex: 1, minHeight: '20px'}}>
                  {(dob ?? (athlete.dateOfBirth ? new Date(athlete.dateOfBirth) : undefined))?.toLocaleDateString('ar-DZ') || ''}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-center">
                <span style={{fontWeight: 'bold', marginLeft: '10px'}}>مكان الميلاد:</span>
                <div style={{borderBottom: '1px dotted #000', flex: 1, minHeight: '20px'}}>
                  {birthPlace}
                </div>
              </div>
            </Col>
          </Row>
          {/* Remove this empty duplicate row */}
          <Row className="mb-3">
            <Col md={4}>
              <div className="d-flex align-items-center">
                <span style={{fontWeight: 'bold', marginLeft: '10px'}}>الزمرة الدموية:</span>
                <div style={{borderBottom: '1px dotted #000', flex: 1, minHeight: '20px'}}>
                  {bloodType}
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-center">
                <span style={{fontWeight: 'bold', marginLeft: '10px'}}>الفئة العمرية:</span>
                <div style={{borderBottom: '1px dotted #000', flex: 1, minHeight: '20px'}}>
                  {ageCategory}
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-center">
                <span style={{fontWeight: 'bold', marginLeft: '10px'}}>الصنف:</span>
                <div style={{borderBottom: '1px dotted #000', flex: 1, minHeight: '20px'}}>
                  {classLabel}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 02- القياسات البدنية */}
      <div style={{
        ...sectionHeaderStyle,
        width: '250px'
      }}>
        02- القياسات البدنية
      </div>

      <Card style={cardStyle} className="mb-4">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table bordered className="m-0">
              <thead>
                <tr style={{backgroundColor: '#f8f9fa'}}>
                  <th className="text-center">الطول /سم</th>
                  <th className="text-center">الوزن /كلغ</th>
                  <th className="text-center">الفئة الوزنية</th>
                  <th className="text-center">مؤشر كتلة الجسم BMI الوزن(كلغ)/الطول²(م)</th>
                  <th className="text-center">نسبة الدهون %</th>
                  <th className="text-center">كتلة العضلات %(كلغ)</th>
                  <th className="text-center">العرض بين الكتفين (سم)</th>
                  <th className="text-center">طول الذراع (سم)</th>
                  <th className="text-center">طول الفخذ (سم)</th>
                  <th className="text-center">محيط الصدر (سم)</th>
                  <th className="text-center">محيط الذراع (سم)</th>
                  <th className="text-center">محيط الفخذ (سم)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{height: '40px'}}>{athlete.height || ''}</td>
                  <td>{athlete.weight || ''}</td>
                  <td>{athlete.weightCategory || ''}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* 03- الصفات المورفولوجية */}
      <div style={{
        ...sectionHeaderStyle,
        width: '300px'
      }}>
        03- الصفات المورفولوجية
      </div>

      <Card style={cardStyle} className="mb-4">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table bordered className="m-0">
              <thead>
                <tr style={{backgroundColor: '#f8f9fa'}}>
                  <th className="text-center">نوع الجسم تحليل/جسماني/لحمي</th>
                  <th className="text-center">شكل الكتفية طويل/عكس عريض/مربع</th>
                  <th className="text-center">قوة القبضة قوي/متوسط/ضعيف</th>
                  <th className="text-center">الحركة المتميزة مرتفعة/متوسط/منخفضة</th>
                  <th className="text-center">سرعة رد الفعل سريع/متوسط/بطيء</th>
                  <th className="text-center">قدرة التحمل جيد/متوسط/منخفض</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{height: '50px'}}></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* 04- المعلومات الرياضية */}
      <div style={{
        ...sectionHeaderStyle,
        width: '250px'
      }}>
        04- المعلومات الرياضية
      </div>

      <Card style={cardStyle} className="mb-4">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table bordered className="m-0">
              <thead>
                <tr style={{backgroundColor: '#f8f9fa'}}>
                  <th className="text-center">النادي</th>
                  <th className="text-center">المدرب</th>
                  <th className="text-center">الحزام</th>
                  <th className="text-center">العمر الرياضي</th>
                  <th className="text-center">أسلوب اللعب يمين/يسار/كلاهما</th>
                  <th className="text-center">أشهر الحركات التقنية</th>
                  <th className="text-center">القدرة السيطرة على الخصم ممتاز/جيد/متوسط/ضعيف</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{height: '40px'}}>{athlete.club || ''}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* 05- الإنجازات الرياضية */}
      <div style={{
        ...sectionHeaderStyle,
        width: '250px'
      }}>
        05- الإنجازات الرياضية
      </div>

      <Card style={cardStyle} className="mb-4">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table bordered className="m-0">
              <thead>
                <tr style={{backgroundColor: '#f8f9fa'}}>
                  <th className="text-center">بطل ولائي مع سنة</th>
                  <th className="text-center">بطل جهوي مع سنة</th>
                  <th className="text-center">بطل وطني مع سنة</th>
                  <th className="text-center">بطل عربي مع سنة</th>
                  <th className="text-center">بطل قاري مع سنة</th>
                  <th className="text-center">بطل عالمي مع سنة</th>
                  <th className="text-center">بطل أولمبي مع سنة</th>
                  <th className="text-center">التصنيف الدولي (العربي المحلي)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{height: '50px'}}></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TechnicalProfile;
