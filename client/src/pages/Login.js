// src/pages/Login.js
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Отримання параметра redirect з URL, якщо він є
  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Виклик функції login з контексту авторизації
      await login(formData.username, formData.password);
      
      // Перенаправлення на попередню сторінку або головну
      navigate(redirectPath);
    } catch (err) {
      console.error('Помилка авторизації:', err);
      setError(err.message || 'Помилка авторизації. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header as="h4" className="text-center py-3 bg-success text-white">
              Вхід до аккаунту
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Логін або Email</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Введіть ваш логін або email"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Введіть ваш пароль"
                    required
                  />
                </Form.Group>
                
                <div className="d-grid">
                  <Button 
                    type="submit" 
                    variant="success" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Авторизація...' : 'Увійти'}
                  </Button>
                </div>
              </Form>
              
              <div className="text-center mt-4">
                <p>
                  Не маєте облікового запису?{' '}
                  <Link to={`/register${redirectPath !== '/' ? `?redirect=${redirectPath}` : ''}`} className="text-decoration-none">
                    Зареєструватися
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;