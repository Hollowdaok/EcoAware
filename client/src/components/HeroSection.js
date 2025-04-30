import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-secondary bg-opacity-25 text-center py-5">
      <h2 className="fw-bold mb-3">Підвищуємо екологічну свідомість разом</h2>
      <p className="lead mx-auto" style={{ maxWidth: '600px' }}>
        Розпочніть свій шлях до екосвідомого життя. Реєструйтесь, здобувайте знання, грайте в ігри та ставайте частиною спільноти.
      </p>
      {!isAuthenticated && (
        <Link to="/register" className="btn btn-success btn-lg mt-3">
          Створити акаунт
        </Link>
      )}
    </div>
  );
};

export default HeroSection;