import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaBell, FaUser, FaChevronDown, FaCog, FaSignOutAlt, 
  FaPlus, FaMoon, FaSun, FaEnvelope, FaGift, FaShoppingCart
} from 'react-icons/fa';
import NuevoPedidoModal from './NuevoPedidoModal';
import toast, { Toaster } from 'react-hot-toast';

function Topbar() {
  const [showNuevoPedidoModal, setShowNuevoPedidoModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNuevoPedido = (data) => {
    console.log('Nuevo pedido:', data);
    toast.success('Pedido creado exitosamente');
  };

  const notifications = [
    { id: 1, type: 'order', title: 'Nuevo pedido #1245', message: 'Cliente: María García', time: '5 min', unread: true },
    { id: 2, type: 'alert', title: 'Stock bajo', message: 'Tela azul: 3 unidades', time: '15 min', unread: true },
    { id: 3, type: 'success', title: 'Pedido completado', message: 'Pedido #1240 entregado', time: '1 hora', unread: false },
    { id: 4, type: 'info', title: 'Recordatorio', message: 'Reunión a las 3:00 PM', time: '2 horas', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const quickActions = [
    { icon: FaShoppingCart, label: 'Nuevo Pedido', color: 'from-purple-500 to-purple-600', action: () => setShowNuevoPedidoModal(true) },
    { icon: FaGift, label: 'Nuevo Producto', color: 'from-blue-500 to-blue-600', action: () => toast.info('Funcionalidad próximamente') },
    { icon: FaPlus, label: 'Nuevo Material', color: 'from-green-500 to-green-600', action: () => toast.info('Funcionalidad próximamente') },
  ];

  return (
    <>
      <Toaster position="top-right" />
      
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Búsqueda Avanzada */}
            <div className="flex-1 max-w-2xl relative">
              <motion.div
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
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition bg-gray-50 hover:bg-white"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Acciones Rápidas y Menús */}
            <div className="flex items-center gap-4 ml-6">
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.action}
                    className={`p-3 bg-gradient-to-br ${action.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all tooltip`}
                    data-tooltip={action.label}
                  >
                    <action.icon className="text-lg" />
                  </motion.button>
                ))}
              </div>

              {/* Separador */}
              <div className="w-px h-8 bg-gray-300"></div>

              {/* Reloj */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden lg:flex flex-col items-end"
              >
                <p className="text-sm font-bold text-gray-800">
                  {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              </motion.div>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-700" />}
              </motion.button>

              {/* Notificaciones */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <FaBell className="text-gray-700 text-xl" />
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
                      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
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
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            whileHover={{ backgroundColor: '#f9fafb' }}
                            className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                              notification.unread ? 'bg-purple-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                notification.type === 'order' ? 'bg-purple-100 text-purple-600' :
                                notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {notification.type === 'order' ? '📦' :
                                 notification.type === 'alert' ? '⚠️' :
                                 notification.type === 'success' ? '✅' : 'ℹ️'}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-sm">{notification.title}</p>
                                <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                                <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-[#8f5cff] rounded-full"></div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="p-3 bg-gray-50 text-center">
                        <button className="text-[#8f5cff] font-semibold text-sm hover:underline">
                          Ver todas las notificaciones
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mensajes */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <FaEnvelope className="text-gray-700 text-xl" />
              </motion.button>

              {/* Usuario */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] hover:shadow-lg transition-all"
                >
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="Usuario" 
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md" 
                  />
                  <div className="text-left hidden xl:block">
                    <p className="font-semibold text-white text-sm">Diego Larico</p>
                    <p className="text-xs text-purple-100">Administrador</p>
                  </div>
                  <FaChevronDown className="text-white text-sm" />
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="p-4 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3]">
                        <div className="flex items-center gap-3">
                          <img 
                            src="https://randomuser.me/api/portraits/men/32.jpg" 
                            alt="Usuario" 
                            className="w-12 h-12 rounded-full border-2 border-white" 
                          />
                          <div>
                            <p className="font-bold text-white">Diego Larico</p>
                            <p className="text-xs text-purple-100">diego@inventario.com</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors text-left">
                          <FaUser className="text-[#8f5cff]" />
                          <span className="font-semibold text-gray-700">Mi Perfil</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors text-left">
                          <FaCog className="text-[#8f5cff]" />
                          <span className="font-semibold text-gray-700">Configuración</span>
                        </button>
                        <div className="h-px bg-gray-200 my-2"></div>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left">
                          <FaSignOutAlt className="text-red-500" />
                          <span className="font-semibold text-red-500">Cerrar Sesión</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      <NuevoPedidoModal
        isOpen={showNuevoPedidoModal}
        onClose={() => setShowNuevoPedidoModal(false)}
        onSubmit={handleNuevoPedido}
      />
    </>
  );
}

export default Topbar;
