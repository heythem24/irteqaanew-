import type { News, FeaturedLeague, RecentAchievement } from '../types';

// Mock data for news
const mockNews: News[] = [
  {
    id: 'news-001',
    title: 'البطولة الوطنية للجودو 2024',
    titleAr: 'البطولة الوطنية للجودو 2024',
    content: 'انطلقت البطولة الوطنية للجودو في مدينة الجزائر بمشاركة أكثر من 500 رياضي من جميع الولايات.',
    contentAr: 'انطلقت البطولة الوطنية للجودو في مدينة الجزائر بمشاركة أكثر من 500 رياضي من جميع الولايات.',
    excerpt: 'انطلقت البطولة الوطنية للجودو...',
    excerptAr: 'انطلقت البطولة الوطنية للجودو...',
    image: '/images/news/judo-championship-2024.jpg',
    author: 'إدارة المنصة',
    authorAr: 'إدارة المنصة',
    sportId: 'judo-001',
    isPublished: true,
    isFeatured: true,
    publishedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'news-002',
    title: 'افتتاح مركز تدريب جديد في وهران',
    titleAr: 'افتتاح مركز تدريب جديد في وهران',
    content: 'تم افتتاح مركز تدريب جديد للجودو في وهران مجهز بأحدث المعدات والتجهيزات.',
    contentAr: 'تم افتتاح مركز تدريب جديد للجودو في وهران مجهز بأحدث المعدات والتجهيزات.',
    excerpt: 'تم افتتاح مركز تدريب جديد...',
    excerptAr: 'تم افتتاح مركز تدريب جديد...',
    image: '/images/news/training-center-oran.jpg',
    author: 'إدارة المنصة',
    authorAr: 'إدارة المنصة',
    sportId: 'judo-001',
    leagueId: 'league-31',
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date('2024-01-20'),
    createdAt: new Date('2024-01-18')
  }
];

// Mock data for featured leagues
const mockFeaturedLeagues: FeaturedLeague[] = [
  {
    id: 'featured-league-001',
    leagueId: 'league-16',
    title: 'رابطة الجزائر المتميزة',
    titleAr: 'رابطة الجزائر المتميزة',
    description: 'رابطة الجزائر للجودو تتميز بتاريخها العريق وإنجازاتها المتميزة في رياضة الجودو.',
    descriptionAr: 'رابطة الجزائر للجودو تتميز بتاريخها العريق وإنجازاتها المتميزة في رياضة الجودو.',
    image: '/images/leagues/algiers-league.jpg',
    highlight: 'أكبر عدد من النوادي والرياضيين',
    highlightAr: 'أكبر عدد من النوادي والرياضيين',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'featured-league-002',
    leagueId: 'league-31',
    title: 'رابطة وهران الرياضية',
    titleAr: 'رابطة وهران الرياضية',
    description: 'رابطة وهران تشتهر بمرافقها الرياضية المتطورة وبرامجها التدريبية المتميزة.',
    descriptionAr: 'رابطة وهران تشتهر بمرافقها الرياضية المتطورة وبرامجها التدريبية المتميزة.',
    image: '/images/leagues/oran-league.jpg',
    highlight: 'أفضل مرافق تدريبية',
    highlightAr: 'أفضل مرافق تدريبية',
    isActive: true,
    createdAt: new Date('2024-01-05')
  }
];

// Mock data for recent achievements
const mockRecentAchievements: RecentAchievement[] = [
  {
    id: 'achievement-001',
    title: 'ميدالية ذهبية في البطولة العربية',
    titleAr: 'ميدالية ذهبية في البطولة العربية',
    description: 'حصل الرياضي أحمد محمد على الميدالية الذهبية في وزن 73 كجم.',
    descriptionAr: 'حصل الرياضي أحمد محمد على الميدالية الذهبية في وزن 73 كجم.',
    athleteName: 'أحمد محمد',
    athleteNameAr: 'أحمد محمد',
    clubName: 'نادي الجزائر للجودو',
    clubNameAr: 'نادي الجزائر للجودو',
    leagueName: 'رابطة الجزائر',
    leagueNameAr: 'رابطة الجزائر',
    achievementType: 'medal',
    achievementTypeAr: 'ميدالية',
    image: '/images/achievements/gold-medal.jpg',
    achievementDate: new Date('2024-01-25'),
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2024-01-26')
  },
  {
    id: 'achievement-002',
    title: 'بطل الجزائر للناشئين',
    titleAr: 'بطل الجزائر للناشئين',
    description: 'توج الرياضي محمد علي بطلاً للجزائر في فئة الناشئين وزن 60 كجم.',
    descriptionAr: 'توج الرياضي محمد علي بطلاً للجزائر في فئة الناشئين وزن 60 كجم.',
    athleteName: 'محمد علي',
    athleteNameAr: 'محمد علي',
    clubName: 'نادي وهران الرياضي',
    clubNameAr: 'نادي وهران الرياضي',
    leagueName: 'رابطة وهران',
    leagueNameAr: 'رابطة وهران',
    achievementType: 'championship',
    achievementTypeAr: 'بطولة',
    image: '/images/achievements/champion-title.jpg',
    achievementDate: new Date('2024-01-20'),
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2024-01-21')
  }
];

