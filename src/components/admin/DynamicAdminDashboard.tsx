import React, { useState, useEffect, useRef } from 'react';
import { Modal, Container, Row, Col, Tab, Tabs, Form, Button, Card, Alert, Table, Badge } from 'react-bootstrap';
import { leagues } from '../../data/mockData';
import type { Club, User, UserRole, FeaturedLeague, News, RecentAchievement } from '../../types';
import FeaturedLeaguesTab from './tabs/FeaturedLeaguesTab';
import HeroCarouselTab from './tabs/HeroCarouselTab';
import NewsTab from './tabs/NewsTab';
import RecentAchievementsTab from './tabs/RecentAchievementsTab';
import LeagueHomepageTab from './tabs/LeagueHomepageTab';
import LeaguePresidentTab from './tabs/LeaguePresidentTab';
import ClubHomepageTab from './tabs/ClubHomepageTab';
import CompetitionsTab from './tabs/CompetitionsTab';
import CompetitionParticipationsTab from './tabs/CompetitionParticipationsTab';
import { UsersService, ClubsService } from '../../services/firestoreService';
import { HomepageService, type HeroCarouselImage } from '../../services/homepageService';
import { uploadToCloudinary } from '../../services/cloudinaryService';

interface DynamicAdminDashboardProps {
  show: boolean;
  onHide: () => void;
}

