import React from 'react';
import { Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import type { RecentAchievement } from '../../../types';

interface RecentAchievementsTabProps {
  achievements: RecentAchievement[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const RecentAchievementsTab: React.FC<RecentAchievementsTabProps> = ({ achievements, onAdd, onEdit, onDelete }) => {
  return (
    <>
      <Row className="mb-3">
        <Col md={8}>
          <h5>الإنجازات الحديثة</h5>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button variant="info" onClick={onAdd} className="w-100">
            <i className="fas fa-medal me-2"></i>
            إضافة إنجاز جديد
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">الإنجازات الحديثة ({achievements.length})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive striped hover>
            <thead className="table-dark">
              <tr>
                <th>الرياضي</th>
                <th>الإنجاز</th>
                <th>النوع</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map(achievement => (
                <tr key={achievement.id}>
                  <td>
                    <strong>{achievement.athleteNameAr}</strong>
                    <br />
                    <small className="text-muted">{achievement.athleteName}</small>
                    {achievement.clubNameAr && (
                      <>
                        <br />
                        <small className="text-primary">{achievement.clubNameAr}</small>
                      </>
                    )}
                  </td>
                  <td>
                    <strong>{achievement.titleAr}</strong>
                    <br />
                    <small className="text-muted">{achievement.title}</small>
                  </td>
                  <td>
                    <Badge bg="info">{achievement.achievementTypeAr}</Badge>
                  </td>
                  <td>{new Date(achievement.achievementDate as any).toLocaleDateString('ar-DZ')}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onEdit(achievement.id)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => onDelete(achievement.id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {achievements.length === 0 && (
            <div className="text-center p-4 text-muted">
              <i className="fas fa-award fa-3x mb-3"></i>
              <p>لا توجد إنجازات حديثة</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default RecentAchievementsTab;

