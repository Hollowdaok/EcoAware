import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const features = [
  { title: "База знань", desc: "Вивчайте корисні поради, тести та поняття пов'язані з екологічним життям.", icon: "📚" },
  { title: "Еко-гра", desc: "Інтерактивні міні-ігри для розвитку навичок екосвідомого життя.", icon: "🎮" },
  { title: "Тести", desc: "Перевірте свої знання, пройдіть тести та отримайте персональні рекомендації.", icon: "📝" },
  { title: "Досягнення", desc: "Заробляйте бали та потрапляйте в таблицю рекордів.", icon: "🏆" },
];

const FeaturesSection = () => (
  <div className="bg-success bg-opacity-10 py-5">
    <Container>
      <div className="text-center mb-4">
        <h3 className="text-success">Що ми пропонуємо</h3>
        <div className="mx-auto" style={{ 
          width: '80px', 
          height: '3px', 
          backgroundColor: '#198754', 
          marginTop: '10px' 
        }}></div>
      </div>
      <Row>
        {features.map((f, i) => (
          <Col md={3} className="mb-4" key={i}>
            <Card className="h-100 text-center">
              <Card.Body>
                <div style={{ fontSize: '2rem' }}>{f.icon}</div>
                <Card.Title className="mt-3">{f.title}</Card.Title>
                <Card.Text>{f.desc}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  </div>
);

export default FeaturesSection;