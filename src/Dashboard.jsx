import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import '../src/App.css';
import { auth } from '../firebaseConfig.js';
import { signOut } from 'firebase/auth'; 

import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import Home from './Home.jsx';
import UserManagement from './UserManagement.jsx';
import VehicleManagement from './VehicleManagement.jsx';
import Settings from './Settings.jsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function Dashboard({onLogout}) {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const navigate = useNavigate();

  const handleSidebarToggle = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  const handleLogout = async () => {
    try {
    toast.info('Logging out...', {
      position: "top-right",
      autoClose: 1000,  
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });

      await signOut(auth);
      console.log('User logged out');

      setTimeout(() => {
        onLogout(); 
        navigate('/');
      }, 2000);  
    } catch (error) {
      console.error('Error logging out:', error);
  
      toast.error(`Error logging out: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,  
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }
  };
  return (
    <div className="grid-container-home">
      <Sidebar openSidebarToggle={openSidebarToggle} onLogout={handleLogout} />
      <Header OpenSidebar={handleSidebarToggle} />
      
      <div className="main-content">
        <Routes>
          <Route path="Home" element={<Home />} />
          <Route path="UserManagement" element={<UserManagement />} />
          <Route path="VehicleManagement" element={<VehicleManagement />} />
          <Route path="Settings" element={<Settings />} />
          <Route path="*" element={<Home />} /> 
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
