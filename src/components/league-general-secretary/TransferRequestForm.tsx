import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Table, Button } from 'react-bootstrap';

interface TransferRequestFormProps {
  leagueId?: string;
}

const TransferRequestForm: React.FC<TransferRequestFormProps> = ({ leagueId }) => {
  const [formData, setFormData] = useState({
    // بيانات النادي الحالي
    currentClub: '',
    currentClubLatin: '',
    
    // بيانات النادي الجديد
    newClub: '',
    newClubLatin: '',
    
    // سبب طلب التحويل
    transferReason: '',
    location: '',
    date: '',
    
    // بيانات الرياضي
    athleteName: '',
    fatherName: '',
    nickname: '',
    birthDate: '',
    birthPlace: '',
    bloodType: '',
    nationality: '',
    address: '',
    
    // رقم الإجازة الرياضية
    sportsLicenseNumber: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const headerStyle = {
    backgroundColor: '#dc3545', // أحمر
    color: 'white',
    textAlign: 'center' as const,
    padding: '10px',
    fontSize: '16px',
    fontWeight: 'bold'
  };

  const greenHeaderStyle = {
    backgroundColor: '#28a745', // أخضر
    color: 'white',
    textAlign: 'center' as const,
    padding: '10px',
    fontSize: '16px',
    fontWeight: 'bold'
  };

  return (
    <Container fluid className="p-4" dir="rtl">
      {/* Header المعلومات الرسمية */}
      <div className="text-center mb-4">
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          الجمهورية الجزائرية الديمقراطية الشعبية
        </div>
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          وزارة الرياضة
        </div>
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          الإتحادية الجزائرية للجودو
        </div>
        
        <div style={{
          backgroundColor: '#6c757d',
          borderRadius: '25px',
          padding: '10px 30px',
          display: 'inline-block',
          color: 'white',
          fontWeight: 'bold'
        }}>
          طلب تحويل
        </div>
      </div>

      {/* معلومات الرابطة */}
      <Card className="mb-4" style={{border: '2px solid #000'}}>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>ولاية:</Form.Label>
                <div style={{borderBottom: '1px dotted #000', minHeight: '25px', paddingBottom: '5px'}}>
                  {/* سيتم ملؤها بناءً على الرابطة */}
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>الموسم الرياضي:</Form.Label>
                <div style={{borderBottom: '1px dotted #000', minHeight: '25px', paddingBottom: '5px'}}>
                  
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>أنا المضي أسفله:</Form.Label>
                <div style={{borderBottom: '1px dotted #000', minHeight: '25px', paddingBottom: '5px'}}>
                  
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* جدول بيانات النوادي */}
      <Card className="mb-4" style={{border: '2px solid #000'}}>
        <Table bordered className="m-0">
          <thead>
            <tr>
              <td style={headerStyle} colSpan={2}>
                النادي الرياضي الحالي ( بالعربية )
              </td>
              <td rowSpan={2} style={{...headerStyle, verticalAlign: 'middle'}}>
                ولاية:
              </td>
            </tr>
            <tr>
              <td style={greenHeaderStyle} colSpan={2}>
                النادي الرياضي الجديد ( بالعربية )
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{padding: '15px', textAlign: 'center'}}>
                <Form.Control
                  type="text"
                  value={formData.currentClub}
                  onChange={(e) => handleInputChange('currentClub', e.target.value)}
                  style={{border: 'none', textAlign: 'center'}}
                />
              </td>
              <td style={{padding: '15px', textAlign: 'center'}}>
                <Form.Control
                  type="text"
                  value={formData.newClub}
                  onChange={(e) => handleInputChange('newClub', e.target.value)}
                  style={{border: 'none', textAlign: 'center'}}
                />
              </td>
              <td style={{padding: '15px', textAlign: 'center', minWidth: '150px'}}>
                
              </td>
            </tr>
          </tbody>
        </Table>
      </Card>

      {/* سبب طلب التحويل */}
      <Card className="mb-4" style={{border: '2px solid #000'}}>
        <Card.Body>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label style={{fontWeight: 'bold'}}>سبب طلب التحويل:</Form.Label>
                <div style={{borderBottom: '1px dotted #000', minHeight: '30px', paddingBottom: '5px'}}>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.transferReason}
                    onChange={(e) => handleInputChange('transferReason', e.target.value)}
                    style={{border: 'none', resize: 'none'}}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>في:</Form.Label>
                <div style={{borderBottom: '1px dotted #000', minHeight: '25px', paddingBottom: '5px'}}>
                  <Form.Control
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    style={{border: 'none'}}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>بـ:</Form.Label>
                <div style={{borderBottom: '1px dotted #000', minHeight: '25px', paddingBottom: '5px'}}>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    style={{border: 'none'}}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={12} className="text-end">
              <Form.Label>إمضاء الرياضي(ة)</Form.Label>
              <div style={{border: '1px solid #000', height: '60px', width: '150px', marginLeft: 'auto'}}>
                
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* خاص بالرابطة */}
      <div style={{
        borderTop: '2px solid #000',
        paddingTop: '20px'
      }}>
        <h5 style={{textAlign: 'center', fontWeight: 'bold', marginBottom: '20px'}}>
          خاص بالرابطة
        </h5>
        
        <Card style={{border: '2px solid #000'}}>
          <Card.Body>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={{fontWeight: 'bold'}}>الرأي:</Form.Label>
                  <div style={{borderBottom: '1px dotted #000', minHeight: '40px', paddingBottom: '5px'}}>
                    
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={12} className="text-end">
                <Form.Label style={{fontWeight: 'bold'}}>إمضاء رئيس أو أمين عام الرابطة</Form.Label>
                <div style={{border: '1px solid #000', height: '60px', width: '200px', marginLeft: 'auto'}}>
                  
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>

      {/* الصفحة الثانية - بيانات الرياضي */}
      <div style={{pageBreakBefore: 'always', marginTop: '50px'}}>
        {/* Header الصفحة الثانية */}
        <div className="text-center mb-4">
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            الجمهورية الجزائرية الديمقراطية الشعبية
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            وزارة الرياضة
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            الإتحادية الجزائرية للجودو
          </div>
          
          <div style={{
            backgroundColor: '#6c757d',
            borderRadius: '25px',
            padding: '10px 30px',
            display: 'inline-block',
            color: 'white',
            fontWeight: 'bold'
          }}>
            طلب تحويل
          </div>
          
          <div className="mt-3">
            <span style={{fontWeight: 'bold'}}>ولاية:</span>
            <span style={{borderBottom: '1px dotted #000', marginLeft: '20px', paddingBottom: '2px'}}>
              
            </span>
          </div>
        </div>

        {/* جدول بيانات الرياضي */}
        <Card style={{border: '2px solid #000'}}>
          <Table bordered className="m-0">
            <tbody>
              <tr>
                <td style={{fontWeight: 'bold', padding: '10px', backgroundColor: '#f8f9fa'}}>الإسم:</td>
                <td style={{padding: '10px'}}>
                  <Form.Control
                    type="text"
                    value={formData.athleteName}
                    onChange={(e) => handleInputChange('athleteName', e.target.value)}
                    style={{border: 'none'}}
                  />
                </td>
                <td style={{fontWeight: 'bold', padding: '10px', backgroundColor: '#f8f9fa'}}>اللقب:</td>
                <td style={{padding: '10px'}}>
                  <Form.Control
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    style={{border: 'none'}}
                  />
                </td>
              </tr>
              <tr>
                <td style={{fontWeight: 'bold', padding: '10px', backgroundColor: '#f8f9fa'}}>تاريخ الميلاد:</td>
                <td style={{padding: '10px'}}>
                  <Form.Control
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    style={{border: 'none'}}
                  />
                </td>
                <td style={{fontWeight: 'bold', padding: '10px', backgroundColor: '#f8f9fa'}}>مكان الميلاد:</td>
                <td style={{padding: '10px'}}>
                  <Form.Control
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                    style={{border: 'none'}}
                  />
                </td>
              </tr>
              <tr>
                <td style={{fontWeight: 'bold', padding: '10px', backgroundColor: '#f8f9fa'}}>فصيلة الدم:</td>
                <td style={{padding: '10px'}}>
                  <Form.Select 
                    value={formData.bloodType}
                    onChange={(e) => handleInputChange('bloodType', e.target.value)}
                    style={{border: 'none'}}
                  >
                    <option value="">اختر...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Form.Select>
                </td>
                <td style={{fontWeight: 'bold', padding: '10px', backgroundColor: '#f8f9fa'}}>الصنف:</td>
                <td style={{padding: '10px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <Form.Check type="checkbox" label="ذكر" />
                    <Form.Check type="checkbox" label="أنثى" />
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{fontWeight: 'bold', padding: '10px', backgroundColor: '#f8f9fa'}}>العنوان:</td>
                <td colSpan={3} style={{padding: '10px'}}>
                  <Form.Control
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    style={{border: 'none'}}
                  />
                </td>
              </tr>
              <tr>
                <td style={{fontWeight: 'bold', padding: '10px', backgroundColor: '#f8f9fa'}}>الجنسية:</td>
                <td colSpan={3} style={{padding: '10px'}}>
                  <Form.Control
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    style={{border: 'none'}}
                    placeholder="الجزائرية"
                  />
                </td>
              </tr>
              <tr>
                <td style={{fontWeight: 'bold', padding: '10px', backgroundColor: '#f8f9fa'}}>رقم الإجازة الرياضية للموسم الحالي:</td>
                <td colSpan={3} style={{padding: '10px'}}>
                  <Form.Control
                    type="text"
                    value={formData.sportsLicenseNumber}
                    onChange={(e) => handleInputChange('sportsLicenseNumber', e.target.value)}
                    style={{border: 'none'}}
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </Card>
      </div>

      {/* أزرار التحكم */}
      <div className="text-center mt-4">
        <Button variant="success" className="me-2">
          <i className="fas fa-save me-2"></i>
          حفظ الطلب
        </Button>
        <Button variant="primary" className="me-2">
          <i className="fas fa-print me-2"></i>
          طباعة
        </Button>
        <Button variant="secondary">
          <i className="fas fa-times me-2"></i>
          إلغاء
        </Button>
      </div>
    </Container>
  );
};

export default TransferRequestForm;
