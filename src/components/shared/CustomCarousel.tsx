import React from 'react';
import { Carousel, Card } from 'react-bootstrap';
import type { CarouselItem } from '../../types';
import { Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';

interface CustomCarouselProps {
  items: CarouselItem[];
  title: string;
  titleAr: string;
  variant?: 'news' | 'clubs' | 'general';
  controls?: boolean;
  indicators?: boolean;
  interval?: number | null; // null to disable auto-cycling
  onViewAll?: () => void;
  viewAllText?: string;
  linkLabel?: string;
  renderFooter?: (item: CarouselItem) => React.ReactNode;
}

const CustomCarousel: React.FC<CustomCarouselProps> = ({ 
  items, 
  title, 
  titleAr, 
  variant = 'general',
  controls = true,
  indicators = true,
  interval = 5000,
  onViewAll,
  viewAllText = 'عرض الكل',
  linkLabel,
  renderFooter,
}) => {
  // Group items into slides of 3
  const groupedItems = [];
  for (let i = 0; i < items.length; i += 3) {
    groupedItems.push(items.slice(i, i + 3));
  }

  const getCardVariant = () => {
    switch (variant) {
      case 'news':
        return 'border-primary';
      case 'clubs':
        return 'border-success';
      default:
        return 'border-secondary';
    }
  };

  // Ensure we only use absolute https image URLs; otherwise fallback to a safe built-in asset
  const toSafeImage = (url?: string): string => {
    if (url && /^https:\/\//.test(url)) return url;
    return '/vite.svg';
  };

  return (
    <div className="mb-5 custom-carousel">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-primary mb-0 fw-bold">{titleAr}</h3>
        <div className="d-flex align-items-center gap-3">
          <small className="text-muted d-none d-md-inline">{title}</small>
          {onViewAll && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm rounded-pill px-3"
              onClick={onViewAll}
            >
              {viewAllText}
            </button>
          )}
        </div>
      </div>
      
      {groupedItems.length > 0 ? (
        <Carousel indicators={indicators} controls={controls} interval={interval} className="shadow-sm rounded-3 overflow-hidden">
          {groupedItems.map((group, groupIndex) => (
            <Carousel.Item key={groupIndex} className="p-3">
              <div className="row g-4">
                {group.map((item) => (
                  <div key={item.id} className="col-md-4">
                    <Card className={`h-100 shadow-sm carousel-card ${getCardVariant()} rounded-3 border-0 animate__animated animate__fadeIn`}>
                      <div className="overflow-hidden rounded-top" style={{ height: 200 }}>
                        <ImageWithFallback
                          inputSrc={item.image}
                          fallbackSrc={toSafeImage(undefined)}
                          alt={item.titleAr}
                          boxWidth={'100%'}
                          boxHeight={200}
                          fixedBox
                          style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                          className="img-fluid transition-scale"
                        />
                      </div>
                      <Card.Body className="d-flex flex-column p-4">
                        <Card.Title className="text-end fw-bold" dir="rtl">
                          {item.titleAr}
                        </Card.Title>
                        {item.descriptionAr && (
                          <Card.Text className="text-muted text-end flex-grow-1" dir="rtl">
                            {item.descriptionAr}
                          </Card.Text>
                        )}
                        {item.link && (
                          <div className="mt-auto">
                            <Link
                              to={item.link}
                              className="btn btn-outline-primary btn-sm rounded-pill px-3"
                              style={{ position: 'relative', zIndex: 2 }}
                            >
                              {linkLabel || 'اقرأ المزيد'}
                            </Link>
                          </div>
                        )}
                        {/* Footer slot for extra content (e.g., stats) */}
                        {renderFooter && (
                          <div className="mt-3 pt-3 border-top">
                            {renderFooter(item)}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                ))}
                
                {/* Fill empty slots if group has less than 3 items */}
                {group.length < 3 && Array.from({ length: 3 - group.length }).map((_, emptyIndex) => (
                  <div key={`empty-${emptyIndex}`} className="col-md-4">
                    <div style={{ height: '300px' }}></div>
                  </div>
                ))}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <div className="text-center py-5 bg-light rounded-3">
          <p className="text-muted mb-0">لا توجد عناصر للعرض حالياً</p>
        </div>
      )}
    </div>
  );
};

export default CustomCarousel;