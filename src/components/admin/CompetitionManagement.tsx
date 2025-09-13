import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Competition, Category } from '../../types/firestoreModels';
import { createCompetition, getAllCompetitions } from '../../services/competitionService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import './CompetitionManagement.css';

interface CompetitionManagementProps {
  organizerId: string;
  organizerType: 'national' | 'regional' | 'provincial' | 'local';
}

const CompetitionManagement: React.FC<CompetitionManagementProps> = ({ organizerId, organizerType }) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    location: '',
    locationAr: '',
    type: organizerType,
    thumbnailUrl: '',
    categories: [] as Partial<Category>[]
  });

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    setLoading(true);
    try {
      const allCompetitions = await getAllCompetitions();
      // Filter competitions by organizer
      const filteredCompetitions = allCompetitions.filter(comp => comp.organizerId === organizerId);
      setCompetitions(filteredCompetitions);
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompetitions = competitions.filter((comp) => {
    const now = new Date();
    const startDate = comp.startDate?.toDate();
    const endDate = comp.endDate?.toDate();

    if (activeTab === 'upcoming') return startDate && startDate > now;
    if (activeTab === 'ongoing') return startDate && endDate && startDate <= now && endDate >= now;
    if (activeTab === 'completed') return endDate && endDate < now;
    return true;
  });

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = formData.thumbnailUrl;
      
      // Upload image to Cloudinary if file is selected
      if (imageFile) {
        setUploadingImage(true);
        const uploadResult = await uploadToCloudinary(imageFile, {
          folder: 'competitions',
          tags: ['competition', 'tournament']
        });
        thumbnailUrl = uploadResult.secure_url;
        setUploadingImage(false);
      }
      const competitionData: Omit<Competition, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        nameAr: formData.nameAr,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        location: formData.location,
        locationAr: formData.locationAr,
        type: formData.type as 'national' | 'regional' | 'provincial' | 'local',
        thumbnailUrl,
        organizerId,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        registrationDeadline: Timestamp.fromDate(new Date(formData.registrationDeadline)),
        status: 'upcoming',
        categories: [],
        isActive: true,
        settings: {
          allowOnlineRegistration: true,
          maxParticipants: 100,
          requireMedicalCertificate: true,
          allowLiveUpdates: true,
          notificationPreferences: {
            email: true,
            push: true,
            sms: false,
            frequency: 'immediate'
          }
        }
      };

      const newCompetitionId = await createCompetition(competitionData);
      if (newCompetitionId) {
        await loadCompetitions();
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating competition:', error);
      setUploadingImage(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      location: '',
      locationAr: '',
      type: organizerType,
      thumbnailUrl: '',
      categories: []
    });
    setImageFile(null);
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, {
        name: '',
        nameAr: '',
        weightClass: '',
        ageGroup: '',
        gender: 'mixed',
        bracket: 'single_elimination',
        participants: [],
        matches: []
      }]
    }));
  };

  const updateCategory = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) => 
        i === index ? { ...cat, [field]: value } : cat
      )
    }));
  };

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  if (loading && competitions.length === 0) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="competition-management">
      <div className="management-header">
        <h2>إدارة المنافسات</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
        >
          إنشاء بطولة جديدة
        </button>
      </div>

      {/* Tabs */}
      <div className="competition-tabs">
        <button 
          onClick={() => setActiveTab('upcoming')} 
          className={activeTab === 'upcoming' ? 'active' : ''}
        >
          قادمة ({competitions.filter(c => {
            const startDate = c.startDate?.toDate();
            return startDate && startDate > new Date();
          }).length})
        </button>
        <button 
          onClick={() => setActiveTab('ongoing')} 
          className={activeTab === 'ongoing' ? 'active' : ''}
        >
          جارية ({competitions.filter(c => {
            const now = new Date();
            const startDate = c.startDate?.toDate();
            const endDate = c.endDate?.toDate();
            return startDate && endDate && startDate <= now && endDate >= now;
          }).length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')} 
          className={activeTab === 'completed' ? 'active' : ''}
        >
          منتهية ({competitions.filter(c => {
            const endDate = c.endDate?.toDate();
            return endDate && endDate < new Date();
          }).length})
        </button>
      </div>

      {/* Competitions List */}
      <div className="competitions-grid">
        {filteredCompetitions.length > 0 ? (
          filteredCompetitions.map((competition) => (
            <div key={competition.id} className="competition-card">
              <div className="competition-thumbnail">
                {competition.thumbnailUrl ? (
                  <img src={competition.thumbnailUrl} alt={competition.name} />
                ) : (
                  <div className="placeholder-thumbnail">لا توجد صورة</div>
                )}
              </div>
              <div className="competition-info">
                <h3>{competition.name}</h3>
                <p>التاريخ: {competition.startDate?.toDate().toLocaleDateString()}</p>
                <p>المكان: {competition.location}</p>
                <p>النوع: {competition.type}</p>
                <div className="competition-actions">
                  <button className="btn-action edit">
                    <i className="fas fa-edit"></i> تعديل
                  </button>
                  <button className="btn-action participants">
                    <i className="fas fa-users"></i> المشاركون ({competition.categories?.reduce((total, cat) => total + (cat.participants?.length || 0), 0) || 0})
                  </button>
                  <button className="btn-action brackets">
                    <i className="fas fa-sitemap"></i> توليد القرعة
                  </button>
                  <button className="btn-action live" disabled={activeTab !== 'ongoing'}>
                    <i className="fas fa-play-circle"></i> إدارة مباشرة
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-competitions">
            <p>لا توجد بطولات في هذا القسم</p>
          </div>
        )}
      </div>

      {/* Create Competition Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>إنشاء بطولة جديدة</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateCompetition} className="competition-form">
              <div className="form-row">
                <div className="form-group">
                  <label>اسم البطولة (بالعربية)</label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>اسم البطولة (بالإنجليزية)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>تاريخ البداية</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>تاريخ النهاية</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>آخر موعد للتسجيل</label>
                  <input
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>المكان</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>وصف البطولة</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>صورة البطولة</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        // Show preview
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const preview = document.getElementById('image-preview') as HTMLImageElement;
                          if (preview && e.target?.result) {
                            preview.src = e.target.result as string;
                            preview.style.display = 'block';
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="form-control"
                  />
                  <img id="image-preview" style={{ display: 'none', width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '4px' }} />
                  {uploadingImage && (
                    <div className="upload-progress">
                      <p>جاري رفع الصورة...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>رابط صورة البطولة (اختياري - إذا لم ترفع صورة)</label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>

              {/* Categories Section */}
              <div className="categories-section">
                <div className="section-header">
                  <h4>فئات البطولة</h4>
                  <button type="button" onClick={addCategory} className="btn-secondary">
                    إضافة فئة
                  </button>
                </div>

                {formData.categories.map((category, index) => (
                  <div key={index} className="category-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>اسم الفئة</label>
                        <input
                          type="text"
                          value={category.name || ''}
                          onChange={(e) => updateCategory(index, 'name', e.target.value)}
                          placeholder="مثال: أشبال -50كغ"
                        />
                      </div>
                      <div className="form-group">
                        <label>الوزن</label>
                        <input
                          type="text"
                          value={category.weightClass || ''}
                          onChange={(e) => updateCategory(index, 'weightClass', e.target.value)}
                          placeholder="مثال: -50كغ"
                        />
                      </div>
                      <div className="form-group">
                        <label>الفئة العمرية</label>
                        <input
                          type="text"
                          value={category.ageGroup || ''}
                          onChange={(e) => updateCategory(index, 'ageGroup', e.target.value)}
                          placeholder="مثال: أشبال"
                        />
                      </div>
                      <div className="form-group">
                        <label>الجنس</label>
                        <select
                          value={category.gender || 'mixed'}
                          onChange={(e) => updateCategory(index, 'gender', e.target.value)}
                        >
                          <option value="male">ذكور</option>
                          <option value="female">إناث</option>
                          <option value="mixed">مختلط</option>
                        </select>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeCategory(index)}
                        className="btn-danger"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'جاري الإنشاء...' : 'إنشاء البطولة'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowCreateForm(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionManagement;