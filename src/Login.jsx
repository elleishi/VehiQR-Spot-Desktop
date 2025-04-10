import React, { useState } from 'react';
import vehiqr2 from './Image/vehiqrLogo.png';  
import top from './Image/adminTop.png'; 
import bottom from './Image/adminBot.png'; 
import { useNavigate } from 'react-router-dom';
import '../src/style/Login.css';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault(); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);  
      
      toast.info('Logging in. Please wait...', {
        position: "top-right",
        autoClose: 2000,  
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      const userDocRef = doc(db, 'user', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data:', userData);

        if (userData.role === 'Admin') {
          toast.success('Welcome, Admin!', {
            position: "top-right",
            autoClose: 3200,  
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
          });

          onLogin();

          setTimeout(() => {
            navigate('/Dashboard');
          }, 3000);
        } else {
          toast.error('Access Denied: You do not have admin privileges.', {
            position: "top-right",
            autoClose: 3000,  
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
          });
        }
      } else {
        toast.error('User data not found.', {
          position: "top-right",
          autoClose: 3000,  
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error logging in:', error);

      toast.error(`Login Failed: ${error.message}`, {
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
    <div className="login-page">
      <div className="login-header">
      <img src={top} alt="top-background" className="top-background" />

      <div className="login-logo">
        <img src={vehiqr2} alt="vehiqr2" className="logo-image" />
      </div>
    </div>
      <div className="login-container">
        <div className="login-form">
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="login-button">
              <button type="submit">LOG IN</button>
            </div>
          </form>
        </div>
      </div>

      <img src={bottom} alt="bottom-background" className="bottom-background" />
    </div>
  );
};

export default Login;
