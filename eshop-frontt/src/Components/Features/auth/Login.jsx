import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../assets/styles/login.css';

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const navigate                = useNavigate();
  const { login }               = useAuth();

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

    // build the form body
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', email);
    params.append('password', password);

    // build your Basic auth header (Client Id and Secret mode)
    const clientId     = 'myclient';
    const clientSecret = 'l3CH5cLjdZloCLaLlsBYHqgwA6jUlDY2';
    const basic        = btoa(`${clientId}:${clientSecret}`);

    try {
      const response = await fetch(
        'http://localhost:9090/realms/myrealm/protocol/openid-connect/token',
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basic}`,
          },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        console.error('Keycloak error:', err);
        setErrors({ general: err.error_description || 'Invalid email or password' });
        return;
      }

      const data = await response.json();
      login(data.access_token, data.refresh_token);
      navigate('/homepage');
    }
    catch (err) {
      console.error('Network/Error:', err);
      setErrors({ general: 'Something went wrong, please try again later' });
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
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
          <a href="#">Forgot Password?</a>
        </form>
      </div>
      <div className="login-image"></div>
    </div>
  );
}

export default Login;
