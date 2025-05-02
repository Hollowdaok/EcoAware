import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Spinner } from 'react-bootstrap';
import '../styles/ArticleDetail.css';
// Імпортуємо трекер для відстеження перегляду статей
import ViewedArticleTracker from '../components/tracking/ViewedArticleTracker';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/articles/${id}`);
        
        if (!response.ok) {
          throw new Error('Не вдалося завантажити статтю');
        }
        
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('uk-UA', options);
  };

  const renderContent = (content) => {
    const formattedContent = content
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('# ')) {
          return <h1 key={index} className="mt-4 mb-3">{paragraph.substring(2)}</h1>;
        } else if (paragraph.startsWith('## ')) {
          return <h2 key={index} className="mt-4 mb-3">{paragraph.substring(3)}</h2>;
        } else if (paragraph.startsWith('### ')) {
          return <h3 key={index} className="mt-4 mb-3">{paragraph.substring(4)}</h3>;
        } else if (paragraph.startsWith('- ')) {
          return (
            <ul key={index} className="mb-3">
              {paragraph.split('\n').map((item, itemIndex) => 
                <li key={itemIndex}>{item.substring(2)}</li>
              )}
            </ul>
          );
        } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return <p key={index} className="mb-3 fw-bold">{paragraph.substring(2, paragraph.length - 2)}</p>;
        } else {
          return <p key={index} className="mb-3">{paragraph}</p>;
        }
      });
      
    return <div className="article-content">{formattedContent}</div>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Завантаження статті...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <div className="alert alert-danger">
          <h4>Помилка завантаження</h4>
          <p>{error}</p>
          <Link to="/knowledge" className="btn btn-outline-secondary mt-3">
            Повернутися до списку статей
          </Link>
        </div>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container className="py-5 text-center">
        <div className="alert alert-warning">
          <h4>Статтю не знайдено</h4>
          <p>Обрана стаття не існує або була видалена.</p>
          <Link to="/knowledge" className="btn btn-outline-secondary mt-3">
            Повернутися до списку статей
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <>
      {/* Додаємо компонент відстеження перегляду статті */}
      <ViewedArticleTracker 
        articleId={article._id} 
        title={article.title} 
        category={article.category} 
      />
        
      {/* Hero Banner */}
      <div className="article-hero py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <div className="d-flex align-items-center mb-4">
                <Link to="/knowledge" className="btn btn-outline-light me-3">
                  Назад до списку
                </Link>
                <Badge 
                  bg="light" 
                  className="px-3 py-2" 
                  style={{ fontSize: '0.85rem', color: '#198754' }}
                >
                  {article.category}
                </Badge>
              </div>
              
              <h1 className="display-5 fw-bold text-light mb-3">{article.title}</h1>
              <div className="d-flex align-items-center text-light opacity-75 small">
                <span className="me-3">
                  <i className="bi bi-calendar3 me-1"></i> {formatDate(article.date)}
                </span>
                <span>
                  <i className="bi bi-clock me-1"></i> Час читання: {article.readTime}
                </span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Article Content */}
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <div className="bg-white p-4 p-md-5 rounded shadow-sm article-container">
              {article.imageUrl && (
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="img-fluid rounded mb-4 w-100 article-image"
                />
              )}
              {renderContent(article.content)}
              
              <hr className="my-5" />
              
              {/* Article Footer */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <div className="mb-3 mb-md-0">
                  <Link to="/knowledge" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left"></i> Всі статті
                  </Link>
                </div>
              </div>
            </div>

          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ArticleDetail;