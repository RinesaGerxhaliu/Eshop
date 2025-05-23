import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../assets/styles/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 4) newErrors.password = 'Password must be at least 4 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch(
        'https://localhost:5050/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            client_id: 'myclient'
          }),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const err = await response.json();
        setErrors({ general: err.error_description || 'Invalid email or password' });
        return;
      }

      const data = await response.json();

      login(data.accessToken);

      navigate('/homepage');
    } catch {
      setErrors({ general: 'Something went wrong, please try again later' });
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <div className="login-form-inner">
          <h2>Sign in</h2>
          <form onSubmit={handleLogin}>
            {errors.general && <div className="error-message">{errors.general}</div>}

            <label>Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}

            <label>Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}

            <button type="submit">Sign in</button>

            <div className="login-links" style={{ textAlign: 'center', marginTop: '10px' }}>
              <a href="#" onClick={() => navigate('/register')} className="link-text">
                Don't have an account yet? Create Account
              </a>
              <br />
              <a href="#" onClick={() => navigate('/homepage')} className="link-textt">
                Go to Home
              </a>
            </div>
          </form>
        </div>
      </div>

      <div className="login-image"></div>
    </div>
  );
}

export default Login;
