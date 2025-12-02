import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  FaBox, FaShoppingBag, FaClipboardList, FaUsers, FaArrowUp, FaArrowDown,
  FaChartLine, FaDollarSign, FaExclamationTriangle, FaClock, FaStar,
  FaTrophy, FaFire, FaLightbulb, FaBell, FaBoxes, FaCubes, FaWarehouse,
  FaRocket, FaCheckCircle, FaCalendarAlt, FaChartBar
} from 'react-icons/fa';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
         XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart,
         Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { toast } from 'react-hot-toast';
import { obtenerDashboardCompleto } from '../services/dashboardService';

function DashboardMain() {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [animateCards, setAnimateCards] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estados para datos de Supabase
  const [estadisticas, setEstadisticas] = useState({
    ventasTotales: 0,
    pedidosActivos: 0,
    totalProductos: 0,
    stockTotal: 0,
    cambioVentas: '+0%',
    cambioPedidos: '+0%',
    cambioProductos: '+0%',
    cambioStock: '+0%'
  });
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [distribucionProductos, setDistribucionProductos] = useState([]);
  const [inventarioCategorias, setInventarioCategorias] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    setAnimateCards(true);
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    setLoading(true);
    
    try {
      const resultado = await obtenerDashboardCompleto();
      
      if (resultado.success) {
        const { data } = resultado;
        
        // Actualizar estados
        if (data.estadisticas) setEstadisticas(data.estadisticas);
        if (data.ventasMensuales) setVentasMensuales(data.ventasMensuales);
        if (data.distribucionProductos) setDistribucionProductos(data.distribucionProductos);
        if (data.inventarioCategorias) setInventarioCategorias(data.inventarioCategorias);
        if (data.topProductos) setTopProductos(data.topProductos);
        if (data.alertas) setAlertas(data.alertas);
        if (data.actividadReciente) setActividadReciente(data.actividadReciente);
      } else {
        toast.error('Error al cargar el dashboard');
        console.error('Error:', resultado.error);
      }
    } catch (error) {
      toast.error('Error al cargar datos: ' + error.message);
      console.error('Error al cargar dashboard:', error);
    }
    
    setLoading(false);
  };

  // Datos de radar para métricas (estáticos - se pueden calcular después)
  const metricsData = [
    { metric: 'Ventas', value: estadisticas.ventasTotales > 50000 ? 85 : 60 },
    { metric: 'Inventario', value: estadisticas.stockTotal > 1000 ? 92 : 70 },
    { metric: 'Pedidos', value: estadisticas.pedidosActivos > 50 ? 78 : 65 },
    { metric: 'Calidad', value: 95 },
    { metric: 'Rapidez', value: 88 },
    { metric: 'Satisfacción', value: 90 },
  ];

  // Mapear alertas con iconos
  const alertasConIconos = alertas.map(alerta => ({
    ...alerta,
    icon: alerta.color === 'orange' ? FaExclamationTriangle :
          alerta.color === 'blue' ? FaClock : FaCheckCircle
  }));

  // Mapear actividad con iconos
  const actividadConIconos = actividadReciente.map(actividad => ({
    ...actividad,
    icon: actividad.color === 'purple' ? FaClipboardList :
          actividad.color === 'blue' ? FaBox :
          actividad.color === 'green' ? FaCheckCircle : FaShoppingBag
  }));

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );

  return (
    <main className="flex-1 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 min-h-screen overflow-y-auto">
      {/* Hero Section con Animación */}
      <div className="relative bg-gradient-to-r from-[#8f5cff] via-[#6e7ff3] to-[#8f5cff] bg-[length:200%_100%] animate-gradient p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <FaRocket className="text-5xl" />
                Panel de Control
              </h1>
              <p className="text-purple-100 text-lg">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="flex gap-3 items-center">
              {/* Botón Refrescar */}
              <button
                onClick={cargarDashboard}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl font-semibold transition-all bg-white/20 text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg 
                  className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Cargando...' : 'Refrescar'}
              </button>
              {['hoy', 'semana', 'mes', 'año'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    selectedPeriod === period
                      ? 'bg-white text-[#8f5cff] shadow-lg scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats Cards Premium */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : [
              { 
                title: 'Ventas Totales', 
                value: estadisticas.ventasTotales, 
                prefix: 'S/ ', 
                change: estadisticas.cambioVentas, 
                isPositive: estadisticas.cambioVentas.startsWith('+'), 
                icon: FaDollarSign, 
                color: 'from-green-500 to-emerald-600',
                bgPattern: '🌟'
              },
              { 
                title: 'Pedidos Activos', 
                value: estadisticas.pedidosActivos, 
                change: estadisticas.cambioPedidos, 
                isPositive: estadisticas.cambioPedidos.startsWith('+'), 
                icon: FaClipboardList, 
                color: 'from-blue-500 to-cyan-600',
                bgPattern: '📋'
              },
              { 
                title: 'Productos', 
                value: estadisticas.totalProductos, 
                change: estadisticas.cambioProductos, 
                isPositive: estadisticas.cambioProductos.startsWith('+'), 
                icon: FaShoppingBag, 
                color: 'from-purple-500 to-pink-600',
                bgPattern: '🛍️'
              },
              { 
                title: 'Stock Total', 
                value: estadisticas.stockTotal, 
                change: estadisticas.cambioStock, 
                isPositive: estadisticas.cambioStock.startsWith('+'), 
                icon: FaBoxes, 
                color: 'from-orange-500 to-red-600',
                bgPattern: '📦'
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl overflow-hidden group cursor-pointer"
              >
                {/* Patrón de fondo */}
                <div className="absolute top-3 right-3 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">
                  {stat.bgPattern}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <stat.icon className="text-2xl text-white" />
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                      stat.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.isPositive ? <FaArrowUp /> : <FaArrowDown />}
                      {stat.change}
                    </div>
                  </div>
                  
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {stat.prefix}
                    <CountUp end={stat.value} duration={2.5} separator="," />
                  </p>
                </div>

                {/* Efecto de brillo al hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000"></div>
              </motion.div>
            ))
            }
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="p-8">
        {/* Alertas Importantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <FaBell className="text-2xl text-[#8f5cff]" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Notificaciones</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alertasConIconos.map((alerta, index) => (
              <motion.div
                key={alerta.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border-l-4 hover:shadow-xl transition-all cursor-pointer ${
                  alerta.color === 'orange' ? 'border-orange-500' :
                  alerta.color === 'blue' ? 'border-blue-500' : 'border-green-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    alerta.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    alerta.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <alerta.icon className={`text-xl ${
                      alerta.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                      alerta.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                    }`} />
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">{alerta.mensaje}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Gráficos Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Ventas Mensuales - Área Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] rounded-xl shadow-lg">
                  <FaChartLine className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Evolución de Ventas</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Últimos 6 meses</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <FaArrowUp />
                <span>+23.4%</span>
              </div>
            </div>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8f5cff]"></div>
              </div>
            ) : ventasMensuales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ventasMensuales}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8f5cff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8f5cff" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Area type="monotone" dataKey="ventas" stroke="#8f5cff" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">No hay datos de ventas</p>
                  <p className="text-sm">Agrega pedidos para ver estadísticas</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Distribución de Productos */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <FaShoppingBag className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Categorías</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Distribución</p>
              </div>
            </div>
            {loading ? (
              <div className="h-[260px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : distribucionProductos.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={distribucionProductos}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distribucionProductos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {distribucionProductos.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <p className="text-sm">No hay productos</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Segunda Fila de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Inventario por Categoría */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <FaWarehouse className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Inventario</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Por categoría</p>
              </div>
            </div>
            {loading ? (
              <div className="h-[260px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : inventarioCategorias.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={inventarioCategorias}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="categoria" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Bar dataKey="cantidad" fill="#8f5cff" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="minimo" fill="#e5e7eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <p className="text-sm">No hay datos de inventario</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Métricas de Rendimiento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <FaTrophy className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Rendimiento</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Métricas clave</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metricsData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" stroke="#6b7280" fontSize={12} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                <Radar name="Métricas" dataKey="value" stroke="#8f5cff" fill="#8f5cff" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Productos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <FaFire className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Top Ventas</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Más populares</p>
              </div>
            </div>
            <div className="space-y-4">
              {topProductos.length > 0 ? topProductos.map((producto, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{producto.imagen}</div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{producto.nombre}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{producto.ventas} ventas</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    producto.tendencia === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {producto.tendencia === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                    <span className="font-bold text-sm">
                      {producto.tendencia === 'up' ? '+' : '-'}{Math.floor(Math.random() * 15) + 5}%
                    </span>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No hay datos de productos disponibles</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>


      </div>

      <ReactTooltip />
    </main>
  );
}

export default DashboardMain;
