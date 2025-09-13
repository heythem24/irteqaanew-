import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';
import { CompetitionsService } from '../services/firestoreService';
import type { Competition } from '../types';
import ImageWithFallback from '../components/shared/ImageWithFallback';

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
      <h1>البطولات</h1>
      <div className="tabs">
        <button onClick={() => setActiveTab('upcoming')} className={activeTab === 'upcoming' ? 'active' : ''}>
          قادمة
        </button>
        <button onClick={() => setActiveTab('ongoing')} className={activeTab === 'ongoing' ? 'active' : ''}>
          جارية
        </button>
        <button onClick={() => setActiveTab('finished')} className={activeTab === 'finished' ? 'active' : ''}>
          منتهية
        </button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4" dir="rtl">{error}</Alert>
      )}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="row">
          {competitions.map((c) => {
            const content = (
              <div 
                className="card shadow-sm h-100" 
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <ImageWithFallback
                    inputSrc={c.image || undefined}
                    fallbackSrc={'/vite.svg'}
                    alt={c.nameAr}
                    boxWidth={'100%'}
                    boxHeight={200}
                    fixedBox
                    style={{ height: '200px', width: '100%', objectFit: 'cover', background: '#007bff' }}
                  />
                </div>
                <div className="card-body">
                  <h5 className="card-title">{c.nameAr}</h5>
                  {c.level && (
                    <div className="mb-2">
                      <span className="badge bg-secondary">{levelLabelAr(c.level)}</span>
                    </div>
                  )}
                  {c.descriptionAr && (
                    <p className="card-text text-muted text-end" dir="rtl" style={{ minHeight: '2.5em' }}>
                      {c.descriptionAr.length > 120 ? `${c.descriptionAr.slice(0, 120)}…` : c.descriptionAr}
                    </p>
                  )}
                  <p className="card-text mb-1">
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      {activeTab === 'upcoming' && `${formatDateAr(c.startDate)} - ${formatDateAr(c.endDate)}`}
                      {activeTab === 'ongoing' && `${formatDateAr(c.startDate)} - ${formatDateAr(c.endDate)}`}
                      {activeTab === 'finished' && `${formatDateAr(c.startDate)} - ${formatDateAr(c.endDate)}`}
                    </small>
                  </p>
                  {activeTab === 'upcoming' && c.registrationDeadline && (
                    <p className="card-text mb-1">
                      <small className="text-muted">
                        <i className="fas fa-hourglass-end me-1"></i>
                        انتهاء التسجيل: {formatDateAr(c.registrationDeadline)}
                      </small>
                    </p>
                  )}
                  <p className="card-text">
                    <small className="text-muted">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {c.placeAr || c.place || '-'}
                    </small>
                  </p>
                </div>
              </div>
            );

            return (
              <div key={c.id} className="col-md-4 mb-4">
                <Link to={`/competitions/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {content}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompetitionsPage;