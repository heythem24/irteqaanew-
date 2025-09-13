import React, { useState } from 'react';
import { Card, Nav } from 'react-bootstrap';
import type { Club } from '../../types';
import AthleteRoster from './AthleteRoster';
import AttendanceTracker from './AttendanceTracker';
import WeeklySchedule from './WeeklySchedule';
import SessionEvaluation from './SessionEvaluation';
import AnnualPlan from './AnnualPlan';
import TechnicalCard from './TechnicalCard';

interface AthleteManagementProps {
  club: Club;
}

const AthleteManagement: React.FC<AthleteManagementProps> = ({ club }) => {
  const [activeTab, setActiveTab] = useState<string>('roster');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roster':
        return <AthleteRoster club={club} />;
      
      case 'attendance':
        return <AttendanceTracker club={club} />;
      
      case 'weekly-program':
        return <WeeklySchedule club={club} />;
      
      case 'session-evaluation':
        return <SessionEvaluation club={club} />;
      
      case 'annual-plan':
        return <AnnualPlan club={club} />;

      case 'technical-card':
        return <TechnicalCard club={club} />;

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0 text-center" dir="rtl">
            <i className="fas fa-users me-2"></i>
            إدارة الرياضيين
          </h4>
        </Card.Header>
        <Card.Body className="p-3">
          <Nav variant="pills" className="justify-content-center">
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'roster'}
                onClick={() => setActiveTab('roster')}
                className="mx-1 fw-bold"
              >
                <i className="fas fa-list me-2"></i>
                القائمة الاسمية للمصارعين
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'attendance'}
                onClick={() => setActiveTab('attendance')}
                className="mx-1 fw-bold"
              >
                <i className="fas fa-calendar-check me-2"></i>
                قائمة الغيابات
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'weekly-program'}
                onClick={() => setActiveTab('weekly-program')}
                className="mx-1 fw-bold"
              >
                <i className="fas fa-calendar-week me-2"></i>
                البرنامج الأسبوعي
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'session-evaluation'}
                onClick={() => setActiveTab('session-evaluation')}
                className="mx-1 fw-bold"
              >
                <i className="fas fa-star me-2"></i>
                تقييم الحصص المنفذة
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'annual-plan'}
                onClick={() => setActiveTab('annual-plan')}
                className="mx-1 fw-bold"
              >
                <i className="fas fa-calendar-alt me-2"></i>
                المخطط السنوي
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'technical-card'}
                onClick={() => setActiveTab('technical-card')}
                className="mx-1 fw-bold"
              >
                <i className="fas fa-clipboard-list me-2"></i>
                البطاقة الفنية
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default AthleteManagement;
