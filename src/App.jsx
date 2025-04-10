import React, { useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx'; 
import { ToastContainer, toast } from 'react-toastify';
import logo from './assets/boxVehiqr.png';

import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.min.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  useEffect(() => {
    document.title = "VehiQR-Spot";
  }, []);

  return (
    <>
    <ToastContainer />
    <Router>
      <Routes>
        
        <Route path="/" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/Dashboard/Home" replace />} />
        <Route path="/Dashboard/*" element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  </>
  );
}

export default App;
