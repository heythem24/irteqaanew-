import React, { useEffect, useState } from 'react';
import { Container, Badge } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { HomepageService } from '../services/homepageService';
import type { News } from '../types';

const NewsDetailPage: React.FC = () => {
  const { newsId } = useParams<{ newsId: string }>();
  const [news, setNews] = useState<News | null>(null);

  useEffect(() => {
    (async () => {
      const content = await HomepageService.getContent();
      const item = (content.news || []).find(n => String(n.id) === String(newsId)) || null;
      setNews(item);
    })();
  }, [newsId]);

  if (!news) {
    return (
      <Container className="py-5 text-center text-muted">الخبر غير موجود</Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-3" dir="rtl">{news.titleAr}</h2>
      <div className="mb-3 d-flex gap-3 align-items-center">
        <small className="text-muted" dir="rtl">
          <i className="fas fa-user me-1"></i>
          {news.authorAr}
        </small>
        <Badge bg={news.isPublished ? 'success' : 'secondary'}>{news.isPublished ? 'منشور' : 'مسودة'}</Badge>
      </div>
      {news.image && (
        <img src={news.image} alt={news.titleAr} className="img-fluid rounded shadow-sm mb-4" />
      )}
      <div dir="rtl" style={{ whiteSpace: 'pre-wrap' }}>
        {news.contentAr}
      </div>
    </Container>
  );
};

export default NewsDetailPage;
