import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import { 
  FaPlus, FaEdit, FaSearch, FaShoppingBag, FaTshirt, FaBox, 
  FaFilter, FaDownload, FaTh, FaList, FaImage, FaStar, FaTag,
  FaHeart, FaEye, FaChartLine, FaLayerGroup, FaCubes, FaBoxes
} from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import NuevoProductoModal from './components/NuevoProductoModal';
import EditarProductoModal from './components/EditarProductoModal';
import toast, { Toaster } from 'react-hot-toast';

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

  // Datos de ejemplo expandidos
  const productos = [
    { 
      id: 1, 
      nombre: 'Camisa Casual', 
      codigo: 'PROD-001', 
      categoria: 'Camisas', 
      tallas: ['S', 'M', 'L'], 
      colores: ['Blanco', 'Azul'], 
      precio: 45.00, 
      stock: 25, 
      stockMinimo: 10,
      materiales: ['Algodón', 'Poliéster'],
      estado: 'Disponible',
      imagen: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      rating: 4.5,
      ventas: 120
    },
    { 
      id: 2, 
      nombre: 'Pantalón Jean', 
      codigo: 'PROD-002', 
      categoria: 'Pantalones', 
      tallas: ['28', '30', '32'], 
      colores: ['Azul oscuro', 'Negro'], 
      precio: 65.00, 
      stock: 5, 
      stockMinimo: 8,
      materiales: ['Denim', 'Elastano'],
      estado: 'Bajo stock',
      imagen: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      rating: 4.8,
      ventas: 95
    },
    { 
      id: 3, 
      nombre: 'Vestido Elegante', 
      codigo: 'PROD-003', 
      categoria: 'Vestidos', 
      tallas: ['S', 'M'], 
      colores: ['Rojo', 'Negro'], 
      precio: 120.00, 
      stock: 12, 
      stockMinimo: 5,
      materiales: ['Seda', 'Poliéster'],
      estado: 'Disponible',
      imagen: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      rating: 5.0,
      ventas: 78
    },
    { 
      id: 4, 
      nombre: 'Chaqueta Deportiva', 
      codigo: 'PROD-004', 
      categoria: 'Abrigos', 
      tallas: ['M', 'L', 'XL'], 
      colores: ['Negro', 'Gris'], 
      precio: 95.00, 
      stock: 18, 
      stockMinimo: 10,
      materiales: ['Nylon', 'Forro polar'],
      estado: 'Disponible',
      imagen: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
      rating: 4.3,
      ventas: 65
    },
    { 
      id: 5, 
      nombre: 'Blusa Floral', 
      codigo: 'PROD-005', 
      categoria: 'Blusas', 
      tallas: ['S', 'M', 'L'], 
      colores: ['Blanco', 'Rosa'], 
      precio: 38.00, 
      stock: 30, 
      stockMinimo: 15,
      materiales: ['Algodón'],
      estado: 'Disponible',
      imagen: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400',
      rating: 4.6,
      ventas: 140
    },
    { 
      id: 6, 
      nombre: 'Short Veraniego', 
      codigo: 'PROD-006', 
      categoria: 'Shorts', 
      tallas: ['S', 'M', 'L'], 
      colores: ['Beige', 'Verde'], 
      precio: 32.00, 
      stock: 22, 
      stockMinimo: 12,
      materiales: ['Lino'],
      estado: 'Disponible',
      imagen: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
      rating: 4.2,
      ventas: 88
    },
  ];

  const categoriaOptions = [...new Set(productos.map(p => p.categoria))].map(cat => ({ 
    value: cat, 
    label: cat 
  }));

  const estadoOptions = [
    { value: 'Disponible', label: '✅ Disponible' },
    { value: 'Bajo stock', label: '⚠️ Bajo stock' },
    { value: 'Agotado', label: '❌ Agotado' },
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
    disponibles: productos.filter(p => p.estado === 'Disponible').length,
    bajoStock: productos.filter(p => p.estado === 'Bajo stock').length,
    valorTotal: productos.reduce((acc, p) => acc + (p.stock * p.precio), 0),
    categorias: [...new Set(productos.map(p => p.categoria))].length,
    ventasTotales: productos.reduce((acc, p) => acc + p.ventas, 0),
  }), [productos]);

  const handleNuevoProducto = (data) => {
    console.log('Nuevo producto:', data);
    toast.success('Producto agregado exitosamente');
  };

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

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '12px',
      borderColor: state.isFocused ? '#8f5cff' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(143, 92, 255, 0.1)' : 'none',
      '&:hover': { borderColor: '#8f5cff' },
    }),
  };

  return (
    <div className="flex fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      <Sidebar onNavigate={onNavigate} activeView={'productos'} />
      
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header Premium */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
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
                  <p className="text-gray-500 text-sm mt-1">Catálogo completo de productos</p>
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
                  onClick={() => setShowNuevoProductoModal(true)}
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
              <div className="flex-1 min-w-[300px] relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o código..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition"
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
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] bg-white font-semibold text-gray-700"
              >
                <option value="nombre-asc">A-Z</option>
                <option value="nombre-desc">Z-A</option>
                <option value="precio-asc">Precio ↑</option>
                <option value="precio-desc">Precio ↓</option>
                <option value="stock-asc">Stock ↑</option>
                <option value="stock-desc">Stock ↓</option>
                <option value="ventas-desc">Más vendidos</option>
              </select>

              <div className="flex gap-2 border-2 border-gray-200 rounded-xl p-1 bg-white">
                <button
                  onClick={() => setVistaActual('grid')}
                  className={`p-2.5 rounded-lg transition ${vistaActual === 'grid' ? 'bg-[#8f5cff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FaTh />
                </button>
                <button
                  onClick={() => setVistaActual('galeria')}
                  className={`p-2.5 rounded-lg transition ${vistaActual === 'galeria' ? 'bg-[#8f5cff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FaImage />
                </button>
                <button
                  onClick={() => setVistaActual('tabla')}
                  className={`p-2.5 rounded-lg transition ${vistaActual === 'tabla' ? 'bg-[#8f5cff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
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
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-[#8f5cff] hover:shadow-2xl transition-all duration-300"
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
                      <div className="absolute bottom-3 right-3 bg-yellow-400 text-gray-800 px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-sm">
                        <FaStar /> {producto.rating}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{producto.nombre}</h3>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                          {producto.categoria}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{producto.codigo}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex gap-1">
                          {producto.tallas.slice(0, 3).map((talla, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                              {talla}
                            </span>
                          ))}
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex gap-1">
                          {producto.colores.slice(0, 2).map((color, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                          <p className="text-xs text-green-700 mb-1">Precio</p>
                          <p className="text-xl font-bold text-green-600">S/ {producto.precio}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                          <p className="text-xs text-blue-700 mb-1">Stock</p>
                          <p className="text-xl font-bold text-blue-600">{producto.stock}</p>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                          <span>Nivel de stock</span>
                          <span>{Math.round((producto.stock / producto.stockMinimo) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
                          onClick={() => {
                            setProductoSeleccionado(producto);
                            setShowEditarProductoModal(true);
                          }}
                          className="flex-1 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
                        >
                          <FaEdit /> Editar
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
                          <FaStar className="text-yellow-400" />
                          <span className="text-sm">{producto.rating}</span>
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
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
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
                        <th className="px-6 py-4 text-center font-semibold">Rating</th>
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
                          className="border-b border-gray-100 hover:bg-purple-50 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={producto.imagen} 
                                alt={producto.nombre}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-semibold text-gray-800">{producto.nombre}</p>
                                <p className="text-sm text-gray-500">{producto.codigo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                              {producto.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-green-600">S/ {producto.precio}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-bold text-[#8f5cff]">{producto.stock}</span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600">{producto.ventas}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <FaStar className="text-yellow-400" />
                              <span className="font-semibold">{producto.rating}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {producto.estado === 'Disponible' ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                                ✅ Disponible
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                                ⚠️ Bajo Stock
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
                                onClick={() => {
                                  setProductoSeleccionado(producto);
                                  setShowEditarProductoModal(true);
                                }}
                                className="p-2 bg-gradient-to-r from-[#f59e42] to-[#ff7a42] text-white rounded-lg hover:shadow-lg transition"
                              >
                                <FaEdit />
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
        onSubmit={handleNuevoProducto}
      />

      <EditarProductoModal
        isOpen={showEditarProductoModal}
        onClose={() => {
          setShowEditarProductoModal(false);
          setProductoSeleccionado(null);
        }}
        onSubmit={(data) => {
          console.log('Producto editado:', data);
          toast.success('Producto actualizado exitosamente');
          setShowEditarProductoModal(false);
          setProductoSeleccionado(null);
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
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
                    className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Información */}
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                      {productoSeleccionado.categoria}
                    </span>
                    <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg">
                      <FaStar className="text-yellow-500" />
                      <span className="font-bold text-gray-800">{productoSeleccionado.rating}</span>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{productoSeleccionado.nombre}</h2>
                  <p className="text-gray-500 mb-6">{productoSeleccionado.codigo}</p>

                  <div className="mb-6">
                    <p className="text-4xl font-bold text-[#8f5cff]">S/ {productoSeleccionado.precio}</p>
                    <p className="text-sm text-gray-500 mt-1">{productoSeleccionado.ventas} ventas realizadas</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Tallas disponibles:</p>
                      <div className="flex gap-2">
                        {productoSeleccionado.tallas.map((talla, i) => (
                          <span key={i} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold">
                            {talla}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Colores disponibles:</p>
                      <div className="flex gap-2">
                        {productoSeleccionado.colores.map((color, i) => (
                          <span key={i} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Materiales:</p>
                      <div className="flex gap-2">
                        {productoSeleccionado.materiales.map((material, i) => (
                          <span key={i} className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <p className="text-sm text-blue-700 mb-1">Stock actual</p>
                      <p className="text-2xl font-bold text-blue-600">{productoSeleccionado.stock} unidades</p>
                    </div>
                    <div className={`rounded-xl p-4 ${productoSeleccionado.estado === 'Disponible' ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
                      <p className={`text-sm mb-1 ${productoSeleccionado.estado === 'Disponible' ? 'text-green-700' : 'text-red-700'}`}>Estado</p>
                      <p className={`text-2xl font-bold ${productoSeleccionado.estado === 'Disponible' ? 'text-green-600' : 'text-red-600'}`}>
                        {productoSeleccionado.estado}
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
    </div>
  );
}

export default ProductosView;
