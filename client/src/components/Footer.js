import React from 'react';
import logo from '../assets/images/Icon.png';

const Footer = () => (
  <footer className="bg-success text-light py-4 mt-5">
    <div className="container">
      <div className="d-flex justify-content-center align-items-center flex-column">
        {/* Логотип */}
        <div className="text-center mb-3">
          <img src={logo} alt="EcoAware logo" height="100" />
        </div>

        {/* Меню біля лого */}
        <div className="text-center mb-3">
          <ul className="list-inline mb-0">
            <li className="list-inline-item mx-2">Контакти</li>
            <li className="list-inline-item mx-2">Про проект</li>
            <li className="list-inline-item mx-2">Зворотній зв'язок</li>
            <li className="list-inline-item mx-2">Політика конфіденційності</li>
          </ul>
        </div>

        {/* Авторські права */}
        <div className="text-center mt-2">
          <p className="mb-0">© 2025 ЕкоСвідомість. Усі права захищено.</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;