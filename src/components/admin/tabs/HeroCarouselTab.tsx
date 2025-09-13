import React, { useRef, useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { uploadToCloudinary } from '../../../services/cloudinaryService';
import type { HeroCarouselImage } from '../../../services/homepageService';

interface Props {
  images: HeroCarouselImage[];
  onAdd: (item: HeroCarouselImage) => void;
  onDelete: (id: string) => void;
}

const HeroCarouselTab: React.FC<Props> = ({ images, onAdd, onDelete }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = () => fileRef.current?.click();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: 'homepage/hero-carousel' });
      const item: HeroCarouselImage = {
        id: `hero_${Date.now()}`,
        image: res.secure_url,
        alt: file.name,
        createdAt: new Date(),
      };
      onAdd(item);
    } catch (err) {
      console.error('HeroCarouselTab: Cloudinary upload failed', err);
      alert('فشل رفع الصورة. تحقق من الإعدادات ثم حاول مرة أخرى.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">صور الكاروسيل الرئيسية</h5>
          <div>
            <Button variant="primary" onClick={handlePick} disabled={uploading}>
              <i className="fas fa-upload me-2"></i>
              {uploading ? '...جاري الرفع' : 'إضافة صورة'}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleChange}
            />
          </div>
        </Card.Header>
        <Card.Body>
          {images.length === 0 && (
            <div className="text-center text-muted py-4">
              <i className="fas fa-images fa-3x mb-3"></i>
              <p>لا توجد صور بعد. اضغط على "إضافة صورة" لرفع صور جديدة.</p>
            </div>
          )}
          <Row>
            {images.map((img) => (
              <Col md={4} key={img.id} className="mb-3">
                <Card className="h-100">
                  <Card.Img variant="top" src={img.image} alt={img.alt || 'Hero image'} style={{ height: 200, objectFit: 'cover' }} />
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <small className="text-muted text-truncate" style={{ maxWidth: '70%' }}>
                      {img.alt || img.image}
                    </small>
                    <Button variant="outline-danger" size="sm" onClick={() => onDelete(img.id)}>
                      حذف
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default HeroCarouselTab;
