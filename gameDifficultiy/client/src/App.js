import React, { useState } from 'react';
import { FaHome, FaBolt, FaChartBar, FaTrophy, FaSignOutAlt } from 'react-icons/fa';
import { RiRobot2Fill } from 'react-icons/ri';
import Game from './components/Game';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Leaderboard from './components/Leaderboard';
import Home from './components/Home';
import { authService } from './services/authService';

function App() {
  const [authMode, setAuthMode] = useState('login');

  const getInitialUser = () => authService.isAuthenticated() ? authService.getCurrentUser() : null;
  const getInitialView = () => {
    const u = authService.isAuthenticated() ? authService.getCurrentUser() : null;
    return u ? (sessionStorage.getItem('currentView') || 'home') : 'auth';
  };

  const [user, setUser] = useState(getInitialUser);
  const [currentView, setCurrentView] = useState(() => {
    const view = getInitialView();
    document.body.style.overflow = view === 'game' ? 'hidden' : '';
    document.body.style.height = view === 'game' ? '100%' : '';
    return view;
  });

  const navigateTo = (view) => {
    sessionStorage.setItem('currentView', view);
    setCurrentView(view);
    // Lock body scroll only during game
    document.body.style.overflow = view === 'game' ? 'hidden' : '';
    document.body.style.height = view === 'game' ? '100%' : '';
  };

  const handleLogin = (userData) => {
    setUser(userData);
    navigateTo('home');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    navigateTo('home');
  };

  const handleLogout = () => {
    authService.logout();
    sessionStorage.removeItem('currentView');
    setUser(null);
    setCurrentView('auth');
    setAuthMode('login');
  };

  const renderAuthView = () => {
    return (
      <div>
        {authMode === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <Register onRegister={handleRegister} onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  };

  const renderMainView = () => {
    return (
      <div style={{ minHeight: currentView === 'game' ? '100vh' : 'auto', overflow: currentView === 'game' ? 'hidden' : 'auto' }}>
        {/* Navigation Bar */}
        {currentView !== 'game' && (
          <nav style={{
            background: 'rgba(5,5,16,0.85)',
            padding: '14px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
                <RiRobot2Fill size={20} color="#00fff7" style={{ filter: 'drop-shadow(0 0 6px #00fff7)' }} />
                <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 3, color: '#fff' }}>AI RUNNER</span>
              </div>

              {[['home', FaHome, 'Home'], ['game', FaBolt, 'Play'], ['dashboard', FaChartBar, 'Dashboard'], ['leaderboard', FaTrophy, 'Leaderboard']].map(([view, Icon, label]) => (
                <button
                  key={view}
                  onClick={() => navigateTo(view)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px',
                    background: currentView === view ? 'rgba(162,89,255,0.15)' : 'transparent',
                    color: currentView === view ? '#a259ff' : 'rgba(255,255,255,0.45)',
                    border: currentView === view ? '1px solid rgba(162,89,255,0.4)' : '1px solid transparent',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '6px 14px' }}>
              <RiRobot2Fill size={13} color="#a259ff" />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, letterSpacing: 1 }}>
                {user?.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px',
                background: 'rgba(255,107,107,0.08)',
                color: '#ff6b6b',
                border: '1px solid rgba(255,107,107,0.25)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: 1,
                transition: 'all 0.2s'
              }}
            >
              <FaSignOutAlt size={12} /> LOGOUT
            </button>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <div style={{ paddingTop: currentView === 'game' ? '0' : (currentView === 'home' ? '0' : '80px'), background: '#050510', minHeight: '100vh' }}>
          {currentView === 'home' && <Home user={user} onNavigate={navigateTo} />}
          {currentView === 'game' && <Game user={user} onNavigate={navigateTo} />}
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'leaderboard' && <Leaderboard />}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {user ? renderMainView() : renderAuthView()}
    </div>
  );
}

export default App;