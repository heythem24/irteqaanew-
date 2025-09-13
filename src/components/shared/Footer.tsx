import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5 className="mb-3 text-light">IRTEQAA</h5>
            <p className="text-light-emphasis">
              منصة شاملة للرياضات الجزائرية تهدف إلى تطوير وتنظيم الأنشطة الرياضية
              في جميع أنحاء الجزائر
            </p>
          </Col>

          <Col md={4}>
            <h6 className="mb-3 text-light">روابط سريعة</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light-emphasis text-decoration-none">
                  الرئيسية
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-light-emphasis text-decoration-none">
                  من نحن
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-light-emphasis text-decoration-none">
                  اتصل بنا
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/news" className="text-light-emphasis text-decoration-none">
                  الأخبار
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={4}>
            <h6 className="mb-3 text-light">معلومات الاتصال</h6>
            <div className="text-light-emphasis">
              <p className="mb-2">
                <i className="fas fa-map-marker-alt me-2"></i>
                الجزائر العاصمة، الجزائر
              </p>
              <p className="mb-2">
                <i className="fas fa-phone me-2"></i>
                +213 21 123 456
              </p>
              <p className="mb-2">
                <i className="fas fa-envelope me-2"></i>
                info@sports-algeria.dz
              </p>
            </div>
          </Col>
        </Row>

        <hr className="my-4 border-light" />

        <Row>
          <Col md={6}>
            <p className="text-light-emphasis mb-0">
              © 2024 IRTEQAA. جميع الحقوق محفوظة.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <div className="social-links">
              <a href="#" className="text-light-emphasis me-3">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-light-emphasis me-3">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-light-emphasis me-3">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-light-emphasis">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
