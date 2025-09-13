import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import CreateClubForm from '../../components/admin/CreateClubForm';

const CreateClubPage: React.FC = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header as="h4" className="text-center bg-primary text-white">
              لوحة تحكم المشرف - إنشاء نادي جديد
            </Card.Header>
            <Card.Body>
              <CreateClubForm />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateClubPage;
