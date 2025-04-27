import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import logo from '../assets/images/Icon.png';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';

const NavBar = () => (
  <Navbar expand="lg" sticky="top" className="custom-navbar bg-success">
    <Container>
      <Navbar.Brand href="#" className="text-white">
        <img
          src={logo}
          alt="EcoAware logo"
          height="30"
          className="d-inline-block align-top"
        />{' '}
        EcoAware
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="me-auto">
        <Nav.Link as={Link} to="/" className="nav-link-custom">Головна</Nav.Link>
        <Nav.Link as={Link} to="/knowledge" className="nav-link-custom">Екознання</Nav.Link>
        <Nav.Link as={Link} to="/tests" className="nav-link-custom">Тести</Nav.Link>
        <Nav.Link as={Link} to="/games" className="nav-link-custom">Еко-ігри</Nav.Link>
          <Nav.Link href="#" className="nav-link-custom">Про проект</Nav.Link>
        </Nav>
        <Nav>
          <Button variant="outline-light" className="me-2">Увійти</Button>
          <Button variant="light" className="registration-btn text-success">Реєстрація</Button>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default NavBar;