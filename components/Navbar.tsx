import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Home, Library, Tv, Film, Magnet } from 'lucide-react';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Movies', path: '/movies', icon: <Film size={18} /> },
    { name: 'TV Shows', path: '/tv', icon: <Tv size={18} /> },
    { name: 'Magnet', path: '/magnet', icon: <Magnet size={18} /> },
    { name: 'Library', path: '/library', icon: <Library size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-highlight tracking-tight flex items-center gap-1">
           Stream<span className="text-white">Flow</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Search & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-secondary text-sm px-4 py-2 rounded-full pl-10 focus:outline-none focus:ring-2 focus:ring-accent w-64 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 text-slate-400" size={16} />
          </form>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-secondary border-b border-white/5 px-4 py-4 animate-fade-in">
          <form onSubmit={handleSearch} className="mb-4 relative">
             <input
              type="text"
              placeholder="Search..."
              className="w-full bg-primary text-sm px-4 py-3 rounded-lg pl-10 focus:outline-none focus:ring-1 focus:ring-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
          </form>
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-3 text-slate-300 hover:text-white px-2 py-2 rounded-md hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};