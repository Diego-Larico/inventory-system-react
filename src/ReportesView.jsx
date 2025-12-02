import React, { useState, useEffect } from 'react';
import { FaDownload, FaFilter, FaChartLine, FaChartBar, FaChartPie, FaCalendarAlt, FaBox, FaShoppingCart, FaDollarSign, FaArrowUp, FaArrowDown, FaFileExcel, FaFilePdf, FaPrint, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart } from 'recharts';
import Select from 'react-select';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast, { Toaster } from 'react-hot-toast';
import { obtenerReporteCompleto } from './services/reportesService';
import Sidebar from './components/Sidebar';

function ReportesView({ onNavigate }) {
  const [tipoReporte, setTipoReporte] = useState('ventas');
  const [rangoFecha, setRangoFecha] = useState('mes');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [vistaGrafico, setVistaGrafico] = useState('lineas');
  
  // Estados para datos de Supabase
  const [loading, setLoading] = useState(true);
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState([]);
  const [comparativoAnual, setComparativoAnual] = useState([]);
  const [estadoInventario, setEstadoInventario] = useState([]);
  const [rendimientoPorCanal, setRendimientoPorCanal] = useState([]);
  const [metricas, setMetricas] = useState({
    ventasTotales: 0,
    crecimiento: 0,
    pedidosCompletados: 0,
    ticketPromedio: 0,
    margenGanancia: 0,
    tasaConversion: 0,
    clientesNuevos: 0,
    clientesRecurrentes: 0,
  });
  const [añoActual, setAñoActual] = useState(new Date().getFullYear());
  const [añoAnterior, setAñoAnterior] = useState(new Date().getFullYear() - 1);

  // Cargar datos completos desde Supabase
  useEffect(() => {
    cargarReporte();
  }, []);

  const cargarReporte = async () => {
    setLoading(true);
    const resultado = await obtenerReporteCompleto();
    
    if (resultado.success) {
      const { data } = resultado;
      setVentasMensuales(data.ventasMensuales || []);
      setProductosMasVendidos(data.productosMasVendidos || []);
      setVentasPorCategoria(data.ventasPorCategoria || []);
      setComparativoAnual(data.comparativoAnual || []);
      setEstadoInventario(data.estadoInventario || []);
      setRendimientoPorCanal(data.rendimientoPorCanal || []);
      setMetricas(data.metricasClave || metricas);
      if (data.añoActual) setAñoActual(data.añoActual);
      if (data.añoAnterior) setAñoAnterior(data.añoAnterior);
      toast.success('Reporte cargado exitosamente');
    } else {
      toast.error('Error al cargar reporte: ' + resultado.error);
    }
    
    setLoading(false);
  };

  const COLORS = ['#8f5cff', '#6e7ff3', '#b6aaff', '#a18fff', '#f59e42', '#f87171'];

  // Opciones de filtros
  const tipoReporteOptions = [
    { value: 'ventas', label: '📊 Reporte de Ventas' },
    { value: 'inventario', label: '📦 Reporte de Inventario' },
    { value: 'productos', label: '🏷️ Reporte de Productos' },
    { value: 'clientes', label: '👥 Reporte de Clientes' },
    { value: 'financiero', label: '💰 Reporte Financiero' },
  ];

  const rangoFechaOptions = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes', label: 'Este mes' },
    { value: 'trimestre', label: 'Este trimestre' },
    { value: 'año', label: 'Este año' },
    { value: 'personalizado', label: 'Personalizado' },
  ];

  const categoriaOptions = [
    { value: 'polo', label: 'Polo' },
    { value: 'pantalon', label: 'Pantalón' },
    { value: 'chaqueta', label: 'Chaqueta' },
    { value: 'vestido', label: 'Vestido' },
    { value: 'camisa', label: 'Camisa' },
  ];

  // Funciones de exportación
  const exportarExcel = () => {
    if (loading) {
      toast.error('Espera a que se carguen los datos');
      return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // Hoja de ventas mensuales
    if (ventasMensuales.length > 0) {
      const wsVentas = XLSX.utils.json_to_sheet(ventasMensuales);
      XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas Mensuales');
    }
    
    // Hoja de productos
    if (productosMasVendidos.length > 0) {
      const wsProductos = XLSX.utils.json_to_sheet(productosMasVendidos);
      XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos');
    }
    
    // Hoja de categorías
    if (ventasPorCategoria.length > 0) {
      const wsCategorias = XLSX.utils.json_to_sheet(ventasPorCategoria);
      XLSX.utils.book_append_sheet(wb, wsCategorias, 'Categorías');
    }
    
    // Hoja de métricas
    const wsMetricas = XLSX.utils.json_to_sheet([metricas]);
    XLSX.utils.book_append_sheet(wb, wsMetricas, 'Métricas');
    
    XLSX.writeFile(wb, `reporte-${tipoReporte}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('✅ Reporte exportado a Excel exitosamente');
  };

  const exportarPDF = () => {
    if (loading) {
      toast.error('Espera a que se carguen los datos');
      return;
    }
    
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(143, 92, 255);
    doc.text('Reporte de ' + tipoReporteOptions.find(t => t.value === tipoReporte)?.label.split(' ').slice(1).join(' '), 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 28);
    
    // Métricas clave
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Métricas Clave', 14, 40);
    
    const metricasData = [
      ['Ventas Totales', `S/ ${metricas.ventasTotales.toLocaleString()}`],
      ['Crecimiento', `${metricas.crecimiento}%`],
      ['Pedidos Completados', metricas.pedidosCompletados.toString()],
      ['Ticket Promedio', `S/ ${metricas.ticketPromedio.toFixed(2)}`],
      ['Margen de Ganancia', `${metricas.margenGanancia}%`],
    ];
    
    doc.autoTable({
      startY: 45,
      head: [['Métrica', 'Valor']],
      body: metricasData,
      theme: 'grid',
      headStyles: { fillColor: [143, 92, 255] },
    });
    
    // Productos más vendidos
    if (productosMasVendidos.length > 0) {
      doc.text('Productos Más Vendidos', 14, doc.lastAutoTable.finalY + 15);
      
      const productosData = productosMasVendidos.map(p => [
        p.nombre,
        p.cantidad.toString(),
        `S/ ${p.ingresos.toLocaleString()}`,
      ]);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Producto', 'Cantidad', 'Ingresos']],
        body: productosData,
        theme: 'striped',
        headStyles: { fillColor: [110, 127, 243] },
      });
    }
    
    // Ventas por categoría
    if (ventasPorCategoria.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Ventas por Categoría', 14, 20);
      
      const categoriasData = ventasPorCategoria.map(c => [
        c.categoria,
        `S/ ${c.ventas.toLocaleString()}`,
        `${c.porcentaje}%`
      ]);
      
      doc.autoTable({
        startY: 25,
        head: [['Categoría', 'Ventas', 'Porcentaje']],
        body: categoriasData,
        theme: 'striped',
        headStyles: { fillColor: [143, 92, 255] },
      });
    }
    
    doc.save(`reporte-${tipoReporte}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('✅ Reporte exportado a PDF exitosamente');
  };

  const imprimir = () => {
    window.print();
    toast.info('📄 Preparando impresión...');
  };

  // Calcular tendencias
  const calcularTendencia = (datos) => {
    if (datos.length < 2) return 0;
    const ultimo = datos[datos.length - 1].ventas;
    const penultimo = datos[datos.length - 2].ventas;
    return ((ultimo - penultimo) / penultimo * 100).toFixed(1);
  };

  const tendencia = calcularTendencia(ventasMensuales);

  return (
    <div className="flex fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      <Sidebar onNavigate={onNavigate} activeView={'reportes'} />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-[#8f5cff]">📊 Reportes y Análisis</h1>
            <span className="px-3 py-1 bg-purple-100 text-[#8f5cff] rounded-full text-sm font-semibold">
              Actualizado hoy
            </span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportarExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
            >
              <FaFileExcel /> Excel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportarPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-md"
            >
              <FaFilePdf /> PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={imprimir}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition shadow-md"
            >
              <FaPrint /> Imprimir
            </motion.button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Select
              options={tipoReporteOptions}
              value={tipoReporteOptions.find(t => t.value === tipoReporte)}
              onChange={(selected) => setTipoReporte(selected.value)}
              placeholder="Tipo de reporte"
              className="text-sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Select
              options={rangoFechaOptions}
              value={rangoFechaOptions.find(r => r.value === rangoFecha)}
              onChange={(selected) => setRangoFecha(selected.value)}
              placeholder="Rango de fecha"
              className="text-sm"
            />
          </div>
          {rangoFecha === 'personalizado' && (
            <>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8f5cff]"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8f5cff]"
              />
            </>
          )}
          <div className="flex-1 min-w-[200px]">
            <Select
              options={categoriaOptions}
              value={categoriaFiltro}
              onChange={setCategoriaFiltro}
              placeholder="Categoría (opcional)"
              isClearable
              className="text-sm"
            />
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="p-8">
        {/* Métricas principales */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] rounded-2xl p-6 shadow-lg text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <FaDollarSign className="text-4xl opacity-80" />
              <span className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${tendencia >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                {tendencia >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                {Math.abs(tendencia) === Infinity ? '∞' : Math.abs(tendencia)}%
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">S/ {metricas.ventasTotales.toLocaleString()}</div>
            <div className="text-sm opacity-90">Ventas Totales</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <FaShoppingCart className="text-4xl text-[#8f5cff]" />
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                metricas.crecimiento >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              }`}>
                {metricas.crecimiento >= 0 ? '+' : ''}{Math.abs(metricas.crecimiento) === Infinity ? '∞' : metricas.crecimiento}%
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{metricas.pedidosCompletados}</div>
            <div className="text-sm text-gray-500">Pedidos Completados</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <FaChartLine className="text-4xl text-[#6e7ff3]" />
              <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                S/ {metricas.ticketPromedio.toFixed(0)}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">S/ {metricas.ticketPromedio.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Ticket Promedio</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <FaBox className="text-4xl text-[#f59e42]" />
              <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                {metricas.margenGanancia}%
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{metricas.margenGanancia}%</div>
            <div className="text-sm text-gray-500">Margen de Ganancia</div>
          </motion.div>
        </section>

        {/* Gráficos principales */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico de ventas mensuales */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Evolución de Ventas</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setVistaGrafico('lineas')}
                  className={`p-2 rounded-lg ${vistaGrafico === 'lineas' ? 'bg-[#8f5cff] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <FaChartLine />
                </button>
                <button
                  onClick={() => setVistaGrafico('barras')}
                  className={`p-2 rounded-lg ${vistaGrafico === 'barras' ? 'bg-[#8f5cff] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <FaChartBar />
                </button>
                <button
                  onClick={() => setVistaGrafico('area')}
                  className={`p-2 rounded-lg ${vistaGrafico === 'area' ? 'bg-[#8f5cff] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <FaChartPie />
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              {vistaGrafico === 'lineas' ? (
                <LineChart data={ventasMensuales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                    formatter={(value) => `S/ ${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="ventas" stroke="#8f5cff" strokeWidth={3} dot={{ r: 5 }} name="Ventas" />
                  <Line type="monotone" dataKey="costos" stroke="#f59e42" strokeWidth={3} dot={{ r: 5 }} name="Costos" />
                  <Line type="monotone" dataKey="ganancias" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="Ganancias" />
                </LineChart>
              ) : vistaGrafico === 'barras' ? (
                <BarChart data={ventasMensuales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                    formatter={(value) => `S/ ${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="ventas" fill="#8f5cff" radius={[8, 8, 0, 0]} name="Ventas" />
                  <Bar dataKey="costos" fill="#f59e42" radius={[8, 8, 0, 0]} name="Costos" />
                  <Bar dataKey="ganancias" fill="#10b981" radius={[8, 8, 0, 0]} name="Ganancias" />
                </BarChart>
              ) : (
                <AreaChart data={ventasMensuales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                    formatter={(value) => `S/ ${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="ventas" stackId="1" stroke="#8f5cff" fill="#8f5cff" fillOpacity={0.6} name="Ventas" />
                  <Area type="monotone" dataKey="costos" stackId="1" stroke="#f59e42" fill="#f59e42" fillOpacity={0.6} name="Costos" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </motion.div>

          {/* Ventas por categoría */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ventas por Categoría</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={ventasPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categoria, porcentaje }) => `${categoria} ${porcentaje}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="ventas"
                >
                  {ventasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `S/ ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {ventasPorCategoria.map((cat, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-gray-700">{cat.categoria}</span>
                  </div>
                  <span className="font-semibold text-gray-800">S/ {cat.ventas.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Análisis comparativo y productos */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Comparativo anual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Comparativo 2024 vs 2025</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={comparativoAnual}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  formatter={(value) => `S/ ${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey={añoAnterior.toString()} fill="#b6aaff" radius={[8, 8, 0, 0]} name={añoAnterior.toString()} />
                <Line type="monotone" dataKey={añoActual.toString()} stroke="#8f5cff" strokeWidth={3} dot={{ r: 5 }} name={añoActual.toString()} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Total {añoAnterior}</div>
                <div className="text-xl font-bold text-[#8f5cff]">
                  S/ {comparativoAnual.reduce((sum, m) => sum + (m[añoAnterior.toString()] || 0), 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Total {añoActual}</div>
                <div className="text-xl font-bold text-[#8f5cff]">
                  S/ {comparativoAnual.reduce((sum, m) => sum + (m[añoActual.toString()] || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Productos más vendidos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Productos</h2>
            <div className="space-y-4">
              {productosMasVendidos.map((producto, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{producto.nombre}</div>
                    <div className="text-sm text-gray-500">{producto.categoria}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">S/ {producto.ingresos.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{producto.cantidad} unidades</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={productosMasVendidos} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="nombre" hide />
                  <Tooltip formatter={(value) => `S/ ${value.toLocaleString()}`} />
                  <Bar dataKey="ingresos" fill="#8f5cff" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        {/* Rendimiento por canal e inventario */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rendimiento por canal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Rendimiento por Canal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={rendimientoPorCanal}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="canal" stroke="#666" />
                <PolarRadiusAxis stroke="#666" />
                <Radar name="Ventas" dataKey="ventas" stroke="#8f5cff" fill="#8f5cff" fillOpacity={0.6} />
                <Radar name="Pedidos" dataKey="pedidos" stroke="#6e7ff3" fill="#6e7ff3" fillOpacity={0.6} />
                <Tooltip formatter={(value, name) => name === 'ventas' ? `S/ ${value.toLocaleString()}` : value} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {rendimientoPorCanal.map((canal, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">{canal.canal}</div>
                  <div className="font-bold text-[#8f5cff]">S/ {canal.ventas.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{canal.pedidos} pedidos</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Estado de inventario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Estado del Inventario</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadoInventario}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="valor"
                  label={({ categoria, valor }) => `${categoria}: ${valor}`}
                >
                  {estadoInventario.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {estadoInventario.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.categoria}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{item.valor} items</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8f5cff]">{estadoInventario.reduce((acc, curr) => acc + curr.valor, 0)}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">72%</div>
                <div className="text-sm text-gray-600">Disponibilidad</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Tabla detallada de métricas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Desglose Mensual Detallado</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mes</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Ventas</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Costos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Ganancias</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Pedidos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Margen %</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {ventasMensuales.map((mes, index) => {
                  const margen = ((mes.ganancias / mes.ventas) * 100).toFixed(1);
                  const tendenciaMes = index > 0 ? ((mes.ventas - ventasMensuales[index - 1].ventas) / ventasMensuales[index - 1].ventas * 100).toFixed(1) : 0;
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-medium text-gray-800">{mes.mes}</td>
                      <td className="py-3 px-4 text-right text-gray-700">S/ {mes.ventas.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-gray-700">S/ {mes.costos.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">S/ {mes.ganancias.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{mes.pedidos}</td>
                      <td className="py-3 px-4 text-right font-semibold text-[#8f5cff]">{margen}%</td>
                      <td className="py-3 px-4 text-center">
                        {tendenciaMes > 0 ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                            <FaArrowUp /> {tendenciaMes}%
                          </span>
                        ) : tendenciaMes < 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            <FaArrowDown /> {Math.abs(tendenciaMes)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-purple-50 font-bold text-gray-800">
                  <td className="py-3 px-4">TOTAL</td>
                  <td className="py-3 px-4 text-right">S/ {ventasMensuales.reduce((acc, m) => acc + m.ventas, 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">S/ {ventasMensuales.reduce((acc, m) => acc + m.costos, 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-green-600">S/ {ventasMensuales.reduce((acc, m) => acc + m.ganancias, 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{ventasMensuales.reduce((acc, m) => acc + m.pedidos, 0)}</td>
                  <td className="py-3 px-4 text-right text-[#8f5cff]">
                    {((ventasMensuales.reduce((acc, m) => acc + m.ganancias, 0) / ventasMensuales.reduce((acc, m) => acc + m.ventas, 0)) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.section>

        {/* Métricas adicionales */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white"
          >
            <div className="text-sm opacity-90 mb-2">Tasa de Conversión</div>
            <div className="text-4xl font-bold mb-2">{metricas.tasaConversion}%</div>
            <div className="text-sm opacity-80">De visitantes a clientes</div>
            <div className="mt-4 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${metricas.tasaConversion * 10}%` }}></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white"
          >
            <div className="text-sm opacity-90 mb-2">Clientes Nuevos</div>
            <div className="text-4xl font-bold mb-2">{metricas.clientesNuevos}</div>
            <div className="text-sm opacity-80">Este mes</div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <FaArrowUp />
              <span>+15% vs mes anterior</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white"
          >
            <div className="text-sm opacity-90 mb-2">Clientes Recurrentes</div>
            <div className="text-4xl font-bold mb-2">{metricas.clientesRecurrentes}</div>
            <div className="text-sm opacity-80">Total activos</div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <FaArrowUp />
              <span>74% tasa de retención</span>
            </div>
          </motion.div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8f5cff]"></div>
              <p className="text-gray-700 font-semibold">Cargando reportes...</p>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}

export default ReportesView;
