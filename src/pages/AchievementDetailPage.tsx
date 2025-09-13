import React, { useEffect, useState } from 'react';
import { Container, Badge } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { HomepageService } from '../services/homepageService';
import type { RecentAchievement } from '../types';

const AchievementDetailPage: React.FC = () => {
  const { achievementId } = useParams<{ achievementId: string }>();
  const [achievement, setAchievement] = useState<RecentAchievement | null>(null);

  useEffect(() => {
    (async () => {
      const content = await HomepageService.getContent();
      const item = (content.recentAchievements || []).find(a => String(a.id) === String(achievementId)) || null;
      setAchievement(item);
    })();
  }, [achievementId]);

  if (!achievement) {
    return (
      <Container className="py-5 text-center text-muted">الإنجاز غير موجود</Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-3" dir="rtl">{achievement.titleAr}</h2>
      <div className="mb-3 d-flex gap-3 align-items-center">
        <Badge bg="info">{achievement.achievementTypeAr}</Badge>
        <small className="text-muted" dir="rtl">{new Date(achievement.achievementDate as any).toLocaleDateString('ar-DZ')}</small>
      </div>
      {achievement.image && (
        <img src={achievement.image} alt={achievement.titleAr} className="img-fluid rounded shadow-sm mb-4" />
      )}
      <div className="mb-3" dir="rtl">
        <strong>الرياضي:</strong> {achievement.athleteNameAr}
      </div>
      {achievement.clubNameAr && (
        <div className="mb-3" dir="rtl">
          <strong>النادي:</strong> {achievement.clubNameAr}
        </div>
      )}
      <div dir="rtl" style={{ whiteSpace: 'pre-wrap' }}>
        {achievement.descriptionAr}
      </div>
    </Container>
  );
};

export default AchievementDetailPage;
