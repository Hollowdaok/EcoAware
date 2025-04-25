import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const KnowledgeCards = () => (
  <Container className="py-5 bg-white">
    <div className="text-center mb-4">
      <h3 className="text-success">Екологічні знання</h3>
      <div className="mx-auto" style={{ 
        width: '80px', 
        height: '3px', 
        backgroundColor: '#198754', 
        marginTop: '10px' 
      }}></div>
    </div>
    <Row>
      {[...Array(3)].map((_, i) => (
        <Col md={4} key={i} className="mb-4">
          <Card className="bg-success bg-opacity-10">
            <Card.Body>
              <Card.Title>Що таке екологічна свідомість?</Card.Title>
              <Card.Text>
                Екологічна свідомість — це усвідомлення впливу наших дій на довкілля...
              </Card.Text>
              <Button variant="success">Читати далі</Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </Container>
);

export default KnowledgeCards;