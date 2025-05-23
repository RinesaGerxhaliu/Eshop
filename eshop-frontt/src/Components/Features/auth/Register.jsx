import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../assets/styles/login.css';

function Register() {
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors]         = useState({});
  const navigate                    = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName)  newErrors.lastName  = 'Last name is required';
    if (!email)     newErrors.email     = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Must be at least 6 characters';

    if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch('https://localhost:5050/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        })
      });

      if (!response.ok) {
        const err = await response.json();
        setErrors({ general: err.detail || 'Registration failed' });
        return;
      }

      navigate('/login');
    } catch {
      setErrors({ general: 'Network error, please try again later' });
    }
  };

  return (
    <div className="login-page center-page">
      <div className="login-form">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister}>
          {errors.general && <div className="error-message">{errors.general}</div>}

          <label>First Name *</label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Enter first name"
          />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}

          <label>Last Name *</label>
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Enter last name"
          />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}

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

          <label>Confirm Password *</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
          />
          {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}

          <button type="submit">Register</button>

          <a href="#" onClick={() => navigate('/login')} className="link-text">
            Already have an account? Sign in
          </a>
          <br />
          <a href="#" onClick={() => navigate('/homepage')} className="link-textt">
            Go to Home
          </a>
        </form>
      </div>
      <div className="login-image"></div>
    </div>
  );
}

export default Register;
