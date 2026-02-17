import React, { useState, useEffect, useRef } from 'react';
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
import { getPlatform } from '../utils/getPlatform'; // ✅ Added platform detector

const frontEndUrl = import.meta.env.VITE_FRONTEND_API_URL;

export default function Hostlogin() {
  const deviceType = useDeviceType();
  const platform = getPlatform(); // ✅ detect ios / android / web
  const [loginMethod, setLoginMethod] = useState('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMsg, setStatus] = useState(false);
  const [loginError, setloginError] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMsg, setOtpStatus] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(20);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    if (otpSent) {
      setCanResendOtp(false);
      setResendCountdown(20);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpSent]);

  const handlePhoneLogin = async () => {
    setLoading(true);
    const fullPhone = `${countryCode}${phone}`;
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
      options: { data: { client: 'host', merchant: 1 } },
    });
    setLoading(false);
    if (error) {
      toast.error('Phone login error!');
      console.error('Phone login error:', error.message);
    } else {
      setOtpSent(true);
      toast.success('OTP sent to your phone!');
    }
  };

  const handleResendOtp = async () => {
    if (!phone || !countryCode) return;
    const fullPhone = countryCode + phone;
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (error) throw error;
      setCanResendOtp(false);
      setResendCountdown(20);
      toast.success("OTP resent successfully");
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { data: { client: 'host', merchant: 1 } },
    });
    setLoading(false);
    if (error) {
      toast.error('Email login error!');
      console.error('Email login error:', error.message);
    } else {
      toast.success('Login link sent to your email!');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${frontEndUrl}/?client=host` },
    });
    if (error) {
      toast.error('Google login error!');
      console.error('Google login error:', error.message);
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
    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: 'sms',
    });

    setLoading(false);
    if (error) {
      toast.error('OTP verification failed.');
      console.error(error);
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
    if (index < 5 && value) inputRefs.current[index + 1]?.focus();
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

  // ✅ update metadata after auth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const client = params.get('client');

    const updateMetadataIfNeeded = async () => {
      if (client !== 'host') return;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Failed to get user:', userError.message);
        return;
      }

      if (user) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { client: 'host', merchant: 1 },
        });

        if (updateError) {
          console.error('Failed to update metadata:', updateError.message);
        } else {
          console.log('User metadata updated successfully');
          toast.success('Welcome! Your profile is ready.');
        }

        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('client');
        window.history.replaceState({}, '', newUrl.toString());
      }
    };

    updateMetadataIfNeeded();
  }, []);

  return (
    <div className="login-container">
      {otpSent ? (
        <div className="otp-box">
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
                  <select
                    className="country-code-select"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
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

                {/* ✅ Hide email login on iOS */}
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
                {/* ✅ Hide email form on iOS */}
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
