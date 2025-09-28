import React from 'react';
import { Card, Row, Col, Table, Container } from 'react-bootstrap';
import type { Athlete } from '../../types';
import { useEffect, useState } from 'react';
import { UsersService, ClubsService } from '../../services/firestoreService';
import { useBodyCompositionCalculator, useMorphologicalTraits } from '../../hooks/usePhysicalTests';

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
  const [belt, setBelt] = useState<string>('');
  const [clubName, setClubName] = useState<string>('');
  const [coachName, setCoachName] = useState<string>('');

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
        setBelt((user as any).beltAr || user.belt || (athlete as any).beltAr || (athlete as any).belt || '');

        // Derive sport age from possible fields on the user document
        // sport age not needed here anymore; we show chronological age in the sports info table
      } catch (e) {
        // On error, fall back to whatever is in athlete prop
        setFatherName((athlete as any).fatherName || '');
        setMotherName((athlete as any).motherName || '');
        setBirthPlace(athlete.placeOfBirth || '');
        setBloodType((athlete as any).bloodType || '');
        setDob(athlete.dateOfBirth ? new Date(athlete.dateOfBirth) : undefined);
        setGender(athlete.gender || 'male');
        setBelt((athlete as any).beltAr || (athlete as any).belt || '');
      }
    };
    fetchUser();
    return () => { mounted = false; };
  }, [athlete]);

  // Fetch club and coach information based on athlete.clubId
  useEffect(() => {
    let mounted = true;
    const loadClubAndCoach = async () => {
      try {
        if (!athlete?.clubId) {
          setClubName(athlete.club || '');
          return;
        }
        const club = await ClubsService.getClubById(athlete.clubId);
        if (!mounted) return;
        const cName = club?.nameAr || club?.name || athlete.club || '';
        setClubName(cName || '');
        let resolvedCoachId: string | undefined = club?.coachId;
        let coachDisplayName = '';
        if (resolvedCoachId) {
          try {
            const coach = await UsersService.getUserById(resolvedCoachId);
            if (!mounted) return;
            coachDisplayName = coach ? `${coach.firstNameAr || coach.firstName || ''} ${coach.lastNameAr || coach.lastName || ''}`.trim() || (coach as any).username || '' : '';
          } catch {}
        }
        // Fallback: find a coach user in this club if coachId missing or name empty
        if ((!resolvedCoachId || !coachDisplayName) && (club?.id || athlete.clubId)) {
          try {
            const allUsers = await UsersService.getAllUsers();
            const coachUser = allUsers.find(u => (u.role as any) === 'coach' && String(u.clubId) === String(club?.id || athlete.clubId));
            if (coachUser) {
              resolvedCoachId = coachUser.id;
              coachDisplayName = `${coachUser.firstNameAr || coachUser.firstName || ''} ${coachUser.lastNameAr || coachUser.lastName || ''}`.trim() || (coachUser as any).username || '';
            }
          } catch {}
        }
        setCoachName(coachDisplayName);

        // sport age from roster not needed; we rely on chronological age
      } catch {
        if (!mounted) return;
        setClubName(athlete.club || '');
        setCoachName('');
      }
    };
    loadClubAndCoach();
    return () => { mounted = false; };
  }, [athlete?.clubId, athlete?.club]);

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

  // Load physical trainer datasets by club for auto-fill
  const clubId = athlete.clubId;
  const { data: bodyCompData } = useBodyCompositionCalculator(clubId);
  const { data: morphoData } = useMorphologicalTraits(clubId);

  // Resolve athlete's row by athleteId or name
  const displayFullName = displayName;
  const findByAthlete = <T extends any>(list: T[]): any | undefined => {
    if (!Array.isArray(list)) return undefined;
    // Prefer athleteId match
    const byId = list.find((r: any) => r.athleteId === athlete.id);
    if (byId) return byId;
    // Fallback by name match
    const byName = list.find((r: any) => (r.name || '').trim() === displayFullName.trim());
    return byName;
  };

  const bodyComp = findByAthlete(bodyCompData) as any | undefined;
  const morpho = findByAthlete(morphoData) as any | undefined;

  // Compute BMI and lean mass percentage if data available
  const heightCm = athlete.height || 0;
  const weightKg = athlete.weight || 0;
  const bmi = heightCm > 0 ? Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(2)) : undefined;
  const fatPercent = typeof bodyComp?.bodyFatPercentage === 'number' && bodyComp.bodyFatPercentage > 0
    ? Number(bodyComp.bodyFatPercentage.toFixed(1))
    : undefined;
  const leanMassKg = typeof bodyComp?.leanMassKg === 'number' && bodyComp.leanMassKg > 0
    ? Number(bodyComp.leanMassKg.toFixed(2))
    : undefined;
  const leanMassPercent = (leanMassKg && weightKg > 0)
    ? Number(((leanMassKg / weightKg) * 100).toFixed(1))
    : undefined;

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
  const headerCellStyle: React.CSSProperties = {
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: '1'
  };

  const tableWrapperStyle: React.CSSProperties = {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch'
  };

  const tableStyle: React.CSSProperties = {
    minWidth: '650px'
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
          <div className="table-responsive" style={tableWrapperStyle}>
            <Table bordered className="m-0" style={tableStyle}>
              <thead>
                <tr style={{backgroundColor: '#f8f9fa'}}>
                  <th style={headerCellStyle}>الطول /سم</th>
                  <th style={headerCellStyle}>الوزن /كلغ</th>
                  <th style={headerCellStyle}>الفئة الوزنية</th>
                  <th style={headerCellStyle}>مؤشر كتلة الجسم</th>
                  <th style={headerCellStyle}>نسبة الدهون %</th>
                  <th style={headerCellStyle}>كتلة العضلات %(كلغ)</th>
                  <th style={headerCellStyle}>العرض بين الكتفين (سم)</th>
                  <th style={headerCellStyle}>طول الذراع (سم)</th>
                  <th style={headerCellStyle}>طول الفخذ (سم)</th>
                  <th style={headerCellStyle}>محيط الصدر (سم)</th>
                  <th style={headerCellStyle}>محيط الذراع (سم)</th>
                  <th style={headerCellStyle}>محيط الفخذ (سم)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{height: '40px'}}>{athlete.height || ''}</td>
                  <td>{athlete.weight || ''}</td>
                  <td>{athlete.weightCategory || ''}</td>
                  <td>{bmi ?? ''}</td>
                  <td>{fatPercent ?? ''}</td>
                  <td>{leanMassPercent !== undefined ? `${leanMassPercent}% (${leanMassKg} كغ)` : ''}</td>
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
          <div className="table-responsive" style={tableWrapperStyle}>
            <Table bordered className="m-0" style={tableStyle}>
              <thead>
                <tr style={{backgroundColor: '#f8f9fa'}}>
                  <th style={headerCellStyle}>نوع الجسم تحليل/جسماني/لحمي</th>
                  <th style={headerCellStyle}>شكل الكتفية طويل/عكس عريض/مربع</th>
                  <th style={headerCellStyle}>قوة القبضة قوي/متوسط/ضعيف</th>
                  <th style={headerCellStyle}>الحركة المتميزة مرتفعة/متوسط/منخفضة</th>
                  <th style={headerCellStyle}>سرعة رد الفعل سريع/متوسط/بطيء</th>
                  <th style={headerCellStyle}>قدرة التحمل جيد/متوسط/منخفض</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{height: '50px'}}>{morpho?.bodyType || ''}</td>
                  <td>{morpho?.stature || ''}</td>
                  <td>{morpho?.gripStrength || ''}</td>
                  <td>{morpho?.physicalFlexibility || ''}</td>
                  <td>{morpho?.reactionSpeed || ''}</td>
                  <td>{morpho?.enduranceStrength || ''}</td>
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
          <div className="table-responsive" style={tableWrapperStyle}>
            <Table bordered className="m-0" style={tableStyle}>
              <thead>
                <tr style={{backgroundColor: '#f8f9fa'}}>
                  <th style={headerCellStyle}>النادي</th>
                  <th style={headerCellStyle}>المدرب</th>
                  <th style={headerCellStyle}>الحزام</th>
                  <th style={headerCellStyle}>العمر </th>
                  <th style={headerCellStyle}>أسلوب اللعب يمين/يسار/كلاهما</th>
                  <th style={headerCellStyle}>أشهر الحركات التقنية</th>
                  <th style={headerCellStyle}>القدرة السيطرة على الخصم ممتاز/جيد/متوسط/ضعيف</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{height: '40px', whiteSpace: 'normal', wordBreak: 'break-word'}}>
                    {clubName || athlete.club || ''}
                  </td>
                  <td>{coachName || ''}</td>
                  <td>{belt || ''}</td>
                  <td>{age !== undefined ? `${age} سنة` : ''}</td>
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
          <div className="table-responsive" style={tableWrapperStyle}>
            <Table bordered className="m-0" style={tableStyle}>
              <thead>
                <tr style={{backgroundColor: '#f8f9fa'}}>
                  <th style={headerCellStyle}>بطل ولائي مع سنة</th>
                  <th style={headerCellStyle}>بطل جهوي مع سنة</th>
                  <th style={headerCellStyle}>بطل وطني مع سنة</th>
                  <th style={headerCellStyle}>بطل عربي مع سنة</th>
                  <th style={headerCellStyle}>بطل قاري مع سنة</th>
                  <th style={headerCellStyle}>بطل عالمي مع سنة</th>
                  <th style={headerCellStyle}>بطل أولمبي مع سنة</th>
                  <th style={headerCellStyle}>التصنيف الدولي (العربي المحلي)</th>
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
