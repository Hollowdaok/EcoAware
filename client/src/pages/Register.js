import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  
  // Отримання параметра redirect з URL, якщо він є
  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    
    // Клієнтська валідація
    const validationErrors = [];
    if (formData.password !== formData.confirmPassword) {
      validationErrors.push({ msg: 'Паролі не співпадають' });
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }
    
    try {
      // Використання функції register з контексту авторизації
      await register(formData);
      
      // Перенаправлення на сторінку з редіректом або головну
      navigate(redirectPath);
    } catch (err) {
      console.error('Помилка реєстрації:', err);
      setErrors([{ msg: err.message || 'Помилка реєстрації. Спробуйте ще раз.' }]);
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
              Реєстрація
            </Card.Header>
            <Card.Body className="p-4">
              {errors.length > 0 && (
                <Alert variant="danger">
                  <ul className="mb-0">
                    {errors.map((error, index) => (
                      <li key={index}>{error.msg}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Логін</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Введіть логін"
                    required
                  />
                  <Form.Text className="text-muted">
                    Мінімум 3 символи, буде використовуватись для входу
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Введіть email"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Створіть пароль"
                    required
                  />
                  <Form.Text className="text-muted">
                    Мінімум 6 символів
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Підтвердження пароля</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Підтвердіть пароль"
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
                    {loading ? 'Реєстрація...' : 'Зареєструватися'}
                  </Button>
                </div>
              </Form>
              
              <div className="text-center mt-4">
                <p>
                  Вже маєте обліковий запис?{' '}
                  <Link to={`/login${redirectPath !== '/' ? `?redirect=${redirectPath}` : ''}`} className="text-decoration-none">
                    Увійти
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

export default Register;