const DynamicAdminDashboard: React.FC<DynamicAdminDashboardProps> = ({ show, onHide }) => {
  // Safely format date value for input[type=date]
  const toDateInputValue = (value: unknown): string => {
    try {
      if (!value) return new Date().toISOString().substring(0, 10);
      const d = value instanceof Date ? value : new Date(value as any);
      if (isNaN(d.getTime())) return new Date().toISOString().substring(0, 10);
      return d.toISOString().substring(0, 10);
    } catch {
      return new Date().toISOString().substring(0, 10);
    }
  };
  const [activeTab, setActiveTab] = useState('clubs');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    password: '',
    role: 'athlete',
    firstName: '',
    lastName: '',
    isActive: true
  });

  // Edit User modal state
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Partial<User>>({});
  const userEditFileInputRef = useRef<HTMLInputElement | null>(null);
  const [userImageUploading, setUserImageUploading] = useState(false);

  const [newClub, setNewClub] = useState<Partial<Club>>({
    name: '', nameAr: '', leagueId: '', sportId: 'judo-001',
    isActive: true, isFeatured: false,
  });

  // Homepage content (local state for now; can be wired to Firestore later)
  const [featuredLeagues, setFeaturedLeagues] = useState<FeaturedLeague[]>([]);
  const [heroImages, setHeroImages] = useState<HeroCarouselImage[]>([]);
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [achievements, setAchievements] = useState<RecentAchievement[]>([]);

  // Add modals state
  const [showAddFeatured, setShowAddFeatured] = useState(false);
  const [editingFeaturedId, setEditingFeaturedId] = useState<string | null>(null);
  const [newFeatured, setNewFeatured] = useState<Partial<FeaturedLeague>>({
    id: '', leagueId: '', wilayaId: '', title: '', titleAr: '', description: '', descriptionAr: '',
    image: '', highlight: '', highlightAr: '', isActive: true, createdAt: new Date()
  });

  const [showAddNews, setShowAddNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newNews, setNewNews] = useState<Partial<News>>({
    id: '', title: '', titleAr: '', content: '', contentAr: '', author: '', authorAr: '',
    image: '', isPublished: false, isFeatured: false, createdAt: new Date()
  });

  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [newAchievement, setNewAchievement] = useState<Partial<RecentAchievement>>({
    id: '', title: '', titleAr: '', description: '', descriptionAr: '',
    athleteName: '', athleteNameAr: '', clubName: '', clubNameAr: '',
    achievementType: 'other', achievementTypeAr: 'أخرى', image: '',
    achievementDate: new Date(), isFeatured: false, isActive: true, createdAt: new Date()
  });

  // Uploading states
  const [featuredUploading, setFeaturedUploading] = useState(false);
  const [newsUploading, setNewsUploading] = useState(false);
  const [achievementUploading, setAchievementUploading] = useState(false);

  // Hidden file inputs (to open gallery/file picker via a button)
  const featuredFileInputRef = useRef<HTMLInputElement | null>(null);
  const newsFileInputRef = useRef<HTMLInputElement | null>(null);
  const achievementFileInputRef = useRef<HTMLInputElement | null>(null);

  // Edit Club modal state
  const [showEditClub, setShowEditClub] = useState(false);
  const [editingClubId, setEditingClubId] = useState<string | null>(null);
  const [editClub, setEditClub] = useState<Partial<Club>>({});
  const clubEditFileInputRef = useRef<HTMLInputElement | null>(null);
  const [clubImageUploading, setClubImageUploading] = useState(false);

  // Cloudinary upload handlers
  const handleFeaturedImageUpload = async (file: File) => {
    setFeaturedUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: 'homepage/featured-leagues' });
      setNewFeatured(prev => ({ ...prev, image: res.secure_url }));
      showAlert('success', 'تم رفع صورة الرابطة بنجاح');
    } catch (e) {
      console.error('Cloudinary upload (featured) failed', e);
      showAlert('danger', 'فشل رفع صورة الرابطة');
    } finally {
      setFeaturedUploading(false);
    }
  };

  const handleNewsImageUpload = async (file: File) => {
    setNewsUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: 'homepage/news' });
      setNewNews(prev => ({ ...prev, image: res.secure_url }));
      showAlert('success', 'تم رفع صورة الخبر بنجاح');
    } catch (e) {
      console.error('Cloudinary upload (news) failed', e);
      showAlert('danger', 'فشل رفع صورة الخبر');
    } finally {
      setNewsUploading(false);
    }
  };

  const handleAchievementImageUpload = async (file: File) => {
    setAchievementUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: 'homepage/achievements' });
      setNewAchievement(prev => ({ ...prev, image: res.secure_url }));
      showAlert('success', 'تم رفع صورة الإنجاز بنجاح');
    } catch (e) {
      console.error('Cloudinary upload (achievement) failed', e);
      showAlert('danger', 'فشل رفع صورة الإنجاز');
    } finally {
      setAchievementUploading(false);
    }
  };

  // Clubs: open edit, upload image, save
  const openEditClub = (club: Club) => {
    setEditingClubId(club.id);
    setEditClub({ ...club });
    setShowEditClub(true);
  };

  const handleClubImageUpload = async (file: File) => {
    if (!editingClubId) return;
    setClubImageUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: `clubs/${editingClubId}` });
      setEditClub(prev => ({ ...prev, image: res.secure_url }));
      showAlert('success', 'تم رفع صورة النادي بنجاح');
    } catch (e) {
      console.error('Cloudinary upload (club) failed', e);
      showAlert('danger', 'فشل رفع صورة النادي');
    } finally {
      setClubImageUploading(false);
    }
  };

  const handleSaveClubEdit = async () => {
    if (!editingClubId) return;
    try {
      const payload: Partial<Club> = {
        name: editClub.name || '',
        nameAr: editClub.nameAr || '',
        description: editClub.description ?? '',
        descriptionAr: editClub.descriptionAr ?? '',
        address: editClub.address ?? '',
        addressAr: editClub.addressAr ?? '',
        phone: editClub.phone ?? '',
        email: editClub.email ?? '',
        isActive: editClub.isActive ?? true,
        isFeatured: editClub.isFeatured ?? false,
        image: editClub.image,
        leagueId: editClub.leagueId || undefined,
      };
      await ClubsService.updateClub(editingClubId, payload);
      // update local list
      setClubs(prev => prev.map(c => (c.id === editingClubId ? { ...c, ...payload } as Club : c)));
      showAlert('success', 'تم حفظ تعديلات النادي بنجاح');
      setShowEditClub(false);
      setEditingClubId(null);
    } catch (e) {
      console.error('Failed to update club', e);
      showAlert('danger', 'فشل حفظ تعديلات النادي');
    }
  };

  const showAlert = (type: 'success' | 'danger' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchUsers = async () => {
    try {
      const allUsers = await UsersService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showAlert('danger', 'فشل تحميل قائمة المستخدمين.');
    }
  };

  const fetchClubs = async () => {
    try {
      const allClubs = await ClubsService.getAllClubs();
      setClubs(allClubs);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
      showAlert('danger', 'فشل تحميل قائمة الأندية.');
    }
  };

  useEffect(() => {
    if (show) {
      fetchUsers();
      fetchClubs();
      // Load homepage content from Firestore
      (async () => {
        try {
          const content = await HomepageService.getContent();
          setHeroImages(content.heroCarousel || []);
          setFeaturedLeagues(content.featuredLeagues || []);
          setNewsItems(content.news || []);
          setAchievements(content.recentAchievements || []);
        } catch (e) {
          console.error('Failed to load homepage content:', e);
        }
      })();
    }
  }, [show]);

  const handleCreateClub = async () => {
    if (!newClub.name || !newClub.nameAr || !newClub.leagueId) {
      showAlert('danger', 'الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    try {
      await ClubsService.createClub(newClub as Omit<Club, 'id' | 'createdAt'>);
      showAlert('success', `تم إنشاء النادي "${newClub.nameAr}" بنجاح!`);
      setShowCreateForm(false);
      setNewClub({ name: '', nameAr: '', leagueId: '', sportId: 'judo-001', isActive: true, isFeatured: false });
      fetchClubs();

      // Find the selected league to get wilayaId
      const selectedLeague = leagues.find(l => l.id === newClub.leagueId);

      // Dispatch custom event to notify navbar that a club was created
      window.dispatchEvent(new CustomEvent('clubCreated', {
        detail: {
          leagueId: newClub.leagueId,
          wilayaId: selectedLeague?.wilayaId
        }
      }));
    } catch (error) {
      console.error("Error creating club:", error);
      showAlert('danger', 'فشل إنشاء النادي.');
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا النادي؟')) {
      try {
        await ClubsService.deleteClub(clubId);
        showAlert('info', 'تم حذف النادي بنجاح');
        fetchClubs();
      } catch (error) {
        console.error("Error deleting club:", error);
        showAlert('danger', 'فشل حذف النادي.');
      }
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.firstName || !newUser.lastName || !newUser.role) {
      showAlert('danger', 'الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    const clubRequiredRoles: UserRole[] = ['club_president', 'coach', 'physical_trainer', 'club_general_secretary', 'club_treasurer', 'medical_staff', 'athlete', 'technical_director'];
    const leagueRequiredRoles: UserRole[] = ['league_president', 'league_technical_director', 'general_secretary', 'treasurer'];

    if (clubRequiredRoles.includes(newUser.role as UserRole) && !newUser.clubId) {
      showAlert('danger', 'الرجاء اختيار نادي لهذا الدور');
      return;
    }
    if (leagueRequiredRoles.includes(newUser.role as UserRole) && !newUser.leagueId) {
      showAlert('danger', 'الرجاء اختيار رابطة لهذا الدور');
      return;
    }
    try {
      await UsersService.createUser(newUser as Omit<User, 'id' | 'createdAt' | 'updatedAt'>);
      setShowCreateUserForm(false);
      setNewUser({ username: '', password: '', role: 'athlete', firstName: '', lastName: '', isActive: true, clubId: undefined, leagueId: undefined });
      showAlert('success', `تم إنشاء المستخدم بنجاح!`);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      showAlert('danger', error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء المستخدم');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await UsersService.deleteUser(userId);
        showAlert('info', 'تم حذف المستخدم بنجاح');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('danger', 'تعذر حذف المستخدم');
      }
    }
  };

  const openEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditUser({ ...user });
    setShowEditUser(true);
  };

  const handleSaveUserEdit = async () => {
    if (!editingUserId) return;
    try {
      // Optional: enforce unique username if changed
      const current = users.find(u => u.id === editingUserId);
      if (editUser.username && editUser.username !== current?.username) {
        try {
          if (editUser.role === 'athlete' && editUser.clubId) {
            // للرياضيين: التحقق من التكرار داخل النادي فقط
            const isAvailable = await UsersService.checkClubUsernameAvailability(editUser.clubId, String(editUser.username), editingUserId);
            if (!isAvailable) {
              showAlert('danger', 'اسم المستخدم موجود بالفعل في هذا النادي');
              return;
            }
          } else {
            // للأدوار الأخرى: التحقق العام
            const usernameToCheck = editUser.role === 'athlete' ? String(editUser.username) : editUser.username;
            const existing = await UsersService.getUserByUsername(usernameToCheck);
            if (existing && existing.id !== editingUserId) {
              showAlert('danger', 'اسم المستخدم موجود بالفعل');
              return;
            }
          }
        } catch (e) {
          // proceed if lookup fails, to avoid blocking edits offline
          console.warn('Username uniqueness check failed, proceeding with update');
        }
      }
      const payload: Partial<User> = {
        // للرياضيين: حفظ اسم المستخدم وكلمة السر كـ string دائماً
        username: editUser.role === 'athlete' ? String(editUser.username || current?.username) : (editUser.username || current?.username),
        firstName: editUser.firstName || '',
        lastName: editUser.lastName || '',
        role: editUser.role || 'athlete',
        clubId: editUser.clubId || undefined,
        leagueId: editUser.leagueId || undefined,
        isActive: editUser.isActive ?? true,
        image: editUser.image,
        // Only update password if provided (avoid overwriting with empty)
        // للرياضيين: حفظ كلمة السر كـ string
        ...(editUser.password ? { password: editUser.role === 'athlete' ? String(editUser.password) : editUser.password } : {}),
      } as Partial<User>;
      await UsersService.updateUser(editingUserId, payload);
      showAlert('success', 'تم حفظ تعديلات المستخدم');
      setUsers(prev => prev.map(u => (u.id === editingUserId ? { ...u, ...payload } as User : u)));
      try {
        if (typeof window !== 'undefined') {
          // Update localStorage current_user if this is the logged-in user
          try {
            const cuStr = localStorage.getItem('current_user');
            if (cuStr) {
              const cu = JSON.parse(cuStr);
              if (cu && cu.id === editingUserId) {
                const merged = { ...cu, ...payload };
                localStorage.setItem('current_user', JSON.stringify(merged));
              }
            }
          } catch { }
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: { userId: editingUserId } }));
        }
      } catch { }
      setShowEditUser(false);
      setEditingUserId(null);
    } catch (e) {
      console.error('Failed to update user', e);
      showAlert('danger', 'فشل حفظ تعديلات المستخدم');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      try {
        await UsersService.updateUser(userId, { isActive: !user.isActive });
        showAlert('success', `تم ${!user.isActive ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`);
        fetchUsers();
      } catch (error) {
        console.error('Error toggling user status:', error);
        showAlert('danger', 'فشل تحديث حالة المستخدم');
      }
    }
  };

  const getRoleLabel = (role: UserRole) => {
    const roleLabels: Record<UserRole, string> = {
      'admin': 'مدير النظام', 'league_president': 'رئيس الرابطة', 'league_technical_director': 'المدير التقني للرابطة', 'technical_director': 'المدير الفني',
      'general_secretary': 'الأمين العام', 'treasurer': 'أمين الصندوق', 'club_president': 'رئيس النادي',
      'coach': 'المدرب', 'physical_trainer': 'المدرب البدني', 'club_general_secretary': 'أمين النادي',
      'club_treasurer': 'أمين صندوق النادي', 'medical_staff': 'الطاقم الطبي', 'athlete': 'رياضي'
    };
    return roleLabels[role] || role;
  };

  const getLeagueClubs = () => {
    if (!selectedLeague) return clubs;
    return clubs.filter(club => club.leagueId === selectedLeague);
  };

  const getLeagueName = (leagueId: string) => {
    const league = leagues.find(l => l.id === leagueId);
    return league ? league.nameAr : 'غير محدد';
  };

  // === Handlers for homepage content tabs ===
  const handleLeagueSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLeagueId = e.target.value;
    const selectedLeague = leagues.find(league => league.id === selectedLeagueId);
    if (selectedLeague) {
      setNewFeatured(prev => ({
        ...prev,
        leagueId: selectedLeague.id,
        wilayaId: String(selectedLeague.wilayaId),
        title: selectedLeague.name,
        titleAr: selectedLeague.nameAr,
        description: selectedLeague.description,
        descriptionAr: selectedLeague.descriptionAr
      }));
    }
  };

  const addFeaturedLeague = () => {
    setNewFeatured({
      id: '',
      leagueId: '',
      wilayaId: '',
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      image: '',
      highlight: '',
      highlightAr: '',
      isActive: true,
      createdAt: new Date()
    });
    setEditingFeaturedId(null);
    setShowAddFeatured(true);
  };
  const editFeaturedLeague = (id: string) => {
    const item = featuredLeagues.find(f => f.id === id);
    if (!item) return;
    setNewFeatured(item);
    setEditingFeaturedId(id);
    setShowAddFeatured(true);
  };
  const deleteFeaturedLeague = (id: string) => {
    setFeaturedLeagues(prev => {
      const next = prev.filter(l => l.id !== id);
      HomepageService.saveContent({ heroCarousel: heroImages, featuredLeagues: next, news: newsItems, recentAchievements: achievements })
        .catch(err => console.error('Failed to save featured leagues:', err));
      return next;
    });
    showAlert('info', 'تم حذف الرابطة المميزة.');
  };

  const addNews = () => {
    setNewNews({
      id: '', title: '', titleAr: '', content: '', contentAr: '', author: '', authorAr: '',
      image: '', isPublished: false, isFeatured: false, createdAt: new Date()
    });
    setEditingNewsId(null);
    setShowAddNews(true);
  };
  const editNews = (id: string) => {
    const item = newsItems.find(n => n.id === id);
    if (!item) return;
    setNewNews(item);
    setEditingNewsId(id);
    setShowAddNews(true);
  };
  const deleteNews = (id: string) => {
    setNewsItems(prev => {
      const next = prev.filter(n => n.id !== id);
      HomepageService.saveContent({ heroCarousel: heroImages, featuredLeagues, news: next, recentAchievements: achievements })
        .catch(err => console.error('Failed to save news:', err));
      return next;
    });
    showAlert('info', 'تم حذف الخبر.');
  };

  const addAchievement = () => {
    setNewAchievement({
      id: '', title: '', titleAr: '', description: '', descriptionAr: '',
      athleteName: '', athleteNameAr: '', clubName: '', clubNameAr: '',
      achievementType: 'other', achievementTypeAr: 'أخرى', image: '',
      achievementDate: new Date(), isFeatured: false, isActive: true, createdAt: new Date()
    });
    setEditingAchievementId(null);
    setShowAddAchievement(true);
  };
  const editAchievement = (id: string) => {
    const item = achievements.find(a => a.id === id);
    if (!item) return;
    setNewAchievement(item);
    setEditingAchievementId(id);
    setShowAddAchievement(true);
  };
  const deleteAchievement = (id: string) => {
    setAchievements(prev => {
      const next = prev.filter(a => a.id !== id);
      HomepageService.saveContent({ heroCarousel: heroImages, featuredLeagues, news: newsItems, recentAchievements: next })
        .catch(err => console.error('Failed to save achievements:', err));
      return next;
    });
    showAlert('info', 'تم حذف الإنجاز.');
  };

  // === Handlers for hero carousel images ===
  const addHeroImage = (item: HeroCarouselImage) => {
    setHeroImages(prev => {
      const next = [...prev, item];
      HomepageService.saveContent({ heroCarousel: next, featuredLeagues, news: newsItems, recentAchievements: achievements })
        .catch(err => console.error('Failed to save hero carousel:', err));
      return next;
    });
    showAlert('success', 'تمت إضافة صورة الكاروسيل بنجاح.');
  };

  const deleteHeroImage = (id: string) => {
    setHeroImages(prev => {
      const next = prev.filter(img => img.id !== id);
      HomepageService.saveContent({ heroCarousel: next, featuredLeagues, news: newsItems, recentAchievements: achievements })
        .catch(err => console.error('Failed to save hero carousel:', err));
      return next;
    });
    showAlert('info', 'تم حذف صورة من الكاروسيل.');
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>
          <i className="fas fa-cogs me-2"></i>
          لوحة التحكم
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <Container fluid>
          {alert && (
            <Alert variant={alert.type} className="mb-3">
              {alert.message}
            </Alert>
          )}
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'clubs')} className="mb-4">
            <Tab eventKey="hero" title="صور الكاروسيل">
              <HeroCarouselTab
                images={heroImages}
                onAdd={addHeroImage}
                onDelete={deleteHeroImage}
              />
            </Tab>

            <Tab eventKey="competition_participations" title="مشاركات البطولات">
              <CompetitionParticipationsTab />
            </Tab>

            {/* تم تعطيل تبويب إدارة المنافسات مؤقتاً */}
            <Tab eventKey="league_president" title="رئيس الرابطة">
              <LeaguePresidentTab />
            </Tab>
            <Tab eventKey="clubs" title="إدارة النوادي">
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>تصفية حسب الرابطة</Form.Label>
                    <Form.Select
                      value={selectedLeague}
                      onChange={(e) => setSelectedLeague(e.target.value)}
                    >
                      <option value="">جميع الرابطات</option>
                      {leagues.map(league => (
                        <option key={league.id} value={league.id}>
                          {league.nameAr} ({league.wilayaNameAr})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Button
                    variant="success"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="w-100"
                  >
                    <i className="fas fa-plus me-2"></i>
                    إضافة نادي جديد
                  </Button>
                </Col>
              </Row>

              {showCreateForm && (
                <Card className="mb-4">
                  <Card.Header className="bg-success text-white">
                    <h5 className="mb-0">إضافة نادي جديد</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>الرابطة *</Form.Label>
                          <Form.Select
                            value={newClub.leagueId}
                            onChange={(e) => setNewClub({ ...newClub, leagueId: e.target.value })}
                            required
                          >
                            <option value="">اختر الرابطة...</option>
                            {leagues.map(league => (
                              <option key={league.id} value={league.id}>
                                {league.nameAr} ({league.wilayaNameAr})
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>اسم النادي (عربي) *</Form.Label>
                          <Form.Control
                            value={newClub.nameAr}
                            onChange={(e) => setNewClub({ ...newClub, nameAr: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>اسم النادي (إنجليزي) *</Form.Label>
                          <Form.Control
                            value={newClub.name}
                            onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Button variant="success" onClick={handleCreateClub} className="me-2">
                          إنشاء النادي
                        </Button>
                        <Button variant="secondary" onClick={() => setShowCreateForm(false)}>
                          إلغاء
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    النوادي المسجلة ({getLeagueClubs().length})
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive striped hover>
                    <thead className="table-dark">
                      <tr>
                        <th>المعرف</th>
                        <th>اسم النادي</th>
                        <th>الرابطة</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getLeagueClubs().map(club => (
                        <tr key={club.id}>
                          <td><code>{club.id}</code></td>
                          <td>{club.nameAr}</td>
                          <td>{getLeagueName(club.leagueId)}</td>
                          <td>
                            <Badge bg={club.isActive ? 'success' : 'secondary'}>
                              {club.isActive ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => openEditClub(club)}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClub(club.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* Edit Club Modal */}
              <Modal show={showEditClub} onHide={() => setShowEditClub(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>تعديل بيانات النادي</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    {/* حقول النادي */}
                    <Form.Group className="mb-3">
                      <Form.Label>اسم النادي (عربي)</Form.Label>
                      <Form.Control
                        value={editClub.nameAr || ''}
                        onChange={(e) => setEditClub(prev => ({ ...prev, nameAr: e.target.value }))}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>اسم النادي (إنجليزي)</Form.Label>
                      <Form.Control
                        value={editClub.name || ''}
                        onChange={(e) => setEditClub(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>الوصف (عربي)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editClub.descriptionAr || ''}
                        onChange={(e) => setEditClub(prev => ({ ...prev, descriptionAr: e.target.value }))}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>الوصف (إنجليزي)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editClub.description || ''}
                        onChange={(e) => setEditClub(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </Form.Group>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Check
                          type="switch"
                          label="نشط"
                          checked={!!editClub.isActive}
                          onChange={(e) => setEditClub(prev => ({ ...prev, isActive: e.currentTarget.checked }))}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Check
                          type="switch"
                          label="مميز"
                          checked={!!editClub.isFeatured}
                          onChange={(e) => setEditClub(prev => ({ ...prev, isFeatured: e.currentTarget.checked }))}
                        />
                      </Col>
                    </Row>
                    <Form.Group>
                      <Form.Label>صورة النادي</Form.Label>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Button
                          variant="secondary"
                          onClick={() => clubEditFileInputRef.current?.click()}
                          disabled={clubImageUploading}
                        >
                          اختر صورة من المعرض
                        </Button>
                        {clubImageUploading && <span className="text-muted">...جاري الرفع</span>}
                      </div>
                      {editClub.image && (
                        <div className="mb-2">
                          <img src={editClub.image} alt="club" style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }} />
                        </div>
                      )}
                      <input
                        ref={clubEditFileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (!file) return;
                          await handleClubImageUpload(file);
                          if (clubEditFileInputRef.current) clubEditFileInputRef.current.value = '';
                        }}
                      />
                    </Form.Group>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowEditClub(false)}>إلغاء</Button>
                  <Button variant="primary" onClick={handleSaveClubEdit}>حفظ</Button>
                </Modal.Footer>
              </Modal>
            </Tab>

            <Tab eventKey="users" title="إدارة المستخدمين">
              <Row className="mb-3">
                <Col md={6}>
                  <Button
                    variant="success"
                    onClick={() => setShowCreateUserForm(!showCreateUserForm)}
                    className="w-100"
                  >
                    <i className="fas fa-user-plus me-2"></i>
                    إضافة مستخدم جديد
                  </Button>
                </Col>
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Body>
                      <h2 className="text-primary">{users.length}</h2>
                      <p>إجمالي المستخدمين</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {showCreateUserForm && (
                <Card className="mb-4">
                  <Card.Header className="bg-success text-white">
                    <h5 className="mb-0">إضافة مستخدم جديد</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>اسم المستخدم *</Form.Label>
                          <Form.Control
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>كلمة المرور *</Form.Label>
                          <Form.Control
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>الاسم الأول *</Form.Label>
                          <Form.Control
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>الاسم الأخير *</Form.Label>
                          <Form.Control
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>الدور *</Form.Label>
                          <Form.Select
                            value={newUser.role}
                            onChange={(e) => {
                              const newRole = e.target.value as UserRole;
                              // مسح clubId و leagueId عند تغيير الدور
                              setNewUser({ ...newUser, role: newRole, clubId: undefined, leagueId: undefined });
                            }}
                            required
                          >
                            <option value="admin">مدير النظام</option>
                            <option value="league_president">رئيس الرابطة</option>
                            <option value="league_technical_director">المدير التقني للرابطة</option>
                            <option value="technical_director">المدير التقني للنادي</option>
                            <option value="general_secretary">الأمين العام للرابطة</option>
                            <option value="treasurer">أمين المال للرابطة</option>
                            <option value="club_president">رئيس النادي</option>
                            <option value="coach">المدرب</option>
                            <option value="physical_trainer">المحضر البدني</option>
                            <option value="club_general_secretary">أمين العام للنادي</option>
                            <option value="club_treasurer">أمين المال للنادي</option>
                            <option value="medical_staff">الطاقم الطبي</option>
                            <option value="athlete">رياضي</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        {/* حقل الرابطة للأدوار المتعلقة بالرابطة */}
                        {['league_president', 'league_technical_director', 'general_secretary', 'treasurer'].includes(newUser.role || '') ? (
                          <Form.Group className="mb-3">
                            <Form.Label>الرابطة *</Form.Label>
                            <Form.Select
                              value={newUser.leagueId || ''}
                              onChange={(e) => setNewUser({ ...newUser, leagueId: e.target.value || undefined, clubId: undefined })}
                              required
                            >
                              <option value="">-- اختر الرابطة --</option>
                              {leagues.map(league => (
                                <option key={league.id} value={league.id}>{league.nameAr} ({league.wilayaNameAr})</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        ) : (
                          <Form.Group className="mb-3">
                            <Form.Label>النادي</Form.Label>
                            <Form.Select
                              value={newUser.clubId || ''}
                              onChange={(e) => setNewUser({ ...newUser, clubId: e.target.value || undefined, leagueId: undefined })}
                            >
                              <option value="">-- اختر النادي --</option>
                              {leagues.map(league => {
                                const leagueClubs = clubs.filter(c => String(c.leagueId) === String(league.id) || String(c.leagueId) === String(league.wilayaId));
                                if (leagueClubs.length === 0) return null;
                                return (
                                  <optgroup key={league.id} label={`${league.nameAr} (${league.wilayaNameAr})`}>
                                    {leagueClubs.map(club => (
                                      <option key={club.id} value={club.id}>{club.nameAr}</option>
                                    ))}
                                  </optgroup>
                                );
                              })}
                            </Form.Select>
                          </Form.Group>
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Button variant="success" onClick={handleCreateUser} className="me-2">
                          إنشاء المستخدم
                        </Button>
                        <Button variant="secondary" onClick={() => setShowCreateUserForm(false)}>
                          إلغاء
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    المستخدمون المسجلون ({users.length})
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive striped hover>
                    <thead className="table-dark">
                      <tr>
                        <th>اسم المستخدم</th>
                        <th>الاسم الكامل</th>
                        <th>الدور</th>
                        <th>النادي/الرابطة</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => {
                        const userClub = user.clubId ? clubs.find(club => club.id === user.clubId) : null;
                        const userLeague = user.leagueId ? leagues.find(league => league.id === user.leagueId) : null;
                        return (
                          <tr key={user.id}>
                            <td><code>{user.username}</code></td>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{getRoleLabel(user.role)}</td>
                            <td>{userClub ? userClub.nameAr : (userLeague ? userLeague.nameAr : '--')}</td>
                            <td>
                              <Badge bg={user.isActive ? 'success' : 'secondary'}>
                                {user.isActive ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => openEditUser(user)}
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button
                                  variant={user.isActive ? 'warning' : 'success'}
                                  size="sm"
                                  onClick={() => handleToggleUserStatus(user.id)}
                                >
                                  <i className={`fas fa-${user.isActive ? 'ban' : 'check'}`}></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* Edit User Modal */}
              <Modal show={showEditUser} onHide={() => setShowEditUser(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>تعديل المستخدم</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    {/* User avatar uploader */}
                    <div className="mb-3">
                      <Form.Label>الصورة الشخصية</Form.Label>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={editUser.image || '/images/default-avatar.jpg'}
                          alt="avatar"
                          style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div className="d-flex gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => userEditFileInputRef.current?.click()}
                            disabled={userImageUploading}
                          >
                            اختر صورة
                          </Button>
                          {userImageUploading && <span className="text-muted">...جاري الرفع</span>}
                        </div>
                        <input
                          ref={userEditFileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) return;
                            setUserImageUploading(true);
                            try {
                              const res = await uploadToCloudinary(file, { folder: `users/${editingUserId || 'general'}` });
                              setEditUser(prev => ({ ...prev, image: res.secure_url }));
                              showAlert('success', 'تم رفع الصورة الشخصية بنجاح');
                            } catch (err) {
                              console.error('Upload avatar failed', err);
                              showAlert('danger', 'فشل رفع الصورة الشخصية');
                            } finally {
                              setUserImageUploading(false);
                              if (userEditFileInputRef.current) userEditFileInputRef.current.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>اسم المستخدم</Form.Label>
                          <Form.Control
                            value={editUser.username || ''}
                            onChange={(e) => setEditUser(prev => ({ ...prev, username: e.target.value }))}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>كلمة المرور</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="اتركها فارغة للإبقاء على الحالية"
                            value={editUser.password || ''}
                            onChange={(e) => setEditUser(prev => ({ ...prev, password: e.target.value }))}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>الاسم الأول</Form.Label>
                          <Form.Control
                            value={editUser.firstName || ''}
                            onChange={(e) => setEditUser(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>الاسم الأخير</Form.Label>
                          <Form.Control
                            value={editUser.lastName || ''}
                            onChange={(e) => setEditUser(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>الدور</Form.Label>
                          <Form.Select
                            value={editUser.role || 'athlete'}
                            onChange={(e) => setEditUser(prev => ({ ...prev, role: e.target.value as any, clubId: undefined, leagueId: undefined }))}
                          >
                            <option value="admin">مدير النظام</option>
                            <option value="league_president">رئيس الرابطة</option>
                            <option value="league_technical_director">المدير التقني للرابطة</option>
                            <option value="technical_director">المدير التقني</option>
                            <option value="general_secretary">الأمين العام</option>
                            <option value="treasurer">أمين الصندوق</option>
                            <option value="club_president">رئيس النادي</option>
                            <option value="coach">المدرب</option>
                            <option value="physical_trainer">المدرب البدني</option>
                            <option value="club_general_secretary">أمين النادي</option>
                            <option value="club_treasurer">أمين صندوق النادي</option>
                            <option value="medical_staff">الطاقم الطبي</option>
                            <option value="athlete">رياضي</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        {/* حقل الرابطة للأدوار المتعلقة بالرابطة */}
                        {['league_president', 'league_technical_director', 'general_secretary', 'treasurer'].includes(editUser.role || '') ? (
                          <Form.Group className="mb-3">
                            <Form.Label>الرابطة</Form.Label>
                            <Form.Select
                              value={editUser.leagueId || ''}
                              onChange={(e) => setEditUser(prev => ({ ...prev, leagueId: e.target.value || undefined, clubId: undefined }))}
                            >
                              <option value="">-- اختر الرابطة --</option>
                              {leagues.map(league => (
                                <option key={league.id} value={league.id}>{league.nameAr} ({league.wilayaNameAr})</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        ) : (
                          <Form.Group className="mb-3">
                            <Form.Label>النادي</Form.Label>
                            <Form.Select
                              value={editUser.clubId || ''}
                              onChange={(e) => setEditUser(prev => ({ ...prev, clubId: e.target.value || undefined, leagueId: undefined }))}
                            >
                              <option value="">-- اختر النادي --</option>
                              {leagues.map(league => {
                                const leagueClubs = clubs.filter(c => String(c.leagueId) === String(league.id) || String(c.leagueId) === String(league.wilayaId));
                                if (leagueClubs.length === 0) return null;
                                return (
                                  <optgroup key={league.id} label={`${league.nameAr} (${league.wilayaNameAr})`}>
                                    {leagueClubs.map(club => (
                                      <option key={club.id} value={club.id}>{club.nameAr}</option>
                                    ))}
                                  </optgroup>
                                );
                              })}
                            </Form.Select>
                          </Form.Group>
                        )}
                      </Col>
                    </Row>
                    <Form.Check
                      type="switch"
                      label="نشط"
                      checked={!!editUser.isActive}
                      onChange={(e) => setEditUser(prev => ({ ...prev, isActive: e.currentTarget.checked }))}
                    />
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowEditUser(false)}>إلغاء</Button>
                  <Button variant="primary" onClick={handleSaveUserEdit}>حفظ</Button>
                </Modal.Footer>
              </Modal>
            </Tab>

            <Tab eventKey="featured" title="الرابطات المميزة">
              <FeaturedLeaguesTab
                leagues={featuredLeagues}
                onAdd={addFeaturedLeague}
                onEdit={editFeaturedLeague}
                onDelete={deleteFeaturedLeague}
              />
            </Tab>

            <Tab eventKey="news" title="الأخبار">
              <NewsTab
                news={newsItems}
                onAdd={addNews}
                onEdit={editNews}
                onDelete={deleteNews}
              />
            </Tab>

            <Tab eventKey="achievements" title="الإنجازات الحديثة">
              <RecentAchievementsTab
                achievements={achievements}
                onAdd={addAchievement}
                onEdit={editAchievement}
                onDelete={deleteAchievement}
              />
            </Tab>

            <Tab eventKey="league-home" title="الرئيسية - الرابطة">
              <LeagueHomepageTab />
            </Tab>

            <Tab eventKey="club-home" title="الرئيسية - النادي">
              <ClubHomepageTab />
            </Tab>

            <Tab eventKey="competitions" title="إدارة البطولات">
              <CompetitionsTab />
            </Tab>

            <Tab eventKey="technical-card" title="البطاقة الفنية للمدرب">
              <div className="text-center p-5">
                <i className="fas fa-clipboard-list fa-4x text-primary mb-4"></i>
                <h4 className="mb-3">البطاقة الفنية للمدرب</h4>
                <p className="text-muted mb-4">
                  للحصول على تجربة أفضل، يمكنك فتح البطاقة الفنية في صفحة مستقلة بحجم كامل
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    window.open('/admin/technical-card', '_blank');
                  }}
                >
                  <i className="fas fa-external-link-alt me-2"></i>
                  فتح البطاقة الفنية في صفحة جديدة
                </Button>
              </div>
            </Tab>
          </Tabs>
        </Container>
      </Modal.Body>
      {/* Add Featured League Modal */}
      <Modal show={showAddFeatured} onHide={() => { setShowAddFeatured(false); setEditingFeaturedId(null); }}>
        <Modal.Header closeButton>
          <Modal.Title>إضافة رابطة مميزة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>اختر الرابطة</Form.Label>
                  <Form.Select
                    value={newFeatured.leagueId || ''}
                    onChange={handleLeagueSelect}
                    className="mb-3"
                  >
                    <option value="">-- اختر الرابطة --</option>
                    {leagues.map(league => (
                      <option key={league.id} value={league.id}>
                        {league.nameAr} - {league.wilayaNameAr} (ID: {league.wilayaId})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>معرف الرابطة</Form.Label>
                  <Form.Control
                    value={newFeatured.leagueId || ''}
                    onChange={(e) => setNewFeatured({ ...newFeatured, leagueId: e.target.value })}
                    required
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>معرف الولاية</Form.Label>
                  <Form.Control
                    value={newFeatured.wilayaId || ''}
                    onChange={(e) => setNewFeatured({ ...newFeatured, wilayaId: e.target.value })}
                    required
                  />
                  <Form.Text className="text-muted">سيتم تعبئته تلقائياً عند اختيار الرابطة</Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>العنوان (عربي)</Form.Label>
              <Form.Control value={newFeatured.titleAr || ''} onChange={(e) => setNewFeatured({ ...newFeatured, titleAr: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>العنوان (إنجليزي)</Form.Label>
              <Form.Control value={newFeatured.title || ''} onChange={(e) => setNewFeatured({ ...newFeatured, title: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الوصف (عربي)</Form.Label>
              <Form.Control as="textarea" rows={3} value={newFeatured.descriptionAr || ''} onChange={(e) => setNewFeatured({ ...newFeatured, descriptionAr: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الوصف (إنجليزي)</Form.Label>
              <Form.Control as="textarea" rows={3} value={newFeatured.description || ''} onChange={(e) => setNewFeatured({ ...newFeatured, description: e.target.value })} />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>تمييز (عربي)</Form.Label>
                  <Form.Control value={newFeatured.highlightAr || ''} onChange={(e) => setNewFeatured({ ...newFeatured, highlightAr: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Highlight (EN)</Form.Label>
                  <Form.Control value={newFeatured.highlight || ''} onChange={(e) => setNewFeatured({ ...newFeatured, highlight: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>صورة</Form.Label>
              <div className="d-flex gap-2 align-items-center mb-2">
                <Button variant="secondary" onClick={() => featuredFileInputRef.current?.click()} disabled={featuredUploading}>
                  <i className="fas fa-image me-2"></i>
                  اختر صورة من المعرض
                </Button>
                {featuredUploading && <span className="text-muted">...جاري الرفع</span>}
              </div>
              <input
                ref={featuredFileInputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) await handleFeaturedImageUpload(file);
                }}
                style={{ display: 'none' }}
              />
              <Form.Text className="text-muted">يمكنك أيضاً لصق رابط صورة مباشرة:</Form.Text>
              <Form.Control className="mt-2" placeholder="https://..." value={newFeatured.image || ''} onChange={(e) => setNewFeatured({ ...newFeatured, image: e.target.value })} />
              {newFeatured.image ? (
                <div className="mt-2"><img src={newFeatured.image} alt="preview" style={{ maxWidth: '100%', height: 'auto' }} /></div>
              ) : null}
            </Form.Group>
            <Form.Check type="switch" label="نشط" checked={!!newFeatured.isActive} onChange={(e) => setNewFeatured({ ...newFeatured, isActive: e.currentTarget.checked })} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowAddFeatured(false); setEditingFeaturedId(null); }}>إلغاء</Button>
          <Button variant="primary" disabled={featuredUploading} onClick={async () => {
            if (!newFeatured.wilayaId) {
              window.alert('الرجاء إدخال معرف الولاية');
              return;
            }
            const item: FeaturedLeague = {
              id: newFeatured.id || editingFeaturedId || `fl_${Date.now()}`,
              leagueId: newFeatured.leagueId || '',
              wilayaId: newFeatured.wilayaId || '',
              title: newFeatured.title || '',
              titleAr: newFeatured.titleAr || '',
              description: newFeatured.description || '',
              descriptionAr: newFeatured.descriptionAr || '',
              image: newFeatured.image || '',
              highlight: newFeatured.highlight || '',
              highlightAr: newFeatured.highlightAr || '',
              isActive: Boolean(newFeatured.isActive),
              createdAt: newFeatured.createdAt || new Date()
            };
            const next = editingFeaturedId
              ? featuredLeagues.map(f => (f.id === editingFeaturedId ? item : f))
              : [...featuredLeagues, item];
            setFeaturedLeagues(next);
            await HomepageService.saveContent({ heroCarousel: heroImages, featuredLeagues: next, news: newsItems, recentAchievements: achievements });
            setShowAddFeatured(false);
            setEditingFeaturedId(null);
          }}>حفظ</Button>
        </Modal.Footer>
      </Modal>

      {/* Add News Modal */}
      <Modal show={showAddNews} onHide={() => { setShowAddNews(false); setEditingNewsId(null); }}>
        <Modal.Header closeButton>
          <Modal.Title>إضافة خبر جديد</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>العنوان (عربي)</Form.Label>
              <Form.Control value={newNews.titleAr || ''} onChange={(e) => setNewNews({ ...newNews, titleAr: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>العنوان (إنجليزي)</Form.Label>
              <Form.Control value={newNews.title || ''} onChange={(e) => setNewNews({ ...newNews, title: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>المحتوى (عربي)</Form.Label>
              <Form.Control as="textarea" rows={4} value={newNews.contentAr || ''} onChange={(e) => setNewNews({ ...newNews, contentAr: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>المحتوى (إنجليزي)</Form.Label>
              <Form.Control as="textarea" rows={4} value={newNews.content || ''} onChange={(e) => setNewNews({ ...newNews, content: e.target.value })} />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الكاتب (عربي)</Form.Label>
                  <Form.Control value={newNews.authorAr || ''} onChange={(e) => setNewNews({ ...newNews, authorAr: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Author (EN)</Form.Label>
                  <Form.Control value={newNews.author || ''} onChange={(e) => setNewNews({ ...newNews, author: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>صورة</Form.Label>
              <div className="d-flex gap-2 align-items-center mb-2">
                <Button variant="secondary" onClick={() => newsFileInputRef.current?.click()} disabled={newsUploading}>
                  <i className="fas fa-image me-2"></i>
                  اختر صورة من المعرض
                </Button>
                {newsUploading && <span className="text-muted">...جاري الرفع</span>}
              </div>
              <input
                ref={newsFileInputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) await handleNewsImageUpload(file);
                }}
                style={{ display: 'none' }}
              />
              <Form.Text className="text-muted">يمكنك أيضاً لصق رابط صورة مباشرة:</Form.Text>
              <Form.Control className="mt-2" placeholder="https://..." value={newNews.image || ''} onChange={(e) => setNewNews({ ...newNews, image: e.target.value })} />
              {newNews.image ? (
                <div className="mt-2"><img src={newNews.image} alt="preview" style={{ maxWidth: '100%', height: 'auto' }} /></div>
              ) : null}
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Check type="switch" label="منشور" checked={!!newNews.isPublished} onChange={(e) => setNewNews({ ...newNews, isPublished: e.currentTarget.checked })} />
              </Col>
              <Col md={6}>
                <Form.Check type="switch" label="مميز" checked={!!newNews.isFeatured} onChange={(e) => setNewNews({ ...newNews, isFeatured: e.currentTarget.checked })} />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowAddNews(false); setEditingNewsId(null); }}>إلغاء</Button>
          <Button variant="primary" disabled={newsUploading} onClick={async () => {
            const item: News = {
              id: newNews.id || editingNewsId || `news_${Date.now()}`,
              title: newNews.title || '',
              titleAr: newNews.titleAr || '',
              content: newNews.content || '',
              contentAr: newNews.contentAr || '',
              excerpt: newNews.excerpt,
              excerptAr: newNews.excerptAr,
              image: newNews.image,
              author: newNews.author || '',
              authorAr: newNews.authorAr || '',
              sportId: newNews.sportId,
              leagueId: newNews.leagueId,
              clubId: newNews.clubId,
              isPublished: Boolean(newNews.isPublished),
              isFeatured: Boolean(newNews.isFeatured),
              publishedAt: newNews.publishedAt,
              createdAt: newNews.createdAt || new Date(),
            };
            const next = editingNewsId
              ? newsItems.map(n => (n.id === editingNewsId ? item : n))
              : [...newsItems, item];
            setNewsItems(next);
            await HomepageService.saveContent({ heroCarousel: heroImages, featuredLeagues, news: next, recentAchievements: achievements });
            setShowAddNews(false);
            setEditingNewsId(null);
          }}>حفظ</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Achievement Modal */}
      <Modal show={showAddAchievement} onHide={() => { setShowAddAchievement(false); setEditingAchievementId(null); }}>
        <Modal.Header closeButton>
          <Modal.Title>إضافة إنجاز جديد</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>العنوان (عربي)</Form.Label>
                  <Form.Control value={newAchievement.titleAr || ''} onChange={(e) => setNewAchievement({ ...newAchievement, titleAr: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>العنوان (إنجليزي)</Form.Label>
                  <Form.Control value={newAchievement.title || ''} onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>الوصف (عربي)</Form.Label>
              <Form.Control as="textarea" rows={3} value={newAchievement.descriptionAr || ''} onChange={(e) => setNewAchievement({ ...newAchievement, descriptionAr: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الوصف (إنجليزي)</Form.Label>
              <Form.Control as="textarea" rows={3} value={newAchievement.description || ''} onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })} />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم الرياضي (عربي)</Form.Label>
                  <Form.Control value={newAchievement.athleteNameAr || ''} onChange={(e) => setNewAchievement({ ...newAchievement, athleteNameAr: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Athlete (EN)</Form.Label>
                  <Form.Control value={newAchievement.athleteName || ''} onChange={(e) => setNewAchievement({ ...newAchievement, athleteName: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>اسم النادي (عربي) - اختياري</Form.Label>
              <Form.Control value={newAchievement.clubNameAr || ''} onChange={(e) => setNewAchievement({ ...newAchievement, clubNameAr: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>نوع الإنجاز (عربي)</Form.Label>
              <Form.Control value={newAchievement.achievementTypeAr || ''} onChange={(e) => setNewAchievement({ ...newAchievement, achievementTypeAr: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>تاريخ الإنجاز</Form.Label>
              <Form.Control type="date" value={toDateInputValue(newAchievement.achievementDate)} onChange={(e) => setNewAchievement({ ...newAchievement, achievementDate: new Date(e.target.value) })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>صورة</Form.Label>
              <div className="d-flex gap-2 align-items-center mb-2">
                <Button variant="secondary" onClick={() => achievementFileInputRef.current?.click()} disabled={achievementUploading}>
                  <i className="fas fa-image me-2"></i>
                  اختر صورة من المعرض
                </Button>
                {achievementUploading && <span className="text-muted">...جاري الرفع</span>}
              </div>
              <input
                ref={achievementFileInputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) await handleAchievementImageUpload(file);
                }}
                style={{ display: 'none' }}
              />
              <Form.Text className="text-muted">يمكنك أيضاً لصق رابط صورة مباشرة:</Form.Text>
              <Form.Control className="mt-2" placeholder="https://..." value={newAchievement.image || ''} onChange={(e) => setNewAchievement({ ...newAchievement, image: e.target.value })} />
              {newAchievement.image ? (
                <div className="mt-2"><img src={newAchievement.image} alt="preview" style={{ maxWidth: '100%', height: 'auto' }} /></div>
              ) : null}
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Check type="switch" label="مميز" checked={!!newAchievement.isFeatured} onChange={(e) => setNewAchievement({ ...newAchievement, isFeatured: e.currentTarget.checked })} />
              </Col>
              <Col md={6}>
                <Form.Check type="switch" label="نشط" checked={!!newAchievement.isActive} onChange={(e) => setNewAchievement({ ...newAchievement, isActive: e.currentTarget.checked })} />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowAddAchievement(false); setEditingAchievementId(null); }}>إلغاء</Button>
          <Button variant="primary" disabled={achievementUploading} onClick={async () => {
            const item: RecentAchievement = {
              id: newAchievement.id || editingAchievementId || `ach_${Date.now()}`,
              title: newAchievement.title || '',
              titleAr: newAchievement.titleAr || '',
              description: newAchievement.description || '',
              descriptionAr: newAchievement.descriptionAr || '',
              athleteName: newAchievement.athleteName || '',
              athleteNameAr: newAchievement.athleteNameAr || '',
              clubName: newAchievement.clubName,
              clubNameAr: newAchievement.clubNameAr,
              leagueName: newAchievement.leagueName,
              leagueNameAr: newAchievement.leagueNameAr,
              achievementType: newAchievement.achievementType || 'other',
              achievementTypeAr: newAchievement.achievementTypeAr || 'أخرى',
              image: newAchievement.image,
              achievementDate: newAchievement.achievementDate || new Date(),
              isFeatured: Boolean(newAchievement.isFeatured),
              isActive: Boolean(newAchievement.isActive),
              createdAt: newAchievement.createdAt || new Date(),
            };
            const next = editingAchievementId
              ? achievements.map(a => (a.id === editingAchievementId ? item : a))
              : [...achievements, item];
            setAchievements(next);
            await HomepageService.saveContent({ heroCarousel: heroImages, featuredLeagues, news: newsItems, recentAchievements: next });
            setShowAddAchievement(false);
            setEditingAchievementId(null);
          }}>حفظ</Button>
        </Modal.Footer>
      </Modal>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {
          onHide();
          // Dispatch event to notify parent that admin dashboard is closed
          window.dispatchEvent(new Event('adminDashboardClosed'));
        }}>إغلاق</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DynamicAdminDashboard;
