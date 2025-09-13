import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Nav, Tab, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import BasicInfoSection from '../../components/admin/club/BasicInfoSection';
import StaffManagementSection from '../../components/admin/club/StaffManagementSection';
import SectionsManagementSection from '../../components/admin/club/SectionsManagementSection';
import { ClubsService, UsersService } from '../../services/firestoreService';

import type { Staff, Athlete, User } from '../../types';
import type { DetailedStaff } from '../../types/clubManagement';

const ComprehensiveClubDashboard: React.FC = () => {
  const [clubData, setClubData] = useState<any>({
    name: '',
    nameAr: '',
    leagueId: '',
    description: '',
    descriptionAr: '',
    address: '',
    addressAr: '',
    phone: '',
    email: '',
    website: '',
    image: '',
    isActive: true,
    isFeatured: false,
    keywords: '',
    notes: '',
    staff: [],
    sections: [],
    statistics: {
      totalMembers: 0,
      totalAthletes: 0,
      totalStaff: 0,
      totalAchievements: 0
    }
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [realtimeData, setRealtimeData] = useState({
    staff: [] as Staff[],
    athletes: [] as Athlete[],
    isRealTimeActive: false
  });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const { clubId } = useParams<{ clubId: string }>();

  const tabs = [
    { key: 'basic', label: 'المعلومات الأساسية', icon: '🏢' },
    { key: 'staff', label: 'الطاقم', icon: '👥' },
    { key: 'sections', label: 'الأقسام', icon: '📄' },
    { key: 'cards', label: 'البطاقات', icon: '🖼️' },
    { key: 'tabs', label: 'التبويبات', icon: '📅' },
    { key: 'athletes', label: 'الرياضيون', icon: '🏃' },
    { key: 'achievements', label: 'الإنجازات', icon: '🏆' }
  ];

  const updateBasicInfo = (data: any) => {
    setClubData((prev: any) => ({ ...prev, ...data }));
  };

  const handleSaveStaff = async (staffMember: DetailedStaff) => {
    if (!clubId) {
      setError("لا يمكن إضافة موظف بدون معرف النادي.");
      return;
    }

    setSaving(true);
    try {
      // This is a simplified mapping. In a real app, you'd have a more robust
      // way to generate usernames and handle passwords securely.
      const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        username: `${staffMember.firstName.toLowerCase()}.${staffMember.lastName.toLowerCase()}`.replace(/ /g, ''),
        password: 'password123', // WARNING: Insecure default password
        role: staffMember.position as any, // Assuming position is a valid UserRole
        firstName: staffMember.firstName,
        lastName: staffMember.lastName,
        email: staffMember.email,
        phone: staffMember.phone,
        clubId: clubId,
        isActive: staffMember.isActive,
      };

      if (staffMember.id && !staffMember.id.includes('new-')) { // Check if it's a real ID
        // Update existing user
        await UsersService.updateUser(staffMember.id, userData);
        setSuccess('تم تحديث بيانات الموظف بنجاح!');
      } else {
        // Create new user
        const newUserId = await UsersService.createUser(userData);
        setSuccess(`تم إنشاء الموظف بنجاح! ID: ${newUserId}`);
      }
      
      // Refresh staff data from Firestore
      loadClubData();

    } catch (err: any) {
      console.error('Error saving staff:', err);
      setError(err.message || 'حدث خطأ أثناء حفظ الموظف.');
    } finally {
      setSaving(false);
    }
  };

  const updateSections = (sections: any[]) => {
    setClubData((prev: any) => ({ ...prev, sections }));
  };

  // حساب الإحصائيات الديناميكية
  const calculateDynamicStats = useCallback(() => {
    if (!clubId) return;

    const totalStaff = realtimeData.staff.length || clubData.staff?.length || 0;
    const totalAthletes = realtimeData.athletes.length || 0;
    const totalMembers = totalStaff + totalAthletes;
    const totalAchievements = clubData.achievements?.length || 0;

    const newStats = {
      totalMembers,
      totalAthletes,
      totalStaff,
      totalAchievements
    };

    setClubData((prev: any) => ({
      ...prev,
      statistics: newStats
    }));
  }, [clubId, realtimeData, clubData.staff, clubData.achievements]);

  // تفعيل التحديثات الفورية
  const enableRealTimeUpdates = useCallback(() => {
    if (!clubId) return;

    setConnectionStatus('connecting');
    setRealtimeData(prev => ({ ...prev, isRealTimeActive: true }));

    // الاشتراك في تحديثات الطاقم
    // TODO: Need a Firestore subscription service for users/staff
    const unsubscribeStaff = () => {};

    // الاشتراك في تحديثات الرياضيين
    // TODO: Need a Firestore subscription service for athletes
    const unsubscribeAthletes = () => {};

    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      unsubscribeStaff();
      unsubscribeAthletes();
      setConnectionStatus('disconnected');
      setRealtimeData(prev => ({ ...prev, isRealTimeActive: false }));
    };
  }, [clubId]);

  // إيقاف التحديثات الفورية
  const disableRealTimeUpdates = useCallback(() => {
    setRealtimeData(prev => ({ ...prev, isRealTimeActive: false }));
    setConnectionStatus('disconnected');
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const clubDataToSave = {
        ...clubData,
        updatedAt: new Date()
      };

      if (clubId) {
        // Update existing club
        await ClubsService.updateClub(clubId, clubDataToSave);
        setSuccess('تم تحديث النادي بنجاح!');
      } else {
        // Create new club
        // This part of the logic is for creating a club, which is not the main focus.
        // Assuming it should use the ClubsService as well.
        const newClubId = await ClubsService.createClub(clubDataToSave);
        setSuccess('تم إنشاء النادي بنجاح!');
        
        // Redirect to edit mode
        if (window.location.pathname === '/admin/club/dashboard') {
          window.history.replaceState(null, '', `/admin/club/dashboard/${newClubId}`);
        }
      }
    } catch (err) {
      console.error('Error saving club:', err);
      setError('حدث خطأ أثناء حفظ النادي. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  // Load club data if clubId exists
  useEffect(() => {
    if (clubId) {
      loadClubData();
    }
  }, [clubId]);

  const loadClubData = async () => {
    if (!clubId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const club = await ClubsService.getClubById(clubId);
      if (club) {
        setClubData(club);
      }
    } catch (err) {
      console.error('Error loading club:', err);
      setError('حدث خطأ أثناء تحميل بيانات النادي.');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicInfoSection data={clubData} onUpdate={updateBasicInfo} />;
      case 'staff':
        return <StaffManagementSection staff={clubData.staff || []} onSaveStaff={handleSaveStaff} clubId={clubId} />;
      case 'sections':
        return <SectionsManagementSection sections={clubData.sections || []} onUpdate={updateSections} />;
      case 'cards':
        return <div className="text-center p-5">قسم البطاقات قيد التطوير</div>;
      case 'tabs':
        return <div className="text-center p-5">قسم التبويبات قيد التطوير</div>;
      case 'athletes':
        return <div className="text-center p-5">قسم الرياضيين قيد التطوير</div>;
      case 'achievements':
        return <div className="text-center p-5">قسم الإنجازات قيد التطوير</div>;
      default:
        return <div>اختر قسماً لإدارته</div>;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col lg={12}>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
          
          <Card>
            <Card.Header className="bg-primary text-white">
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0">
                    {clubId ? 'تعديل النادي' : 'إنشاء نادي جديد'}
                  </h4>
                </Col>
                <Col md="auto">
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-1"
                        />
                        جاري الحفظ...
                      </>
                    ) : (
                      clubId ? 'تحديث النادي' : 'إنشاء النادي'
                    )}
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'basic')}>
                <Row>
                  <Col md={3}>
                    <Nav variant="pills" className="flex-column">
                      {tabs.map((tab) => (
                        <Nav.Item key={tab.key}>
                          <Nav.Link eventKey={tab.key} className="text-end">
                            <div className="d-flex align-items-center justify-content-between">
                              <span>{tab.icon}</span>
                              <span className="me-2">{tab.label}</span>
                            </div>
                          </Nav.Link>
                        </Nav.Item>
                      ))}
                    </Nav>
                  </Col>
                  <Col md={9}>
                    <Tab.Content>
                      <Tab.Pane eventKey={activeTab}>
                        {renderTabContent()}
                      </Tab.Pane>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ComprehensiveClubDashboard;
