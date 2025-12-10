


import { useState } from 'react';
import { supabase } from './supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';


function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setShowErrorModal(true);
    } else {
      setSuccess('Login successful!');
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      {/* Modal de Error */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-red-500 to-red-600 p-4"
              >
                <h3 className="text-white font-bold text-xl flex items-center gap-2">
                  <motion.span
                    initial={{ rotate: 0, scale: 0 }}
                    animate={{ rotate: [0, -10, 10, -10, 0], scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-2xl"
                  >
                    ⚠️
                  </motion.span>
                  Error de Acceso
                </h3>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6"
              >
                <p className="text-gray-700 dark:text-gray-300 text-base mb-6">
                  Las credenciales ingresadas son incorrectas. Por favor, verifica tu correo electrónico y contraseña e intenta nuevamente.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowErrorModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Entendido
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", damping: 20 }}
        className="w-full flex flex-col md:flex-row max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Left: Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex flex-col justify-center px-8 py-12 md:py-16 bg-white dark:bg-gray-800"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
            className="flex flex-col items-center mb-10"
          >
            <motion.img
              src="/vite.svg"
              alt="Logo"
              className="w-16 h-16 mb-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center"
            >
              Iniciar Sesión
            </motion.span>
          </motion.div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej: correo@ejemplo.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-indigo-200 dark:border-indigo-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-gray-700 dark:text-gray-100 dark:bg-gray-700 transition-all duration-300 focus:scale-105"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-indigo-200 dark:border-indigo-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-gray-700 dark:text-gray-100 dark:bg-gray-700 transition-all duration-300 focus:scale-105"
              />
            </motion.div>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-semibold rounded-full shadow-md hover:from-indigo-400 hover:to-purple-500 transition-all transition-colors duration-300"
            >
              {loading ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Iniciando sesión...
                </motion.span>
              ) : (
                'Iniciar Sesión'
              )}
            </motion.button>
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-green-600 dark:text-green-400 text-sm mt-2 text-center font-semibold"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
        {/* Right: Illustration & Message */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-purple-500 via-indigo-400 to-purple-300 text-white px-8 py-12 md:py-16 relative overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 text-center relative z-10"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl font-bold mb-2"
            >
              Bienvenido al sistema de inventario
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-base md:text-lg"
            >
              Gestiona materiales, productos y pedidos de forma eficiente.
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 15 }}
            className="w-full flex justify-center relative z-10"
          >
            <motion.img
              src="/vite.svg"
              alt="Ilustración"
              className="w-32 h-32"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
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
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
