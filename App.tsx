import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Details } from './pages/Details';
import { Player } from './pages/Player';
import { SearchPage } from './pages/Search';
import { Library } from './pages/Library';
import { GenrePage } from './pages/GenrePage';
import { ApiKeyModal } from './components/ApiKeyModal';

// Wrapper to conditionally render Header/Footer based on route (hide on player)
const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isPlayer = location.pathname.includes('/watch');

  return (
    <div className="min-h-screen bg-primary text-text font-sans">
      <ApiKeyModal />
      {!isPlayer && <Navbar />}
      <main className={!isPlayer ? "pt-16" : ""}>
        {children}
      </main>
      {!isPlayer && (
        <footer className="bg-secondary py-8 mt-auto border-t border-white/5">
          <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
            <p className="mb-2">&copy; {new Date().getFullYear()} StreamFlow. All rights reserved.</p>
            <p className="text-xs">
              This site does not store any files on its server. All contents are provided by non-affiliated third parties.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<Library />} />
          <Route path="/movies" element={<GenrePage type="movie" />} />
          <Route path="/tv" element={<GenrePage type="tv" />} />
          <Route path="/:type/:id" element={<Details />} />
          <Route path="/:type/:id/watch" element={<Player />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;