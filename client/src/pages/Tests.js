import React from 'react';
import { Container, Row, Col, Form, Button, Card, Badge } from 'react-bootstrap';
import '../styles/EcoTests.css';

const EcoTestsPage = () => {
  const categories = [
    { name: 'Відходи', count: 8 },
    { name: 'Вода', count: 7 },
    { name: 'Енергія', count: 6 },
    { name: 'Транспорт', count: 3 },
    { name: 'Споживання', count: 5 },
    { name: 'Біорізноманіття', count: 5 },
    { name: 'Зміна клімату', count: 4 }
  ];

  const tests = [
    {
      category: 'Вода',
      title: 'Водні ресурси',
      description: 'Тест на знання значення водних ресурсів та способів їх збереження в побуті та промисловості.',
      questions: 15,
      time: '~12 хвилин'
    },
    {
      category: 'Відходи',
      title: 'Сортування відходів',
      description: 'Тест на знання правильного сортування різних типів відходів та їх утилізації.',
      questions: 10,
      time: '~7 хвилин'
    }
  ];

  return (
    <>
      {/* Hero Banner */}
      <div className="bg-secondary text-light py-5 text-center hero-section">
        <Container>
          <h1 className="display-4 mb-3">Екологічні тести</h1>
          <p className="lead mx-auto" style={{ maxWidth: '800px' }}>
            Перевірте свої знання, відкрийте нове і підвищіть рівень екологічної свідомості
          </p>
        </Container>
      </div>

      {/* Search Section */}
      <Container className="my-5 text-center">
        <h2 className="text-success mb-4">Пошук екологічних тестів</h2>
        <Row className="justify-content-center">
          <Col md={8}>
            <Form className="d-flex">
              <Form.Control
                type="search"
                placeholder="Що ви хочете пройти? Напр.: сортування сміття, екослід..."
                className="me-2"
                aria-label="Search"
              />
              <Button variant="success">Шукати</Button>
            </Form>
          </Col>
        </Row>
      </Container>

      {/* Tests Section */}
      <div className="bg-light py-5">
        <Container>
          <Row>
            {/* Categories Sidebar */}
            <Col md={3}>
              <div className="categories-box p-3 bg-white rounded">
                <h5 className="border-bottom pb-2 mb-3">Категорії</h5>
                <ul className="list-unstyled">
                  {categories.map((category, index) => (
                    <li key={index} className="d-flex justify-content-between align-items-center mb-2">
                      <span>{category.name}</span>
                      <Badge bg="light" text="dark" className="rounded-pill" style={{ backgroundColor: '#e8f5e9' }}>
                        {category.count}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Tests Grid */}
            <Col md={9}>
              <Row>
                {tests.map((test, index) => (
                  <Col md={6} key={index} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="d-flex flex-column">
                        <Badge bg="light" text="success" className="align-self-start mb-2" style={{ backgroundColor: '#e8f5e9' }}>
                          {test.category}
                        </Badge>
                        <Card.Title className="fw-bold">{test.title}</Card.Title>
                        <Card.Text>{test.description}</Card.Text>
                        <div className="mt-auto d-flex justify-content-between text-muted small mb-3">
                          <span>{test.questions} питань</span>
                          <span>{test.time}</span>
                        </div>
                        <Button variant="success" className="w-100">Пройти тест</Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default EcoTestsPage;