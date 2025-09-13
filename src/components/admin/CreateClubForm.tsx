import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { League, Club } from '../../types';
import { LeaguesService, ClubsService as FirestoreClubsService } from '../../services/firestoreService';

interface CreateClubFormProps {
  onClubCreated?: () => void;
}

const CreateClubForm: React.FC<CreateClubFormProps> = ({ onClubCreated }) => {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState<boolean>(true);
  const [formData, setFormData] = useState<Partial<Club>>({
    name: '',
    nameAr: '',
    leagueId: '',
    description: '',
    descriptionAr: '',
    address: '',
    addressAr: '',
    phone: '',
    email: '',
    isActive: true,
    isFeatured: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoadingLeagues(true);
        console.log('=== DEBUG: Fetching leagues ===');
        const leaguesData = await LeaguesService.getAllLeagues();
        console.log('Leagues fetched:', leaguesData);
        console.log('Number of leagues:', leaguesData.length);
        setLeagues(leaguesData);
      } catch (err) {
        setError('فشل تحميل قائمة الرابطات.');
        console.error('Error fetching leagues:', err);
      } finally {
        setLoadingLeagues(false);
      }
    };
    fetchLeagues();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const selectedLeague = leagues.find(l => l.id === formData.leagueId);
    if (!selectedLeague) {
      setError('الرجاء اختيار رابطة صالحة.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const newClubData: Omit<Club, 'id' | 'createdAt'> = {
        name: formData.name || '',
        nameAr: formData.nameAr || '',
        leagueId: selectedLeague.id,
        sportId: selectedLeague.sportId, // Get sportId from the selected league
        description: formData.description || '',
        descriptionAr: formData.descriptionAr || '',
        address: formData.address || '',
        addressAr: formData.addressAr || '',
        phone: formData.phone || '',
        email: formData.email || '',
        isActive: formData.isActive ?? true,
        isFeatured: formData.isFeatured ?? false,
      };

      console.log('===DEBUG: Creating club with data==>', newClubData);
      console.log('===DEBUG: Selected league ID==>', selectedLeague?.id);
      console.log('===DEBUG: Selected league wilayaId==>', selectedLeague?.wilayaId);
      
      const clubId = await FirestoreClubsService.createClub(newClubData);
      console.log('===DEBUG: Club created with ID==>', clubId);
      
      // Debug: Verify the club was created by fetching it back
      try {
        const createdClub = await FirestoreClubsService.getClubById(clubId);
        console.log('===DEBUG: Created club verification==>', createdClub);
        
        // Double-check that the club is properly associated with the league
        if (createdClub && createdClub.leagueId === selectedLeague?.id) {
          console.log('===DEBUG: Club-league association verified===');
        } else {
          console.warn('===DEBUG: Club-league association issue===', {
            clubLeagueId: createdClub?.leagueId,
            expectedLeagueId: selectedLeague?.id,
            clubLeagueIdType: typeof createdClub?.leagueId,
            expectedLeagueIdType: typeof selectedLeague?.id
          });
          
          // If there's a mismatch, try to update the club with the correct leagueId
          if (createdClub && createdClub.leagueId !== selectedLeague?.id) {
            console.log('===DEBUG: Attempting to fix club-league association===');
            try {
              await FirestoreClubsService.updateClub(clubId, { leagueId: selectedLeague.id });
              console.log('===DEBUG: Club-league association fixed===');
              
              // Verify the fix
              const updatedClub = await FirestoreClubsService.getClubById(clubId);
              console.log('===DEBUG: Updated club verification==>', updatedClub);
            } catch (updateError) {
              console.error('===DEBUG: Failed to fix club-league association===', updateError);
            }
          }
        }
      } catch (err) {
        console.error('===DEBUG: Failed to verify created club==>', err);
      }
      
      alert('تم إنشاء النادي بنجاح! سيتم الآن إعادة توجيهك...');
      
      // Debug: Verify the club was created
      console.log('===DEBUG: Club created successfully===');
      
      // Call the callback to notify that a club was created
      if (onClubCreated) {
        onClubCreated();
      }
      
      // Dispatch custom event to notify navbar that a club was created
      window.dispatchEvent(new CustomEvent('clubCreated', {
        detail: {
          leagueId: newClubData.leagueId,
          wilayaId: selectedLeague?.wilayaId
        }
      }));
      
      const league = leagues.find(l => l.id === newClubData.leagueId);
      console.log('===DEBUG: Found league for navigation==>', league);
      
      if (league) {
        console.log('===DEBUG: Navigating to league page==>', `/league/${league.wilayaId}`);
        navigate(`/league/${league.wilayaId}`);
      } else {
        // Fallback to home if league not found, though this shouldn't happen
        console.log('===DEBUG: League not found, navigating to home');
        navigate('/');
      }

    } catch (err) {
      console.error('Failed to create club:', err);
      setError('حدث خطأ أثناء إنشاء النادي. الرجاء مراجعة الكونسول والمحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingLeagues) {
    return <Spinner animation="border" />;
  }

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridLeague">
          <Form.Label>الرابطة</Form.Label>
          <Form.Select name="leagueId" value={formData.leagueId} onChange={handleChange} required>
            <option value="">اختر الرابطة...</option>
            {leagues.map(league => (
              <option key={league.id} value={league.id}>
                {league.nameAr} ({league.wilayaNameAr})
              </option>
            ))}
          </Form.Select>
          {leagues.length === 0 && !loadingLeagues && (
            <Form.Text className="text-muted">
              لم يتم العثور على أي رابطات. الرجاء التأكد من استيراد البيانات أولاً.
            </Form.Text>
          )}
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} md="6" controlId="formGridNameAr">
          <Form.Label>اسم النادي (بالعربية)</Form.Label>
          <Form.Control name="nameAr" value={formData.nameAr} onChange={handleChange} placeholder="مثال: نادي الأبطال" required />
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="formGridName">
          <Form.Label>اسم النادي (بالإنجليزية)</Form.Label>
          <Form.Control name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Champions Club" required />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridDescriptionAr">
          <Form.Label>الوصف (بالعربية)</Form.Label>
          <Form.Control as="textarea" rows={3} name="descriptionAr" value={formData.descriptionAr} onChange={handleChange} />
        </Form.Group>
        <Form.Group as={Col} controlId="formGridDescription">
          <Form.Label>الوصف (بالإنجليزية)</Form.Label>
          <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridAddressAr">
          <Form.Label>العنوان (بالعربية)</Form.Label>
          <Form.Control name="addressAr" value={formData.addressAr} onChange={handleChange} />
        </Form.Group>
        <Form.Group as={Col} controlId="formGridAddress">
          <Form.Label>العنوان (بالإنجليزية)</Form.Label>
          <Form.Control name="address" value={formData.address} onChange={handleChange} />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} md="6" controlId="formGridEmail">
          <Form.Label>البريد الإلكتروني</Form.Label>
          <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@club.com" />
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="formGridPhone">
          <Form.Label>رقم الهاتف</Form.Label>
          <Form.Control name="phone" value={formData.phone} onChange={handleChange} />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} xs="auto" controlId="formGridIsActive">
          <Form.Check type="switch" name="isActive" label="النادي نشط" checked={formData.isActive} onChange={handleChange} />
        </Form.Group>
        <Form.Group as={Col} xs="auto" controlId="formGridIsFeatured">
          <Form.Check type="switch" name="isFeatured" label="نادي مميز" checked={formData.isFeatured} onChange={handleChange} />
        </Form.Group>
      </Row>

      <Button variant="primary" type="submit" disabled={submitting}>
        {submitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'إنشاء النادي'}
      </Button>
    </Form>
  );
};

export default CreateClubForm;
