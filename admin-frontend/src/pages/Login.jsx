import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdEmail } from 'react-icons/md';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';
import Alert from 'react-bootstrap/Alert';

import '../styles/Login.css';

const redirectUrl = window.location.origin;
// const redirectUrl = 'https://admin-ajride.delightcoders.com/dashboard';
const allowedAdmins  = import.meta.env.VITE_ADMIN_EMAIL;

// List of allowed admin emails
// const allowedAdmins = [adminEmail];

console.log("allowedAdmins",allowedAdmins)
export default function Adminlogin() {
  const navigate = useNavigate();
  const { client } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  console.log("dashh",client)

  // Redirect if already logged in
  useEffect(() => {
    if (client == "admin") navigate('/dashboard');
  }, [client]);

 

  const handleEmailLogin = async () => {
    setLoading(true);
    setLoginError(false);
    setLoginMsg(false);
    setUnauthorized(false);

    // Trim and lowercase email
    const trimmedEmail = email.trim().toLowerCase();

    // Check if the email is in the allowed admin list
    if (!allowedAdmins.includes(trimmedEmail)) {
      setUnauthorized(true);
      setLoading(false);
      toast.error('Unauthorized email.');
      return;
    }

    // Proceed with login
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
     options: {
      emailRedirectTo: redirectUrl,
       
    },
    });

    setLoading(false);

    if (error) {
      setLoginError(true);
      toast.error('Email login error!');
    } else {
      setLoginMsg(true);
      toast.success('Login link sent to your email!');
    }
  };

  return (
    <div className="login-container">
      {loading && <FullScreenLoader />}

      <div className="login-box">
        <h2 className="login-heading">Admin Log in</h2>

        {loginMsg && <Alert variant="success">Login link sent to your email!</Alert>}
        {loginError && <Alert variant="danger">Something went wrong!</Alert>}
        {unauthorized && (
          <Alert variant="danger">Unauthorized: Only admin users can log in.</Alert>
        )}

        <div className="form-group">
          <input
            type="email"
            placeholder="Email address"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '10px', width: '100%' }}
          />

          <button className="continue-btn" onClick={handleEmailLogin} disabled={loading}>
            <MdEmail className="icon" /> Login
          </button>
        </div>
      </div>
    </div>
  );
}
