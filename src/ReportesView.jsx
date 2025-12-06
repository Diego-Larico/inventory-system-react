import React, { useState, useEffect } from 'react';
import { FaDownload, FaFilter, FaChartLine, FaChartBar, FaChartPie, FaCalendarAlt, FaBox, FaShoppingCart, FaDollarSign, FaArrowUp, FaArrowDown, FaFileExcel, FaFilePdf, FaPrint, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart } from 'recharts';
import Select from 'react-select';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast, { Toaster } from 'react-hot-toast';
import { notificaciones } from './utils/notifications';
import { 
  obtenerReporteCompleto,
  obtenerProductosPorEstado,
  obtenerRotacionInventario,
  obtenerMargenGananciaPorProducto,
  obtenerTiposCliente,
  obtenerClientesFrecuentes,
  obtenerCostosMensuales,
  obtenerRentabilidadMensual
} from './services/reportesService';

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
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
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
  
  // Estados para nuevos gráficos
  const [productosPorEstado, setProductosPorEstado] = useState([]);
  const [rotacionInventario, setRotacionInventario] = useState([]);
  const [margenGananciaPorProducto, setMargenGananciaPorProducto] = useState([]);
  const [tiposCliente, setTiposCliente] = useState([]);
  const [clientesFrecuentes, setClientesFrecuentes] = useState([]);
  const [costosMensuales, setCostosMensuales] = useState([]);
  const [rentabilidadMensual, setRentabilidadMensual] = useState([]);

  // Cargar datos completos desde Supabase
  useEffect(() => {
    cargarReporte();
  }, []);

  // Reaccionar al cambio de tipo de reporte
  useEffect(() => {
    // Vista cambiada sin notificación
  }, [tipoReporte]);

  // Recargar cuando cambien los filtros de fecha
  useEffect(() => {
    if (rangoFecha !== 'personalizado') {
      aplicarFiltros();
    }
  }, [rangoFecha]);

  // Aplicar filtros cuando se seleccione rango personalizado
  useEffect(() => {
    if (rangoFecha === 'personalizado' && fechaInicio && fechaFin) {
      aplicarFiltros();
    }
  }, [fechaInicio, fechaFin]);

  const cargarReporte = async () => {
    setLoading(true);
    
    try {
      // Cargar reporte base
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
      }

      // Cargar datos adicionales en paralelo
      const [
        resProductosEstado,
        resRotacion,
        resMargen,
        resTiposCliente,
        resClientesFrecuentes,
        resCostos,
        resRentabilidad
      ] = await Promise.all([
        obtenerProductosPorEstado(),
        obtenerRotacionInventario(),
        obtenerMargenGananciaPorProducto(),
        obtenerTiposCliente(),
        obtenerClientesFrecuentes(),
        obtenerCostosMensuales(),
        obtenerRentabilidadMensual()
      ]);

      // Actualizar estados con los nuevos datos
      if (resProductosEstado.success) setProductosPorEstado(resProductosEstado.data);
      if (resRotacion.success) setRotacionInventario(resRotacion.data);
      if (resMargen.success) setMargenGananciaPorProducto(resMargen.data);
      if (resTiposCliente.success) setTiposCliente(resTiposCliente.data);
      if (resClientesFrecuentes.success) setClientesFrecuentes(resClientesFrecuentes.data);
      if (resCostos.success) setCostosMensuales(resCostos.data);
      if (resRentabilidad.success) setRentabilidadMensual(resRentabilidad.data);

      setUltimaActualizacion(new Date());
    } catch (error) {
      notificaciones.error('Error al cargar reporte: ' + error.message);
    }
    
    setLoading(false);
  };

  const aplicarFiltros = () => {
    // Los datos ya están cargados, solo aplicamos filtros visuales
  };

  const refrescarDatos = async () => {
    await cargarReporte();
  };

  // Determinar qué secciones mostrar según el tipo de reporte
  const seccionesPorTipo = {
    ventas: {
      mostrarMetricas: true,
      mostrarVentasMensuales: true,
      mostrarCategorias: true,
      mostrarComparativo: true,
      mostrarTopProductos: true,
      mostrarCanales: true,
      mostrarInventario: false,
      mostrarProductosPorEstado: false,
      mostrarRotacionInventario: false,
      mostrarMargenGanancia: false,
      mostrarTiposCliente: false,
      mostrarClientesFrecuentes: false,
      mostrarCostos: false,
      mostrarRentabilidad: false,
      titulo: 'Análisis de Ventas',
      descripcion: 'Métricas y tendencias de ventas por canal'
    },
    inventario: {
      mostrarMetricas: false,
      mostrarVentasMensuales: false,
      mostrarCategorias: false,
      mostrarComparativo: false,
      mostrarTopProductos: false, // ❌ ELIMINADO
      mostrarCanales: false,
      mostrarInventario: false, // ❌ ELIMINADO
      mostrarProductosPorEstado: true,
      mostrarRotacionInventario: true,
      mostrarMargenGanancia: false,
      mostrarTiposCliente: false,
      mostrarClientesFrecuentes: false,
      mostrarCostos: false,
      mostrarRentabilidad: false,
      titulo: 'Estado del Inventario',
      descripcion: 'Rotación, stock y valorización de inventario'
    },
    productos: {
      mostrarMetricas: false,
      mostrarVentasMensuales: false,
      mostrarCategorias: true,
      mostrarComparativo: false,
      mostrarTopProductos: false, // ❌ ELIMINADO
      mostrarCanales: false,
      mostrarInventario: false, // ❌ ELIMINADO
      mostrarProductosPorEstado: true,
      mostrarRotacionInventario: false,
      mostrarMargenGanancia: true,
      mostrarTiposCliente: false,
      mostrarClientesFrecuentes: false,
      mostrarCostos: false,
      mostrarRentabilidad: false,
      titulo: 'Análisis de Productos',
      descripcion: 'Rentabilidad, precios y estado de productos'
    },
    clientes: {
      mostrarMetricas: true,
      mostrarVentasMensuales: false, // ❌ ELIMINADO
      mostrarCategorias: false,
      mostrarComparativo: false, // ❌ ELIMINADO
      mostrarTopProductos: false,
      mostrarCanales: false, // ❌ ELIMINADO
      mostrarInventario: false,
      mostrarProductosPorEstado: false,
      mostrarRotacionInventario: false,
      mostrarMargenGanancia: false,
      mostrarTiposCliente: true,
      mostrarClientesFrecuentes: true,
      mostrarCostos: false,
      mostrarRentabilidad: false,
      titulo: 'Análisis de Clientes',
      descripcion: 'Segmentación y comportamiento de clientes'
    },
    financiero: {
      mostrarMetricas: true,
      mostrarVentasMensuales: false, // ❌ ELIMINADO
      mostrarCategorias: false, // ❌ ELIMINADO
      mostrarComparativo: false, // ❌ ELIMINADO
      mostrarTopProductos: false, // ❌ ELIMINADO
      mostrarCanales: false, // ❌ ELIMINADO
      mostrarInventario: false,
      mostrarProductosPorEstado: false,
      mostrarRotacionInventario: false,
      mostrarMargenGanancia: false,
      mostrarTiposCliente: false,
      mostrarClientesFrecuentes: false,
      mostrarCostos: true,
      mostrarRentabilidad: true,
      titulo: 'Reporte Financiero',
      descripcion: 'Ingresos, costos, gastos y rentabilidad global'
    }
  };

  const seccionActual = seccionesPorTipo[tipoReporte] || seccionesPorTipo.ventas;

  // Filtrar datos según categoría seleccionada
  const datosFiltrados = {
    productosMasVendidos: categoriaFiltro 
      ? productosMasVendidos.filter(p => p.categoria?.toLowerCase() === categoriaFiltro.value?.toLowerCase())
      : productosMasVendidos,
    ventasPorCategoria: categoriaFiltro
      ? ventasPorCategoria.filter(c => c.categoria?.toLowerCase() === categoriaFiltro.value?.toLowerCase())
      : ventasPorCategoria,
  };

  const COLORS = ['#8f5cff', '#6e7ff3', '#b6aaff', '#a18fff', '#f59e42', '#f87171'];

  // Opciones de filtros
  const tipoReporteOptions = [
    { value: 'ventas', label: 'Reporte de Ventas' },
    { value: 'inventario', label: 'Reporte de Inventario' },
    { value: 'productos', label: 'Reporte de Productos' },
    { value: 'clientes', label: 'Reporte de Clientes' },
    { value: 'financiero', label: 'Reporte Financiero' },
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
    { value: 'Polo', label: 'Polo' },
    { value: 'Pantalón', label: 'Pantalón' },
    { value: 'Chaqueta', label: 'Chaqueta' },
    { value: 'Vestido', label: 'Vestido' },
    { value: 'Camisa', label: 'Camisa' },
    { value: 'Short', label: 'Short' },
    { value: 'Falda', label: 'Falda' },
    { value: 'Accesorio', label: 'Accesorio' },
  ];

  // Estilos personalizados para react-select con modo oscuro
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '8px',
      borderColor: state.isFocused ? '#8f5cff' : '#e5e7eb',
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(143, 92, 255, 0.1)' : 'none',
      '&:hover': { borderColor: '#8f5cff' },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
      borderRadius: '8px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused 
        ? (document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6')
        : 'transparent',
      color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937',
      '&:hover': {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937',
    }),
    input: (base) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937',
    }),
  };

  // Funciones de exportación
  const exportarExcel = () => {
    if (loading) {
      notificaciones.advertencia('Espera a que se carguen los datos');
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
    notificaciones.excelExportado(`Reporte de ${tipoReporteOptions.find(t => t.value === tipoReporte)?.label}`);
  };

  const exportarPDF = () => {
    if (loading) {
      notificaciones.advertencia('Espera a que se carguen los datos');
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
    
    autoTable(doc, {
      startY: 45,
      head: [['Métrica', 'Valor']],
      body: metricasData,
      theme: 'grid',
      headStyles: { fillColor: [143, 92, 255] },
    });
    
    // Productos más vendidos
    if (productosMasVendidos.length > 0) {
      const finalY = doc.lastAutoTable?.finalY || 45;
      doc.text('Productos Más Vendidos', 14, finalY + 15);
      
      const productosData = productosMasVendidos.map(p => [
        p.nombre,
        p.cantidad.toString(),
        `S/ ${p.ingresos.toLocaleString()}`,
      ]);
      
      autoTable(doc, {
        startY: finalY + 20,
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
      
      autoTable(doc, {
        startY: 25,
        head: [['Categoría', 'Ventas', 'Porcentaje']],
        body: categoriasData,
        theme: 'striped',
        headStyles: { fillColor: [143, 92, 255] },
      });
    }
    
    doc.save(`reporte-${tipoReporte}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    notificaciones.pdfExportado(`Reporte de ${tipoReporteOptions.find(t => t.value === tipoReporte)?.label}`);
  };

  const imprimir = () => {
    if (loading) {
      toast.error('Espera a que se carguen los datos');
      return;
    }

    // Crear una ventana nueva con el contenido formateado para imprimir
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    
    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte - ${tipoReporteOptions.find(t => t.value === tipoReporte)?.label}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page { 
                margin: 2cm 1.5cm;
                size: A4 portrait;
              }
              body { 
                print-color-adjust: exact; 
                -webkit-print-color-adjust: exact;
              }
              .no-print { display: none; }
            }
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              color: #000;
              background: #fff;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .header h1 {
              font-size: 20pt;
              font-weight: bold;
              color: #000;
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header .info {
              font-size: 9pt;
              color: #333;
              margin-top: 8px;
            }
            .header .info strong {
              font-weight: bold;
            }
            .seccion {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .seccion h2 {
              font-size: 14pt;
              font-weight: bold;
              color: #000;
              margin-bottom: 12px;
              padding-bottom: 5px;
              border-bottom: 1px solid #333;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .metricas-grid {
              display: table;
              width: 100%;
              border: 1px solid #000;
              margin-bottom: 20px;
            }
            .metrica-row {
              display: table-row;
            }
            .metrica-cell {
              display: table-cell;
              padding: 10px 12px;
              border-bottom: 1px solid #ccc;
              vertical-align: middle;
            }
            .metrica-cell:first-child {
              font-weight: bold;
              width: 60%;
              background: #f5f5f5;
            }
            .metrica-cell:last-child {
              text-align: right;
              font-weight: bold;
            }
            .metrica-row:last-child .metrica-cell {
              border-bottom: none;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              border: 1px solid #000;
              font-size: 10pt;
            }
            table thead {
              background: #e0e0e0;
              border-bottom: 2px solid #000;
            }
            table th {
              padding: 8px 10px;
              text-align: left;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 9pt;
              border-right: 1px solid #ccc;
            }
            table th:last-child {
              border-right: none;
            }
            table td {
              padding: 8px 10px;
              border-bottom: 1px solid #ddd;
              border-right: 1px solid #ddd;
            }
            table td:last-child {
              border-right: none;
            }
            table tbody tr:last-child td {
              border-bottom: none;
            }
            table tbody tr:nth-child(even) {
              background: #f9f9f9;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .bold {
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              padding-top: 15px;
              border-top: 1px solid #000;
              text-align: center;
              font-size: 8pt;
              color: #666;
            }
            .summary-box {
              border: 1px solid #000;
              padding: 15px;
              margin-bottom: 20px;
              background: #f9f9f9;
            }
            .summary-box p {
              margin: 5px 0;
              font-size: 10pt;
            }
            .summary-box strong {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${tipoReporteOptions.find(t => t.value === tipoReporte)?.label}</h1>
            <div class="info">
              <strong>Fecha de generación:</strong> ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
            </div>
            <div class="info">
              <strong>Período:</strong> ${rangoFecha === 'mes' ? 'Último mes' : rangoFecha === 'trimestre' ? 'Último trimestre' : rangoFecha === 'semestre' ? 'Último semestre' : rangoFecha === 'año' ? 'Último año' : 'Personalizado'}
            </div>
          </div>

          <div class="seccion">
            <h2>Resumen Ejecutivo</h2>
            <div class="metricas-grid">
              <div class="metrica-row">
                <div class="metrica-cell">Ventas Totales</div>
                <div class="metrica-cell">S/ ${metricas.ventasTotales.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div class="metrica-row">
                <div class="metrica-cell">Crecimiento</div>
                <div class="metrica-cell">${metricas.crecimiento > 0 ? '+' : ''}${metricas.crecimiento}%</div>
              </div>
              <div class="metrica-row">
                <div class="metrica-cell">Pedidos Completados</div>
                <div class="metrica-cell">${metricas.pedidosCompletados} unidades</div>
              </div>
              <div class="metrica-row">
                <div class="metrica-cell">Ticket Promedio</div>
                <div class="metrica-cell">S/ ${metricas.ticketPromedio.toFixed(2)}</div>
              </div>
              <div class="metrica-row">
                <div class="metrica-cell">Margen de Ganancia</div>
                <div class="metrica-cell">${metricas.margenGanancia}%</div>
              </div>
            </div>
          </div>

          ${productosMasVendidos.length > 0 ? `
            <div class="seccion">
              <h2>Productos Más Vendidos</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 50%;">Producto</th>
                    <th style="width: 20%;" class="text-center">Cantidad</th>
                    <th style="width: 30%;" class="text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  ${productosMasVendidos.slice(0, 15).map((p, idx) => `
                    <tr>
                      <td>${idx + 1}. ${p.nombre}</td>
                      <td class="text-center">${p.cantidad} unidades</td>
                      <td class="text-right bold">S/ ${p.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${ventasPorCategoria.length > 0 ? `
            <div class="seccion">
              <h2>Ventas por Categoría</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 50%;">Categoría</th>
                    <th style="width: 30%;" class="text-right">Ventas</th>
                    <th style="width: 20%;" class="text-center">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  ${ventasPorCategoria.map(c => `
                    <tr>
                      <td>${c.categoria}</td>
                      <td class="text-right">S/ ${c.ventas.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="text-center bold">${c.porcentaje}%</td>
                    </tr>
                  `).join('')}
                  <tr style="border-top: 2px solid #000; background: #e8e8e8;">
                    <td class="bold">TOTAL</td>
                    <td class="text-right bold">S/ ${ventasPorCategoria.reduce((sum, c) => sum + c.ventas, 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="text-center bold">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}

          ${ventasMensuales.length > 0 ? `
            <div class="seccion">
              <h2>Ventas Mensuales</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 40%;">Período</th>
                    <th style="width: 35%;" class="text-right">Ventas</th>
                    <th style="width: 25%;" class="text-center">Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  ${ventasMensuales.map(v => `
                    <tr>
                      <td>${v.mes}</td>
                      <td class="text-right">S/ ${v.ventas.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td class="text-center">${v.pedidos}</td>
                    </tr>
                  `).join('')}
                  <tr style="border-top: 2px solid #000; background: #e8e8e8;">
                    <td class="bold">TOTAL</td>
                    <td class="text-right bold">S/ ${ventasMensuales.reduce((sum, v) => sum + v.ventas, 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="text-center bold">${ventasMensuales.reduce((sum, v) => sum + v.pedidos, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}

          <div class="footer">
            <p>Sistema de Inventario - Reporte generado automáticamente</p>
            <p>Documento impreso: ${format(new Date(), "dd/MM/yyyy HH:mm")}</p>
            <p>Página 1 de 1</p>
          </div>
        </body>
      </html>
    `;

    ventanaImpresion.document.write(contenidoHTML);
    ventanaImpresion.document.close();
    
    // Esperar a que se cargue el contenido antes de imprimir
    ventanaImpresion.onload = () => {
      ventanaImpresion.focus();
      setTimeout(() => {
        ventanaImpresion.print();
        notificaciones.documentoImpreso();
      }, 250);
    };
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
    <div className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-right" />
      {/* Topbar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#8f5cff]">{seccionActual.titulo}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{seccionActual.descripcion}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-100 text-[#8f5cff] rounded-full text-sm font-semibold">
                {format(new Date(), 'dd MMM yyyy', { locale: es })}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Actualizado {format(ultimaActualizacion, 'HH:mm', { locale: es })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refrescarDatos}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#8f5cff] text-white rounded-lg font-semibold hover:bg-[#7c4de0] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSearch className={loading ? 'animate-spin' : ''} /> Refrescar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportarExcel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              title="Exportar a Excel"
            >
              <FaFileExcel /> Excel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportarPDF}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              title="Exportar a PDF"
            >
              <FaFilePdf /> PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={imprimir}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              title="Imprimir reporte"
            >
              <FaPrint /> Imprimir
            </motion.button>
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaFilter className="text-[#8f5cff]" />
            <span className="font-semibold">Filtros:</span>
            {(categoriaFiltro || rangoFecha !== 'mes') && (
              <span className="px-2 py-1 bg-purple-100 text-[#8f5cff] rounded-full text-xs">
                Filtros activos
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select
                options={tipoReporteOptions}
                value={tipoReporteOptions.find(t => t.value === tipoReporte)}
                onChange={(selected) => setTipoReporte(selected.value)}
                placeholder="Tipo de reporte"
                className="text-sm"
                styles={customSelectStyles}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select
                options={rangoFechaOptions}
                value={rangoFechaOptions.find(r => r.value === rangoFecha)}
                onChange={(selected) => setRangoFecha(selected.value)}
                placeholder="Rango de fecha"
                className="text-sm"
                styles={customSelectStyles}
              />
            </div>
            {rangoFecha === 'personalizado' && (
              <>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8f5cff] text-sm"
                    placeholder="Fecha inicio"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400 dark:text-gray-500" />
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8f5cff] text-sm"
                    placeholder="Fecha fin"
                  />
                </div>
              </>
            )}
            <div className="flex-1 min-w-[200px]">
              <Select
                options={categoriaOptions}
                value={categoriaFiltro}
                onChange={setCategoriaFiltro}
                placeholder="Todas las categorías"
                isClearable
                className="text-sm"
                styles={customSelectStyles}
              />
            </div>
            {(categoriaFiltro || rangoFecha === 'personalizado') && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCategoriaFiltro(null);
                  setRangoFecha('mes');
                  setFechaInicio('');
                  setFechaFin('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"
              >
                Limpiar filtros
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="p-8">
        {/* Métricas principales */}
        {seccionActual.mostrarMetricas && (
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
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <FaShoppingCart className="text-4xl text-[#8f5cff]" />
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                metricas.crecimiento >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              }`}>
                {metricas.crecimiento >= 0 ? '+' : ''}{Math.abs(metricas.crecimiento) === Infinity ? '∞' : metricas.crecimiento}%
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{metricas.pedidosCompletados}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pedidos Completados</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <FaChartLine className="text-4xl text-[#6e7ff3]" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                S/ {metricas.ticketPromedio.toFixed(0)}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">S/ {metricas.ticketPromedio.toFixed(2)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Ticket Promedio</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <FaBox className="text-4xl text-[#f59e42]" />
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                {metricas.margenGanancia}%
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{metricas.margenGanancia}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Margen de Ganancia</div>
          </motion.div>
        </section>
        )}

        {/* Gráficos principales */}
        {seccionActual.mostrarVentasMensuales && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico de ventas mensuales */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Evolución de Ventas</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setVistaGrafico('lineas')}
                  className={`p-2 rounded-lg ${vistaGrafico === 'lineas' ? 'bg-[#8f5cff] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                >
                  <FaChartLine />
                </button>
                <button
                  onClick={() => setVistaGrafico('barras')}
                  className={`p-2 rounded-lg ${vistaGrafico === 'barras' ? 'bg-[#8f5cff] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                >
                  <FaChartBar />
                </button>
                <button
                  onClick={() => setVistaGrafico('area')}
                  className={`p-2 rounded-lg ${vistaGrafico === 'area' ? 'bg-[#8f5cff] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
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
          {seccionActual.mostrarCategorias && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Ventas por Categoría {categoriaFiltro && `- ${categoriaFiltro.label}`}</h2>
            {datosFiltrados.ventasPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosFiltrados.ventasPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categoria, porcentaje }) => `${categoria} ${porcentaje}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="ventas"
                >
                  {datosFiltrados.ventasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `S/ ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <FaChartPie className="text-5xl mx-auto mb-3 opacity-50" />
                  <p>No hay datos de ventas para esta categoría</p>
                </div>
              </div>
            )}
            <div className="mt-4 space-y-2">
              {datosFiltrados.ventasPorCategoria.map((cat, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-gray-700">{cat.categoria}</span>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">S/ {cat.ventas.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
          )}
        </section>
        )}

        {/* Rendimiento por Canal y Top Productos en grid 50-50 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rendimiento por canal */}
          {seccionActual.mostrarCanales && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Rendimiento por Canal</h2>
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
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{canal.canal}</div>
                  <div className="font-bold text-[#8f5cff]">S/ {canal.ventas.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{canal.pedidos} pedidos</div>
                </div>
              ))}
            </div>
          </motion.div>
          )}

          {/* Productos más vendidos */}
          {seccionActual.mostrarTopProductos && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Top Productos {categoriaFiltro && `- ${categoriaFiltro.label}`}</h2>
            <div className="space-y-4">
              {datosFiltrados.productosMasVendidos.length > 0 ? datosFiltrados.productosMasVendidos.map((producto, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{producto.nombre}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{producto.categoria}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800 dark:text-gray-100">S/ {producto.ingresos.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{producto.cantidad} unidades</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaBox className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No hay productos en esta categoría</p>
                </div>
              )}
            </div>
            {datosFiltrados.productosMasVendidos.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={datosFiltrados.productosMasVendidos} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="nombre" hide />
                  <Tooltip formatter={(value) => `S/ ${value.toLocaleString()}`} />
                  <Bar dataKey="ingresos" fill="#8f5cff" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            )}
          </motion.div>
          )}
        </section>

        {/* Comparativo anual - Ancho completo */}
        {seccionActual.mostrarComparativo && (
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Comparativo 2024 vs 2025</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={comparativoAnual}>
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis dataKey="mes" className="dark:stroke-gray-400" />
                <YAxis className="dark:stroke-gray-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px',
                    color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#000'
                  }}
                  formatter={(value) => `S/ ${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey={añoAnterior.toString()} fill="#b6aaff" radius={[8, 8, 0, 0]} name={añoAnterior.toString()} />
                <Line type="monotone" dataKey={añoActual.toString()} stroke="#8f5cff" strokeWidth={3} dot={{ r: 5 }} name={añoActual.toString()} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total {añoAnterior}</div>
                <div className="text-xl font-bold text-[#8f5cff]">
                  S/ {comparativoAnual.reduce((sum, m) => sum + (m[añoAnterior.toString()] || 0), 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total {añoActual}</div>
                <div className="text-xl font-bold text-[#8f5cff]">
                  S/ {comparativoAnual.reduce((sum, m) => sum + (m[añoActual.toString()] || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        </section>
        )}

        {/* Estado de inventario */}
        {seccionActual.mostrarInventario && (
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Estado del Inventario</h2>
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
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.categoria}</span>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{item.valor} items</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8f5cff]">{estadoInventario.reduce((acc, curr) => acc + curr.valor, 0)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">72%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Disponibilidad</div>
              </div>
            </div>
          </motion.div>
        </section>
        )}

        {/* NUEVOS GRÁFICOS - Productos por Estado */}
        {seccionActual.mostrarProductosPorEstado && (
        <section key={`productos-estado-${tipoReporte}`} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            key={`productos-pie-${tipoReporte}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Productos por Estado</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productosPorEstado}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  fill="#8884d8"
                  paddingAngle={3}
                  dataKey="cantidad"
                  label={({ estado, porcentaje }) => `${estado}: ${porcentaje}%`}
                >
                  {productosPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {productosPorEstado.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: `${item.color}15` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.estado}</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{item.cantidad}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            key={`productos-bar-${tipoReporte}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Distribución por Estado</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productosPorEstado} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="estado" width={100} />
                <Tooltip />
                <Bar dataKey="cantidad" radius={[0, 8, 8, 0]}>
                  {productosPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{productosPorEstado[0].cantidad}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Disponibles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{productosPorEstado[1].cantidad}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Bajo Stock</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{productosPorEstado[2].cantidad}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Agotados</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
        )}

        {/* NUEVOS GRÁFICOS - Rotación de Inventario */}
        {seccionActual.mostrarRotacionInventario && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Rotación de Inventario</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rotacionInventario}>
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis dataKey="producto" angle={-20} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rotacion" fill="#8f5cff" radius={[8, 8, 0, 0]} name="Rotación Mensual" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <div className="text-3xl font-bold text-[#8f5cff]">{(rotacionInventario.reduce((sum, p) => sum + p.rotacion, 0) / rotacionInventario.length).toFixed(1)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rotación Promedio Mensual</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Días de Inventario</h2>
            <div className="space-y-4">
              {rotacionInventario.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.producto}</span>
                    <span className="text-sm font-bold text-[#8f5cff]">{item.dias} días</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((item.dias / 120) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.min(...rotacionInventario.map(p => p.dias))}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Rotación Más Rápida</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.max(...rotacionInventario.map(p => p.dias))}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Rotación Más Lenta</div>
              </div>
            </div>
          </motion.div>
        </section>
        )}

        {/* NUEVOS GRÁFICOS - Margen de Ganancia por Producto */}
        {seccionActual.mostrarMargenGanancia && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Precio vs Costo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={margenGananciaPorProducto}>
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis dataKey="producto" angle={-20} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `S/ ${value}`} />
                <Legend />
                <Bar dataKey="precio" fill="#8f5cff" name="Precio Venta" radius={[8, 8, 0, 0]} />
                <Bar dataKey="costo" fill="#f59e42" name="Costo" radius={[8, 8, 0, 0]} />
                <Line type="monotone" dataKey="margen" stroke="#10b981" strokeWidth={3} name="Margen %" />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Margen de Ganancia</h2>
            <div className="space-y-4">
              {margenGananciaPorProducto.map((prod, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">{prod.producto}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Precio: S/ {prod.precio} | Costo: S/ {prod.costo}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{prod.margen}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">S/ {prod.precio - prod.costo}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                      style={{ width: `${prod.margen}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl font-bold text-green-600">
                {(margenGananciaPorProducto.reduce((sum, p) => sum + p.margen, 0) / margenGananciaPorProducto.length).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Margen Promedio</div>
            </div>
          </motion.div>
        </section>
        )}

        {/* NUEVOS GRÁFICOS - Tipos de Cliente */}
        {seccionActual.mostrarTiposCliente && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Segmentación de Clientes</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tiposCliente}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tipo, cantidad }) => `${tipo}: ${cantidad}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {tiposCliente.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-3">
              {tiposCliente.map((tipo, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${tipo.color}15` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tipo.color }}></div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-100">{tipo.tipo}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{tipo.cantidad} clientes</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">S/ {tipo.ventas.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total ventas</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Valor por Tipo de Cliente</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tiposCliente}>
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip formatter={(value) => `S/ ${value.toLocaleString()}`} />
                <Bar dataKey="ventas" radius={[8, 8, 0, 0]}>
                  {tiposCliente.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {tiposCliente.map((tipo, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="text-2xl font-bold" style={{ color: tipo.color }}>
                    S/ {Math.round(tipo.ventas / tipo.cantidad).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ticket Prom. {tipo.tipo}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
        )}

        {/* NUEVOS GRÁFICOS - Clientes Frecuentes */}
        {seccionActual.mostrarClientesFrecuentes && (
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Top Clientes Frecuentes</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {clientesFrecuentes.map((cliente, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-700 hover:shadow-md transition">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-100">{cliente.nombre}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{cliente.pedidos} pedidos realizados</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#8f5cff]">S/ {cliente.total.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total gastado</div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clientesFrecuentes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="nombre" width={100} />
                    <Tooltip formatter={(value) => `S/ ${value.toLocaleString()}`} />
                    <Bar dataKey="total" fill="#8f5cff" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#8f5cff]">
                      {clientesFrecuentes.reduce((sum, c) => sum + c.pedidos, 0)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Pedidos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#8f5cff]">
                      S/ {clientesFrecuentes.reduce((sum, c) => sum + c.total, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-400">Valor Acumulado</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
        )}

        {/* NUEVOS GRÁFICOS - Costos Mensuales */}
        {seccionActual.mostrarCostos && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Desglose de Costos</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costosMensuales}>
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `S/ ${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="materiales" stackId="a" fill="#8f5cff" name="Materiales" radius={[0, 0, 0, 0]} />
                <Bar dataKey="operativos" stackId="a" fill="#f59e42" name="Operativos" radius={[0, 0, 0, 0]} />
                <Bar dataKey="personal" stackId="a" fill="#10b981" name="Personal" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="text-lg font-bold text-[#8f5cff]">
                  S/ {costosMensuales.reduce((sum, m) => sum + m.materiales, 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Materiales</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <div className="text-lg font-bold text-[#f59e42]">
                  S/ {costosMensuales.reduce((sum, m) => sum + m.operativos, 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Operativos</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-lg font-bold text-[#10b981]">
                  S/ {costosMensuales.reduce((sum, m) => sum + m.personal, 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Personal</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Evolución de Costos Totales</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={costosMensuales.map(m => ({
                mes: m.mes,
                total: m.materiales + m.operativos + m.personal
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `S/ ${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="total" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Costos Totales" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    S/ {costosMensuales.reduce((sum, m) => sum + m.materiales + m.operativos + m.personal, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Costos Totales del Período</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    S/ {Math.round((costosMensuales.reduce((sum, m) => sum + m.materiales + m.operativos + m.personal, 0)) / costosMensuales.length).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Promedio Mensual</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
        )}

        {/* NUEVOS GRÁFICOS - Rentabilidad */}
        {seccionActual.mostrarRentabilidad && (
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Análisis de Rentabilidad</h2>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={rentabilidadMensual}>
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="ingresos" fill="#10b981" name="Ingresos" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="left" dataKey="costos" fill="#ef4444" name="Costos" radius={[8, 8, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="utilidad" stroke="#8f5cff" strokeWidth={3} name="Utilidad" />
                <Line yAxisId="right" type="monotone" dataKey="margen" stroke="#f59e42" strokeWidth={3} name="Margen %" />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ingresos Totales</div>
                <div className="text-2xl font-bold text-green-600">
                  S/ {rentabilidadMensual.reduce((sum, m) => sum + m.ingresos, 0).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Costos Totales</div>
                <div className="text-2xl font-bold text-red-600">
                  S/ {rentabilidadMensual.reduce((sum, m) => sum + m.costos, 0).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Utilidad Total</div>
                <div className="text-2xl font-bold text-[#8f5cff]">
                  S/ {rentabilidadMensual.reduce((sum, m) => sum + m.utilidad, 0).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Margen Promedio</div>
                <div className="text-2xl font-bold text-[#f59e42]">
                  {(rentabilidadMensual.reduce((sum, m) => sum + m.margen, 0) / rentabilidadMensual.length).toFixed(1)}%
                </div>
              </div>
            </div>
          </motion.div>
        </section>
        )}

        {/* Tabla detallada de métricas */}
        {seccionActual.mostrarVentasMensuales && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Desglose Mensual Detallado</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Mes</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Ventas</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Costos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Ganancias</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Pedidos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Margen %</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {ventasMensuales.map((mes, index) => {
                  const margen = ((mes.ganancias / mes.ventas) * 100).toFixed(1);
                  const tendenciaMes = index > 0 ? ((mes.ventas - ventasMensuales[index - 1].ventas) / ventasMensuales[index - 1].ventas * 100).toFixed(1) : 0;
                  return (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100">{mes.mes}</td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">S/ {mes.ventas.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">S/ {mes.costos.toLocaleString()}</td>
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
                <tr className="bg-purple-50 dark:bg-purple-900 font-bold text-gray-800 dark:text-gray-100">
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
        )}

        {/* Métricas adicionales */}
        {seccionActual.mostrarMetricas && (
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
        )}

      </main>
    </div>
  );
}

export default ReportesView;
