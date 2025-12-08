import React, { useState } from 'react';
import { Container, Row, Col, Nav, Card, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import type { Staff, Club } from '../../types';
import { UsersService } from '../../services/firestoreService';
import BodyTypeCalculator from './BodyTypeCalculator';
import BodyCompositionCalculator from './BodyCompositionCalculator';
import MaxDynamicStrengthTest from './MaxDynamicStrengthTest';
import MaxStaticStrengthTest from './MaxStaticStrengthTest';
import SpecialSpeedTest from './SpecialSpeedTest';
import MorphologicalTraits from './MorphologicalTraits';
import CardioCirculatoryMeasurements from './CardioCirculatoryMeasurements';
import ExplosiveStrengthKumiTest from './ExplosiveStrengthKumiTest';
import SpecialEnduranceTest from './SpecialEnduranceTest';
import SpeedStrengthTests from './SpeedStrengthTests';
import GroundworkSkillsTest from './GroundworkSkillsTest';
import UchiKomiTest from './UchiKomiTest';
import ThrowingSkillsTest from './ThrowingSkillsTest';
import TeamRecord from './TeamRecord';

interface PhysicalTrainerDashboardProps {
  physicalTrainer: Staff;
  club: Club;
}

const PhysicalTrainerDashboard: React.FC<PhysicalTrainerDashboardProps> = ({ physicalTrainer, club }) => {
  const [activeSection, setActiveSection] = useState<string>('max-strength-dynamic');
  const navigate = useNavigate();

  const handleLogout = () => {
    UsersService.logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'max-strength-dynamic':
        return <MaxDynamicStrengthTest clubId={club.id} />;

      case 'max-strength-static':
        return <MaxStaticStrengthTest clubId={club.id} />;

      case 'special-speed':
        return <SpecialSpeedTest clubId={club.id} />;

      case 'morphological':
        return <MorphologicalTraits clubId={club.id} />;

      case 'cardio-measurements':
        return <CardioCirculatoryMeasurements clubId={club.id} />;

      case 'explosive-strength-kumi':
        return <ExplosiveStrengthKumiTest clubId={club.id} />;

      case 'special-endurance':
        return <SpecialEnduranceTest clubId={club.id} />;

      case 'speed-strength':
        return <SpeedStrengthTests clubId={club.id} />;

      case 'ground-skills':
        return <GroundworkSkillsTest clubId={club.id} />;

      case 'throwing-skills':
        return <ThrowingSkillsTest clubId={club.id} />;

      case 'uchi-komi':
        return <UchiKomiTest clubId={club.id} />;

      case 'body-type':
        return <BodyTypeCalculator clubId={club.id} />;

      case 'body-composition':
        return <BodyCompositionCalculator clubId={club.id} />;

      case 'team-record':
        return <TeamRecord clubId={club.id} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header Section */}
      <section className="position-relative py-5" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3
        }}></div>
        
        <Container className="position-relative">
          <Row className="align-items-center">
            <Col md={9}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <Link
                  to={`/club/${club.id}`}
                  className="btn btn-light shadow-sm me-3"
                  style={{
                    borderRadius: '50px',
                    padding: '10px 20px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="fas fa-arrow-right me-2"></i>
                  العودة للنادي
                </Link>
                <Button variant="outline-danger" onClick={handleLogout}>
                  تسجيل الخروج
                </Button>
              </div>
              <div className="text-white">
                <h1 className="display-6 fw-bold mb-2" dir="rtl">
                  <i className="fas fa-dumbbell me-3" style={{ color: '#ffd700' }}></i>
                  لوحة تحكم المحضر البدني
                </h1>
                <p className="lead mb-0" dir="rtl">
                  <i className="fas fa-user-tie me-2"></i>
                  {physicalTrainer.firstNameAr} {physicalTrainer.lastNameAr}
                </p>
                <div className="mt-3 d-flex align-items-center text-white-50" dir="rtl">
                  <i className="fas fa-building me-2"></i>
                  <span>{club.nameAr}</span>
                </div>
              </div>
            </Col>
            <Col md={3} className="text-center">
              <img
                src={physicalTrainer.image || '/images/default-avatar.jpg'}
                alt={`${physicalTrainer.firstNameAr} ${physicalTrainer.lastNameAr}`}
                className="img-fluid rounded-circle shadow"
                style={{ width: '110px', height: '110px', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.8)' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Navigation Section */}
      <section className="py-4" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <Container>
          <div className="row justify-content-center">
            <div className="col-12">
              <Nav variant="pills" className="justify-content-center flex-wrap gap-3">
                {/* الاختبارات البدنية */}
                <NavDropdown 
                  title={
                    <span className="d-flex align-items-center">
                      <i className="fas fa-dumbbell me-2"></i>
                      الاختبارات البدنية
                    </span>
                  } 
                  id="physical-tests-dropdown"
                  className="nav-dropdown-custom"
                >
                  <NavDropdown.Item onClick={() => setActiveSection('max-strength-dynamic')}>
                    <i className="fas fa-dumbbell me-2"></i>
                    اختبار القوة القصوى المتحركة
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => setActiveSection('max-strength-static')}>
                    <i className="fas fa-weight-hanging me-2"></i>
                    اختبار القوة القصوى الثابتة
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => setActiveSection('special-speed')}>
                    <i className="fas fa-running me-2"></i>
                    اختبار السرعة الخاصة
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => setActiveSection('explosive-strength-kumi')}>
                    <i className="fas fa-fist-raised me-2"></i>
                    اختبار القوة الانفجارية الخاصة (kumi-kata)
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => setActiveSection('special-endurance')}>
                    <i className="fas fa-heartbeat me-2"></i>
                    اختبار المداومة الخاصة
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => setActiveSection('speed-strength')}>
                    <i className="fas fa-bolt me-2"></i>
                    اختبارات القوة المميزة بالسرعة
                  </NavDropdown.Item>
                </NavDropdown>

                {/* الاختبارات المورفولوجية */}
                <NavDropdown 
                  title={
                    <span className="d-flex align-items-center">
                      <i className="fas fa-ruler me-2"></i>
                      الاختبارات المورفولوجية
                    </span>
                  } 
                  id="morphological-tests-dropdown"
                  className="nav-dropdown-custom"
                >
                  <NavDropdown.Item onClick={() => setActiveSection('morphological')}>
                    <i className="fas fa-ruler me-2"></i>
                    الصفات المورفولوجية
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => setActiveSection('cardio-measurements')}>
                    <i className="fas fa-heartbeat me-2"></i>
                    قياسات القلب والجهاز الدوري
                  </NavDropdown.Item>
                </NavDropdown>

                {/* الاختبارات المهارية */}
            <NavDropdown 
              title={
                <span>
                  <i className="fas fa-user-ninja me-2"></i>
                  الاختبارات المهارية
                </span>
              } 
              id="skill-tests-dropdown"
              className="mx-1 mb-2"
            >
              <NavDropdown.Item onClick={() => setActiveSection('ground-skills')}>
                <i className="fas fa-user-ninja me-2"></i>
                مهارات اللعب الأرضي\20ث
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => setActiveSection('throwing-skills')}>
                <i className="fas fa-hand-rock me-2"></i>
                مهارات الرمي
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => setActiveSection('uchi-komi')}>
                <i className="fas fa-redo me-2"></i>
                الأوتشي-كومي
              </NavDropdown.Item>
            </NavDropdown>

                {/* حساب نمط الجسم */}
                <NavDropdown 
                  title={
                    <span className="d-flex align-items-center">
                      <i className="fas fa-user-md me-2"></i>
                      حساب نمط الجسم
                    </span>
                  } 
                  id="body-type-dropdown"
                  className="nav-dropdown-custom"
                >
                  <NavDropdown.Item onClick={() => setActiveSection('body-type')}>
                    <i className="fas fa-user-md me-2"></i>
                    حساب نمط الجسم
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => setActiveSection('body-composition')}>
                    <i className="fas fa-weight me-2"></i>
                    حساب الدهون ووزن كتلة الجسم
                  </NavDropdown.Item>
                </NavDropdown>

                {/* سجل الفريق */}
                <Nav.Link
                  onClick={() => setActiveSection('team-record')}
                  className="nav-link-custom"
                  style={{
                    background: 'linear-gradient(45deg, #28a745, #20c997)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontWeight: 'bold',
                    padding: '12px 25px',
                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="fas fa-clipboard-list me-2"></i>
                  سجل الفريق
                </Nav.Link>
              </Nav>
            </div>
          </div>
        </Container>
      </section>

      {/* Content Section */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '70vh' }}>
        <Container>
          <div className="content-wrapper" style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {renderContent()}
          </div>
        </Container>
      </section>

      {/* Custom Styles */}
      <style>
        {`
          /* Navigation Dropdown Styles */
          .nav-dropdown-custom .dropdown-toggle {
            background: linear-gradient(45deg, #667eea, #764ba2) !important;
            color: white !important;
            border: none !important;
            border-radius: 25px !important;
            padding: 12px 25px !important;
            font-weight: bold !important;
            font-size: 14px !important;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
            transition: all 0.3s ease !important;
            min-width: 200px !important;
          }

          .nav-dropdown-custom .dropdown-toggle:hover,
          .nav-dropdown-custom .dropdown-toggle:focus,
          .nav-dropdown-custom .dropdown-toggle:active {
            background: linear-gradient(45deg, #764ba2, #667eea) !important;
            transform: translateY(-3px) !important;
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
            color: white !important;
          }

          .nav-dropdown-custom .dropdown-toggle::after {
            margin-left: 10px !important;
          }

          .nav-dropdown-custom .dropdown-menu {
            border: none !important;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
            border-radius: 15px !important;
            padding: 15px 0 !important;
            margin-top: 10px !important;
            background: white !important;
            min-width: 250px !important;
          }

          .nav-dropdown-custom .dropdown-item {
            padding: 12px 25px !important;
            font-weight: 500 !important;
            font-size: 14px !important;
            transition: all 0.3s ease !important;
            border-radius: 0 !important;
            color: #495057 !important;
          }

          .nav-dropdown-custom .dropdown-item:hover {
            background: linear-gradient(45deg, #f8f9fa, #e9ecef) !important;
            color: #667eea !important;
            transform: translateX(5px) !important;
            padding-left: 30px !important;
          }

          .nav-dropdown-custom .dropdown-item i {
            width: 20px !important;
            text-align: center !important;
            margin-right: 10px !important;
          }

          /* Special Link Styles */
          .nav-link-custom:hover {
            transform: translateY(-3px) !important;
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4) !important;
          }

          /* Content Wrapper Animation */
          .content-wrapper {
            animation: fadeInUp 0.6s ease-out;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Back Button Hover Effect */
          .btn-light:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .nav-dropdown-custom .dropdown-toggle {
              width: 100% !important;
              margin-bottom: 15px !important;
              min-width: auto !important;
            }

            .content-wrapper {
              padding: 20px !important;
              margin: 0 10px !important;
            }

            .display-6 {
              font-size: 1.8rem !important;
            }
          }

          @media (max-width: 576px) {
            .nav-dropdown-custom .dropdown-toggle {
              font-size: 13px !important;
              padding: 10px 20px !important;
            }

            .content-wrapper {
              padding: 15px !important;
              border-radius: 15px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PhysicalTrainerDashboard;
