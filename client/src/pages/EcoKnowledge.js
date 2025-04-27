import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/EcoKnowledge.css';

const EcoKnowledgePage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        
        const articlesResponse = await fetch('http://localhost:5000/api/articles');
        
        if (!articlesResponse.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const articlesData = await articlesResponse.json();
        setArticles(articlesData);
        
        const categoryMap = articlesData.reduce((acc, article) => {
          const category = article.category;
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        
        const categoryArray = Object.entries(categoryMap).map(([name, count]) => ({
          name,
          count
        }));
        
        setCategories(categoryArray);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('uk-UA', options);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === null || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName === selectedCategory ? null : categoryName);
  };

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
            <Form className="d-flex" onSubmit={handleSearch}>
              <Form.Control
                type="search"
                placeholder="Що ви хочете дізнатись? Напр.: сортування сміття, екослід..."
                className="me-2"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="success" type="submit">Шукати</Button>
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

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-3">Завантаження статей...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <h4>Помилка завантаження</h4>
              <p>{error}</p>
            </div>
          ) : (
            <Row>
              {/* Categories Sidebar */}
              <Col md={3}>
                <div className="categories-box p-3 bg-white rounded">
                  <h5 className="border-bottom pb-2 mb-3">Категорії</h5>
                  <ul className="list-unstyled">
                    {categories.map((category, index) => (
                      <li 
                        key={index} 
                        className={`d-flex justify-content-between align-items-center mb-2 category-item ${selectedCategory === category.name ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(category.name)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span>{category.name}</span>
                        <Badge bg="light" text="dark" className="rounded-pill bg-light-green">
                          {category.count}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                  {selectedCategory && (
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="mt-3 w-100"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Скинути фільтр
                    </Button>
                  )}
                </div>
              </Col>

              {/* Articles Grid */}
              <Col md={9}>
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">Статті не знайдено. Спробуйте змінити критерії пошуку.</p>
                  </div>
                ) : (
                  <Row>
                    {filteredArticles.map((article, index) => (
                      <Col md={6} key={index} className="mb-4">
                        <Link to={`/knowledge/article/${article._id}`} className="text-decoration-none">
                          <Card className="h-100 border-0 shadow-sm article-card">
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
                              <Badge bg="light" text="success" className="align-self-start mb-2">
                                {article.category}
                              </Badge>
                              <Card.Title className="fw-bold text-dark">{article.title}</Card.Title>
                              <Card.Text className="text-secondary">{article.description}</Card.Text>
                              <div className="mt-auto d-flex justify-content-between text-muted small">
                                <span>{formatDate(article.date)}</span>
                                <span>Час читання: {article.readTime}</span>
                              </div>
                            </Card.Body>
                          </Card>
                        </Link>
                      </Col>
                    ))}
                  </Row>
                )}
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </>
  );
};

export default EcoKnowledgePage;