class DashboardContentService {
  private static emitUpdated(section: 'news' | 'featuredLeagues' | 'recentAchievements') {
    try {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('dashboardContentUpdated', { detail: { section } });
        window.dispatchEvent(event);
      }
    } catch {
      // ignore
    }
  }
  // News management
  static async getNews(): Promise<News[]> {
    // In a real app, this would fetch from Firebase
    // For now, we'll use localStorage to persist changes
    const stored = localStorage.getItem('dashboardNews');
    const items: News[] = stored ? JSON.parse(stored) : mockNews;
    return items.map(n => ({
      ...n,
      publishedAt: n.publishedAt ? new Date(n.publishedAt as any) : undefined,
      createdAt: n.createdAt ? new Date(n.createdAt as any) : new Date()
    }));
  }

  static async saveNews(news: News[]): Promise<void> {
    localStorage.setItem('dashboardNews', JSON.stringify(news));
    this.emitUpdated('news');
  }

  static async addNews(newsItem: Omit<News, 'id' | 'createdAt'>): Promise<News> {
    const news = await this.getNews();
    const newNews: News = {
      ...newsItem,
      id: `news-${Date.now()}`,
      createdAt: new Date()
    };
    news.unshift(newNews); // Add to beginning
    await this.saveNews(news);
    return newNews;
  }

  static async updateNews(id: string, updates: Partial<News>): Promise<News | null> {
    const news = await this.getNews();
    const index = news.findIndex(item => item.id === id);
    if (index === -1) return null;

    news[index] = { ...news[index], ...updates };
    await this.saveNews(news);
    return news[index];
  }

  static async deleteNews(id: string): Promise<boolean> {
    const news = await this.getNews();
    const filteredNews = news.filter(item => item.id !== id);
    if (filteredNews.length === news.length) return false;

    await this.saveNews(filteredNews);
    return true;
  }

  // Featured leagues management
  static async getFeaturedLeagues(): Promise<FeaturedLeague[]> {
    const stored = localStorage.getItem('dashboardFeaturedLeagues');
    return stored ? JSON.parse(stored) : mockFeaturedLeagues;
  }

  static async saveFeaturedLeagues(leagues: FeaturedLeague[]): Promise<void> {
    localStorage.setItem('dashboardFeaturedLeagues', JSON.stringify(leagues));
    this.emitUpdated('featuredLeagues');
  }

  static async addFeaturedLeague(league: Omit<FeaturedLeague, 'id' | 'createdAt'>): Promise<FeaturedLeague> {
    const leagues = await this.getFeaturedLeagues();
    const newLeague: FeaturedLeague = {
      ...league,
      id: `featured-league-${Date.now()}`,
      createdAt: new Date()
    };
    leagues.push(newLeague);
    await this.saveFeaturedLeagues(leagues);
    return newLeague;
  }

  static async updateFeaturedLeague(id: string, updates: Partial<FeaturedLeague>): Promise<FeaturedLeague | null> {
    const leagues = await this.getFeaturedLeagues();
    const index = leagues.findIndex(item => item.id === id);
    if (index === -1) return null;

    leagues[index] = { ...leagues[index], ...updates };
    await this.saveFeaturedLeagues(leagues);
    return leagues[index];
  }

  static async deleteFeaturedLeague(id: string): Promise<boolean> {
    const leagues = await this.getFeaturedLeagues();
    const filteredLeagues = leagues.filter(item => item.id !== id);
    if (filteredLeagues.length === leagues.length) return false;

    await this.saveFeaturedLeagues(filteredLeagues);
    return true;
  }

  // Recent achievements management
  static async getRecentAchievements(): Promise<RecentAchievement[]> {
    const stored = localStorage.getItem('dashboardRecentAchievements');
    const items: RecentAchievement[] = stored ? JSON.parse(stored) : mockRecentAchievements;
    return items.map(a => ({
      ...a,
      achievementDate: new Date(a.achievementDate as any),
      createdAt: a.createdAt ? new Date(a.createdAt as any) : new Date()
    }));
  }

  static async saveRecentAchievements(achievements: RecentAchievement[]): Promise<void> {
    localStorage.setItem('dashboardRecentAchievements', JSON.stringify(achievements));
    this.emitUpdated('recentAchievements');
  }

  static async addRecentAchievement(achievement: Omit<RecentAchievement, 'id' | 'createdAt'>): Promise<RecentAchievement> {
    const achievements = await this.getRecentAchievements();
    const newAchievement: RecentAchievement = {
      ...achievement,
      id: `achievement-${Date.now()}`,
      createdAt: new Date()
    };
    achievements.unshift(newAchievement); // Add to beginning
    await this.saveRecentAchievements(achievements);
    return newAchievement;
  }

  static async updateRecentAchievement(id: string, updates: Partial<RecentAchievement>): Promise<RecentAchievement | null> {
    const achievements = await this.getRecentAchievements();
    const index = achievements.findIndex(item => item.id === id);
    if (index === -1) return null;

    achievements[index] = { ...achievements[index], ...updates };
    await this.saveRecentAchievements(achievements);
    return achievements[index];
  }

  static async deleteRecentAchievement(id: string): Promise<boolean> {
    const achievements = await this.getRecentAchievements();
    const filteredAchievements = achievements.filter(item => item.id !== id);
    if (filteredAchievements.length === achievements.length) return false;

    await this.saveRecentAchievements(filteredAchievements);
    return true;
  }

  // Get all dashboard content
  static async getDashboardContent() {
    const [news, featuredLeagues, recentAchievements] = await Promise.all([
      this.getNews(),
      this.getFeaturedLeagues(),
      this.getRecentAchievements()
    ]);

    return {
      news: news.filter(item => item.isPublished),
      featuredLeagues: featuredLeagues.filter(item => item.isActive),
      recentAchievements: recentAchievements.filter(item => item.isActive)
    };
  }
}

export default DashboardContentService;
