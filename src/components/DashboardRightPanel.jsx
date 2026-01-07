import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import TodoListWidget from './TodoListWidget';
import { obtenerEstadisticasDashboard } from '../services/estadisticasService';
import { 
  FaCalendarAlt, 
  FaLightbulb,
  FaChartLine,
  FaUsers,
  FaBox,
  FaRocket,
  FaSpinner
} from 'react-icons/fa';

function DashboardRightPanel() {
  const [date, setDate] = useState(new Date());
  const [stats, setStats] = useState({
    clientes: 0,
    productos: 0,
    crecimiento: 0,
    rendimiento: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Cargar estadísticas al montar
  useEffect(() => {
    cargarEstadisticas(true);
    
    // Actualizar estadísticas cuando cambian productos o clientes (sin loading)
    const handleActualizacion = () => cargarEstadisticas(false);
    window.addEventListener('productosActualizados', handleActualizacion);
    window.addEventListener('clientesActualizados', handleActualizacion);
    
    // Actualizar cada 30 segundos (sin loading)
    const interval = setInterval(() => cargarEstadisticas(false), 30000);
    
    return () => {
      window.removeEventListener('productosActualizados', handleActualizacion);
      window.removeEventListener('clientesActualizados', handleActualizacion);
      clearInterval(interval);
    };
  }, []);

  async function cargarEstadisticas(mostrarCarga = false) {
    if (mostrarCarga) setLoadingStats(true);
    const resultado = await obtenerEstadisticasDashboard();
    if (resultado.success) {
      setStats(resultado.data);
    }
    if (mostrarCarga) setLoadingStats(false);
  }

  return (
    <aside className="w-96 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-6">
        {/* Header del Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] bg-clip-text text-transparent mb-1">
            Panel Lateral
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tu asistente personal</p>
        </motion.div>

        {/* Calendario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-3">
            <FaCalendarAlt className="text-[#8f5cff] text-xl" />
            <h3 className="font-bold text-gray-800 dark:text-gray-100">Calendario</h3>
          </div>
          <Calendar
            onChange={setDate}
            value={date}
            locale="es-ES"
            className="w-full border-none"
          />
        </motion.div>

        {/* Tareas Pendientes - Usando TodoListWidget con drag and drop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <TodoListWidget />
        </motion.div>

        {/* Tips Rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <FaLightbulb className="text-2xl" />
            <h3 className="font-bold">Tip del Día</h3>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            💡 Mantén actualizado el inventario diariamente para evitar desabastecimientos y mejorar la satisfacción del cliente.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          {loadingStats ? (
            <div className="col-span-2 flex items-center justify-center py-8">
              <FaSpinner className="text-3xl text-[#8f5cff] animate-spin" />
            </div>
          ) : (
            [
              { 
                icon: FaUsers, 
                value: stats.clientes, 
                label: 'Clientes', 
                color: 'from-blue-500 to-blue-600',
                prefix: '',
                suffix: ''
              },
              { 
                icon: FaBox, 
                value: stats.productos, 
                label: 'Productos', 
                color: 'from-green-500 to-green-600',
                prefix: '',
                suffix: ''
              },
              { 
                icon: FaChartLine, 
                value: stats.crecimiento, 
                label: 'Crecimiento', 
                color: 'from-purple-500 to-purple-600',
                prefix: '+',
                suffix: '%'
              },
              { 
                icon: FaRocket, 
                value: stats.rendimiento, 
                label: 'Rendimiento', 
                color: 'from-orange-500 to-orange-600',
                prefix: '',
                suffix: '%'
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg cursor-pointer`}
              >
                <stat.icon className="text-2xl mb-2" />
                <p className="text-2xl font-bold">
                  {stat.prefix}{stat.value}{stat.suffix}
                </p>
                <p className="text-xs opacity-75">{stat.label}</p>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </aside>
  );
}

export default DashboardRightPanel;
