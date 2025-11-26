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

function DashboardMain() {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // Datos de ventas por mes
  const ventasMensuales = [
    { mes: 'Ene', ventas: 42000, pedidos: 45, productos: 180 },
    { mes: 'Feb', ventas: 48000, pedidos: 52, productos: 210 },
    { mes: 'Mar', ventas: 55000, pedidos: 61, productos: 240 },
    { mes: 'Abr', ventas: 51000, pedidos: 58, productos: 225 },
    { mes: 'May', ventas: 62000, pedidos: 68, productos: 275 },
    { mes: 'Jun', ventas: 71000, pedidos: 78, productos: 310 },
  ];

  // Datos para el gráfico de distribución
  const distribucionProductos = [
    { name: 'Camisas', value: 35, color: '#8f5cff' },
    { name: 'Pantalones', value: 28, color: '#6e7ff3' },
    { name: 'Vestidos', value: 18, color: '#f59e42' },
    { name: 'Abrigos', value: 12, color: '#10b981' },
    { name: 'Accesorios', value: 7, color: '#ef4444' },
  ];

  // Datos de inventario por categoría
  const inventarioCategorias = [
    { categoria: 'Materiales', cantidad: 120, minimo: 80 },
    { categoria: 'Productos', cantidad: 85, minimo: 50 },
    { categoria: 'Telas', cantidad: 95, minimo: 70 },
    { categoria: 'Accesorios', cantidad: 65, minimo: 40 },
    { categoria: 'Hilos', cantidad: 150, minimo: 100 },
  ];

  // Datos de radar para métricas
  const metricsData = [
    { metric: 'Ventas', value: 85 },
    { metric: 'Inventario', value: 92 },
    { metric: 'Pedidos', value: 78 },
    { metric: 'Calidad', value: 95 },
    { metric: 'Rapidez', value: 88 },
    { metric: 'Satisfacción', value: 90 },
  ];

  // Alertas y notificaciones
  const alertas = [
    { id: 1, tipo: 'warning', mensaje: '5 productos con stock bajo', icon: FaExclamationTriangle, color: 'orange' },
    { id: 2, tipo: 'info', mensaje: '8 pedidos pendientes de entrega', icon: FaClock, color: 'blue' },
    { id: 3, tipo: 'success', mensaje: '12 pedidos completados hoy', icon: FaCheckCircle, color: 'green' },
  ];

  // Productos más vendidos
  const topProductos = [
    { nombre: 'Camisa Casual Blanca', ventas: 145, tendencia: 'up', imagen: '👕' },
    { nombre: 'Pantalón Jean Azul', ventas: 132, tendencia: 'up', imagen: '👖' },
    { nombre: 'Vestido Floral Rojo', ventas: 98, tendencia: 'down', imagen: '👗' },
    { nombre: 'Chaqueta Denim', ventas: 87, tendencia: 'up', imagen: '🧥' },
  ];

  // Actividad reciente
  const actividadReciente = [
    { id: 1, accion: 'Nuevo pedido #1245', tiempo: 'Hace 5 min', icon: FaClipboardList, color: 'purple' },
    { id: 2, accion: 'Stock actualizado: Hilo Negro', tiempo: 'Hace 12 min', icon: FaBox, color: 'blue' },
    { id: 3, accion: 'Pedido #1240 completado', tiempo: 'Hace 25 min', icon: FaCheckCircle, color: 'green' },
    { id: 4, accion: 'Nuevo producto agregado', tiempo: 'Hace 1 hora', icon: FaShoppingBag, color: 'orange' },
  ];

  return (
    <main className="flex-1 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 min-h-screen overflow-y-auto">
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
            
            <div className="flex gap-3">
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
            {[
              { 
                title: 'Ventas Totales', 
                value: 71000, 
                prefix: 'S/ ', 
                change: '+12.5%', 
                isPositive: true, 
                icon: FaDollarSign, 
                color: 'from-green-500 to-emerald-600',
                bgPattern: '🌟'
              },
              { 
                title: 'Pedidos Activos', 
                value: 78, 
                change: '+8.3%', 
                isPositive: true, 
                icon: FaClipboardList, 
                color: 'from-blue-500 to-cyan-600',
                bgPattern: '📋'
              },
              { 
                title: 'Productos', 
                value: 310, 
                change: '+15.2%', 
                isPositive: true, 
                icon: FaShoppingBag, 
                color: 'from-purple-500 to-pink-600',
                bgPattern: '🛍️'
              },
              { 
                title: 'Stock Total', 
                value: 1250, 
                change: '-3.1%', 
                isPositive: false, 
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
                className="relative bg-white rounded-2xl p-6 shadow-xl overflow-hidden group cursor-pointer"
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
                  
                  <h3 className="text-gray-500 text-sm font-semibold mb-2">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.prefix}
                    <CountUp end={stat.value} duration={2.5} separator="," />
                  </p>
                </div>

                {/* Efecto de brillo al hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000"></div>
              </motion.div>
            ))}
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
            <h2 className="text-2xl font-bold text-gray-800">Notificaciones</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alertas.map((alerta, index) => (
              <motion.div
                key={alerta.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`bg-white rounded-2xl p-4 shadow-lg border-l-4 hover:shadow-xl transition-all cursor-pointer ${
                  alerta.color === 'orange' ? 'border-orange-500' :
                  alerta.color === 'blue' ? 'border-blue-500' : 'border-green-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    alerta.color === 'orange' ? 'bg-orange-100' :
                    alerta.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <alerta.icon className={`text-xl ${
                      alerta.color === 'orange' ? 'text-orange-600' :
                      alerta.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                    }`} />
                  </div>
                  <p className="font-semibold text-gray-700">{alerta.mensaje}</p>
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
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] rounded-xl shadow-lg">
                  <FaChartLine className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Evolución de Ventas</h3>
                  <p className="text-sm text-gray-500">Últimos 6 meses</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <FaArrowUp />
                <span>+23.4%</span>
              </div>
            </div>
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
          </motion.div>

          {/* Distribución de Productos */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <FaShoppingBag className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Categorías</h3>
                <p className="text-sm text-gray-500">Distribución</p>
              </div>
            </div>
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
                  <span className="text-xs text-gray-600 font-semibold">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Segunda Fila de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Inventario por Categoría */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <FaWarehouse className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Inventario</h3>
                <p className="text-sm text-gray-500">Por categoría</p>
              </div>
            </div>
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
          </motion.div>

          {/* Métricas de Rendimiento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <FaTrophy className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Rendimiento</h3>
                <p className="text-sm text-gray-500">Métricas clave</p>
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
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <FaFire className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Top Ventas</h3>
                <p className="text-sm text-gray-500">Más populares</p>
              </div>
            </div>
            <div className="space-y-4">
              {topProductos.map((producto, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{producto.imagen}</div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{producto.nombre}</p>
                      <p className="text-xs text-gray-500">{producto.ventas} ventas</p>
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
              ))}
            </div>
          </motion.div>
        </div>

        {/* Actividad Reciente y Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividad Reciente */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] rounded-xl shadow-lg">
                <FaClock className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Actividad Reciente</h3>
                <p className="text-sm text-gray-500">Últimas acciones</p>
              </div>
            </div>
            <div className="space-y-4">
              {actividadReciente.map((actividad, index) => (
                <motion.div
                  key={actividad.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <div className={`p-2.5 rounded-lg ${
                    actividad.color === 'purple' ? 'bg-purple-100' :
                    actividad.color === 'blue' ? 'bg-blue-100' :
                    actividad.color === 'green' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <actividad.icon className={`text-lg ${
                      actividad.color === 'purple' ? 'text-purple-600' :
                      actividad.color === 'blue' ? 'text-blue-600' :
                      actividad.color === 'green' ? 'text-green-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{actividad.accion}</p>
                    <p className="text-xs text-gray-500">{actividad.tiempo}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
                <FaLightbulb className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Acciones Rápidas</h3>
                <p className="text-sm text-gray-500">Atajos frecuentes</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: FaClipboardList, label: 'Nuevo Pedido', color: 'from-purple-500 to-purple-600' },
                { icon: FaShoppingBag, label: 'Agregar Producto', color: 'from-blue-500 to-blue-600' },
                { icon: FaBox, label: 'Registrar Material', color: 'from-green-500 to-green-600' },
                { icon: FaUsers, label: 'Nuevo Cliente', color: 'from-orange-500 to-orange-600' },
                { icon: FaChartLine, label: 'Ver Reportes', color: 'from-pink-500 to-pink-600' },
                { icon: FaWarehouse, label: 'Inventario', color: 'from-cyan-500 to-cyan-600' },
              ].map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 bg-gradient-to-br ${action.color} rounded-xl shadow-lg text-white font-semibold text-sm flex flex-col items-center gap-2 hover:shadow-xl transition-all`}
                >
                  <action.icon className="text-2xl" />
                  {action.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <ReactTooltip />
    </main>
  );
}

export default DashboardMain;
