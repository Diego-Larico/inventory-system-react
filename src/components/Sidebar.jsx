import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaBox, 
  FaTshirt, 
  FaShoppingCart, 
  FaChartBar,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaFire,
  FaBolt
} from 'react-icons/fa';
import WeatherWidget from './WeatherWidget';

function Sidebar({ onNavigate, activeView }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Inicio', 
      icon: FaHome, 
      color: 'from-purple-500 to-pink-500',
      badge: null
    },
    { 
      id: 'materiales', 
      label: 'Materiales', 
      icon: FaBox, 
      color: 'from-blue-500 to-cyan-500',
      badge: '120'
    },
    { 
      id: 'productos', 
      label: 'Productos', 
      icon: FaTshirt, 
      color: 'from-green-500 to-emerald-500',
      badge: '310'
    },
    { 
      id: 'pedidos', 
      label: 'Pedidos', 
      icon: FaShoppingCart, 
      color: 'from-orange-500 to-red-500',
      badge: '8',
      notification: true
    },
    { 
      id: 'reportes', 
      label: 'Reportes', 
      icon: FaChartBar, 
      color: 'from-indigo-500 to-purple-500',
      badge: null
    },
  ];

  const secondaryItems = [
    { id: 'config', label: 'Configuración', icon: FaCog },
    { id: 'help', label: 'Ayuda', icon: FaQuestionCircle },
    { id: 'logout', label: 'Cerrar sesión', icon: FaSignOutAlt },
  ];

  const handleItemClick = (itemId) => {
    if (['config', 'help', 'logout'].includes(itemId)) {
      console.log(`${itemId} clicked`);
      return;
    }
    onNavigate(itemId);
  };

  return (
    <motion.aside
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-b from-[#1e1e2e] to-[#2d2d44] h-screen flex flex-col shadow-2xl relative overflow-hidden"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header with Logo */}
      <div className="relative z-10 p-6 flex items-center justify-between border-b border-gray-700/50">
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] rounded-xl flex items-center justify-center shadow-lg">
            <FaBolt className="text-white text-xl" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-bold text-xl text-white">Inventario</h1>
                <p className="text-xs text-gray-400">Sistema Web</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
        >
          {isCollapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
        </motion.button>
      </div>

      {/* Main Navigation */}
      <nav className="relative z-10 flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.button
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg shadow-purple-500/30' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon with gradient on hover */}
                  <div className={`relative z-10 ${isActive ? 'text-white' : ''}`}>
                    <Icon className={`text-xl transition-transform group-hover:scale-110 ${
                      isActive ? 'drop-shadow-lg' : ''
                    }`} />
                    {item.notification && !isCollapsed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1e1e2e]"
                      >
                        <span className="absolute inset-0 bg-red-500 rounded-full animate-ping"></span>
                      </motion.div>
                    )}
                  </div>

                  {/* Label */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`flex-1 text-left font-semibold ${
                          isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Badge */}
                  {!isCollapsed && item.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30'
                      }`}
                    >
                      {item.badge}
                    </motion.span>
                  )}

                  {/* Hover Arrow */}
                  {!isCollapsed && hoveredItem === item.id && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                    >
                      <FaChevronRight className="text-gray-400" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Tooltip for collapsed state */}
                {isCollapsed && hoveredItem === item.id && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 0.95, x: 0 }}
                    className="absolute left-20 top-0 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap z-50 border border-gray-700"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 bg-purple-500 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3 }}
          className="my-6 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"
        />

        {/* Weather Widget */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <WeatherWidget isCollapsed={isCollapsed} />
        </motion.div>

        {/* Secondary Items */}
        <div className="space-y-1">
          {secondaryItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ x: 5 }}
                onClick={() => handleItemClick(item.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
              >
                <Icon className="text-lg group-hover:scale-110 transition-transform" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* User Profile Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 p-4 border-t border-gray-700/50"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              DL
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e1e2e]"></div>
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-white truncate">Diego Larico</p>
                <p className="text-xs text-gray-400 truncate">Administrador</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <FaChevronRight className="text-gray-400 group-hover:text-white transition-colors" />
          )}
        </motion.div>
      </motion.div>
    </motion.aside>
  );
}

export default Sidebar;
