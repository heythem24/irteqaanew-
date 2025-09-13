import React, { useState, useEffect } from 'react';
import type { Competition, Athlete } from '../../types/firestoreModels';
import { getAllCompetitions } from '../../services/competitionService';
import { useClubData } from '../../hooks/useFirestore';
import './CoachCompetitionParticipation.css';

interface CoachCompetitionParticipationProps {
  clubId: string;
  leagueId: string;
  wilayaId: number;
}

const CoachCompetitionParticipation: React.FC<CoachCompetitionParticipationProps> = ({
  clubId,
  leagueId,
  wilayaId
}) => {
  const [availableCompetitions, setAvailableCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle');

  // Get club athletes
  const { data: athletes = [], loading: athletesLoading } = useClubData<Athlete>('athletes', clubId, 'clubId');

  useEffect(() => {
    loadAvailableCompetitions();
  }, [leagueId, wilayaId]);

  const loadAvailableCompetitions = async () => {
    setLoading(true);
    try {
      const allCompetitions = await getAllCompetitions();
      
      // Filter competitions based on coach's scope
      const now = new Date();
      const filtered = allCompetitions.filter(comp => {
        const isUpcoming = comp.startDate?.toDate() > now;
        const registrationOpen = comp.registrationDeadline?.toDate() > now;
        
        // Check if competition is available for this coach's level
        if (comp.type === 'national') {
          return true; // National competitions are available to all
        } else if (comp.type === 'regional') {
          // Regional competitions - check if it's in the same region
          return true; // For now, assume all regional competitions are available
        } else if (comp.type === 'provincial') {
          // Provincial competitions - check wilaya
          return true; // For now, assume all provincial competitions are available
        } else if (comp.type === 'local') {
          // Local competitions - check league
          return comp.organizerId === leagueId;
        }
        
        return isUpcoming && registrationOpen;
      });

      setAvailableCompetitions(filtered);
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEligibleAthletes = (competition: Competition) => {
    if (!competition.categories || competition.categories.length === 0) {
      return [];
    }

    return athletes.filter(athlete => {
      // Check if athlete meets basic requirements
      const age = calculateAge(athlete.dateOfBirth?.toDate());
      
      // For now, simple filtering - can be enhanced with more complex logic
      return athlete.isActive && age >= 6 && age <= 25;
    });
  };

  const calculateAge = (birthDate?: Date): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getAthletesByCategory = (competition: Competition) => {
    const eligibleAthletes = getEligibleAthletes(competition);
    const categorizedAthletes: { [categoryId: string]: Athlete[] } = {};

    competition.categories?.forEach(category => {
      categorizedAthletes[category.id] = eligibleAthletes.filter(athlete => {
        // Enhanced filtering based on category requirements
        const age = calculateAge(athlete.dateOfBirth?.toDate());
        
        // Weight class filtering
        if (category.weightClass && athlete.weight) {
          const weightLimit = parseFloat(category.weightClass.replace(/[^0-9.]/g, ''));
          if (athlete.weight > weightLimit) return false;
        }

        // Gender filtering
        if (category.gender && category.gender !== 'mixed') {
          if (athlete.gender !== category.gender) return false;
        }

        // Age group filtering (simplified)
        if (category.ageGroup) {
          if (category.ageGroup.includes('أشبال') && (age < 10 || age > 12)) return false;
          if (category.ageGroup.includes('أصاغر') && (age < 13 || age > 15)) return false;
          if (category.ageGroup.includes('شباب') && (age < 16 || age > 17)) return false;
          if (category.ageGroup.includes('كبار') && age < 18) return false;
        }

        return true;
      });
    });

    return categorizedAthletes;
  };

  const handleRegisterAthletes = async (competitionId: string, registrations: { [categoryId: string]: string[] }) => {
    setRegistrationStatus('registering');
    
    try {
      // Here you would implement the actual registration logic
      // This would involve updating the competition's participant lists
      console.log('Registering athletes:', { competitionId, registrations });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRegistrationStatus('success');
      setTimeout(() => setRegistrationStatus('idle'), 3000);
    } catch (error) {
      console.error('Error registering athletes:', error);
      setRegistrationStatus('error');
      setTimeout(() => setRegistrationStatus('idle'), 3000);
    }
  };

  if (loading || athletesLoading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="coach-competition-participation">
      <div className="participation-header">
        <h2>المشاركة في البطولات</h2>
        <p>سجل رياضييك في البطولات المتاحة</p>
      </div>

      {availableCompetitions.length === 0 ? (
        <div className="no-competitions">
          <p>لا توجد بطولات متاحة للتسجيل حاليًا</p>
        </div>
      ) : (
        <div className="competitions-list">
          {availableCompetitions.map(competition => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              athletes={athletes}
              onSelect={() => setSelectedCompetition(competition)}
              onRegister={handleRegisterAthletes}
              isSelected={selectedCompetition?.id === competition.id}
              categorizedAthletes={getAthletesByCategory(competition)}
              registrationStatus={registrationStatus}
            />
          ))}
        </div>
      )}

      {registrationStatus === 'success' && (
        <div className="alert alert-success">
          تم تسجيل الرياضيين بنجاح!
        </div>
      )}

      {registrationStatus === 'error' && (
        <div className="alert alert-error">
          حدث خطأ في تسجيل الرياضيين. يرجى المحاولة مرة أخرى.
        </div>
      )}
    </div>
  );
};

interface CompetitionCardProps {
  competition: Competition;
  athletes: Athlete[];
  onSelect: () => void;
  onRegister: (competitionId: string, registrations: { [categoryId: string]: string[] }) => void;
  isSelected: boolean;
  categorizedAthletes: { [categoryId: string]: Athlete[] };
  registrationStatus: 'idle' | 'registering' | 'success' | 'error';
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({
  competition,
  onSelect,
  onRegister,
  isSelected,
  categorizedAthletes,
  registrationStatus
}) => {
  const [selectedAthletes, setSelectedAthletes] = useState<{ [categoryId: string]: string[] }>({});

  const handleAthleteSelection = (categoryId: string, athleteId: string, selected: boolean) => {
    setSelectedAthletes(prev => ({
      ...prev,
      [categoryId]: selected 
        ? [...(prev[categoryId] || []), athleteId]
        : (prev[categoryId] || []).filter(id => id !== athleteId)
    }));
  };

  const handleSubmitRegistration = () => {
    onRegister(competition.id, selectedAthletes);
  };

  const hasSelectedAthletes = Object.values(selectedAthletes).some(list => list.length > 0);

  return (
    <div className={`competition-card ${isSelected ? 'selected' : ''}`}>
      <div className="card-header" onClick={onSelect}>
        <div className="competition-thumbnail">
          {competition.thumbnailUrl ? (
            <img src={competition.thumbnailUrl} alt={competition.name} />
          ) : (
            <div className="placeholder">لا توجد صورة</div>
          )}
        </div>
        <div className="competition-info">
          <h3>{competition.nameAr || competition.name}</h3>
          <p>النوع: {competition.type}</p>
          <p>التاريخ: {competition.startDate?.toDate().toLocaleDateString()}</p>
          <p>المكان: {competition.location}</p>
          <p>آخر موعد للتسجيل: {competition.registrationDeadline?.toDate().toLocaleDateString()}</p>
        </div>
        <div className="expand-arrow">
          {isSelected ? '▲' : '▼'}
        </div>
      </div>

      {isSelected && (
        <div className="card-content">
          <div className="categories-section">
            <h4>الفئات المتاحة</h4>
            {competition.categories?.map(category => {
              const eligibleAthletes = categorizedAthletes[category.id] || [];
              
              return (
                <div key={category.id} className="category-section">
                  <h5>{category.nameAr || category.name}</h5>
                  <p>
                    الوزن: {category.weightClass} | 
                    الفئة العمرية: {category.ageGroup} | 
                    الجنس: {category.gender === 'male' ? 'ذكور' : category.gender === 'female' ? 'إناث' : 'مختلط'}
                  </p>
                  
                  {eligibleAthletes.length > 0 ? (
                    <div className="athletes-list">
                      {eligibleAthletes.map(athlete => (
                        <div key={athlete.id} className="athlete-item">
                          <label>
                            <input
                              type="checkbox"
                              checked={(selectedAthletes[category.id] || []).includes(athlete.id)}
                              onChange={(e) => handleAthleteSelection(category.id, athlete.id, e.target.checked)}
                            />
                            <span className="athlete-name">
                              {athlete.firstNameAr || athlete.firstName} {athlete.lastNameAr || athlete.lastName}
                            </span>
                            <span className="athlete-details">
                              الوزن: {athlete.weight}كغ | 
                              الحزام: {athlete.belt?.current || 'غير محدد'}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-eligible">لا يوجد رياضيون مؤهلون لهذه الفئة</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="registration-actions">
            <button
              className="btn-primary"
              onClick={handleSubmitRegistration}
              disabled={!hasSelectedAthletes || registrationStatus === 'registering'}
            >
              {registrationStatus === 'registering' ? 'جاري التسجيل...' : 'تسجيل الرياضيين'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachCompetitionParticipation;