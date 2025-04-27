import React from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import '../styles/EcoGames.css';

const EcoGamesPage = () => {
  const games = [
    {
      title: 'Сортуй сміття',
      difficulty: 'Легка',
      description: 'Навчіться правильно сортувати відходи в інтерактивній грі з різними рівнями складності. Дізнайтеся, які матеріали підлягають переробці, а які ні.',
      image: '/placeholder-game.jpg'
    },
    {
      title: 'Сортуй сміття',
      difficulty: 'Легка',
      description: 'Навчіться правильно сортувати відходи в інтерактивній грі з різними рівнями складності. Дізнайтеся, які матеріали підлягають переробці, а які ні.',
      image: '/placeholder-game.jpg'
    },
    {
      title: 'Екологічний транспорт',
      difficulty: 'Середня',
      description: 'Дізнайтеся про вплив різних видів транспорту на довкілля та знайдіть найбільш екологічні варіанти пересування містом.',
      image: '/placeholder-game.jpg'
    },
    {
      title: 'Економія води',
      difficulty: 'Легка',
      description: 'Вивчіть прості способи економії води в повсякденному житті через інтерактивні завдання та головоломки.',
      image: '/placeholder-game.jpg'
    }
  ];

  return (
    <>
      {/* Hero Banner */}
      <div className="bg-secondary hero-section">
        <Container className="py-5 text-center text-light">
          <h1 className="display-4 mb-3">Еко-ігри</h1>
          <p className="lead mx-auto">
            Інтерактивні екологічні ігри для розвитку екосвідомості та 
            екологічної грамотності в ігровій формі
          </p>
        </Container>
      </div>

      {/* Games Grid */}
      <div className="games-section">
        <Container className="py-5">
          <Row>
            {games.map((game, index) => (
              <Col lg={6} md={6} key={index} className="mb-4">
                <Card className="game-card h-100 border-0">
                  <div className="game-image-placeholder"></div>
                  <Card.Body>
                    <Card.Title className="game-title">{game.title}</Card.Title>
                    <div className="difficulty mb-3">
                      <span className="text-muted">Складність: </span>
                      <span>{game.difficulty}</span>
                    </div>
                    <Card.Text>{game.description}</Card.Text>
                    <Button variant="success" className="play-button">
                      Грати
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Navigation Bar would be in the App component or a separate Navbar component */}
    </>
  );
};

export default EcoGamesPage;