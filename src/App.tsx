import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AnimeDetailPage from './pages/AnimeDetail';
import Search from './pages/Search';
import Movies from './pages/Movies';
import Latest from './pages/Latest'; 
import AllAnime from './pages/AllAnime';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/anime/:id" element={<AnimeDetailPage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/latest" element={<Latest />} />
	<Route path="/all-anime" element={<AllAnime />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
