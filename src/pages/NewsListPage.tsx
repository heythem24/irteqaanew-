import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { HomepageService } from '../services/homepageService';
import type { News } from '../types';

const NewsListPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);

  useEffect(() => {
    (async () => {
      const content = await HomepageService.getContent();
      setNews(content.news || []);
    })();
  }, []);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-primary" dir="rtl">جميع الأخبار</h2>
      <Row>
        {news.length === 0 && (
          <Col>
            <div className="text-center text-muted py-5">لا توجد أخبار متاحة حالياً</div>
          </Col>
        )}
        {news.map((item) => (
          <Col md={4} key={item.id} className="mb-3">
            <Card className="h-100 shadow-sm">
              {item.image && (
                <Card.Img variant="top" src={item.image} alt={item.titleAr} style={{ height: 180, objectFit: 'cover' }} />
              )}
              <Card.Body>
                <h5 className="mb-2" dir="rtl">{item.titleAr}</h5>
                <p className="text-muted small" dir="rtl">{item.excerptAr || item.contentAr?.slice(0, 120)}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted" dir="rtl">
                    <i className="fas fa-user me-1"></i>
                    {item.authorAr}
                  </small>
                  <Badge bg={item.isPublished ? 'success' : 'secondary'}>{item.isPublished ? 'منشور' : 'مسودة'}</Badge>
                </div>
                <div className="mt-3 text-end">
                  <Link to={`/news/${item.id}`} className="btn btn-outline-primary btn-sm">اقرأ المزيد</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default NewsListPage;
