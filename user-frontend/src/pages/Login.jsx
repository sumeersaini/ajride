import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import FullScreenLoader from '../components/FullScreenLoader';
import toast from "react-hot-toast";
import { supabase } from '../services/supabaseClient';
import { FaGoogle } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import countriesData from '../utils/countries.json';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from 'react-bootstrap/Alert';
import useDeviceType from '../hooks/useDeviceType';

const frontEndUrl = import.meta.env.VITE_FRONTEND_API_URL;
import { getPlatform } from '../utils/getPlatform';

const redirectUrl = window.location.origin;
const emailRedirectUrl = `${window.location.origin}/auth/callback`;

export default function Login() {
  const deviceType = useDeviceType();
  const platform = getPlatform(); // ✅ Detect platform (ios / android / web)

  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(20);
  const resendIntervalRef = useRef(null);

  const [loginMethod, setLoginMethod] = useState('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMsg, setStatus] = useState(false);
  const [loginError, setloginError] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpMsg, setOtpStatus] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/');
    return () => clearInterval(resendIntervalRef.current);
  }, [user]);

  const startResendCountdown = () => {
    setCanResendOtp(false);
    setResendCountdown(20);
    clearInterval(resendIntervalRef.current);
    resendIntervalRef.current = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(resendIntervalRef.current);
          setCanResendOtp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePhoneLogin = async () => {
    setLoading(true);
    const fullPhone = `${countryCode}${phone}`;
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
      options: {
        data: {
          redirectTo: `${window.location.origin}/auth/callback`,
          client: 'user',
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setOtpSent(true);
      startResendCountdown();
      toast.success('OTP sent to your phone!');
    }
  };

  const handleResendOtp = async () => {
    if (!phone || !countryCode) return;
    const fullPhone = countryCode + phone;
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (error) throw error;
      startResendCountdown();
      toast.success("OTP resent successfully");
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        redirectTo: emailRedirectUrl,
        data: {
          client: 'user',
        },
      },
    });
    
    setLoading(false);
    if (error) {
      toast.error('Email login error!');
    } else {
      toast.success('Login link sent to your email!');
    }
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${frontEndUrl}/?client=user`,
      },
    });
    if (error) {
      toast.error('Google login error!');
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const otp = otpArray.join('');
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP.');
      setLoading(false);
      return;
    }

    const fullPhone = `${countryCode}${phone}`;
    const { data, error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: 'sms',
    });
    setLoading(false);
    if (error) {
      toast.error('OTP verification failed.');
    } else {
      toast.success('OTP verified successfully!');
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (!value) return;
    const updatedOtp = [...otpArray];
    updatedOtp[index] = value[0];
    setOtpArray(updatedOtp);
    if (index < 5 && value) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otpArray[index]) {
        const updatedOtp = [...otpArray];
        updatedOtp[index] = '';
        setOtpArray(updatedOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <div className="login-container">
      {otpSent ? (
        <div className='otp-box'>
          {otpMsg && <Alert variant="success">OTP verified!</Alert>}
          {otpError && <Alert variant="danger">Error: Invalid OTP!</Alert>}

          <div className="verify-otp-box" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {otpArray.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-input"
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                style={{
                  width: '40px',
                  height: '50px',
                  textAlign: 'center',
                  fontSize: '24px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
              />
            ))}
          </div>

          <button className="continue-btn" onClick={handleVerifyOtp} disabled={loading}>
            Verify OTP
          </button>

          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            {canResendOtp ? (
              <button className="btnresend-btn" onClick={handleResendOtp}>
                Resend OTP
              </button>
            ) : (
              <small className="text-muted">You can resend OTP in {resendCountdown}s</small>
            )}
          </div>

          <button className="social-btn" onClick={() => setOtpSent(false)} style={{ marginTop: '10px' }}>
            Back to Login
          </button>
        </div>
      ) : (
        <div className="login-box">
          {loading && <FullScreenLoader />}

          <h2 className="login-heading">Log in or sign up</h2>
          <h3 className="welcome-text">Welcome to AJ Ride</h3>

          {loginMsg && <Alert variant="success">Login link sent to your email!</Alert>}
          {loginError && <Alert variant="danger">Error: something went wrong!</Alert>}

          <div className="form-group">
            {loginMethod === 'phone' ? (
              <>
                <div className="phone-input-wrapper" style={{ display: 'flex', gap: '10px' }}>
                  <select className="country-code-select" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                    {countriesData.map((country, idx) => (
                      <option key={idx} value={country.dial_code}>
                        {country.code} {deviceType !== 'mobile' ? country.dial_code : ''}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Phone number"
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ flex: 1, padding: '10px' }}
                  />
                </div>
                <button className="continue-btn" onClick={handlePhoneLogin} disabled={loading}>
                  Continue
                </button>

                {/* ✅ Email option hidden on iOS */}
                {platform !== "iOS" && (
                  <>
                    <div className="divider"><span>or</span></div>
                    <button className="social-btn" onClick={() => setLoginMethod('email')} style={{ marginTop: '10px' }}>
                      Continue with Email
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                {/* ✅ Email form hidden on iOS */}
                {platform !== "ios" && (
                  <>
                    <input
                      type="email"
                      placeholder="Email address"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ padding: '10px', width: '100%' }}
                    />
                    <button className="continue-btn" onClick={handleEmailLogin} disabled={loading}>
                      <MdEmail className="icon" /> Continue
                    </button>
                  </>
                )}

                <div className="divider"><span>or</span></div>
                <button className="social-btn" onClick={() => setLoginMethod('phone')} style={{ marginTop: '10px' }}>
                  Continue with Phone
                </button>
              </>
            )}
          </div>

          <div className="social-buttons">
            <button className="social-btn" onClick={handleGoogleLogin}>
              <FaGoogle className="icon" /> Continue with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
