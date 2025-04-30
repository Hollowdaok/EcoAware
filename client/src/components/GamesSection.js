import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const GamesSection = () => (
  <div className="bg-success bg-opacity-10 py-5">
    <Container>
      <div className="text-center mb-4">
        <h3 className="text-success">Еко-гра</h3>
        <div className="mx-auto" style={{ 
          width: '80px', 
          height: '3px', 
          backgroundColor: '#198754', 
          marginTop: '10px' 
        }}></div>
      </div>
      <Row className="justify-content-center">
        <Col md={6} className="mb-4">
          <Card>
            <div style={{ height: '200px', background: '#ccc' }} /> {/* Placeholder */}
            <Card.Body>
              <Card.Title>Сортуй сміття</Card.Title>
              <Card.Text>Навчіться правильно сортувати відходи в інтерактивній грі!</Card.Text>
              <Button variant="success">Грати</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  </div>
);

export default GamesSection;