import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar';
import Home from './pages/Home';
import EcoKnowledge from './pages/EcoKnowledge';
import Tests from './pages/Tests';
import EcoGames from './pages/EcoGames';
import Footer from './components/Footer';

const App = () => (
  <Router>
    <NavBar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/knowledge" element={<EcoKnowledge />} />
      <Route path="/tests" element={<Tests />} />
      <Route path="/games" element={<EcoGames />} />
    </Routes>
    <Footer />
  </Router>
);

export default App;