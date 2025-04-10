import React, { useState } from 'react';
import { BsGrid1X2Fill, BsListCheck } from 'react-icons/bs';
import { FaCar, FaUser } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { RiUserSettingsFill } from "react-icons/ri";
import vehiqr from './Image/vehiqr.png';
import { Link } from 'react-router-dom';

import '../src/style/HeadAndSide.css';

function Sidebar({ openSidebarToggle, OpenSidebar, onLogout }) {
  const [showPasswordOption, setShowPasswordOption] = useState(false);


  return (
    <aside id="sidebar" className={openSidebarToggle ? 'sidebar-responsive' : ''}>
      <div className="sidebar-title">
        <div className="sidebar-brand">
          <img src={vehiqr} alt="vehiqr" className="vehiqrlogo" />
        </div>
      </div>
      <ul className="sidebar-list">
        <li className="s-list-item">
          <Link to="/Dashboard/Home">
            <BsGrid1X2Fill className="icon" /> Overview
          </Link>
        </li>
        <li className="s-list-item">
          <Link to="/Dashboard/VehicleManagement">
            <FaCar className="icon" /> Vehicle Management
          </Link>
        </li>
        <li className="s-list-item">
          <Link to="/Dashboard/UserManagement">
            <FaUser className="icon" /> User Management
          </Link>
        </li>
        <li className="s-list-item">
        <Link to="/Dashboard/Settings">
            <RiUserSettingsFill className="icon" />Settings
          </Link>
        </li>
        <li className="s-list-item" onClick={onLogout}>
          <FiLogOut className="icon" /> Log out
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
