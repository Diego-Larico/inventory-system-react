
import { useState } from 'react';
import { supabase } from './supabaseClient';
import './Login.css';

function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Login successful!');
      // Aquí puedes redirigir al dashboard o guardar el usuario
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-logo">
          {/* Reemplaza esto por tu logo real */}
          <span className="logo-icon">🧵</span>
          <span className="logo-text"><b>Thrive</b>Studios</span>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="chris.huxley@gmail.com"
            required
            disabled={loading}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            disabled={loading}
          />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <a href="#" className="forgot-password">Forgot Password?</a>
          {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
          {success && <div style={{ color: 'green', marginTop: '10px' }}>{success}</div>}
        </form>
      </div>
      <div className="login-right">
        <div className="login-message">
          <h2>It's not about what you make.<br/>It's about what you make possible.</h2>
          <p>Welcome to Thrive!</p>
        </div>
        {/* Aquí puedes poner una imagen SVG personalizada */}
        <div className="login-illustration">
          {/* Reemplaza esto por tu ilustración real */}
          <img src="/vite.svg" alt="Illustration" />
        </div>
      </div>
    </div>
  );
}

export default Login;
