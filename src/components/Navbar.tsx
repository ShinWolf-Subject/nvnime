import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiHome, FiFilm, FiMenu, FiX, FiGrid } from 'react-icons/fi';
import { MdLocalMovies } from 'react-icons/md';

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const navItems = [
    { path: '/', label: 'Beranda', icon: <FiHome /> },
    { path: '/movies', label: 'Movie', icon: <MdLocalMovies /> },
    { path: '/all-anime', label: 'All', icon: <FiGrid /> },
    { path: '/latest', label: 'Terbaru', icon: <FiFilm /> },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-effect">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mr-2">
            <div className="w-10 h-10 nvrg rounded-lg flex items-center justify-center">
              <FiFilm className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold tgr nvrg">NvNime</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari anime..."
                className="w-full px-4 py-2 pl-12 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition-all"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
	      {/*
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-1 py-1 bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
              >
	        <FiSearch className="text-gray-400" />
              </button>
	      */}
            </div>
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-primary-400"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4"
          >
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari anime..."
                  className="w-full px-4 py-2 pl-12 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-dark-800 transition-colors"
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
