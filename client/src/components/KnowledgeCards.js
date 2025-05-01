import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const KnowledgeCards = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRandomArticles = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('http://localhost:5000/api/articles');
        
        if (!response.ok) {
          throw new Error('Не вдалося завантажити статті');
        }
        
        const data = await response.json();
        
        // Перемішуємо масив та беремо перші 3 статті
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setArticles(shuffled.slice(0, 3));
        
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRandomArticles();
  }, []);

  // Функція форматування дати
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('uk-UA', options);
  };

  if (loading) {
    return (
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Екологічні знання</h2>
          <p className="text-center text-muted">Завантаження статей...</p>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Екологічні знання</h2>
          <div className="alert alert-danger">
            <p>Помилка завантаження статей: {error}</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-5 bg-light">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <h2>Екологічні знання</h2>
          <Link to="/knowledge" className="btn btn-outline-success">
            Всі статті <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        
        <Row>
          {articles.map((article, index) => (
            <Col md={4} key={article._id || index} className="mb-4">
              <Link to={`/knowledge/article/${article._id}`} className="text-decoration-none">
                <Card className="h-100 border-0 shadow-sm hover-card">
                  {article.imageUrl && (
                    <div 
                      className="article-image-preview" 
                      style={{ 
                        backgroundImage: `url(${article.imageUrl})`,
                        height: '160px',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderTopLeftRadius: 'calc(0.375rem - 1px)',
                        borderTopRightRadius: 'calc(0.375rem - 1px)'
                      }}
                    />
                  )}
                  
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-center mb-2">
                      <Badge bg="light" text="success" className="me-2">
                        {article.category}
                      </Badge>
                    </div>
                    <Card.Title className="fw-bold text-dark">{article.title}</Card.Title>
                    <Card.Text className="text-secondary">{article.description}</Card.Text>
                    <div className="mt-auto d-flex justify-content-between text-muted small">
                      <span>{formatDate(article.date)}</span>
                      <span>Читати: {article.readTime}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default KnowledgeCards;