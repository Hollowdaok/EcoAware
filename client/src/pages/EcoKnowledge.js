import React from 'react';
import { Container, Row, Col, Form, Button, Card, Badge } from 'react-bootstrap';
import '../styles/EcoKnowledge.css';


const EcoKnowledgePage = () => {
  const categories = [
    { name: 'Відходи', count: 8 },
    { name: 'Вода', count: 7 },
    { name: 'Енергія', count: 6 },
    { name: 'Транспорт', count: 3 },
    { name: 'Споживання', count: 5 },
    { name: 'Біорізноманіття', count: 5 },
    { name: 'Зміна клімату', count: 4 }
  ];

  const articles = [
    {
      category: 'Енергія',
      title: 'Енергозбереження вдома: 10 простих способів зменшити споживання',
      description: 'Прості та доступні методи економії електроенергії, що допоможуть зменшити витрати та знизити вплив на довкілля.',
      date: '9 квітня 2025',
      readTime: '6 хв'
    },
    {
      category: 'Відходи',
      title: 'Сортування сміття: покрокова інструкція для початківців',
      description: 'Як правильно розділяти сміття для переробки, компостування та утилізації. Практичні поради для щоденного використання.',
      date: '10 квітня 2025',
      readTime: '5 хв'
    }
  ];

  return (
    <>
      {/* Hero Banner */}
      <div className="bg-secondary text-light py-5 text-center hero-section">
        <Container>
          <h1 className="display-4 mb-3">Екологічні знання</h1>
          <p className="lead mx-auto" style={{ maxWidth: '800px' }}>
            Вичерпна інформація про екологічні поняття, проблеми та практичні поради 
            для свідомого життя. Дізнайтеся більше про навколишнє середовище та як ми 
            можемо його захистити.
          </p>
        </Container>
      </div>

      {/* Search Section */}
      <Container className="my-5 text-center">
        <h2 className="text-success mb-4">Пошук екологічних знань</h2>
        <Row className="justify-content-center">
          <Col md={8}>
            <Form className="d-flex">
              <Form.Control
                type="search"
                placeholder="Що ви хочете дізнатись? Напр.: сортування сміття, екослід..."
                className="me-2"
                aria-label="Search"
              />
              <Button variant="success">Шукати</Button>
            </Form>
          </Col>
        </Row>
      </Container>

      {/* Articles Section */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-success text-center mb-4">
            Корисні статті
            <div className="green-underline mx-auto mt-2"></div>
          </h2>

          <Row>
            {/* Categories Sidebar */}
            <Col md={3}>
              <div className="categories-box p-3 bg-white rounded">
                <h5 className="border-bottom pb-2 mb-3">Категорії</h5>
                <ul className="list-unstyled">
                  {categories.map((category, index) => (
                    <li key={index} className="d-flex justify-content-between align-items-center mb-2">
                      <span>{category.name}</span>
                      <Badge bg="light" text="dark" className="rounded-pill bg-light-green">
                        {category.count}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Articles Grid */}
            <Col md={9}>
              <Row>
                {articles.map((article, index) => (
                  <Col md={6} key={index} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="d-flex flex-column">
                        <Badge bg="light" text="success" className="align-self-start mb-2">
                          {article.category}
                        </Badge>
                        <Card.Title className="fw-bold">{article.title}</Card.Title>
                        <Card.Text>{article.description}</Card.Text>
                        <div className="mt-auto d-flex justify-content-between text-muted small">
                          <span>{article.date}</span>
                          <span>Час читання: {article.readTime}</span>
                        </div>
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

export default EcoKnowledgePage;