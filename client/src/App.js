import React from 'react';
import NavBar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import KnowledgeCards from './components/KnowledgeCards';
import GamesSection from './components/GamesSection';
import TestsSection from './components/TestsSection';
import Footer from './components/Footer';

const App = () => (
  <>
    <NavBar />
    <HeroSection />
    <FeaturesSection />
    <KnowledgeCards />
    <GamesSection />
    <TestsSection />
    <Footer />
  </>
);

export default App;
