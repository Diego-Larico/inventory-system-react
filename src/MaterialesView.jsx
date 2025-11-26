import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
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

function MaterialesView({ onNavigate }) {
  const [showNuevoMaterialModal, setShowNuevoMaterialModal] = useState(false);
  const [showEditarMaterialModal, setShowEditarMaterialModal] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState('grid'); // 'grid', 'tabla', 'compacta'
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [ordenamiento, setOrdenamiento] = useState('nombre-asc');
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);

  // Datos de ejemplo expandidos
  const materiales = [
    { id: 1, nombre: 'Hilo blanco', codigo: 'MAT-001', tipo: 'Hilo', cantidad: 30, minimo: 10, ubicacion: 'A-1', proveedor: 'Textiles SA', estado: 'Disponible', precio: 2.5, color: '#FFFFFF' },
    { id: 2, nombre: 'Tela azul', codigo: 'MAT-002', tipo: 'Tela', cantidad: 5, minimo: 8, ubicacion: 'B-3', proveedor: 'Fabrics Co', estado: 'Bajo stock', precio: 15.0, color: '#3B82F6' },
    { id: 3, nombre: 'Botón dorado', codigo: 'MAT-003', tipo: 'Accesorio', cantidad: 50, minimo: 20, ubicacion: 'C-2', proveedor: 'Accesorios Plus', estado: 'Disponible', precio: 0.5, color: '#FFD700' },
    { id: 4, nombre: 'Cremallera negra', codigo: 'MAT-004', tipo: 'Accesorio', cantidad: 2, minimo: 5, ubicacion: 'C-1', proveedor: 'Zippers Inc', estado: 'Bajo stock', precio: 3.0, color: '#000000' },
    { id: 5, nombre: 'Hilo negro', codigo: 'MAT-005', tipo: 'Hilo', cantidad: 45, minimo: 10, ubicacion: 'A-2', proveedor: 'Textiles SA', estado: 'Disponible', precio: 2.5, color: '#000000' },
    { id: 6, nombre: 'Tela roja', codigo: 'MAT-006', tipo: 'Tela', cantidad: 12, minimo: 8, ubicacion: 'B-1', proveedor: 'Fabrics Co', estado: 'Disponible', precio: 18.0, color: '#EF4444' },
    { id: 7, nombre: 'Etiqueta premium', codigo: 'MAT-007', tipo: 'Etiqueta', cantidad: 100, minimo: 30, ubicacion: 'D-1', proveedor: 'Labels Pro', estado: 'Disponible', precio: 0.3, color: '#8B5CF6' },
    { id: 8, nombre: 'Elástico blanco', codigo: 'MAT-008', tipo: 'Accesorio', cantidad: 3, minimo: 10, ubicacion: 'C-3', proveedor: 'Elastic World', estado: 'Bajo stock', precio: 1.5, color: '#FFFFFF' },
  ];

  const tipoOptions = [...new Set(materiales.map(m => m.tipo))].map(tipo => ({ 
    value: tipo, 
    label: tipo,
    icon: getTipoIcon(tipo)
  }));

  const estadoOptions = [
    { value: 'Disponible', label: '✅ Disponible' },
    { value: 'Bajo stock', label: '⚠️ Bajo stock' },
    { value: 'Agotado', label: '❌ Agotado' },
  ];

  function getTipoIcon(tipo) {
    const icons = {
      'Hilo': '🧵',
      'Tela': '🧶',
      'Accesorio': '📌',
      'Botón': '⚪',
      'Cremallera': '🔒',
      'Etiqueta': '🏷️',
      'Otro': '📦'
    };
    return icons[tipo] || '📦';
  }

  // Filtrado y ordenamiento
  const materialesFiltrados = useMemo(() => {
    let resultado = materiales.filter(m => {
      const matchBusqueda = busqueda ? 
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        m.codigo.toLowerCase().includes(busqueda.toLowerCase()) : true;
      const matchTipo = tipoFiltro ? m.tipo === tipoFiltro.value : true;
      const matchEstado = estadoFiltro ? m.estado === estadoFiltro.value : true;
      return matchBusqueda && matchTipo && matchEstado;
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
  }, [materiales, busqueda, tipoFiltro, estadoFiltro, ordenamiento]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: materiales.length,
    disponibles: materiales.filter(m => m.estado === 'Disponible').length,
    bajoStock: materiales.filter(m => m.estado === 'Bajo stock').length,
    valorTotal: materiales.reduce((acc, m) => acc + (m.cantidad * m.precio), 0),
    tipos: [...new Set(materiales.map(m => m.tipo))].length,
  }), [materiales]);

  const handleNuevoMaterial = (data) => {
    console.log('Nuevo material:', data);
    toast.success('Material agregado exitosamente');
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
      boxShadow: state.isFocused ? '0 0 0 3px rgba(143, 92, 255, 0.1)' : 'none',
      '&:hover': { borderColor: '#8f5cff' },
    }),
  };

  return (
    <div className="flex fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      <Sidebar onNavigate={onNavigate} activeView={'materiales'} />
      
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
                    <p className="text-3xl font-bold mt-1">{stats.tipos}</p>
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
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition"
                />
              </div>

              <Select
                options={tipoOptions}
                value={tipoFiltro}
                onChange={setTipoFiltro}
                isClearable
                placeholder="🏷️ Tipo"
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
                <option value="cantidad-asc">Stock ↑</option>
                <option value="cantidad-desc">Stock ↓</option>
                <option value="precio-asc">Precio ↑</option>
                <option value="precio-desc">Precio ↓</option>
              </select>

              <div className="flex gap-2 border-2 border-gray-200 rounded-xl p-1 bg-white">
                <button
                  onClick={() => setVistaActual('grid')}
                  className={`p-2.5 rounded-lg transition ${vistaActual === 'grid' ? 'bg-[#8f5cff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FaTh />
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
                {materialesFiltrados.map((material, index) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-[#8f5cff] hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Header con color */}
                    <div 
                      className="h-24 relative flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${material.color}20, ${material.color}40)` 
                      }}
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-lg"
                        style={{ backgroundColor: material.color }}
                      >
                        {getTipoIcon(material.tipo)}
                      </div>
                      {material.estado === 'Bajo stock' && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <FaExclamationTriangle className="text-xs" />
                          Bajo Stock
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{material.nombre}</h3>
                      <p className="text-sm text-gray-500 mb-4">{material.codigo}</p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Stock</p>
                          <p className="text-xl font-bold text-[#8f5cff]">{material.cantidad}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Precio</p>
                          <p className="text-xl font-bold text-green-600">S/ {material.precio}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <FaWarehouse className="text-[#8f5cff]" />
                        <span>{material.ubicacion}</span>
                        <span className="mx-2">•</span>
                        <FaTag className="text-[#8f5cff]" />
                        <span>{material.tipo}</span>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                          <span>Stock vs Mínimo</span>
                          <span>{Math.round((material.cantidad / material.minimo) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((material.cantidad / material.minimo) * 100, 100)}%` }}
                            transition={{ duration: 1, delay: index * 0.05 }}
                            className={`h-full ${material.cantidad < material.minimo ? 'bg-red-500' : 'bg-green-500'}`}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setMaterialSeleccionado(material);
                          setShowEditarMaterialModal(true);
                        }}
                        className="w-full bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
                      >
                        <FaEdit /> Editar
                      </button>
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
                          className="border-b border-gray-100 hover:bg-purple-50 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                style={{ backgroundColor: `${material.color}40` }}
                              >
                                {getTipoIcon(material.tipo)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{material.nombre}</p>
                                <p className="text-sm text-gray-500">{material.codigo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                              {material.tipo}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-bold text-[#8f5cff]">{material.cantidad}</span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600">{material.minimo}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-semibold text-green-600">S/ {material.precio}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <FaWarehouse className="text-[#8f5cff]" />
                              {material.ubicacion}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {material.estado === 'Disponible' ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                                ✅ Disponible
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold flex items-center gap-1 justify-center">
                                <FaExclamationTriangle /> Bajo Stock
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  setMaterialSeleccionado(material);
                                  setShowEditarMaterialModal(true);
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
      </div>

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
        onSubmit={(data) => {
          console.log('Material editado:', data);
          toast.success('Material actualizado exitosamente');
          setShowEditarMaterialModal(false);
          setMaterialSeleccionado(null);
        }}
        material={materialSeleccionado}
      />
    </div>
  );
}

export default MaterialesView;
