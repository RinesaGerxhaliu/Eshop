import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../assets/styles/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', 'myclient');
    params.append('username', email);
    params.append('password', password);
    params.append('client_secret', 'VvZg6mZTpji9AQNRwwQLPalqWR015c7q');

    try {
      const response = await fetch('http://localhost:9090/realms/myrealm/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        throw new Error('Login failed!');
      }

      const data = await response.json();
      console.log(data);

      login(data.access_token); // shenon si i kyçur dhe ruan tokenin

      navigate('/homepage');

    } catch (error) {
      console.error('Error:', error);
      alert('Invalid username or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <h2>Sign in</h2>

        <form onSubmit={handleLogin}>
          <label>Email Address *</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email" 
          />

          <label>Password *</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password" 
          />

          <button type="submit">Sign in</button>

          <a href="#">Forgot Password?</a>
        </form>
      </div>

      <div className="login-image"></div>
    </div>
  );
}

export default Login;
