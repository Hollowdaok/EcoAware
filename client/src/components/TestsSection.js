import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const TestsSection = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRandomTests = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('http://localhost:5000/api/tests');
        
        if (!response.ok) {
          throw new Error('Не вдалося завантажити тести');
        }
        
        const data = await response.json();
        
        // Перемішуємо масив та беремо перші 3 тести
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setTests(shuffled.slice(0, 3));
        
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError(err.message);
        
        // Використовуємо моковані дані як запасний варіант
        setTests([
          {
            _id: '1',
            category: 'Вода',
            title: 'Водні ресурси',
            description: 'Тест на знання значення водних ресурсів та способів їх збереження в побуті та промисловості.',
            questionCount: 10,
            estimatedTime: '~12 хвилин',
            difficulty: 'середній'
          },
          {
            _id: '2',
            category: 'Відходи',
            title: 'Сортування відходів',
            description: 'Тест на знання правильного сортування різних типів відходів та їх утилізації.',
            questionCount: 5,
            estimatedTime: '~7 хвилин',
            difficulty: 'легкий'
          },
          {
            _id: '3',
            category: 'Енергія',
            title: 'Відновлювані джерела енергії',
            description: 'Перевірте свої знання про різні типи відновлюваних джерел енергії, їх переваги та недоліки.',
            questionCount: 8,
            estimatedTime: '~10 хвилин',
            difficulty: 'середній'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRandomTests();
  }, []);

  if (loading) {
    return (
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">Екологічні тести</h2>
          <p className="text-center text-muted">Завантаження тестів...</p>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <h2>Екологічні тести</h2>
          <Link to="/tests" className="btn btn-outline-success">
            Всі тести <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        
        <Row>
          {tests.map((test, index) => (
            <Col md={4} key={test._id || index} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-card">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <Badge bg="light" text="success" className="me-2">
                      {test.category}
                    </Badge>
                    <Badge bg="light" text="secondary">
                      {test.difficulty}
                    </Badge>
                  </div>
                  <Card.Title className="fw-bold">{test.title}</Card.Title>
                  <Card.Text>{test.description}</Card.Text>
                  <div className="mt-auto d-flex justify-content-between text-muted small mb-3">
                    <span>{test.questionCount || 0} питань</span>
                    <span>{test.estimatedTime}</span>
                  </div>
                  <Link to={`/tests/${test._id}`}>
                    <Button variant="success" className="w-100">Пройти тест</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default TestsSection;