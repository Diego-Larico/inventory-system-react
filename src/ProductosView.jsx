import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaEdit, FaSearch, FaShoppingBag, FaTshirt, FaBox, 
  FaFilter, FaDownload, FaTh, FaList, FaImage, FaTag,
  FaHeart, FaEye, FaChartLine, FaLayerGroup, FaCubes, FaBoxes, FaTrash
} from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import NuevoProductoModal from './components/NuevoProductoModal';
import EditarProductoModal from './components/EditarProductoModal';
import toast, { Toaster } from 'react-hot-toast';
import { obtenerProductos, eliminarProducto } from './services/productosService';
import { confirmarEliminar, mostrarExito } from './utils/confirmationModals';
import { supabase } from './supabaseClient';

function ProductosView({ onNavigate }) {
  const [showNuevoProductoModal, setShowNuevoProductoModal] = useState(false);
  const [showEditarProductoModal, setShowEditarProductoModal] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState('grid'); // 'grid', 'tabla', 'galeria'
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [ordenamiento, setOrdenamiento] = useState('nombre-asc');
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos desde Supabase
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const productosDB = await obtenerProductos();
      
      // Obtener ventas totales por producto desde detalles_pedido
      const { data: ventasData } = await supabase
        .from('detalles_pedido')
        .select('producto_id, cantidad')
        .not('producto_id', 'is', null);
      
      // Calcular ventas totales por producto
      const ventasPorProducto = {};
      if (ventasData) {
        ventasData.forEach(detalle => {
          const productoId = detalle.producto_id;
          ventasPorProducto[productoId] = (ventasPorProducto[productoId] || 0) + detalle.cantidad;
        });
      }
      
      // Transformar datos de Supabase al formato esperado
      const productosFormateados = productosDB.map(p => ({
        id: p.id,
        nombre: p.nombre,
        codigo: p.codigo,
        categoria: p.categoria?.nombre || 'Sin categoría',
        categoria_id: p.categoria_id, // ← IMPORTANTE: Incluir categoria_id para el modal de editar
        tallas: p.tallas || [],
        colores: p.colores || [],
        precio: parseFloat(p.precio),
        stock: p.stock,
        stockMinimo: p.stock_minimo,
        estado: p.estado,
        imagen: p.imagen_url || 'https://placehold.co/400x400/8f5cff/ffffff?text=Producto',
        descripcion: p.descripcion,
        costo: p.costo,
        ventas: ventasPorProducto[p.id] || 0,
      }));
      setProductos(productosFormateados);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoProducto = () => {
    setShowNuevoProductoModal(true);
  };

  const handleProductoCreado = (nuevoProducto) => {
    toast.success('Producto creado correctamente');
    cargarProductos(); // Recargar lista
  };

  const handleEliminarProducto = async (producto) => {
    const confirmado = await confirmarEliminar(producto.nombre, 'Producto');
    if (!confirmado) return;
    
    const resultado = await eliminarProducto(producto.id);
    if (resultado.success) {
      await mostrarExito('Producto eliminado', `El producto "${producto.nombre}" ha sido eliminado correctamente`);
      await cargarProductos();
      // Notificar al Sidebar para actualizar el badge
      window.dispatchEvent(new Event('productosActualizados'));
    } else {
      toast.error('Error al eliminar: ' + resultado.error);
    }
  };

  // Opciones para filtros
  const categoriaOptions = [...new Set(productos.map(p => p.categoria))].map(cat => ({ 
    value: cat, 
    label: cat 
  }));

  const estadoOptions = [
    { value: 'disponible', label: '✅ Disponible' },
    { value: 'bajo_stock', label: '⚠️ Bajo stock' },
    { value: 'agotado', label: '❌ Agotado' },
  ];

  // Filtrado y ordenamiento
  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter(p => {
      const matchBusqueda = busqueda ? 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        p.codigo.toLowerCase().includes(busqueda.toLowerCase()) : true;
      const matchCategoria = categoriaFiltro ? p.categoria === categoriaFiltro.value : true;
      const matchEstado = estadoFiltro ? p.estado === estadoFiltro.value : true;
      return matchBusqueda && matchCategoria && matchEstado;
    });

    // Ordenamiento
    const [campo, direccion] = ordenamiento.split('-');
    resultado.sort((a, b) => {
      let valorA = a[campo];
      let valorB = b[campo];
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
  }, [productos, busqueda, categoriaFiltro, estadoFiltro, ordenamiento]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: productos.length,
    disponibles: productos.filter(p => p.estado === 'disponible').length,
    bajoStock: productos.filter(p => p.estado === 'bajo_stock').length,
    valorTotal: productos.reduce((acc, p) => acc + (p.stock * p.precio), 0),
    categorias: [...new Set(productos.map(p => p.categoria).filter(Boolean))].length,
    ventasTotales: productos.reduce((acc, p) => acc + (p.ventas || 0), 0),
  }), [productos]);

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(productosFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'productos.xlsx');
    toast.success('Exportado exitosamente');
  };

  const handleQuickView = (producto) => {
    setProductoSeleccionado(producto);
    setShowQuickView(true);
  };

  const handleEditarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setShowEditarProductoModal(true);
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
    <>
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
                  <FaShoppingBag className="text-white text-3xl" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] bg-clip-text text-transparent">
                    Gestión de Productos
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Catálogo completo de productos</p>
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
                  onClick={handleNuevoProducto}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
                >
                  <FaPlus /> Nuevo Producto
                </motion.button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Productos</p>
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
                  <FaBox className="text-4xl opacity-20" />
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
                  <FaCubes className="text-4xl opacity-20" />
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
                    <p className="text-2xl font-bold mt-1">S/ {stats.valorTotal.toFixed(0)}</p>
                  </div>
                  <FaTag className="text-4xl opacity-20" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 shadow-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Ventas</p>
                    <p className="text-3xl font-bold mt-1">{stats.ventasTotales}</p>
                  </div>
                  <FaChartLine className="text-4xl opacity-20" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="px-8 pb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
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
                value={categoriaFiltro}
                onChange={setCategoriaFiltro}
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
                <option value="precio-asc">Precio ↑</option>
                <option value="precio-desc">Precio ↓</option>
                <option value="stock-asc">Stock ↑</option>
                <option value="stock-desc">Stock ↓</option>
                <option value="ventas-desc">Más vendidos</option>
              </select>

              <div className="flex gap-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-1 bg-white dark:bg-gray-800">
                <button
                  onClick={() => setVistaActual('grid')}
                  className={`p-2.5 rounded-lg transition ${vistaActual === 'grid' ? 'bg-[#8f5cff] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <FaTh />
                </button>
                <button
                  onClick={() => setVistaActual('galeria')}
                  className={`p-2.5 rounded-lg transition ${vistaActual === 'galeria' ? 'bg-[#8f5cff] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <FaImage />
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
                {productosFiltrados.map((producto, index) => (
                  <motion.div
                    key={producto.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 dark:border-gray-700 hover:border-[#8f5cff] hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Imagen del producto */}
                    <div className="relative h-56 bg-gray-200 overflow-hidden group">
                      <img 
                        src={producto.imagen} 
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {producto.estado === 'Bajo stock' && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ⚠️ Bajo Stock
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleQuickView(producto)}
                          className="text-[#8f5cff] hover:text-[#6e7ff3]"
                        >
                          <FaEye className="text-lg" />
                        </button>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{producto.nombre}</h3>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-semibold">
                          {producto.categoria}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{producto.codigo}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex gap-1">
                          {(producto.tallas || []).slice(0, 3).map((talla, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-semibold">
                              {talla}
                            </span>
                          ))}
                        </div>
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <div className="flex gap-1">
                          {(producto.colores || []).slice(0, 2).map((color, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 text-center">
                          <p className="text-xs text-green-700 dark:text-green-400 mb-1">Precio</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-500">S/ {producto.precio}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3 text-center">
                          <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Stock</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-500">{producto.stock}</p>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <span>Nivel de stock</span>
                          <span>{Math.round((producto.stock / producto.stockMinimo) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((producto.stock / producto.stockMinimo) * 100, 100)}%` }}
                            transition={{ duration: 1, delay: index * 0.05 }}
                            className={`h-full ${producto.stock < producto.stockMinimo ? 'bg-red-500' : 'bg-green-500'}`}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditarProducto(producto)}
                          className="flex-1 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
                        >
                          <FaEdit /> Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminarProducto(producto);
                          }}
                          className="px-4 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : vistaActual === 'galeria' ? (
              <motion.div
                key="galeria"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              >
                {productosFiltrados.map((producto, index) => (
                  <motion.div
                    key={producto.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                    onClick={() => handleQuickView(producto)}
                  >
                    <img 
                      src={producto.imagen} 
                      alt={producto.nombre}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-lg font-bold mb-1">{producto.nombre}</h3>
                        <p className="text-sm mb-2">S/ {producto.precio}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm opacity-75">• Stock: {producto.stock}</span>
                        </div>
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
                        <th className="px-6 py-4 text-left font-semibold">Producto</th>
                        <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                        <th className="px-6 py-4 text-center font-semibold">Precio</th>
                        <th className="px-6 py-4 text-center font-semibold">Stock</th>
                        <th className="px-6 py-4 text-center font-semibold">Ventas</th>
                        <th className="px-6 py-4 text-center font-semibold">Estado</th>
                        <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosFiltrados.map((producto, index) => (
                        <motion.tr
                          key={producto.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={producto.imagen} 
                                alt={producto.nombre}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{producto.nombre}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{producto.codigo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-semibold">
                              {producto.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-green-600 dark:text-green-400">S/ {producto.precio}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-bold text-[#8f5cff]">{producto.stock}</span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{producto.ventas || 0}</td>
                          <td className="px-6 py-4 text-center">
                            {producto.estado === 'disponible' ? (
                              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
                                ✅ Disponible
                              </span>
                            ) : producto.estado === 'bajo_stock' ? (
                              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-semibold">
                                ⚠️ Bajo Stock
                              </span>
                            ) : producto.estado === 'agotado' ? (
                              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold">
                                ❌ Agotado
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-lg text-sm font-semibold">
                                🚫 Descontinuado
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleQuickView(producto)}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:shadow-lg transition"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleEditarProducto(producto)}
                                className="p-2 bg-gradient-to-r from-[#f59e42] to-[#ff7a42] text-white rounded-lg hover:shadow-lg transition"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleEliminarProducto(producto)}
                                className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition"
                              >
                                <FaTrash />
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

          {productosFiltrados.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <FaShoppingBag className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-xl text-gray-500 font-semibold">No se encontraron productos</p>
              <p className="text-gray-400 mt-2">Intenta ajustar los filtros</p>
            </motion.div>
          )}
        </main>
      </div>

      {/* Modales */}
      <NuevoProductoModal
        isOpen={showNuevoProductoModal}
        onClose={() => setShowNuevoProductoModal(false)}
        onSuccess={handleProductoCreado}
      />

      <EditarProductoModal
        isOpen={showEditarProductoModal}
        onClose={() => {
          setShowEditarProductoModal(false);
          setProductoSeleccionado(null);
        }}
        onSubmit={async (data) => {
          console.log('Producto editado:', data);
          toast.success('Producto actualizado exitosamente');
          setShowEditarProductoModal(false);
          setProductoSeleccionado(null);
          await cargarProductos();
          // Notificar al Sidebar para actualizar el badge
          window.dispatchEvent(new Event('productosActualizados'));
        }}
        producto={productoSeleccionado}
      />

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && productoSeleccionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickView(false)}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Imagen */}
                <div className="relative h-96 md:h-auto">
                  <img 
                    src={productoSeleccionado.imagen} 
                    alt={productoSeleccionado.nombre}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setShowQuickView(false)}
                    className="absolute top-4 right-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full p-3 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Información */}
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-semibold">
                      {productoSeleccionado.categoria}
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{productoSeleccionado.nombre}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{productoSeleccionado.codigo}</p>

                  <div className="mb-6">
                    <p className="text-4xl font-bold text-[#8f5cff]">S/ {productoSeleccionado.precio}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{productoSeleccionado.ventas || 0} ventas realizadas</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Tallas disponibles:</p>
                      <div className="flex gap-2">
                        {(productoSeleccionado.tallas || []).map((talla, i) => (
                          <span key={i} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg font-semibold">
                            {talla}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Colores disponibles:</p>
                      <div className="flex gap-2">
                        {(productoSeleccionado.colores || []).map((color, i) => (
                          <span key={i} className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-lg font-semibold">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Materiales:</p>
                      <div className="flex gap-2">
                        {(productoSeleccionado.materiales || []).map((material, i) => (
                          <span key={i} className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-lg font-semibold">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
                      <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Stock actual</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">{productoSeleccionado.stock} unidades</p>
                    </div>
                    <div className={`rounded-xl p-4 ${productoSeleccionado.estado === 'disponible' ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'}`}>
                      <p className={`text-sm mb-1 ${productoSeleccionado.estado === 'disponible' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>Estado</p>
                      <p className={`text-2xl font-bold ${productoSeleccionado.estado === 'disponible' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                        {productoSeleccionado.estado === 'disponible' ? '✅ Disponible' : productoSeleccionado.estado === 'bajo_stock' ? '⚠️ Bajo Stock' : productoSeleccionado.estado === 'agotado' ? '❌ Agotado' : '🚫 Descontinuado'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowQuickView(false);
                      setShowEditarProductoModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Editar Producto
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProductosView;
