import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaBell, FaMoon, FaSun, FaShoppingCart, FaBox, FaTshirt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { obtenerNotificaciones, marcarComoLeida, marcarTodasComoLeidas } from '../services/notificacionesService';
import { useTheme } from '../context/ThemeContext';
import NuevoPedidoModal from './NuevoPedidoModal';
import NuevoMaterialModal from './NuevoMaterialModal';
import NuevoProductoModal from './NuevoProductoModal';

function Topbar() {
  const { darkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  // Modal states
  const [showNuevoPedidoModal, setShowNuevoPedidoModal] = useState(false);
  const [showNuevoMaterialModal, setShowNuevoMaterialModal] = useState(false);
  const [showNuevoProductoModal, setShowNuevoProductoModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    cargarNotificaciones();
    // Recargar notificaciones cada 30 segundos
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarNotificaciones = async () => {
    setLoadingNotifications(true);
    try {
      const resultado = await obtenerNotificaciones();
      if (resultado.success) {
        setNotifications(resultado.data);
        setUnreadCount(resultado.unreadCount);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
    setLoadingNotifications(false);
  };

  const handleMarcarComoLeida = async (notificacionId) => {
    const resultado = await marcarComoLeida(notificacionId);
    if (resultado.success) {
      cargarNotificaciones();
    }
  };

  const handleMarcarTodasComoLeidas = async () => {
    const resultado = await marcarTodasComoLeidas();
    if (resultado.success) {
      toast.success('Todas las notificaciones marcadas como leídas');
      cargarNotificaciones();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Buscando: ${searchQuery}`);
      // Aquí implementarías la lógica de búsqueda
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40 transition-colors">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Búsqueda Avanzada */}
          <div className="flex-1 max-w-2xl relative">
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos, pedidos, clientes..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              {searchQuery && (
                <motion.button
                  type="button"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </motion.button>
              )}
            </motion.form>
          </div>

          {/* Acciones y Menús */}
          <div className="flex items-center gap-4 ml-6">
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNuevoPedidoModal(true)}
                className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                title="Nuevo Pedido"
              >
                <FaShoppingCart className="text-lg" />
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNuevoProductoModal(true)}
                className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                title="Nuevo Producto"
              >
                <FaTshirt className="text-lg" />
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNuevoMaterialModal(true)}
                className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                title="Nuevo Material"
              >
                <FaBox className="text-lg" />
              </motion.button>
            </div>

            {/* Separador */}
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

            {/* Reloj */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden lg:flex flex-col items-end"
            >
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentTime.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </motion.div>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all"
                title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              >
                {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700 dark:text-gray-300" />}
              </motion.button>

              {/* Notificaciones */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  <FaBell className="text-gray-700 dark:text-gray-300 text-xl" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-bold text-lg">Notificaciones</h3>
                          {unreadCount > 0 && (
                            <span className="bg-white text-[#8f5cff] text-xs font-bold px-3 py-1 rounded-full">
                              {unreadCount} nuevas
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {loadingNotifications ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8f5cff]"></div>
                          </div>
                        ) : notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              whileHover={{ backgroundColor: darkMode ? '#374151' : '#f9fafb' }}
                              onClick={() => handleMarcarComoLeida(notification.id)}
                              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition ${
                                notification.unread ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                  notification.type === 'order' ? 'bg-purple-100 text-purple-600' :
                                  notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                  notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  {notification.type === 'order' ? '📦' :
                                   notification.type === 'alert' ? '⚠️' :
                                   notification.type === 'success' ? '✅' : 
                                   notification.type === 'warning' ? '⚡' : 'ℹ️'}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{notification.title}</p>
                                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{notification.message}</p>
                                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{notification.time}</p>
                                </div>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-[#8f5cff] rounded-full"></div>
                                )}
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">No hay notificaciones</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 text-center border-t border-gray-200 dark:border-gray-600">
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarcarTodasComoLeidas}
                            className="text-[#8f5cff] dark:text-[#a78bfa] font-semibold text-sm hover:underline mb-2"
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>


            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <NuevoPedidoModal
        isOpen={showNuevoPedidoModal}
        onClose={() => setShowNuevoPedidoModal(false)}
        onSubmit={(data) => {
          console.log('Nuevo pedido:', data);
          toast.success('Pedido creado exitosamente');
          setShowNuevoPedidoModal(false);
        }}
      />

      <NuevoProductoModal
        isOpen={showNuevoProductoModal}
        onClose={() => setShowNuevoProductoModal(false)}
        onSubmit={(data) => {
          console.log('Nuevo producto:', data);
          toast.success('Producto creado exitosamente');
          setShowNuevoProductoModal(false);
        }}
      />

      <NuevoMaterialModal
        isOpen={showNuevoMaterialModal}
        onClose={() => setShowNuevoMaterialModal(false)}
        onSubmit={(data) => {
          console.log('Nuevo material:', data);
          toast.success('Material creado exitosamente');
          setShowNuevoMaterialModal(false);
        }}
      />
    </>
  );
}

export default Topbar;
