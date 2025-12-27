import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import CustomCarousel from '../components/shared/CustomCarousel';
import HeroCarousel from '../components/shared/HeroCarousel';
import './HomePage.css';
// Removed duplicate dashboard sections to avoid repeating content
import type { CarouselItem, News, FeaturedLeague, RecentAchievement } from '../types';
import { HomepageService, type HeroCarouselImage } from '../services/homepageService';
import { ClubsService, UsersService } from '../services/firestoreService';
import { wilayas } from '../data/wilayas';
import type { Club, User } from '../types';

const HomePage: React.FC = () => {
  const [dashboardContent, setDashboardContent] = useState({
    news: [] as News[],
    featuredLeagues: [] as FeaturedLeague[],
    recentAchievements: [] as RecentAchievement[]
  });
  const [heroImages, setHeroImages] = useState<HeroCarouselImage[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  // Fallback hero carousel images (used when Firestore has none)
  const fallbackHeroImages = [
    {
      id: 'hero-1',
      image: '/images/hero-sports.jpg',
      alt: 'الرياضة الجزائرية'
    },
    {
      id: 'hero-2',
      image: '/images/hero-sports-2.jpg',
      alt: 'الأنشطة الرياضية'
    },
    {
      id: 'hero-3',
      image: '/images/hero-sports-3.jpg',
      alt: 'المواهب الرياضية'
    }
  ];

  // Load dashboard content on component mount
  useEffect(() => {
    const loadDashboardContent = async () => {
      try {
        const content = await HomepageService.getContent();
        setDashboardContent({
          news: content.news,
          featuredLeagues: content.featuredLeagues,
          recentAchievements: content.recentAchievements,
        });
        setHeroImages(content.heroCarousel || []);
      } catch (error) {
        console.error('Error loading dashboard content:', error);
      }
    };

    loadDashboardContent();

    // Fetch clubs and users for dynamic counters
    const loadStats = async () => {
      try {
        const [allClubs, allUsers] = await Promise.all([
          ClubsService.getAllClubs(),
          UsersService.getAllUsers()
        ]);
        setClubs(allClubs);
        setUsers(allUsers);
      } catch (e) {
        console.error('Error loading stats:', e);
      }
    };
    loadStats();

    const handler = () => {
      // Re-fetch on any section update
      loadDashboardContent();
    };
    window.addEventListener('dashboardContentUpdated', handler as EventListener);
    return () => {
      window.removeEventListener('dashboardContentUpdated', handler as EventListener);
    };
  }, []);

  // Convert news to carousel items
  const newsCarouselItems: CarouselItem[] = dashboardContent.news.map(article => ({
    id: article.id,
    title: article.title,
    titleAr: article.titleAr,
    description: article.excerpt,
    descriptionAr: article.excerptAr,
    image: article.image || '/images/default-news.jpg',
    link: `/news/${article.id}`
  }));

  // Convert featured leagues to carousel items
  const featuredLeaguesItems: CarouselItem[] = dashboardContent.featuredLeagues.map(league => ({
    id: league.id,
    title: league.title,
    titleAr: league.titleAr,
    description: league.description,
    descriptionAr: league.descriptionAr,
    image: league.image || '/images/default-league.jpg',
    // رابط صفحة الرابطة
    link: `/league/${league.wilayaId || league.leagueId}`
  }));

  const getClubCount = (leagueId: string) => clubs.filter(c => c.leagueId === leagueId).length;
  const getAthleteCount = (leagueId: string) => {
    const leagueClubIds = clubs.filter(c => c.leagueId === leagueId).map(c => c.id);
    const athletes = users.filter(u => u.role === 'athlete');
    return athletes.filter(a => a.clubId && leagueClubIds.includes(a.clubId)).length;
  };

  // Convert recent achievements to carousel items
  const achievementsCarouselItems: CarouselItem[] = dashboardContent.recentAchievements.map(achievement => ({
    id: achievement.id,
    title: achievement.title,
    titleAr: achievement.titleAr,
    description: achievement.description,
    descriptionAr: achievement.descriptionAr,
    image: achievement.image || '/images/default-achievement.jpg',
    link: `/achievement/${achievement.id}`
  }));

  const heroCarouselItems = (heroImages && heroImages.length > 0
    ? heroImages.map((h) => ({ id: h.id, image: h.image, alt: h.alt || 'صورة' }))
    : fallbackHeroImages);

  return (
    <div className="homepage">
      {/* Hero Carousel Section */}
      <div className="hero-section position-relative">
        <HeroCarousel items={heroCarouselItems} />
        <div className="hero-overlay-text position-absolute top-50 start-50 translate-middle text-center text-white w-100 px-3">
          <Container>
            <h1 className="display-4 fw-bold mb-4 animate__animated animate__fadeInDown">
              منصة إرتقاء
            </h1>
            <p className="lead mb-5 animate__animated animate__fadeInUp animate__delay-1s">
              نظام متكامل لإدارة الأندية والرابطات الرياضية وتحقيق التميز في الأداء
            </p>
            <div className="animate__animated animate__fadeIn animate__delay-2s">
              <button
                className="btn btn-primary btn-lg me-3 rounded-pill px-4 py-2"
                onClick={() => navigate('/leagues')}
              >
                <i className="fas fa-shield-alt me-2"></i>
                استكشف الرابطات
              </button>
              <button
                className="btn btn-primary btn-lg rounded-pill px-4 py-2"
                onClick={() => navigate('/about')}
              >
                <i className="fas fa-info-circle me-2"></i>
                تعرف علينا
              </button>
            </div>
          </Container>
        </div>
      </div>

      <Container>
        {/* Featured Leagues Section */}
        <section className="py-5 animate__animated animate__fadeIn">
          <CustomCarousel
            items={featuredLeaguesItems}
            title="Featured Leagues"
            titleAr="الرابطات المميزة"
            variant="general"
            controls={false}  // Disable navigation arrows
            onViewAll={() => navigate('/featured-leagues')}
            viewAllText="عرض جميع الرابطات المميزة"
            linkLabel="زيارة صفحة الرابطة"
            renderFooter={(item) => {
              const fl = dashboardContent.featuredLeagues.find(x => x.id === item.id);
              const leagueId = fl?.leagueId || '';
              if (!leagueId) return null;
              return (
                <div className="d-flex justify-content-around text-center mt-2 pt-2 border-top">
                  <div>
                    <div className="text-muted small">
                      <i className="fas fa-shield-alt me-1"></i>
                      الأندية
                    </div>
                    <div className="fw-bold">{getClubCount(leagueId)}</div>
                  </div>
                  <div className="vr mx-2"></div>
                  <div>
                    <div className="text-muted small">
                      <i className="fas fa-users me-1"></i>
                      الرياضيين
                    </div>
                    <div className="fw-bold">{getAthleteCount(leagueId)}</div>
                  </div>
                </div>
              );
            }}
          />
        </section>

        {/* News Section */}
        <section className="py-5 bg-light rounded-3 p-4 animate__animated animate__fadeIn animate__delay-1s">
          <CustomCarousel
            items={newsCarouselItems}
            title="Latest News"
            titleAr="آخر الأخبار"
            variant="news"
            controls={false}  // Disable navigation arrows
            onViewAll={() => navigate('/news')}
          />
        </section>

        {/* Recent Achievements Section */}
        <section className="py-5 animate__animated animate__fadeIn animate__delay-2s">
          <CustomCarousel
            items={achievementsCarouselItems}
            title="Recent Achievements"
            titleAr="الإنجازات الحديثة"
            variant="clubs"
            controls={false}  // Disable navigation arrows
            onViewAll={() => navigate('/achievements')}
          />
        </section>

        {/* Quick Stats Section */}
        <section className="py-5 stats-section">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold text-primary mb-3">إحصائيات المنصة</h2>
            <p className="text-muted">أرقام تعكس نجاحنا وتطورنا المستمر</p>
          </div>
          <Row className="text-center g-4">
            <Col md={3} className="animate__animated animate__fadeInUp">
              <Card className="border-0 shadow-lg h-100 rounded-3 overflow-hidden stats-card">
                <div className="card-bg-primary py-4">
                  <div className="text-white mb-3">
                    <i className="fas fa-trophy fa-3x"></i>
                  </div>
                  <h3 className="text-white display-5 fw-bold">{wilayas.length}</h3>
                </div>
                <Card.Body className="py-4">
                  <p className="text-muted mb-0">رابطة ولائية</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="animate__animated animate__fadeInUp animate__delay-1s">
              <Card className="border-0 shadow-lg h-100 rounded-3 overflow-hidden stats-card">
                <div className="card-bg-success py-4">
                  <div className="text-white mb-3">
                    <i className="fas fa-users fa-3x"></i>
                  </div>
                  <h3 className="text-white display-5 fw-bold">500+</h3>
                </div>
                <Card.Body className="py-4">
                  <p className="text-muted mb-0">نادي رياضي</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="animate__animated animate__fadeInUp animate__delay-2s">
              <Card className="border-0 shadow-lg h-100 rounded-3 overflow-hidden stats-card">
                <div className="card-bg-warning py-4">
                  <div className="text-white mb-3">
                    <i className="fas fa-medal fa-3x"></i>
                  </div>
                  <h3 className="text-white display-5 fw-bold">1000+</h3>
                </div>
                <Card.Body className="py-4">
                  <p className="text-muted mb-0">رياضي مسجل</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="animate__animated animate__fadeInUp animate__delay-3s">
              <Card className="border-0 shadow-lg h-100 rounded-3 overflow-hidden stats-card">
                <div className="card-bg-info py-4">
                  <div className="text-white mb-3">
                    <i className="fas fa-calendar fa-3x"></i>
                  </div>
                  <h3 className="text-white display-5 fw-bold">50+</h3>
                </div>
                <Card.Body className="py-4">
                  <p className="text-muted mb-0">فعالية سنوية</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>
      </Container>
    </div>
  );
};

export default HomePage;