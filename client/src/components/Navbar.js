// src/components/Navbar.js
import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavBar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // Обробник виходу з системи
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Помилка виходу з системи:', error);
    }
  };

  return (
    <Navbar 
      bg="success" 
      variant="dark" 
      expand="lg"
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
    >
      <Container>
        <Navbar.Brand as={Link} to="/">EcoAware</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>Головна</Nav.Link>
            <Nav.Link as={Link} to="/knowledge" onClick={() => setExpanded(false)}>Екознання</Nav.Link>
            <Nav.Link as={Link} to="/tests" onClick={() => setExpanded(false)}>Тести</Nav.Link>
            <Nav.Link as={Link} to="/games/trash-sorting" onClick={() => setExpanded(false)}>Гра</Nav.Link>
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              // Меню для авторизованого користувача
              <NavDropdown 
                title={currentUser ? currentUser.username : 'Користувач'} 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)}>
                  Мій профіль
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => { handleLogout(); setExpanded(false); }}>
                  Вийти
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              // Кнопки для неавторизованого користувача
              <>
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-light" 
                  className="me-2"
                  onClick={() => setExpanded(false)}
                >
                  Увійти
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="light"
                  onClick={() => setExpanded(false)}
                >
                  Зареєструватися
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;