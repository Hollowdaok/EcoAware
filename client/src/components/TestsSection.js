import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const TestsSection = () => (
  <Container className="py-5 bg-light">
    <div className="text-center mb-4">
      <h3 className="text-success">Тести</h3>
      <div className="mx-auto" style={{ 
        width: '80px', 
        height: '3px', 
        backgroundColor: '#198754', 
        marginTop: '10px' 
      }}></div>
    </div>
    <Row>
      <Col md={6} className="mb-4">
        <Card className="h-100 text-center bg-success bg-opacity-10">
          <Card.Body>
            <div style={{ fontSize: '2rem' }}>🧠</div>
            <Card.Title>Тест на рівень екосвідомості</Card.Title>
            <Card.Text>Дізнайтесь свій рівень екологічної свідомості за допомогою знань та звичок.</Card.Text>
            <Button variant="success">Пройти</Button>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} className="mb-4">
        <Card className="h-100 text-center bg-success bg-opacity-10">
          <Card.Body>
            <div style={{ fontSize: '2rem' }}>📝</div>
            <Card.Title>Тест "Екологічні міфи"</Card.Title>
            <Card.Text>Перевірте, які із варіантів екології — факти, а які — поширені міфи.</Card.Text>
            <Button variant="success">Пройти</Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default TestsSection;