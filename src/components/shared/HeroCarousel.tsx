import React from 'react';
import { Carousel } from 'react-bootstrap';
import './HeroCarousel.css';

interface HeroCarouselItem {
  id: string;
  image: string;
  alt: string;
}

interface HeroCarouselProps {
  items: HeroCarouselItem[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <section className="hero-carousel bg-primary text-white py-5 mb-5">
        
      </section>
    );
  }

  return (
    <section className="hero-carousel mb-5 p-0">
      <Carousel indicators={true} controls={false} interval={5000} className="hero-carousel-container">
        {items.map((item) => (
          <Carousel.Item key={item.id} className="w-100">
            <div className="hero-image-container">
              <img
                src={item.image}
                alt={item.alt}
                className="hero-carousel-image w-100"
              />
              <div className="hero-overlay">
                <div className="container-fluid h-100 px-0">
                  <div className="row h-100 align-items-center">
                    {/* Overlay content if needed */}
                  </div>
                </div>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
};

export default HeroCarousel;