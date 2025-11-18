


import { useState } from 'react';
import { supabase } from './supabaseClient';
import Tilt from 'react-parallax-tilt';


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
    const { error } = await supabase.auth.signInWithPassword({
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
    <div className="flex items-center justify-center min-h-screen w-full">
      <Tilt glareEnable={true} glareMaxOpacity={0.45} scale={1.05} className="w-full flex flex-col md:flex-row max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Left: Form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 md:py-16">
          <div className="flex flex-col items-center mb-10">
            <img src="/vite.svg" alt="Logo" className="w-16 h-16 mb-2" />
            <span className="text-2xl font-bold text-gray-800 text-center">Iniciar Sesión</span>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-indigo-600 mb-1">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej: correo@ejemplo.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-indigo-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 transition-all duration-300 focus:scale-105"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-indigo-600 mb-1">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-indigo-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 transition-all duration-300 focus:scale-105"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-semibold rounded-full shadow-md hover:from-indigo-400 hover:to-purple-500 transition-all transition-colors duration-300 transform hover:scale-105 active:scale-95"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="flex justify-between items-center">
              <a href="#" className="text-sm text-indigo-500 hover:underline">Forgot Password?</a>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
          </form>
        </div>
        {/* Right: Illustration & Message */}
        <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-purple-500 via-indigo-400 to-purple-300 text-white px-8 py-12 md:py-16 relative">
          <div className="mb-8 text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Bienvenido al sistema de inventario</h2>
            <p className="text-base md:text-lg">Gestiona materiales, productos y pedidos de forma eficiente.</p>
          </div>
          <div className="w-full flex justify-center">
            <img src="/vite.svg" alt="Ilustración" className="w-32 h-32" />
          </div>
          {/* Fondo decorativo */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="absolute bottom-0 right-0 w-64 h-64 opacity-30" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="200" fill="url(#paint0_radial)" />
              <defs>
                <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(200 200) scale(200)" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8f5cff" />
                  <stop offset="1" stopColor="#6e7ff3" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </Tilt>
    </div>
  );
}

export default Login;
