import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Row, Col, Table, Badge, Spinner, Tab, Nav, Container, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { UsersService } from '../../services/firestoreService';
import { ClubsService } from '../../services/firestoreService';
import { StaffService } from '../../services/mockDataService';
import StaffMemberPage from '../../components/staff/StaffMemberPage';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import type { Staff, Club, User } from '../../types';
import { StaffPosition } from '../../types';

// Mock data for the president as fallback
const presidentData = {
  id: 'cp-001',
  firstName: 'Ali',
  lastName: 'Benali',
  firstNameAr: 'علي',
  lastNameAr: 'بن علي',
  firstNameEn: 'Ali',
  lastNameEn: 'Benali',
  position: StaffPosition.CLUB_PRESIDENT,
  positionAr: 'رئيس النادي',
  positionEn: 'Club President',
  email: 'president@club.dz',
  phone: '+213 555 123 456',
  bioAr: 'رئيس نادي بخبرة واسعة في إدارة الأندية الرياضية وتطوير الرياضة على المستوى المحلي والوطني.',
  bioEn: 'Club president with extensive experience in managing sports clubs and developing sports at the local and national level.',
  image: '/images/staff/club-president.jpg',
  isActive: true,
  createdAt: new Date()
};

const additionalInfo = {
  experience: '10 سنوات',
  achievements: [
    'تطوير برنامج تدريبي متكامل للنادي',
    'تنظيم أكثر من 30 بطولة محلية ووطنية',
    'توسيع قاعدة الرياضيين إلى أكثر من 200 رياضي',
    'تحقيق 15 ميدالية في البطولات الوطنية'
  ],
  responsibilities: [
    'الإشراف على الإدارة العامة للنادي',
    'التنسيق مع الاتحادات الرياضية',
    'الموافقة على الخطط التدريبية والبرامج الفنية',
    'إدارة الموارد المالية والبشرية',
    'التوقيع على العقود والاتفاقيات الرسمية',
    'تمثيل النادي في المناسبات الرسمية',
    'الإشراف على الأنشطة الترويجية والتسويقية',
    'التنسيق مع وسائل الإعلام'
  ],
  education: [
    'ماجستير في الإدارة الرياضية - جامعة الجزائر',
    'ليسانس في القانون الرياضي - جامعة وهران',
    'دبلوم في الإدارة الرياضية من الاتحاد الجزائري'
  ],
  certifications: [
    'شهادة في إدارة الأندية الرياضية',
    'دورة في القانون الرياضي الدولي',
    'شهادة في التسويق الرياضي',
    'دورة في الإدارة المالية للأندية'
  ],
  socialMedia: {
    facebook: 'https://facebook.com/club.president',
    twitter: 'https://twitter.com/club_president',
    linkedin: 'https://linkedin.com/in/club-president'
  }
};

const ClubPresidentPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [athletesCount, setAthletesCount] = useState<number>(0);
  const [coachesCount, setCoachesCount] = useState<number>(0);
  const [president, setPresident] = useState<Staff | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);
  
  // يمكن ربط هذه لاحقاً بخدمات دفع/فعاليات عند توفرها
  const [pendingPayments] = useState<number>(0);
  const [upcomingEvents] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!clubId) {
          throw new Error('clubId is missing');
        }

        console.log('===ClubPresidentPage Debug: Fetching club data===', clubId);
        
        // Fetch current user data
        const userData = await UsersService.getCurrentUserWithDetails();
        console.log('===ClubPresidentPage Debug: Current user data===', userData);
        if (mounted) setCurrentUser(userData);
        
        // Fetch club from Firestore first
        const clubData = await ClubsService.getClubById(clubId);
        console.log('===ClubPresidentPage Debug: Club data from Firestore===', clubData);
        
        if (clubData) {
          setClub(clubData);
        } else {
          // Fallback to mock data
          console.log('===ClubPresidentPage Debug: Falling back to mock data===');
          // We'll set mock data later if needed
        }

        // Fetch president data
        let presidentData: Staff | null = null;
        
        // First try to get the current logged-in user
        try {
          const currentUser = UsersService.getCurrentUser();
          if (currentUser && currentUser.role === 'club_president') {
            // Convert User to Staff format
            presidentData = {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              firstNameAr: currentUser.firstNameAr || currentUser.firstName,
              lastNameAr: currentUser.lastNameAr || currentUser.lastName,
              position: StaffPosition.CLUB_PRESIDENT,
              positionAr: 'رئيس النادي',
              bioAr: 'رئيس النادي بخبرة في إدارة الأندية الرياضية وتطوير الرياضة على المستوى المحلي والوطني.',
              image: currentUser.image,
              email: currentUser.email,
              phone: currentUser.phone,
              clubId: clubData?.id,
              isActive: currentUser.isActive,
              createdAt: currentUser.createdAt
            };
          }
        } catch (e) {
          console.log('Error getting current user:', e);
        }
        
        // If no current user, try to find president by clubId
        if (!presidentData && clubData) {
          try {
            const staff = await StaffService.getStaffByClub(clubId);
            const p = staff.find((s) => s.position === StaffPosition.CLUB_PRESIDENT) || null;
            presidentData = p;
          } catch (e) {
            console.log('Error getting president from staff service:', e);
          }
        }

        // الرياضيون
        const athletes = await UsersService.getAthletesByClub(clubId);
        // المدرّبون (لا توجد دالة متخصصة، نستخدم جميع المستخدمين مع فلترة)
        const allUsers = await UsersService.getAllUsers();
        const coaches = allUsers.filter(u => u.role === 'coach' && String(u.clubId) === String(clubId));
        
        if (mounted) {
          setPresident(presidentData);
          setAthletesCount(athletes.length);
          setCoachesCount(coaches.length);
          if (!clubData) {
            // Set mock club data if Firestore didn't return anything
            // In a real app, you might want to handle this differently
            setClub({
              id: clubId,
              name: 'نادي الرياضة',
              nameAr: 'نادي الرياضة',
              leagueId: '',
              sportId: 'judo-001',
              description: '',
              descriptionAr: '',
              address: '',
              addressAr: '',
              phone: '',
              email: '',
              image: '',
              isActive: true,
              isFeatured: false,
              createdAt: new Date()
            });
          }
        }
      } catch (e) {
        console.error('ClubPresidentPage: failed to load data', e);
        if (mounted) {
          setAthletesCount(0);
          setCoachesCount(0);
          setError('حدث خطأ أثناء تحميل البيانات');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [clubId]);

  const handleImageUpload = async (file: File) => {
    if (!clubId || !president) return;
    
    setUploadingImage(true);
    setAlert(null);
    
    try {
      const result = await uploadToCloudinary(file, { folder: `clubs/${clubId}/president` });
      
      // Update the president's image in state
      setPresident(prev => prev ? { ...prev, image: result.secure_url } : null);
      
      // Update the user's image in the database
      try {
        await UsersService.updateUser(president.id, { image: result.secure_url });
        setAlert({ type: 'success', message: 'تم تحديث الصورة الشخصية بنجاح' });
        
        // Dispatch event to notify other components of the update
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: { userId: president.id } }));
      } catch (updateError) {
        console.error('Error updating user image in database:', updateError);
        setAlert({ type: 'danger', message: 'تم رفع الصورة لكن حدث خطأ أثناء حفظها في قاعدة البيانات' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setAlert({ type: 'danger', message: 'فشل في رفع الصورة. يرجى المحاولة مرة أخرى' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAlert({ type: 'danger', message: 'يرجى اختيار ملف صورة فقط' });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: 'danger', message: 'حجم الصورة يجب أن يكون أقل من 5 ميغابايت' });
      return;
    }
    
    await handleImageUpload(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const pendingRequests: Array<{ id: string; type: string; user: string; date: string }> = [];

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">جاري تحميل البيانات...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!club) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">النادي غير موجود.</Alert>
      </Container>
    );
  }

  // Use the president data from state or fallback to mock data
  const finalPresidentData = president || presidentData;

  return (
    <div dir="rtl">
      <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
        <Container fluid className="px-0">
          <Card className="rounded-0">
            <Card.Header className="bg-success text-white px-4">
              <Nav variant="tabs" className="border-0">
                <Nav.Item>
                  <Nav.Link
                    eventKey="dashboard"
                    className="bg-transparent border-0 text-white"
                    style={{ borderRadius: '0' }}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    لوحة التحكم
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="profile"
                    className="bg-transparent border-0 text-white"
                    style={{ borderRadius: '0' }}
                  >
                    <i className="fas fa-user me-2"></i>
                    الملف الشخصي
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>

            <Card.Body className="p-0">
              <Tab.Content>
                <Tab.Pane eventKey="dashboard">
                  <div className="container py-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <h1 className="h4 mb-0">لوحة رئيس النادي</h1>
                      <div className="d-flex gap-2">
                        <Button variant="primary"><i className="fas fa-user-plus ms-2"></i>إضافة رياضي</Button>
                        <Button variant="outline-primary"><i className="fas fa-users ms-2"></i>إدارة الأعضاء</Button>
                        <Button variant="outline-secondary"><i className="fas fa-gear ms-2"></i>إعدادات النادي</Button>
                      </div>
                    </div>

                    {/* Alert for messages */}
                    {alert && (
                      <Alert variant={alert.type} className="mb-4" onClose={() => setAlert(null)} dismissible>
                        {alert.message}
                      </Alert>
                    )}

                    {/* بطاقات إحصائية سريعة */}
                    <Row className="g-3 mb-4">
                      <Col md={3} sm={6}>
                        <Card className="shadow-sm">
                          <Card.Body className="text-center">
                            <div className="text-muted mb-1">عدد الرياضيين</div>
                            <div className="display-6">{athletesCount}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6}>
                        <Card className="shadow-sm">
                          <Card.Body className="text-center">
                            <div className="text-muted mb-1">المدرّبون</div>
                            <div className="display-6">{coachesCount}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6}>
                        <Card className="shadow-sm">
                          <Card.Body className="text-center">
                            <div className="text-muted mb-1">دفعات قيد المتابعة</div>
                            <div className="display-6">{pendingPayments}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6}>
                        <Card className="shadow-sm">
                          <Card.Body className="text-center">
                            <div className="text-muted mb-1">فعاليات قادمة</div>
                            <div className="display-6">{upcomingEvents}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row className="g-4">
                      <Col lg={7}>
                        <Card className="shadow-sm">
                          <Card.Header className="bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                              <strong>طلبات بانتظار الموافقة</strong>
                              <Badge bg={pendingRequests.length ? 'warning' : 'secondary'}>
                                {pendingRequests.length || 0}
                              </Badge>
                            </div>
                          </Card.Header>
                          <Card.Body className="p-0">
                            {pendingRequests.length === 0 ? (
                              <div className="text-muted text-center py-4">لا توجد طلبات حالياً</div>
                            ) : (
                              <Table hover responsive className="mb-0">
                                <thead>
                                  <tr>
                                    <th>الطلب</th>
                                    <th>المستخدم</th>
                                    <th>التاريخ</th>
                                    <th className="text-center">إجراءات</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pendingRequests.map((r) => (
                                    <tr key={r.id}>
                                      <td>{r.type}</td>
                                      <td className="text-end">{r.user}</td>
                                      <td>{r.date}</td>
                                      <td className="text-center">
                                        <div className="d-inline-flex gap-2">
                                          <Button size="sm" variant="success">
                                            <i className="fas fa-check"></i>
                                          </Button>
                                          <Button size="sm" variant="outline-danger">
                                            <i className="fas fa-times"></i>
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={5}>
                        <Card className="shadow-sm h-100">
                          <Card.Header className="bg-white">
                            <strong>إجراءات سريعة</strong>
                          </Card.Header>
                          <Card.Body>
                            <div className="d-grid gap-2">
                              <Button variant="outline-primary">
                                <i className="fas fa-clipboard-list ms-2"></i>تصدير قائمة الرياضيين
                              </Button>
                              <Button variant="outline-primary">
                                <i className="fas fa-money-bill-wave ms-2"></i>تسوية اشتراكات الشهر
                              </Button>
                              <Button variant="outline-secondary">
                                <i className="fas fa-file-arrow-up ms-2"></i>رفع وثائق النادي
                              </Button>
                              <Button variant="outline-secondary">
                                <i className="fas fa-bullhorn ms-2"></i>نشر إعلان داخلي
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab.Pane>
                
                <Tab.Pane eventKey="profile">
                  <div className="position-relative">
                    {uploadingImage && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex justify-content-center align-items-center" style={{ zIndex: 1000 }}>
                        <Spinner animation="border" variant="primary" />
                        <span className="ms-2">جاري رفع الصورة...</span>
                      </div>
                    )}
                    <StaffMemberPage
                      staff={finalPresidentData}
                      clubId={clubId}
                      additionalInfo={additionalInfo}
                    />
                    <div className="container py-4">
                      <Card className="shadow-sm">
                        <Card.Header className="bg-success text-white">
                          <h4 className="mb-0" dir="rtl">
                            <i className="fas fa-camera me-2"></i>
                            تحديث الصورة الشخصية
                          </h4>
                        </Card.Header>
                        <Card.Body>
                          <div className="d-flex align-items-center gap-3">
                            <Button 
                              variant="primary" 
                              onClick={triggerFileInput}
                              disabled={uploadingImage}
                            >
                              <i className="fas fa-upload me-2"></i>
                              اختيار صورة
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              style={{ display: 'none' }}
                            />
                            {uploadingImage && (
                              <div className="text-muted">
                                <Spinner animation="border" size="sm" className="me-2" />
                                جاري رفع الصورة...
                              </div>
                            )}
                          </div>
                          <div className="mt-3 text-muted">
                            <small>
                              <i className="fas fa-info-circle me-2"></i>
                              يُنصح باستخدام صورة واضحة بحجم 200×200 بكسل بتنسيق JPG أو PNG، وحجمها أقل من 5 ميغابايت
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Container>
      </Tab.Container>
    </div>
  );
};

export default ClubPresidentPage;