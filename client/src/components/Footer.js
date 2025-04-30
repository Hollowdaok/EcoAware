import React from 'react';
import logo from '../assets/images/Icon.png';

const Footer = () => (
  <footer className="bg-success text-light py-4">
    <div className="container">
      <div className="d-flex justify-content-center align-items-center flex-column">
        {/* Логотип */}
        <div className="text-center mb-3">
          <img src={logo} alt="EcoAware logo" height="100" />
        </div>

        {/* Авторські права */}
        <div className="text-center mt-2">
          <p className="mb-0">© 2025 EcoAware</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;