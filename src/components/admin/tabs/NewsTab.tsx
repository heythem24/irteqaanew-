import React from 'react';
import { Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import type { News } from '../../../types';

interface NewsTabProps {
  news: News[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const NewsTab: React.FC<NewsTabProps> = ({ news, onAdd, onEdit, onDelete }) => {
  return (
    <>
      <Row className="mb-3">
        <Col md={8}>
          <h5>الأخبار المنشورة</h5>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button variant="success" onClick={onAdd} className="w-100">
            <i className="fas fa-plus me-2"></i>
            إضافة خبر جديد
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">الأخبار ({news.length})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive striped hover>
            <thead className="table-dark">
              <tr>
                <th>العنوان</th>
                <th>الكاتب</th>
                <th>تاريخ النشر</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {news.map(item => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.titleAr}</strong>
                    <br />
                    <small className="text-muted">{item.title}</small>
                  </td>
                  <td>{item.authorAr}</td>
                  <td>{item.publishedAt ? new Date(item.publishedAt as any).toLocaleDateString('ar-DZ') : 'غير محدد'}</td>
                  <td>
                    <Badge bg={item.isPublished ? 'success' : 'secondary'}>
                      {item.isPublished ? 'منشور' : 'مسودة'}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onEdit(item.id)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => onDelete(item.id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {news.length === 0 && (
            <div className="text-center p-4 text-muted">
              <i className="fas fa-newspaper fa-3x mb-3"></i>
              <p>لا توجد أخبار منشورة</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default NewsTab;

