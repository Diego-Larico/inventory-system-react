import React, { useState } from 'react';
import { FaDownload, FaFilter, FaChartLine, FaChartBar, FaChartPie, FaCalendarAlt, FaBox, FaShoppingCart, FaDollarSign, FaArrowUp, FaArrowDown, FaFileExcel, FaFilePdf, FaPrint, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart } from 'recharts';
import Select from 'react-select';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ReportesView({ onNavigate }) {
  const [tipoReporte, setTipoReporte] = useState('ventas');
  const [rangoFecha, setRangoFecha] = useState('mes');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [vistaGrafico, setVistaGrafico] = useState('lineas'); // lineas, barras, area, radar

  // Datos de ejemplo para ventas mensuales
  const ventasMensuales = [
    { mes: 'Ene', ventas: 4500, costos: 2800, pedidos: 45, ganancias: 1700 },
    { mes: 'Feb', ventas: 5200, costos: 3100, pedidos: 52, ganancias: 2100 },
    { mes: 'Mar', ventas: 4800, costos: 2900, pedidos: 48, ganancias: 1900 },
    { mes: 'Abr', ventas: 6100, costos: 3600, pedidos: 61, ganancias: 2500 },
    { mes: 'May', ventas: 5700, costos: 3400, pedidos: 57, ganancias: 2300 },
    { mes: 'Jun', ventas: 6800, costos: 4000, pedidos: 68, ganancias: 2800 },
    { mes: 'Jul', ventas: 7200, costos: 4300, pedidos: 72, ganancias: 2900 },
    { mes: 'Ago', ventas: 6900, costos: 4100, pedidos: 69, ganancias: 2800 },
    { mes: 'Sep', ventas: 7500, costos: 4500, pedidos: 75, ganancias: 3000 },
    { mes: 'Oct', ventas: 8200, costos: 4900, pedidos: 82, ganancias: 3300 },
    { mes: 'Nov', ventas: 8800, costos: 5200, pedidos: 88, ganancias: 3600 },
    { mes: 'Dic', ventas: 9500, costos: 5600, pedidos: 95, ganancias: 3900 },
  ];

  // Datos de productos más vendidos
  const productosMasVendidos = [
    { nombre: 'Polo básico blanco', cantidad: 450, ingresos: 11250, categoria: 'Polo' },
    { nombre: 'Pantalón jean azul', cantidad: 320, ingresos: 12800, categoria: 'Pantalón' },
    { nombre: 'Chaqueta denim', cantidad: 180, ingresos: 14400, categoria: 'Chaqueta' },
    { nombre: 'Vestido floral', cantidad: 250, ingresos: 15000, categoria: 'Vestido' },
    { nombre: 'Camisa formal', cantidad: 290, ingresos: 14500, categoria: 'Camisa' },
  ];

  // Datos de categorías
  const ventasPorCategoria = [
    { categoria: 'Polo', ventas: 25000, porcentaje: 28 },
    { categoria: 'Pantalón', ventas: 22000, porcentaje: 25 },
    { categoria: 'Chaqueta', ventas: 18000, porcentaje: 20 },
    { categoria: 'Vestido', ventas: 15000, porcentaje: 17 },
    { categoria: 'Camisa', ventas: 9000, porcentaje: 10 },
  ];

  // Datos de análisis comparativo
  const comparativoAnual = [
    { mes: 'Ene', '2024': 3800, '2025': 4500 },
    { mes: 'Feb', '2024': 4200, '2025': 5200 },
    { mes: 'Mar', '2024': 3900, '2025': 4800 },
    { mes: 'Abr', '2024': 5100, '2025': 6100 },
    { mes: 'May', '2024': 4800, '2025': 5700 },
    { mes: 'Jun', '2024': 5900, '2025': 6800 },
    { mes: 'Jul', '2024': 6200, '2025': 7200 },
    { mes: 'Ago', '2024': 5800, '2025': 6900 },
    { mes: 'Sep', '2024': 6500, '2025': 7500 },
    { mes: 'Oct', '2024': 7100, '2025': 8200 },
    { mes: 'Nov', '2024': 7600, '2025': 8800 },
    { mes: 'Dic', '2024': 8200, '2025': 9500 },
  ];

  // Datos de inventario
  const estadoInventario = [
    { categoria: 'Stock disponible', valor: 120, color: '#8f5cff' },
    { categoria: 'Bajo stock', valor: 25, color: '#f59e42' },
    { categoria: 'Sin stock', valor: 8, color: '#f87171' },
    { categoria: 'Sobre stock', valor: 15, color: '#6e7ff3' },
  ];

  // Datos de rendimiento por canal
  const rendimientoPorCanal = [
    { canal: 'Tienda física', ventas: 45000, pedidos: 320, ticketPromedio: 140 },
    { canal: 'E-commerce', ventas: 32000, pedidos: 280, ticketPromedio: 114 },
    { canal: 'WhatsApp', ventas: 18000, pedidos: 150, ticketPromedio: 120 },
    { canal: 'Redes sociales', ventas: 12000, pedidos: 95, ticketPromedio: 126 },
  ];

  // Métricas clave
  const metricas = {
    ventasTotales: 89000,
    crecimiento: 18.5,
    pedidosCompletados: 845,
    ticketPromedio: 105.32,
    margenGanancia: 42.3,
    tasaConversion: 3.8,
    clientesNuevos: 124,
    clientesRecurrentes: 356,
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
    const wb = XLSX.utils.book_new();
    
    // Hoja de ventas mensuales
    const wsVentas = XLSX.utils.json_to_sheet(ventasMensuales);
    XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas Mensuales');
    
    // Hoja de productos
    const wsProductos = XLSX.utils.json_to_sheet(productosMasVendidos);
    XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos');
    
    // Hoja de categorías
    const wsCategorias = XLSX.utils.json_to_sheet(ventasPorCategoria);
    XLSX.utils.book_append_sheet(wb, wsCategorias, 'Categorías');
    
    XLSX.writeFile(wb, `reporte-${tipoReporte}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('✅ Reporte exportado a Excel exitosamente');
  };

  const exportarPDF = () => {
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
    ];
    
    doc.autoTable({
      startY: 45,
      head: [['Métrica', 'Valor']],
      body: metricasData,
      theme: 'grid',
      headStyles: { fillColor: [143, 92, 255] },
    });
    
    // Productos más vendidos
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
    <div className="flex-1 bg-gray-50 min-h-screen overflow-y-auto">
      {/* Topbar similar a otras vistas */}
      <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
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
                {Math.abs(tendencia)}%
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
              <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                +{metricas.crecimiento}%
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
                <Bar dataKey="2024" fill="#b6aaff" radius={[8, 8, 0, 0]} name="2024" />
                <Line type="monotone" dataKey="2025" stroke="#8f5cff" strokeWidth={3} dot={{ r: 5 }} name="2025" />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Total 2024</div>
                <div className="text-xl font-bold text-[#8f5cff]">S/ 65,200</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Total 2025</div>
                <div className="text-xl font-bold text-[#8f5cff]">S/ 81,200</div>
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
      </main>
    </div>
  );
}

export default ReportesView;
