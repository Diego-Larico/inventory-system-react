import React, { useState } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'react-slick';
import Modal from 'react-modal';
import Dropzone from 'react-dropzone';
import Sidebar from './components/Sidebar';
import { FaPlus, FaSearch, FaBoxOpen, FaEdit } from 'react-icons/fa';
import Select from 'react-select';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import MaterialTypePieChart from './components/MaterialTypePieChart';
import DashboardBarChart from './components/DashboardBarChart';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import NuevoProductoModal from './components/NuevoProductoModal';
import EditarProductoModal from './components/EditarProductoModal';

function ProductosView({ onNavigate }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [savedFilters, setSavedFilters] = useState([]);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showEditarProductoModal, setShowEditarProductoModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [images, setImages] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [showNuevoProductoModal, setShowNuevoProductoModal] = useState(false);

  const productos = [
    { nombre: 'Polo básico blanco', codigo: 'P-001', categoria: 'Polo', stock: 35, estado: 'Activo', destacado: true },
    { nombre: 'Pantalón jean azul', codigo: 'P-002', categoria: 'Pantalón', stock: 12, estado: 'Activo', destacado: false },
    { nombre: 'Chaqueta denim', codigo: 'P-003', categoria: 'Chaqueta', stock: 5, estado: 'Bajo stock', destacado: true },
    { nombre: 'Vestido floral', codigo: 'P-004', categoria: 'Vestido', stock: 18, estado: 'Activo', destacado: false },
  ];
  // Guardar filtro actual
  function handleSaveFilter() {
    setSavedFilters([...savedFilters, {
      busqueda,
      categoriaFiltro,
      estadoFiltro,
      name: `Filtro ${savedFilters.length + 1}`
    }]);
  }

  function handleApplySavedFilter(filter) {
    setBusqueda(filter.busqueda);
    setCategoriaFiltro(filter.categoriaFiltro);
    setEstadoFiltro(filter.estadoFiltro);
  }

  function handleOpenQuickView(product) {
    setQuickViewProduct(product);
    setShowQuickView(true);
  }

  function handleCloseQuickView() {
    setShowQuickView(false);
    setQuickViewProduct(null);
    setNewComment('');
  }

  function handleDrop(acceptedFiles, codigo) {
    setImages({ ...images, [codigo]: acceptedFiles[0] });
  }

  function handleAddComment(codigo) {
    if (!newComment.trim()) return;
    setComments({
      ...comments,
      [codigo]: [...(comments[codigo] || []), newComment]
    });
    setNewComment('');
  }

  const categoriaOptions = [...new Set(productos.map(p => p.categoria))].map(c => ({ value: c, label: c }));
  const estadoOptions = [...new Set(productos.map(p => p.estado))].map(e => ({ value: e, label: e }));

  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = busqueda ? p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase()) : true;
    const matchCategoria = categoriaFiltro ? p.categoria === categoriaFiltro.value : true;
    const matchEstado = estadoFiltro ? p.estado === estadoFiltro.value : true;
    return matchBusqueda && matchCategoria && matchEstado;
  });

  const totalProductos = productos.length;
  const activos = productos.filter(p => p.estado === 'Activo').length;
  const bajoStock = productos.filter(p => p.estado === 'Bajo stock').length;

  // Configuración para el carrusel de destacados
  const featuredProducts = productos.filter(p => p.destacado);
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    beforeChange: (oldIndex, newIndex) => setFeaturedIndex(newIndex),
    appendDots: dots => (
      <div style={{ position: 'absolute', bottom: 10, width: '100%' }}>
        <ul style={{ margin: 0, padding: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>{dots}</ul>
      </div>
    ),
    customPaging: i => (
      <button
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: i === featuredIndex ? '#8f5cff' : '#e5e7eb',
          border: 'none',
          margin: 0,
          padding: 0,
          transition: 'background 0.3s',
        }}
        aria-label={`Ir al producto destacado ${i + 1}`}
      />
    ),
  };

  // Historial de movimientos de productos (usando react-vertical-timeline-component)
  const movimientosProductos = [
    { tipo: 'entrada', descripcion: '+20 Polo básico blanco agregado', fecha: '19/11/2025' },
    { tipo: 'salida', descripcion: '-5 Pantalón jean azul vendido', fecha: '18/11/2025' },
    { tipo: 'entrada', descripcion: '+10 Chaqueta denim recibida', fecha: '17/11/2025' },
    { tipo: 'salida', descripcion: '-2 Vestido floral vendido', fecha: '16/11/2025' },
  ];
  const [mostrarTodosMov, setMostrarTodosMov] = useState(false);
  // Los iconos ya están importados arriba: FaPlus, FaEdit

  const handleNuevoProducto = (data) => {
    console.log('Nuevo producto creado:', data);
    // Aquí puedes agregar la lógica para guardar el producto
  };

  return (
    <div className="flex fixed inset-0 bg-gray-100">
      <Sidebar onNavigate={onNavigate} activeView={'productos'} />
      <div className="flex-1 flex flex-col min-h-0">
        <header className="px-8 py-6 bg-white border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#8f5cff]">Productos</h1>
            <p className="text-sm text-gray-400">Gestiona tu catálogo de productos terminados</p>
          </div>
          <button 
            onClick={() => setShowNuevoProductoModal(true)}
            className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6e7ff3] transition flex items-center gap-2"
          >
            <FaPlus /> Nuevo Producto
          </button>
        </header>
        <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
          {/* Resumen superior */}
          <section className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
              <span className="text-lg font-semibold text-[#8f5cff]">Total productos</span>
              <span className="text-4xl font-bold text-gray-700">{totalProductos}</span>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
              <span className="text-lg font-semibold text-[#8f5cff]">Activos</span>
              <span className="text-4xl font-bold text-green-500">{activos}</span>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
              <span className="text-lg font-semibold text-[#8f5cff]">Bajo stock</span>
              <span className="text-4xl font-bold text-red-500">{bajoStock}</span>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
              <span className="text-lg font-semibold text-[#8f5cff] mb-2">Capacidad ocupada</span>
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={Math.min(100, activos * 20)}
                  text={`${Math.min(100, activos * 20)}%`}
                  styles={buildStyles({
                    pathColor: '#8f5cff',
                    textColor: '#8f5cff',
                    trailColor: '#e5e7eb',
                  })}
                />
              </div>
            </div>
          </section>

          {/* Filtros y búsqueda + guardado */}
          <section className="mb-8 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f5cff] w-72"
              />
            </div>
            <Select
              options={categoriaOptions}
              value={categoriaFiltro}
              onChange={setCategoriaFiltro}
              isClearable
              placeholder="Filtrar por categoría"
              className="min-w-[200px] w-52"
            />
            <Select
              options={estadoOptions}
              value={estadoFiltro}
              onChange={setEstadoFiltro}
              isClearable
              placeholder="Filtrar por estado"
              className="min-w-[200px] w-52"
            />
            <button onClick={handleSaveFilter} className="bg-[#8f5cff] text-white px-3 py-2 rounded-lg font-semibold hover:bg-[#6e7ff3] transition">Guardar filtro</button>
            {savedFilters.length > 0 && (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-400">Filtros guardados:</span>
                {savedFilters.map((f, idx) => (
                  <button key={idx} onClick={() => handleApplySavedFilter(f)} className="bg-gray-200 text-[#8f5cff] px-2 py-1 rounded-lg text-xs font-semibold hover:bg-[#8f5cff] hover:text-white transition">{f.name}</button>
                ))}
              </div>
            )}
          </section>

          {/* Sección principal: tabla y movimientos lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 w-full items-start">
            {/* Columna principal: Tabla de productos y widgets */}
            <div className="flex flex-col gap-8 w-full max-w-full">
              <section className="bg-white rounded-2xl shadow-lg p-6 w-full">
                <h2 className="text-xl font-semibold text-[#8f5cff] mb-4">Lista de productos</h2>
                <table className="w-full text-center">
                  <thead>
                    <tr>
                      <th className="pb-2 text-center">Nombre</th>
                      <th className="pb-2 text-center">Código</th>
                      <th className="pb-2 text-center">Categoría</th>
                      <th className="pb-2 text-center">Stock</th>
                      <th className="pb-2 text-center">Estado</th>
                      <th className="pb-2 text-center" style={{ width: '240px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {productosFiltrados.map((p, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className={`border-b last:border-b-0 ${p.stock <= 10 ? 'animate-pulse' : ''}`}
                        >
                          <td>
                            <div className="flex flex-col items-center">
                              {images[p.codigo] ? (
                                <img src={URL.createObjectURL(images[p.codigo])} alt={p.nombre} className="w-10 h-10 object-cover rounded-lg mb-1" />
                              ) : (
                                <FaBoxOpen className="text-gray-300 text-2xl mb-1" />
                              )}
                              <span>{p.nombre}</span>
                            </div>
                          </td>
                          <td>{p.codigo}</td>
                          <td>{p.categoria}</td>
                          <td>
                            <div className="w-12 h-12 flex items-center justify-center mx-auto">
                              <CircularProgressbar
                                value={p.stock}
                                maxValue={100}
                                text={`${p.stock}`}
                                styles={buildStyles({
                                  pathColor: p.stock > 10 ? '#8f5cff' : '#f87171',
                                  textColor: p.stock > 10 ? '#8f5cff' : '#f87171',
                                  trailColor: '#e5e7eb',
                                })}
                              />
                            </div>
                          </td>
                          <td>
                            {p.estado === 'Activo' ? (
                              <span className="text-green-500">Activo</span>
                            ) : (
                              <motion.span
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="text-red-500 font-bold"
                              >Bajo stock</motion.span>
                            )}
                          </td>
                          <td>
                            <div className="flex gap-1 items-center justify-end w-full">
                              <button onClick={() => handleOpenQuickView(p)} className="bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white px-3 py-1 rounded-lg font-semibold flex items-center gap-2 shadow hover:scale-105 transition-transform duration-200 whitespace-nowrap">
                                <FaEdit /> Vista rápida
                              </button>
                              <button 
                                onClick={() => {
                                  setProductoSeleccionado(p);
                                  setShowEditarProductoModal(true);
                                }}
                                className="bg-gradient-to-br from-[#f59e42] to-[#ff7a42] text-white px-3 py-1 rounded-lg font-semibold flex items-center gap-2 shadow hover:scale-105 transition-transform duration-200 whitespace-nowrap"
                              >
                                <FaEdit /> Editar
                              </button>
                              <Dropzone onDrop={files => handleDrop(files, p.codigo)} multiple={false} accept={{'image/*': []}}>
                                {({ getRootProps, getInputProps }) => (
                                  <button
                                    type="button"
                                    {...getRootProps()}
                                    className="px-3 py-1 h-8 rounded-lg font-semibold flex items-center gap-2 shadow bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white hover:scale-105 transition-transform duration-200 cursor-pointer text-sm border-none whitespace-nowrap"
                                    style={{ outline: 'none' }}
                                  >
                                    <input {...getInputProps()} />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16V4a2 2 0 012-2h12a2 2 0 012 2v12M4 16l4-4a2 2 0 012.828 0l2.344 2.344a2 2 0 002.828 0L20 8M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
                                    {images[p.codigo] ? 'Cambiar imagen' : 'Subir imagen'}
                                  </button>
                                )}
                              </Dropzone>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </section>
              {/* Widget de productos destacados y gráfico circular en layout horizontal */}
              <section className="mb-8 w-full flex flex-row gap-8 justify-center items-start">
                <div className="w-full max-w-5xl flex flex-row gap-8">
                  <div className="flex-1 min-w-[340px] max-w-[700px]">
                    <h2 className="text-xl font-bold text-[#8f5cff] mb-2">Productos destacados</h2>
                    <div className="relative w-full">
                      <Slider {...sliderSettings} className="w-full max-w-[680px]">
                        {featuredProducts.map((p, i) => (
                          <div key={i} className="p-4">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
                              <div className="w-32 h-32 mb-2 overflow-hidden flex items-center justify-center">
                                {images[p.codigo] ? (
                                  <img src={URL.createObjectURL(images[p.codigo])} alt={p.nombre} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                  <FaBoxOpen className="text-gray-300 text-7xl mx-auto" />
                                )}
                              </div>
                              <span className="font-semibold text-xl text-[#8f5cff]">{p.nombre}</span>
                              <span className="text-gray-400 text-base">{p.categoria}</span>
                              <Dropzone onDrop={files => handleDrop(files, p.codigo)} multiple={false} accept={{'image/*': []}}>
                                {({ getRootProps, getInputProps }) => (
                                  <div {...getRootProps()} className="mt-2 cursor-pointer text-xs text-[#8f5cff] underline">
                                    <input {...getInputProps()} />
                                    {images[p.codigo] ? 'Cambiar imagen' : 'Subir imagen'}
                                  </div>
                                )}
                              </Dropzone>
                              <button onClick={() => handleOpenQuickView(p)} className="mt-4 bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform duration-200">Vista rápida</button>
                            </motion.div>
                          </div>
                        ))}
                      </Slider>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[340px] max-w-[700px] flex items-center justify-center mt-9">
                    <MaterialTypePieChart materiales={productos.map(p => ({ nombre: p.nombre, tipo: p.categoria, cantidad: p.stock }))} />
                  </div>
                </div>
              </section>
            </div>
            {/* Historial de movimientos de productos - Línea de tiempo visual con react-vertical-timeline-component */}
            <section className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in min-w-[320px] max-w-[420px] w-full">
              <h2 className="text-xl font-semibold text-[#8f5cff] mb-4">Historial de movimientos</h2>
              <VerticalTimeline layout="1-column">
                {(mostrarTodosMov ? movimientosProductos : movimientosProductos.slice(0, 3)).map((mov, i) => (
                  <VerticalTimelineElement
                    key={i}
                    date={mov.fecha}
                    iconStyle={{ background: mov.tipo === 'entrada' ? '#8f5cff' : '#f59e42', color: '#fff' }}
                    icon={mov.tipo === 'entrada' ? <FaPlus /> : <FaEdit />}
                    contentStyle={{ background: '#f9f9ff', color: '#333', boxShadow: 'none', border: '1px solid #e5e7eb', padding: '12px 16px' }}
                    contentArrowStyle={{ borderRight: '7px solid #e5e7eb' }}
                  >
                    <h3 className="font-semibold text-[#8f5cff] text-base mb-1">{mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}</h3>
                    <p className="text-gray-700 text-sm">{mov.descripcion}</p>
                  </VerticalTimelineElement>
                ))}
              </VerticalTimeline>
              {movimientosProductos.length > 3 && !mostrarTodosMov && (
                <button
                  className="mt-4 bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform duration-200 border border-[#8f5cff]"
                  onClick={() => setMostrarTodosMov(true)}
                >
                  Ver más movimientos
                </button>
              )}
            </section>
          </div>

          {/* Quick View Modal */}
          <Modal
            isOpen={showQuickView}
            onRequestClose={handleCloseQuickView}
            contentLabel="Vista rápida de producto"
            ariaHideApp={false}
            style={{ overlay: { zIndex: 1000, background: 'rgba(0,0,0,0.3)' }, content: { borderRadius: 20, maxWidth: 400, margin: 'auto', padding: 24 } }}
          >
            {quickViewProduct && (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-2">
                  {images[quickViewProduct.codigo] ? (
                    <img src={URL.createObjectURL(images[quickViewProduct.codigo])} alt={quickViewProduct.nombre} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <FaBoxOpen className="text-gray-300 text-6xl" />
                  )}
                </div>
                <span className="font-semibold text-lg text-[#8f5cff]">{quickViewProduct.nombre}</span>
                <span className="text-gray-400 text-sm">{quickViewProduct.categoria}</span>
                <div className="w-16 h-16 my-2">
                  <CircularProgressbar
                    value={quickViewProduct.stock}
                    maxValue={100}
                    text={`${quickViewProduct.stock}`}
                    styles={buildStyles({
                      pathColor: quickViewProduct.stock > 10 ? '#8f5cff' : '#f87171',
                      textColor: quickViewProduct.stock > 10 ? '#8f5cff' : '#f87171',
                      trailColor: '#e5e7eb',
                    })}
                  />
                </div>
                <span className="text-xs text-gray-500 mb-2">Código: {quickViewProduct.codigo}</span>
                <span className="text-xs text-gray-500 mb-2">Estado: {quickViewProduct.estado}</span>
                {/* Panel de comentarios */}
                <div className="w-full mt-4">
                  <h4 className="text-[#8f5cff] font-semibold mb-2">Notas y comentarios</h4>
                  <div className="bg-gray-100 rounded-lg p-2 mb-2 min-h-[40px]">
                    {(comments[quickViewProduct.codigo] || []).map((c, idx) => (
                      <div key={idx} className="text-xs text-gray-700 mb-1">• {c}</div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Añadir nota..."
                      className="px-2 py-1 rounded-lg border border-gray-300 text-xs flex-1"
                    />
                    <button onClick={() => handleAddComment(quickViewProduct.codigo)} className="bg-[#8f5cff] text-white px-2 py-1 rounded-lg text-xs font-semibold">Agregar</button>
                  </div>
                </div>
                <button onClick={handleCloseQuickView} className="mt-4 bg-gray-200 text-[#8f5cff] px-4 py-2 rounded-lg font-semibold">Cerrar</button>
              </div>
            )}
          </Modal>

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
              setShowEditarProductoModal(false);
              setProductoSeleccionado(null);
            }}
            producto={productoSeleccionado}
          />
        </main>
      </div>
    </div>
  );
}

export default ProductosView;
