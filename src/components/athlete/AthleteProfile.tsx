import React from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Athlete, Club } from '../../types';
import { UsersService as UserService } from '../../services/firestoreService';

interface AthleteProfileProps {
  athlete: Athlete;
  club: Club;
  beltColor: string;
}

const AthleteProfile: React.FC<AthleteProfileProps> = ({ athlete, club, beltColor }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    UserService.logout();
    navigate(`/club/${club.id}`);
  };
  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? 'fas fa-mars text-primary' : 'fas fa-venus text-danger';
  };

  const calculateBMI = (weight: number, height: number) => {
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  return (
    <div>
      {/* زر تسجيل الخروج */}
      <Row className="mb-4">
        <Col className="text-end">
          <Button variant="outline-danger" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>
            خروج
          </Button>
        </Col>
      </Row>

      {/* الصورة والمعلومات الأساسية */}
      <Row className="mb-4">
        <Col lg={4} className="text-center">
          <Card className="shadow-lg border-0" style={{ background: `linear-gradient(135deg, var(--bs-${beltColor}) 0%, var(--bs-${beltColor}) 100%)` }}>
            <Card.Body className="p-4 text-white">
              <img
                src={athlete.image || '/images/default-athlete.jpg'}
                alt={`${athlete.firstNameAr} ${athlete.lastNameAr}`}
                className="img-fluid rounded-circle shadow mb-3 athlete-image"
                style={{ width: '200px', height: '200px', objectFit: 'cover', border: '5px solid white' }}
              />
              <h4 className="mb-2" dir="rtl">
                <i className={getGenderIcon(athlete.gender)} style={{ fontSize: '0.8em' }}></i>
                {' '}
                {athlete.firstNameAr} {athlete.lastNameAr}
              </h4>
              <Badge bg="light" text="dark" className="fs-6 mb-2">
                {athlete.beltAr}
              </Badge>
              <p className="mb-0" dir="rtl" style={{ opacity: 0.9 }}>
                {calculateAge(athlete.dateOfBirth)} سنة
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          {/* المعلومات الشخصية */}
          <Card className="shadow-sm mb-4">
            <Card.Header className={`bg-${beltColor} text-white`}>
              <h5 className="mb-0" dir="rtl">
                <i className="fas fa-user-circle me-2"></i>
                المعلومات الشخصية
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <p className="text-end mb-0" dir="rtl">
                      <strong>الاسم الكامل:</strong> {athlete.firstNameAr} {athlete.lastNameAr}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-end mb-0" dir="rtl">
                      <strong>تاريخ الميلاد:</strong> {new Date(athlete.dateOfBirth).toLocaleDateString('ar-DZ')}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-end mb-0" dir="rtl">
                      <strong>العمر:</strong> {calculateAge(athlete.dateOfBirth)} سنة
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <p className="text-end mb-0" dir="rtl">
                      <strong>الوزن:</strong> {athlete.weight} كيلوغرام
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-end mb-0" dir="rtl">
                      <strong>الطول:</strong> {athlete.height} سنتيمتر
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-end mb-0" dir="rtl">
                      <strong>النادي:</strong> {club.nameAr}
                    </p>
                  </div>
                </Col>
              </Row>
              {athlete.bioAr && (
                <div className="mt-3 pt-3 border-top">
                  <h6 className={`text-${beltColor} text-end mb-2`} dir="rtl">نبذة شخصية:</h6>
                  <p className="text-end mb-0" dir="rtl">{athlete.bioAr}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* الإحصائيات البدنية */}
      <Row>
        <Col lg={6}>
          <Card className="shadow-lg mb-4 border-0">
            <Card.Header className={`bg-${beltColor} text-white`}>
              <h5 className="mb-0" dir="rtl">
                <i className="fas fa-chart-bar me-2"></i>
                الإحصائيات البدنية
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="text-center">
                <Col md={4}>
                  <div className="stats-card mb-3" style={{ background: `linear-gradient(135deg, var(--bs-${beltColor}) 0%, var(--bs-${beltColor}) 100%)` }}>
                    <div className="stats-number">
                      {athlete.weight}
                    </div>
                    <div className="stats-label">كيلوغرام</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="stats-card mb-3" style={{ background: `linear-gradient(135deg, var(--bs-${beltColor}) 0%, var(--bs-${beltColor}) 100%)` }}>
                    <div className="stats-number">
                      {athlete.height}
                    </div>
                    <div className="stats-label">سنتيمتر</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="stats-card mb-3" style={{ background: `linear-gradient(135deg, var(--bs-${beltColor}) 0%, var(--bs-${beltColor}) 100%)` }}>
                    <div className="stats-number">
                      {calculateBMI(athlete.weight, athlete.height)}
                    </div>
                    <div className="stats-label">مؤشر كتلة الجسم</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          {/* معلومات الاتصال */}
          <Card className="shadow-sm mb-4">
            <Card.Header className={`bg-${beltColor} text-white`}>
              <h5 className="mb-0" dir="rtl">
                <i className="fas fa-address-card me-2"></i>
                معلومات الاتصال
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              {athlete.email && (
                <div className="mb-3">
                  <strong className="text-end d-block" dir="rtl">البريد الإلكتروني:</strong>
                  <a href={`mailto:${athlete.email}`} className={`text-${beltColor}`}>
                    {athlete.email}
                  </a>
                </div>
              )}
              {athlete.phone && (
                <div className="mb-3">
                  <strong className="text-end d-block" dir="rtl">الهاتف:</strong>
                  <a href={`tel:${athlete.phone}`} className={`text-${beltColor}`}>
                    {athlete.phone}
                  </a>
                </div>
              )}
              <div className="mb-3">
                <strong className="text-end d-block" dir="rtl">النادي:</strong>
                <span className={`text-${beltColor}`}>{club.nameAr}</span>
              </div>
              {club.addressAr && (
                <div>
                  <strong className="text-end d-block" dir="rtl">عنوان النادي:</strong>
                  <p className="text-end mb-0" dir="rtl">{club.addressAr}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AthleteProfile;
