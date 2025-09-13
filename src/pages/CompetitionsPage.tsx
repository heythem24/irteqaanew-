import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';
import { CompetitionsService } from '../services/firestoreService';
import type { Competition } from '../types';
import ImageWithFallback from '../components/shared/ImageWithFallback';
import './CompetitionsPage.css';

const CompetitionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'finished'>('upcoming');
  const [allCompetitions, setAllCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await CompetitionsService.getAllCompetitions();
        setAllCompetitions(data);
      } catch (e) {
        console.error('Failed to load competitions:', e);
        setError('فشل في تحميل قائمة البطولات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const competitions = useMemo(() => {
    return allCompetitions.filter(c => (c.status || 'upcoming') === activeTab);
  }, [allCompetitions, activeTab]);

  const formatDateAr = (value: unknown): string => {
    try {
      if (!value) return '-';
      const d = value instanceof Date ? value : new Date(value as any);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('ar-DZ');
    } catch {
      return '-';
    }
  };

  const levelLabelAr = (lv?: string): string => {
    switch (lv) {
      case 'national':
        return 'بطولة وطنية';
      case 'regional':
        return 'بطولة جهوية';
      case 'league':
        return 'بطولة تابعة لرابطة';
      default:
        return '';
    }
  };

  return (
    <div className="competitions-page">
      <div className="page-header">
        <h1 className="page-title">البطولات</h1>
        <p className="page-subtitle">استكشف البطولات والمنافسات القادمة والجارية والمنتهية</p>
      </div>

      <div className="competition-tabs">
        <button 
          onClick={() => setActiveTab('upcoming')} 
          className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
        >
          <i className="fas fa-calendar-plus me-2"></i>
          قادمة
        </button>
        <button 
          onClick={() => setActiveTab('ongoing')} 
          className={`tab-button ${activeTab === 'ongoing' ? 'active' : ''}`}
        >
          <i className="fas fa-play-circle me-2"></i>
          جارية
        </button>
        <button 
          onClick={() => setActiveTab('finished')} 
          className={`tab-button ${activeTab === 'finished' ? 'active' : ''}`}
        >
          <i className="fas fa-check-circle me-2"></i>
          منتهية
        </button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4" dir="rtl">{error}</Alert>
      )}

      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">جاري تحميل البطولات...</p>
        </div>
      ) : (
        <div className="competitions-grid">
          {competitions.length > 0 ? (
            competitions.map((c) => (
              <div key={c.id} className="competition-card-wrapper">
                <Link to={`/competitions/${c.id}`} className="competition-card-link">
                  <div className="competition-card">
                    <div className="card-image-container">
                      <ImageWithFallback
                        inputSrc={c.image || undefined}
                        fallbackSrc={'/vite.svg'}
                        alt={c.nameAr}
                        boxWidth={'100%'}
                        boxHeight={200}
                        fixedBox
                        className="card-image"
                      />
                      <div className="card-badge">
                        <span className="badge bg-secondary">{levelLabelAr(c.level)}</span>
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{c.nameAr}</h3>
                      {c.descriptionAr && (
                        <p className="card-description" dir="rtl">
                          {c.descriptionAr.length > 120 ? `${c.descriptionAr.slice(0, 120)}…` : c.descriptionAr}
                        </p>
                      )}
                      <div className="card-details">
                        <div className="detail-item">
                          <i className="fas fa-calendar me-1"></i>
                          <span>{formatDateAr(c.startDate)} - {formatDateAr(c.endDate)}</span>
                        </div>
                        {activeTab === 'upcoming' && c.registrationDeadline && (
                          <div className="detail-item">
                            <i className="fas fa-hourglass-end me-1"></i>
                            <span>انتهاء التسجيل: {formatDateAr(c.registrationDeadline)}</span>
                          </div>
                        )}
                        <div className="detail-item">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          <span>{c.placeAr || c.place || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="no-competitions">
              <i className="fas fa-trophy fa-3x mb-3"></i>
              <h3>لا توجد بطولات</h3>
              <p>لا توجد بطولات في هذا القسم حالياً</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompetitionsPage;