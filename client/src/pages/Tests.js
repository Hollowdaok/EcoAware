import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/EcoTests.css';

const EcoTestsPage = () => {
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        
        const testsResponse = await fetch('http://localhost:5000/api/tests');
        
        if (!testsResponse.ok) {
          throw new Error('Не вдалося завантажити тести');
        }
        
        const testsData = await testsResponse.json();
        setTests(testsData);
        
        // Витягування унікальних категорій та їх підрахунок
        const categoryMap = testsData.reduce((acc, test) => {
          const category = test.category;
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
    
    fetchTests();
  }, []);

  // Фільтрація тестів на основі пошуку та категорії
  const filteredTests = tests.filter(test => {
    const matchesSearch = searchTerm === '' || 
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === null || test.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Обробка пошуку
  const handleSearch = (e) => {
    e.preventDefault();
    // Пошук обробляється функцією filteredTests
  };

  // Обробка вибору категорії
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName === selectedCategory ? null : categoryName);
  };

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
            <Form className="d-flex" onSubmit={handleSearch}>
              <Form.Control
                type="search"
                placeholder="Що ви хочете пройти? Напр.: сортування сміття, екослід..."
                className="me-2"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form>
          </Col>
        </Row>
      </Container>

      {/* Tests Section */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-success text-center mb-4">
            Екологічні тести
            <div className="green-underline mx-auto mt-2"></div>
          </h2>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-3">Завантаження тестів...</p>
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

              {/* Tests Grid */}
              <Col md={9}>
                {filteredTests.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">Тести не знайдено. Спробуйте змінити критерії пошуку.</p>
                  </div>
                ) : (
                  <Row>
                    {filteredTests.map((test, index) => (
                      <Col md={6} key={test._id || index} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm">
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
                              <span>{test.questionCount} питань</span>
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
                )}
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </>
  );
};

export default EcoTestsPage;