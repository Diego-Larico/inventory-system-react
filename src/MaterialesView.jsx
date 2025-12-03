import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  obtenerMateriales, 
  eliminarMaterial, 
  obtenerCategoriasMateriales,
  buscarMateriales,
  obtenerEstadisticasMateriales 
} from './services/materialesService';
import { 
  FaPlus, FaEdit, FaSearch, FaExclamationTriangle, FaBox, FaCube, 
  FaWarehouse, FaTag, FaFilter, FaDownload, FaTh, FaList, FaChartPie,
  FaSortAmountDown, FaSortAmountUp, FaEye, FaBoxes, FaLayerGroup
} from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import NuevoMaterialModal from './components/NuevoMaterialModal';
import EditarMaterialModal from './components/EditarMaterialModal';
import toast, { Toaster } from 'react-hot-toast';
import { confirmarEliminar } from './utils/confirmationModals';

function MaterialesView({ onNavigate }) {
  const [showNuevoMaterialModal, setShowNuevoMaterialModal] = useState(false);
  const [showEditarMaterialModal, setShowEditarMaterialModal] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState('grid');
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [ordenamiento, setOrdenamiento] = useState('nombre-asc');
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);
  
  // Estado para datos de Supabase
  const [materiales, setMateriales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalMateriales: 0,
    disponibles: 0,
    bajoStock: 0,
    agotados: 0,
    valorInventario: 0
  });

  // Cargar materiales desde Supabase
  const cargarMateriales = async () => {
    setLoading(true);
    const resultado = await obtenerMateriales();
    if (resultado.success) {
      setMateriales(resultado.data);
    } else {
      toast.error('Error al cargar materiales: ' + resultado.error);
    }
    setLoading(false);
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    const resultado = await obtenerEstadisticasMateriales();
    if (resultado.success) {
      setEstadisticas(resultado.data);
    }
  };

  // Cargar categorías
  const cargarCategorias = async () => {
    const resultado = await obtenerCategoriasMateriales();
    if (resultado.success) {
      setCategorias(resultado.data);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarMateriales();
    cargarEstadisticas();
    cargarCategorias();
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (busqueda.trim()) {
        setLoading(true);
        const resultado = await buscarMateriales(busqueda);
        if (resultado.success) {
          setMateriales(resultado.data);
        }
        setLoading(false);
      } else {
        cargarMateriales();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda]);

  // Opciones de categorías dinámicas desde Supabase
  const categoriaOptions = categorias.map(cat => ({
    value: cat.id,
    label: `${cat.icono} ${cat.nombre}`,
    nombre: cat.nombre
  }));

  const estadoOptions = [
    { value: 'disponible', label: '✅ Disponible' },
    { value: 'bajo_stock', label: '⚠️ Bajo stock' },
    { value: 'agotado', label: '❌ Agotado' },
  ];

  // Filtrado y ordenamiento
  const materialesFiltrados = useMemo(() => {
    let resultado = materiales.filter(m => {
      const matchCategoria = tipoFiltro ? m.categoria_id === tipoFiltro.value : true;
      const matchEstado = estadoFiltro ? m.estado === estadoFiltro.value : true;
      return matchCategoria && matchEstado;
    });

    // Ordenamiento
    const [campo, direccion] = ordenamiento.split('-');
    resultado.sort((a, b) => {
      let valorA = a[campo];
      let valorB = b[campo];
      
      if (campo === 'precio') {
        valorA = parseFloat(a.precio_unitario || 0);
        valorB = parseFloat(b.precio_unitario || 0);
      }
      
      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }
      
      if (direccion === 'asc') {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

    return resultado;
  }, [materiales, tipoFiltro, estadoFiltro, ordenamiento]);

  // Estadísticas desde Supabase
  const stats = useMemo(() => ({
    total: estadisticas.totalMateriales || materiales.length,
    disponibles: estadisticas.disponibles || materiales.filter(m => m.estado === 'disponible').length,
    bajoStock: estadisticas.bajoStock || materiales.filter(m => m.estado === 'bajo_stock').length,
    valorTotal: estadisticas.valorInventario || materiales.reduce((acc, m) => acc + (parseFloat(m.cantidad || 0) * parseFloat(m.precio_unitario || 0)), 0),
    categorias: categorias.length,
  }), [estadisticas, materiales, categorias]);

  const handleNuevoMaterial = async () => {
    setShowNuevoMaterialModal(false);
    await cargarMateriales();
    await cargarEstadisticas();
    toast.success('Material agregado exitosamente');
  };

  const handleEliminarMaterial = async (material) => {
    const confirmado = await confirmarEliminar(material.nombre, 'Material');
    if (!confirmado) return;
    
    const resultado = await eliminarMaterial(material.id);
    if (resultado.success) {
      toast.success('Material eliminado exitosamente');
      await cargarMateriales();
      await cargarEstadisticas();
      // Notificar al Sidebar para actualizar el badge
      window.dispatchEvent(new Event('materialesActualizados'));
    } else {
      toast.error('Error al eliminar: ' + resultado.error);
    }
  };

  const handleAbrirEditar = (material) => {
    setMaterialSeleccionado(material);
    setShowEditarMaterialModal(true);
  };

  const handleEditarMaterial = async () => {
    setShowEditarMaterialModal(false);
    setMaterialSeleccionado(null);
    await cargarMateriales();
    await cargarEstadisticas();
    // Notificar al Sidebar para actualizar el badge
    window.dispatchEvent(new Event('materialesActualizados'));
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(materialesFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Materiales');
    XLSX.writeFile(wb, 'materiales.xlsx');
    toast.success('Exportado exitosamente');
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '12px',
      borderColor: state.isFocused ? '#8f5cff' : '#e5e7eb',
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(143, 92, 255, 0.1)' : 'none',
      '&:hover': { borderColor: '#8f5cff' },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
      borderRadius: '12px',
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

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-right" />
        {/* Header Premium */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] p-4 rounded-2xl shadow-lg"
                >
                  <FaBox className="text-white text-3xl" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] bg-clip-text text-transparent">
                    Gestión de Materiales
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">Control completo de inventario</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportarExcel}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl font-semibold shadow-lg hover:bg-green-600 transition"
                >
                  <FaDownload /> Exportar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNuevoMaterialModal(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
                >
                  <FaPlus /> Nuevo Material
                </motion.button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Materiales</p>
                    <p className="text-3xl font-bold mt-1">{stats.total}</p>
                  </div>
                  <FaBoxes className="text-4xl opacity-20" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Disponibles</p>
                    <p className="text-3xl font-bold mt-1">{stats.disponibles}</p>
                  </div>
                  <FaCube className="text-4xl opacity-20" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 shadow-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Bajo Stock</p>
                    <p className="text-3xl font-bold mt-1">{stats.bajoStock}</p>
                  </div>
                  <FaExclamationTriangle className="text-4xl opacity-20" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 shadow-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Categorías</p>
                    <p className="text-3xl font-bold mt-1">{stats.categorias}</p>
                  </div>
                  <FaLayerGroup className="text-4xl opacity-20" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] rounded-2xl p-4 shadow-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Valor Total</p>
                    <p className="text-2xl font-bold mt-1">S/ {stats.valorTotal.toFixed(2)}</p>
                  </div>
                  <FaTag className="text-4xl opacity-20" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="px-8 pb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[300px] relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o código..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition"
                />
              </div>

              <Select
                options={categoriaOptions}
                value={tipoFiltro}
                onChange={setTipoFiltro}
                isClearable
                placeholder="🏷️ Categoría"
                className="min-w-[180px]"
                styles={customSelectStyles}
              />

              <Select
                options={estadoOptions}
                value={estadoFiltro}
                onChange={setEstadoFiltro}
                isClearable
                placeholder="📊 Estado"
                className="min-w-[180px]"
                styles={customSelectStyles}
              />

              <select
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] bg-white dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300"
              >
                <option value="nombre-asc">A-Z</option>
                <option value="nombre-desc">Z-A</option>
                <option value="cantidad-asc">Stock ↑</option>
                <option value="cantidad-desc">Stock ↓</option>
                <option value="precio-asc">Precio ↑</option>
                <option value="precio-desc">Precio ↓</option>
              </select>

              <div className="flex gap-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-1 bg-white dark:bg-gray-800">
                <button
                  onClick={() => setVistaActual('grid')}
                  className={`p-2.5 rounded-lg transition ${vistaActual === 'grid' ? 'bg-[#8f5cff] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <FaTh />
                </button>
                <button
                  onClick={() => setVistaActual('tabla')}
                  className={`p-2.5 rounded-lg transition ${vistaActual === 'tabla' ? 'bg-[#8f5cff] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {vistaActual === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {materialesFiltrados.map((material, index) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 dark:border-gray-700 hover:border-[#8f5cff] hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Header con color */}
                    <div 
                      className="h-24 relative flex items-center justify-center"
                      style={{ 
                        background: material.categoria?.color ? `linear-gradient(135deg, ${material.categoria.color}20, ${material.categoria.color}40)` : 'linear-gradient(135deg, #8f5cff20, #8f5cff40)'
                      }}
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-lg"
                        style={{ backgroundColor: material.categoria?.color || '#8f5cff' }}
                      >
                        {material.categoria?.icono || '📦'}
                      </div>
                      {material.estado === 'bajo_stock' && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <FaExclamationTriangle className="text-xs" />
                          Bajo Stock
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">{material.nombre}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{material.codigo}</p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Stock</p>
                          <p className="text-xl font-bold text-[#8f5cff]">{parseFloat(material.cantidad || 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{material.unidad || 'unidades'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Precio</p>
                          <p className="text-xl font-bold text-green-600">S/ {parseFloat(material.precio_unitario || 0).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <FaWarehouse className="text-[#8f5cff]" />
                        <span>{material.ubicacion || 'Sin ubicación'}</span>
                        <span className="mx-2">•</span>
                        <FaTag className="text-[#8f5cff]" />
                        <span>{material.categoria?.nombre || 'Sin categoría'}</span>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <span>Stock vs Mínimo</span>
                          <span>{material.stock_minimo > 0 ? Math.round((parseFloat(material.cantidad || 0) / parseFloat(material.stock_minimo)) * 100) : 100}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${material.stock_minimo > 0 ? Math.min((parseFloat(material.cantidad || 0) / parseFloat(material.stock_minimo)) * 100, 100) : 100}%` }}
                            transition={{ duration: 1, delay: index * 0.05 }}
                            className={`h-full ${parseFloat(material.cantidad || 0) < parseFloat(material.stock_minimo || 0) ? 'bg-red-500' : 'bg-green-500'}`}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAbrirEditar(material)}
                          className="flex-1 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
                        >
                          <FaEdit /> Editar
                        </button>
                        <button
                          onClick={() => handleEliminarMaterial(material)}
                          className="px-4 bg-red-500 text-white py-2.5 rounded-xl font-semibold hover:bg-red-600 hover:shadow-lg transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="tabla"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Material</th>
                        <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                        <th className="px-6 py-4 text-center font-semibold">Stock</th>
                        <th className="px-6 py-4 text-center font-semibold">Mínimo</th>
                        <th className="px-6 py-4 text-center font-semibold">Precio</th>
                        <th className="px-6 py-4 text-center font-semibold">Ubicación</th>
                        <th className="px-6 py-4 text-center font-semibold">Estado</th>
                        <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialesFiltrados.map((material, index) => (
                        <motion.tr
                          key={material.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                style={{ backgroundColor: material.categoria?.color ? `${material.categoria.color}40` : '#8f5cff40' }}
                              >
                                {material.categoria?.icono || '📦'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{material.nombre}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{material.codigo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                              {material.categoria?.nombre || 'Sin categoría'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div>
                              <span className="text-lg font-bold text-[#8f5cff]">{parseFloat(material.cantidad || 0).toFixed(2)}</span>
                              <p className="text-xs text-gray-400">{material.unidad || 'unidades'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{parseFloat(material.stock_minimo || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-semibold text-green-600 dark:text-green-400">S/ {parseFloat(material.precio_unitario || 0).toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                              <FaWarehouse className="text-[#8f5cff]" />
                              {material.ubicacion}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {material.estado === 'disponible' ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                                ✅ Disponible
                              </span>
                            ) : material.estado === 'bajo_stock' ? (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-semibold flex items-center gap-1 justify-center">
                                <FaExclamationTriangle /> Bajo Stock
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                                ❌ Agotado
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleAbrirEditar(material)}
                                className="p-2 bg-gradient-to-r from-[#f59e42] to-[#ff7a42] text-white rounded-lg hover:shadow-lg transition"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleEliminarMaterial(material)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:shadow-lg transition"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {materialesFiltrados.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <FaBox className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-xl text-gray-500 font-semibold">No se encontraron materiales</p>
              <p className="text-gray-400 mt-2">Intenta ajustar los filtros</p>
            </motion.div>
          )}
        </main>

      {/* Modales */}
      <NuevoMaterialModal
        isOpen={showNuevoMaterialModal}
        onClose={() => setShowNuevoMaterialModal(false)}
        onSubmit={handleNuevoMaterial}
      />

      <EditarMaterialModal
        isOpen={showEditarMaterialModal}
        onClose={() => {
          setShowEditarMaterialModal(false);
          setMaterialSeleccionado(null);
        }}
        onSubmit={handleEditarMaterial}
        material={materialSeleccionado}
      />
    </div>
  );
}

export default MaterialesView;
