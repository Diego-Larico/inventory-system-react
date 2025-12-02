import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { FaPlus, FaSearch, FaShippingFast, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaEdit, FaTrash, FaFilter, FaDownload, FaBoxOpen, FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaEnvelope } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Modal from 'react-modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import NuevoPedidoModal from './components/NuevoPedidoModal';
import EditarPedidoModal from './components/EditarPedidoModal';
import {
  obtenerPedidos,
  actualizarEstadoPedido,
  eliminarPedido,
  obtenerEstadisticasPedidos,
  buscarPedidos,
  obtenerPedidosPorSemana,
  obtenerIngresosMensuales,
} from './services/pedidosService';

function PedidosView({ onNavigate }) {
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [prioridadFiltro, setPrioridadFiltro] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista', 'kanban', 'calendario'
  const [showNuevoPedidoModal, setShowNuevoPedidoModal] = useState(false);
  const [showEditarPedidoModal, setShowEditarPedidoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalPedidos: 0,
    pendientes: 0,
    enProceso: 0,
    completados: 0,
    cancelados: 0,
    ventasMes: 0,
  });
  const [dataPorSemana, setDataPorSemana] = useState([]);
  const [dataIngresos, setDataIngresos] = useState([]);

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
    cargarEstadisticas();
    cargarDatosGraficos();
  }, []);

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const resultado = await obtenerPedidos();
      if (resultado.success) {
        setPedidos(resultado.data);
      } else {
        toast.error('Error al cargar pedidos');
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const resultado = await obtenerEstadisticasPedidos();
      if (resultado.success) {
        setEstadisticas(resultado.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarDatosGraficos = async () => {
    try {
      // Cargar datos de pedidos por semana
      const resultadoSemana = await obtenerPedidosPorSemana();
      if (resultadoSemana.success) {
        setDataPorSemana(resultadoSemana.data);
      }

      // Cargar datos de ingresos mensuales
      const resultadoIngresos = await obtenerIngresosMensuales();
      if (resultadoIngresos.success) {
        setDataIngresos(resultadoIngresos.data);
      }
    } catch (error) {
      console.error('Error al cargar datos de gráficos:', error);
    }
  };

  // Buscar pedidos cuando cambia el término de búsqueda
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (busqueda.trim()) {
        const resultado = await buscarPedidos(busqueda);
        if (resultado.success) {
          setPedidos(resultado.data);
        }
      } else {
        cargarPedidos();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda]);

  // Mock data inicial solo para cuando no hay pedidos en la BD
  const pedidosMock = [
    {
      id: 'PED-001',
      cliente: 'Juan Pérez',
      telefono: '+51 987654321',
      direccion: 'Av. Principal 123, Lima',
      estado: 'Pendiente',
      prioridad: 'Alta',
      fecha: '2025-11-20',
      fechaEntrega: '2025-11-25',
      total: 450.00,
      productos: [
        { nombre: 'Polo básico blanco', cantidad: 10, precio: 25.00 },
        { nombre: 'Pantalón jean azul', cantidad: 5, precio: 40.00 }
      ],
      notas: 'Entrega urgente antes de las 3pm'
    },
    {
      id: 'PED-002',
      cliente: 'María García',
      telefono: '+51 912345678',
      direccion: 'Jr. Los Olivos 456, Arequipa',
      estado: 'En Proceso',
      prioridad: 'Media',
      fecha: '2025-11-19',
      fechaEntrega: '2025-11-23',
      total: 320.00,
      productos: [
        { nombre: 'Chaqueta denim', cantidad: 4, precio: 80.00 }
      ],
      notas: ''
    },
    {
      id: 'PED-003',
      cliente: 'Carlos Rodríguez',
      telefono: '+51 998877665',
      direccion: 'Calle Comercio 789, Cusco',
      estado: 'Completado',
      prioridad: 'Baja',
      fecha: '2025-11-15',
      fechaEntrega: '2025-11-18',
      total: 890.00,
      productos: [
        { nombre: 'Vestido floral', cantidad: 5, precio: 120.00 },
        { nombre: 'Polo básico blanco', cantidad: 13, precio: 25.00 }
      ],
      notas: 'Cliente satisfecho'
    },
    {
      id: 'PED-004',
      cliente: 'Ana López',
      telefono: '+51 976543210',
      direccion: 'Av. Industrial 234, Trujillo',
      estado: 'Cancelado',
      prioridad: 'Alta',
      fecha: '2025-11-18',
      fechaEntrega: '2025-11-22',
      total: 560.00,
      productos: [
        { nombre: 'Pantalón jean azul', cantidad: 14, precio: 40.00 }
      ],
      notas: 'Cliente solicitó cancelación'
    },
    {
      id: 'PED-005',
      cliente: 'Luis Fernández',
      telefono: '+51 965432109',
      direccion: 'Psje. Las Flores 567, Chiclayo',
      estado: 'En Tránsito',
      prioridad: 'Media',
      fecha: '2025-11-17',
      fechaEntrega: '2025-11-21',
      total: 725.00,
      productos: [
        { nombre: 'Chaqueta denim', cantidad: 5, precio: 80.00 },
        { nombre: 'Vestido floral', cantidad: 3, precio: 120.00 }
      ],
      notas: 'En camino al destino'
    },
    {
      id: 'PED-006',
      cliente: 'Patricia Vega',
      telefono: '+51 954321098',
      direccion: 'Av. Grau 890, Piura',
      estado: 'Pendiente',
      prioridad: 'Alta',
      fecha: '2025-11-20',
      fechaEntrega: '2025-11-24',
      total: 1200.00,
      productos: [
        { nombre: 'Polo básico blanco', cantidad: 20, precio: 25.00 },
        { nombre: 'Pantalón jean azul', cantidad: 10, precio: 40.00 },
        { nombre: 'Chaqueta denim', cantidad: 4, precio: 80.00 }
      ],
      notas: 'Pedido corporativo - Factura requerida'
    },
  ];

  // Filtros
  const estadoOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'En Proceso', label: 'En Proceso' },
    { value: 'Entregado', label: 'Entregado' },
    { value: 'Completado', label: 'Completado' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  const prioridadOptions = [
    { value: 'Alta', label: 'Alta' },
    { value: 'Media', label: 'Media' },
    { value: 'Baja', label: 'Baja' }
  ];

  // Filtrado
  const pedidosFiltrados = pedidos.filter(p => {
    const matchEstado = estadoFiltro ? p.estado === estadoFiltro.value : true;
    const matchPrioridad = prioridadFiltro ? p.prioridad === prioridadFiltro.value : true;
    const matchFecha = fechaInicio && fechaFin ? 
      new Date(p.fecha_pedido) >= new Date(fechaInicio) && new Date(p.fecha_pedido) <= new Date(fechaFin) : true;
    return matchEstado && matchPrioridad && matchFecha;
  });

  // Estadísticas calculadas desde el estado
  const totalPedidos = estadisticas.totalPedidos || pedidos.length;
  const pendientes = estadisticas.pendientes || pedidos.filter(p => p.estado === 'Pendiente').length;
  const enProceso = pedidos.filter(p => p.estado === 'En Proceso' || p.estado === 'Entregado').length;
  const completados = estadisticas.completados || pedidos.filter(p => p.estado === 'Completado').length;
  const cancelados = pedidos.filter(p => p.estado === 'Cancelado').length;
  const ingresoTotal = estadisticas.ventasMes || 0;

  // Datos para gráficos
  const dataPorEstado = [
    { name: 'Pendiente', value: pendientes, color: '#f59e42' },
    { name: 'En Proceso', value: enProceso, color: '#6e7ff3' },
    { name: 'Completado', value: completados, color: '#10b981' },
    { name: 'Cancelado', value: cancelados, color: '#ef4444' }
  ];

  // Los datos de gráficos ahora vienen del estado cargado desde Supabase

  // Funciones
  function handleVerDetalle(pedido) {
    setSelectedPedido(pedido);
    setShowModal(true);
  }

  function handleCerrarModal() {
    setShowModal(false);
    setSelectedPedido(null);
  }

  async function handleCambiarEstado(pedidoId, nuevoEstado) {
    try {
      const resultado = await actualizarEstadoPedido(pedidoId, nuevoEstado);
      if (resultado.success) {
        toast.success(`Estado actualizado a ${nuevoEstado}`);
        await cargarPedidos();
        await cargarEstadisticas();
      } else {
        toast.error('Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al actualizar estado');
    }
  }

  async function handleEliminarPedido(pedidoId) {
    if (!window.confirm('¿Estás seguro de eliminar este pedido?')) {
      return;
    }

    try {
      const resultado = await eliminarPedido(pedidoId);
      if (resultado.success) {
        toast.success('Pedido eliminado correctamente');
        await cargarPedidos();
        await cargarEstadisticas();
        if (showModal) {
          handleCerrarModal();
        }
      } else {
        toast.error('Error al eliminar pedido');
      }
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      toast.error('Error al eliminar pedido');
    }
  }

  async function handlePedidoCreado(nuevoPedido) {
    setShowNuevoPedidoModal(false);
    await cargarPedidos();
    await cargarEstadisticas();
  }
  function handleVerDetalle(pedido) {
    setSelectedPedido(pedido);
    setShowModal(true);
  }

  function handleCerrarModal() {
    setShowModal(false);
    setSelectedPedido(null);
  }

  function handleExportar() {
    console.log('Exportando pedidos a Excel...');
    // Aquí iría la lógica de exportación
  }

  function getEstadoColor(estado) {
    switch (estado) {
      case 'Pendiente': return 'bg-orange-100 text-orange-600';
      case 'En Proceso': return 'bg-blue-100 text-blue-600';
      case 'Entregado': return 'bg-purple-100 text-purple-600';
      case 'Completado': return 'bg-green-100 text-green-600';
      case 'Cancelado': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  function getEstadoIcon(estado) {
    switch (estado) {
      case 'Pendiente': return <FaClock className="text-orange-500" />;
      case 'En Proceso': return <FaBoxOpen className="text-blue-500" />;
      case 'Entregado': return <FaShippingFast className="text-purple-500" />;
      case 'Completado': return <FaCheckCircle className="text-green-500" />;
      case 'Cancelado': return <FaTimesCircle className="text-red-500" />;
      default: return null;
    }
  }

  function getPrioridadColor(prioridad) {
    switch (prioridad) {
      case 'Alta': return 'text-red-500 font-bold';
      case 'Media': return 'text-yellow-500 font-semibold';
      case 'Baja': return 'text-green-500';
      default: return 'text-gray-500';
    }
  }

  return (
    <div className="flex fixed inset-0 bg-gray-100 dark:bg-gray-900">
      <Sidebar onNavigate={onNavigate} activeView={'pedidos'} />
      <div className="flex-1 flex flex-col min-h-0">
        <header className="px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#8f5cff]">Pedidos</h1>
            <p className="text-sm text-gray-400">Gestiona y monitorea todos los pedidos del negocio</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportar}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2"
            >
              <FaDownload /> Exportar
            </button>
            <button 
              onClick={() => setShowNuevoPedidoModal(true)}
              className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6e7ff3] transition flex items-center gap-2"
            >
              <FaPlus /> Nuevo Pedido
            </button>
          </div>
        </header>
        
        <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
          {/* Resumen de estadísticas */}
          <section className="mb-8 grid grid-cols-1 md:grid-cols-6 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center"
            >
              <span className="text-lg font-semibold mb-2">Total Pedidos</span>
              <span className="text-4xl font-bold">{totalPedidos}</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center"
            >
              <FaClock className="text-orange-500 text-3xl mb-2" />
              <span className="text-lg font-semibold text-gray-700">Pendientes</span>
              <span className="text-3xl font-bold text-orange-500">{pendientes}</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center"
            >
              <FaShippingFast className="text-blue-500 text-3xl mb-2" />
              <span className="text-lg font-semibold text-gray-700">En Proceso</span>
              <span className="text-3xl font-bold text-blue-500">{enProceso}</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center"
            >
              <FaCheckCircle className="text-green-500 text-3xl mb-2" />
              <span className="text-lg font-semibold text-gray-700">Completados</span>
              <span className="text-3xl font-bold text-green-500">{completados}</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center"
            >
              <FaTimesCircle className="text-red-500 text-3xl mb-2" />
              <span className="text-lg font-semibold text-gray-700">Cancelados</span>
              <span className="text-3xl font-bold text-red-500">{cancelados}</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center"
            >
              <span className="text-lg font-semibold mb-2">Ingresos</span>
              <span className="text-3xl font-bold">S/ {ingresoTotal.toFixed(2)}</span>
            </motion.div>
          </section>

          {/* Gráficos de análisis */}
          <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gráfico de distribución por estado */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#8f5cff]">Distribución por Estado</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataPorEstado}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dataPorEstado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de pedidos por semana */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#8f5cff]">Pedidos esta Semana</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataPorSemana}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pedidos" fill="#8f5cff" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de ingresos */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#8f5cff]">Ingresos Mensuales</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataIngresos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Filtros y búsqueda */}
          <section className="mb-6 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <FaFilter className="text-[#8f5cff]" />
              <h3 className="text-lg font-semibold text-[#8f5cff]">Filtros de Búsqueda</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <FaSearch className="text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar por ID o cliente..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f5cff]"
                />
              </div>
              <Select
                options={estadoOptions}
                value={estadoFiltro}
                onChange={setEstadoFiltro}
                isClearable
                placeholder="Estado"
                className="w-full"
              />
              <Select
                options={prioridadOptions}
                value={prioridadFiltro}
                onChange={setPrioridadFiltro}
                isClearable
                placeholder="Prioridad"
                className="w-full"
              />
              <input
                type="date"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f5cff]"
                placeholder="Fecha inicio"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f5cff]"
                placeholder="Fecha fin"
              />
            </div>
          </section>

          {/* Botones de vista */}
          <section className="mb-6 flex gap-3">
            <button
              onClick={() => setVistaActual('lista')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                vistaActual === 'lista' 
                  ? 'bg-[#8f5cff] text-white' 
                  : 'bg-white text-[#8f5cff] border border-[#8f5cff]'
              }`}
            >
              Vista Lista
            </button>
            <button
              onClick={() => setVistaActual('kanban')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                vistaActual === 'kanban' 
                  ? 'bg-[#8f5cff] text-white' 
                  : 'bg-white text-[#8f5cff] border border-[#8f5cff]'
              }`}
            >
              Vista Kanban
            </button>
          </section>

          {/* Vista de Lista */}
          {vistaActual === 'lista' && (
            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#8f5cff] mb-4">
                Lista de Pedidos ({pedidosFiltrados.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-center">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="pb-3 text-center">ID</th>
                      <th className="pb-3 text-center">Cliente</th>
                      <th className="pb-3 text-center">Fecha</th>
                      <th className="pb-3 text-center">Entrega</th>
                      <th className="pb-3 text-center">Estado</th>
                      <th className="pb-3 text-center">Prioridad</th>
                      <th className="pb-3 text-center">Total</th>
                      <th className="pb-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="py-8 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8f5cff]"></div>
                              <span className="text-gray-500">Cargando pedidos...</span>
                            </div>
                          </td>
                        </tr>
                      ) : pedidosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-gray-500">
                            No se encontraron pedidos
                          </td>
                        </tr>
                      ) : (
                        pedidosFiltrados.map((pedido, index) => (
                          <motion.tr
                            key={pedido.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                          >
                            <td className="py-4">
                              <div className="flex flex-col items-center">
                                <span className="font-semibold text-[#8f5cff]">{pedido.numero_pedido || pedido.id}</span>
                                {pedido.numero_pedido && (
                                  <span className="text-xs text-gray-400">{pedido.id}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-gray-700">{pedido.cliente_nombre}</span>
                                {pedido.cliente_telefono && (
                                  <span className="text-xs text-gray-400">{pedido.cliente_telefono}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 text-gray-600 text-sm">
                              {pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toLocaleDateString('es-ES') : '-'}
                            </td>
                            <td className="py-4 text-gray-600 text-sm font-semibold">
                              {pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toLocaleDateString('es-ES') : '-'}
                            </td>
                            <td className="py-4">
                              <div className="flex items-center justify-center gap-2">
                                {getEstadoIcon(pedido.estado)}
                                <select
                                  value={pedido.estado}
                                  onChange={(e) => handleCambiarEstado(pedido.id, e.target.value)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${getEstadoColor(pedido.estado)}`}
                                >
                                  <option value="Pendiente">Pendiente</option>
                                  <option value="En Proceso">En Proceso</option>
                                  <option value="Completado">Completado</option>
                                  <option value="Cancelado">Cancelado</option>
                                  <option value="Entregado">Entregado</option>
                                </select>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`${getPrioridadColor(pedido.prioridad)}`}>
                                {pedido.prioridad}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className="font-bold text-green-600">S/ {parseFloat(pedido.total || 0).toFixed(2)}</span>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2 items-center justify-center">
                                <button
                                  onClick={() => handleVerDetalle(pedido)}
                                  className="bg-[#8f5cff] text-white px-3 py-1 rounded-lg font-semibold flex items-center gap-2 shadow hover:scale-105 transition-transform duration-200 whitespace-nowrap"
                                >
                                  <FaEye /> Ver
                                </button>
                                <button 
                                  onClick={() => handleEliminarPedido(pedido.id)}
                                  className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold flex items-center gap-2 shadow hover:bg-red-600 transition whitespace-nowrap"
                                >
                                  <FaTrash /> Eliminar
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Vista Kanban */}
          {vistaActual === 'kanban' && (
            <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {estadoOptions.map(estado => {
                const pedidosEstado = pedidosFiltrados.filter(p => p.estado === estado.value);
                return (
                  <div key={estado.value} className="bg-gray-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">{estado.label}</h3>
                      <span className="bg-[#8f5cff] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {pedidosEstado.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {pedidosEstado.map(pedido => (
                        <motion.div
                          key={pedido.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer"
                          onClick={() => handleVerDetalle(pedido)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[#8f5cff] text-sm">{pedido.numero_pedido || pedido.id}</span>
                            <span className={`text-xs font-semibold ${getPrioridadColor(pedido.prioridad)}`}>
                              {pedido.prioridad}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">{pedido.cliente_nombre}</p>
                          {pedido.cliente_telefono && (
                            <p className="text-xs text-gray-500 mb-2">{pedido.cliente_telefono}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>📅 {pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toLocaleDateString('es-ES') : '-'}</span>
                            <span className="font-bold text-green-600">S/ {parseFloat(pedido.total || 0).toFixed(2)}</span>
                          </div>
                        </motion.div>
                      ))}
                      {pedidosEstado.length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-4">
                          Sin pedidos
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </main>
      </div>

      {/* Modal de Detalle */}
      <Modal
        isOpen={showModal}
        onRequestClose={handleCerrarModal}
        contentLabel="Detalle del Pedido"
        ariaHideApp={false}
        style={{
          overlay: { zIndex: 1000, background: 'rgba(0,0,0,0.5)' },
          content: {
            borderRadius: 20,
            maxWidth: 700,
            margin: 'auto',
            padding: 0,
            maxHeight: '90vh',
            overflow: 'hidden'
          }
        }}
      >
        {selectedPedido && (
          <div className="flex flex-col h-full">
            {/* Header del Modal */}
            <div className="bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Detalle del Pedido</h2>
                <button
                  onClick={handleCerrarModal}
                  className="text-white hover:bg-white hover:text-[#8f5cff] rounded-full w-8 h-8 flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{selectedPedido.numero_pedido || selectedPedido.id}</div>
                  {selectedPedido.numero_pedido && (
                    <div className="text-sm opacity-80">ID: {selectedPedido.id}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getEstadoIcon(selectedPedido.estado)}
                  <span className="bg-white text-[#8f5cff] px-4 py-2 rounded-full font-semibold">
                    {selectedPedido.estado}
                  </span>
                </div>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Información del Cliente */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#8f5cff] mb-3 flex items-center gap-2">
                  <FaUser /> Información del Cliente
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400" />
                    <span className="font-semibold">{selectedPedido.cliente_nombre}</span>
                  </div>
                  {selectedPedido.cliente_telefono && (
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      <span className="text-gray-700">{selectedPedido.cliente_telefono}</span>
                    </div>
                  )}
                  {selectedPedido.cliente_direccion && (
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <span className="text-gray-700">{selectedPedido.cliente_direccion}</span>
                    </div>
                  )}
                  {selectedPedido.cliente_email && (
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      <span className="text-gray-700">{selectedPedido.cliente_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <FaCalendarAlt />
                    <span className="text-sm">Fecha de Pedido</span>
                  </div>
                  <span className="font-bold text-lg text-gray-700">
                    {selectedPedido.fecha_pedido ? new Date(selectedPedido.fecha_pedido).toLocaleDateString('es-ES') : '-'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <FaShippingFast />
                    <span className="text-sm">Fecha de Entrega</span>
                  </div>
                  <span className="font-bold text-lg text-[#8f5cff]">
                    {selectedPedido.fecha_entrega ? new Date(selectedPedido.fecha_entrega).toLocaleDateString('es-ES') : '-'}
                  </span>
                </div>
              </div>

              {/* Prioridad */}
              <div className="mb-6">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <span className="font-semibold text-gray-700">Prioridad:</span>
                  <span className={`text-xl font-bold ${getPrioridadColor(selectedPedido.prioridad)}`}>
                    {selectedPedido.prioridad}
                  </span>
                </div>
              </div>

              {/* Productos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#8f5cff] mb-3 flex items-center gap-2">
                  <FaBoxOpen /> Productos
                </h3>
                <div className="space-y-2">
                  {(selectedPedido.detalles || []).map((detalle, index) => (
                    <div key={detalle.id || index} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-700">{detalle.producto_nombre}</p>
                        <p className="text-sm text-gray-500">Cantidad: {detalle.cantidad}</p>
                        {(detalle.talla || detalle.color) && (
                          <p className="text-xs text-gray-400">
                            {detalle.talla && `Talla: ${detalle.talla}`}
                            {detalle.talla && detalle.color && ' | '}
                            {detalle.color && `Color: ${detalle.color}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Precio unit.: S/ {parseFloat(detalle.precio_unitario).toFixed(2)}</p>
                        <p className="font-bold text-green-600">S/ {parseFloat(detalle.subtotal).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desglose de Totales */}
              <div className="mb-6 bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">S/ {parseFloat(selectedPedido.subtotal || 0).toFixed(2)}</span>
                </div>
                {parseFloat(selectedPedido.descuento || 0) > 0 && (
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Descuento:</span>
                    <span className="font-semibold text-red-600">- S/ {parseFloat(selectedPedido.descuento).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(selectedPedido.impuestos || 0) > 0 && (
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Impuestos:</span>
                    <span className="font-semibold">S/ {parseFloat(selectedPedido.impuestos).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex items-center justify-between text-lg font-bold text-gray-800">
                  <span>Total:</span>
                  <span className="text-green-600">S/ {parseFloat(selectedPedido.total || 0).toFixed(2)}</span>
                </div>
                {parseFloat(selectedPedido.anticipo || 0) > 0 && (
                  <>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Anticipo:</span>
                      <span className="font-semibold text-blue-600">S/ {parseFloat(selectedPedido.anticipo).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Saldo Pendiente:</span>
                      <span className="text-orange-600">S/ {parseFloat(selectedPedido.saldo || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Método de Pago */}
              {selectedPedido.metodo_pago && (
                <div className="mb-6 bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-semibold">Método de Pago:</span>
                    <span className="text-blue-700 font-bold">{selectedPedido.metodo_pago}</span>
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedPedido.notas && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-yellow-700 mb-2">Notas:</h3>
                  <p className="text-gray-700">{selectedPedido.notas}</p>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={handleCerrarModal}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cerrar
              </button>
              <button 
                onClick={() => handleEliminarPedido(selectedPedido.id)}
                className="bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
              >
                <FaTrash /> Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <NuevoPedidoModal
        isOpen={showNuevoPedidoModal}
        onClose={() => setShowNuevoPedidoModal(false)}
        onSubmit={handlePedidoCreado}
      />

      <EditarPedidoModal
        isOpen={showEditarPedidoModal}
        onClose={() => {
          setShowEditarPedidoModal(false);
        }}
        onSubmit={(data) => {
          console.log('Pedido editado:', data);
          setShowEditarPedidoModal(false);
          setSelectedPedido(null);
        }}
        pedido={selectedPedido}
      />
    </div>
  );
}

export default PedidosView;
