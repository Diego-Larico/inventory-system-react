import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes, FaBox, FaHashtag, FaTshirt, FaDollarSign, FaRuler, FaTag, FaImage, FaPalette, FaSave, FaSpinner } from 'react-icons/fa';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { confirmarGuardar, mostrarExito, mostrarError } from '../utils/confirmationModals';
import { generarCodigoProducto, obtenerCategorias, crearProducto } from '../services/productosService';

Modal.setAppElement('#root');

function NuevoProductoModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    categoria_id: '',
    categoria: null,
    precio: '',
    costo: '',
    stock: '',
    stock_minimo: '5',
    tallas: [],
    colores: [],
    descripcion: '',
  });

  // Cargar código automático y categorías cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarDatosIniciales();
    }
  }, [isOpen]);

  const cargarDatosIniciales = async () => {
    try {
      setLoadingCategorias(true);
      
      // Generar código automático
      const nuevoCodigo = await generarCodigoProducto();
      console.log('✅ Código generado:', nuevoCodigo);
      
      // Obtener categorías
      const categoriasDB = await obtenerCategorias();
      console.log('✅ Categorías obtenidas de Supabase:', categoriasDB);
      
      if (!categoriasDB || categoriasDB.length === 0) {
        toast.error('No hay categorías disponibles. Ejecuta el script SQL en Supabase.', {
          duration: 5000,
          icon: '⚠️',
        });
        setCategorias([]);
      } else {
        const categoriasFormateadas = categoriasDB.map(cat => ({
          value: cat.id,
          label: `${cat.icono || '📦'} ${cat.nombre}`,
          nombre: cat.nombre,
          icono: cat.icono,
          color: cat.color
        }));
        
        console.log('✅ Categorías formateadas:', categoriasFormateadas);
        setCategorias(categoriasFormateadas);
        toast.success(`${categoriasFormateadas.length} categorías cargadas`, {
          icon: '📂',
          duration: 2000,
        });
      }
      
      setFormData(prev => ({ ...prev, codigo: nuevoCodigo }));
    } catch (error) {
      console.error('❌ Error al cargar datos iniciales:', error);
      toast.error(`Error al cargar datos: ${error.message || 'Error desconocido'}`, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setLoadingCategorias(false);
    }
  };

  const tallasOptions = [
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' },
    { value: '28', label: '28' },
    { value: '30', label: '30' },
    { value: '32', label: '32' },
    { value: '34', label: '34' },
    { value: '36', label: '36' },
  ];

  const coloresOptions = [
    { value: 'Blanco', label: '⚪ Blanco' },
    { value: 'Negro', label: '⚫ Negro' },
    { value: 'Azul', label: '🔵 Azul' },
    { value: 'Rojo', label: '🔴 Rojo' },
    { value: 'Verde', label: '🟢 Verde' },
    { value: 'Amarillo', label: '🟡 Amarillo' },
    { value: 'Rosa', label: '🩷 Rosa' },
    { value: 'Gris', label: '⚪ Gris' },
    { value: 'Naranja', label: '🟠 Naranja' },
    { value: 'Morado', label: '🟣 Morado' },
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El nombre del producto es obligatorio', {
        icon: '📝',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }
    
    if (!formData.categoria) {
      toast.error('Selecciona una categoría', {
        icon: '🏷️',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }
    
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      toast.error('El precio debe ser mayor a 0', {
        icon: '💰',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error('El stock no puede ser negativo', {
        icon: '📦',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }

    // Confirmación antes de crear el producto
    const confirmado = await confirmarGuardar(`Nuevo Producto "${formData.nombre}"`);
    if (!confirmado) return;

    setLoading(true);

    try {
      // Preparar datos para enviar
      const datosProducto = {
        codigo: formData.codigo,
        nombre: formData.nombre.trim(),
        categoria_id: formData.categoria.value,
        descripcion: formData.descripcion.trim() || null,
        precio: parseFloat(formData.precio),
        costo: formData.costo ? parseFloat(formData.costo) : 0,
        stock: parseInt(formData.stock),
        stock_minimo: formData.stock_minimo ? parseInt(formData.stock_minimo) : 5,
        tallas: formData.tallas.map(t => t.value),
        colores: formData.colores.map(c => c.value),
      };

      const resultado = await crearProducto(datosProducto);

      if (resultado.success) {
        await mostrarExito(
          '¡Producto creado exitosamente!',
          `Código: ${resultado.data?.codigo || formData.codigo}`
        );
        
        // Notificar al Sidebar para actualizar el badge
        window.dispatchEvent(new Event('productosActualizados'));
        
        handleClose();
        if (onSuccess) onSuccess(resultado.data);
      } else {
        await mostrarError(
          'Error al crear el producto',
          resultado.error || 'No se pudo registrar el producto en la base de datos'
        );
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      await mostrarError(
        'Error inesperado',
        error.message || 'Ocurrió un error al procesar la solicitud'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      codigo: '',
      categoria_id: '',
      categoria: null,
      precio: '',
      costo: '',
      stock: '',
      stock_minimo: '5',
      tallas: [],
      colores: [],
      descripcion: '',
    });
    onClose();
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      padding: '8px',
      borderRadius: '12px',
      borderColor: state.isFocused ? '#8f5cff' : '#e5e7eb',
      borderWidth: '2px',
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(143, 92, 255, 0.1)' : 'none',
      '&:hover': { borderColor: '#8f5cff' },
      transition: 'all 0.2s',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
      borderRadius: '12px',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#8f5cff',
      borderRadius: '8px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'white',
      fontWeight: '600',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'white',
      ':hover': {
        backgroundColor: '#7d4eea',
        color: 'white',
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#8f5cff' 
        : state.isFocused 
          ? (document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6')
          : 'transparent',
      color: state.isSelected ? 'white' : (document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151'),
      cursor: 'pointer',
      transition: 'all 0.2s',
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
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40"
      closeTimeoutMS={300}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header Premium */}
        <div className="sticky top-0 bg-gradient-to-br from-[#8f5cff] via-[#7d4eea] to-[#6e7ff3] text-white p-8 relative overflow-hidden z-10">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl">
                <FaBox className="text-3xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Nuevo Producto</h2>
                <p className="text-white/80 mt-1">Agrega un nuevo producto al inventario</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-lg"
            >
              <FaTimes className="text-xl" />
            </motion.button>
          </div>
        </div>

        {/* Formulario con scroll */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-160px)] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaTshirt className="text-[#8f5cff]" />
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:border-[#8f5cff] focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                placeholder="Ej: Camisa Casual Azul"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaTag className="text-[#8f5cff]" />
                Categoría *
              </label>
              <Select
                value={formData.categoria}
                onChange={(val) => handleChange('categoria', val)}
                options={categorias}
                styles={customSelectStyles}
                placeholder={loadingCategorias ? "Cargando categorías..." : "Selecciona categoría"}
                isSearchable
                isClearable
                isLoading={loadingCategorias}
                isDisabled={loadingCategorias}
                noOptionsMessage={() => "No hay categorías disponibles"}
              />
              {categorias.length === 0 && !loadingCategorias && (
                <p className="text-xs text-red-500 mt-2">
                  ⚠️ No hay categorías. Ejecuta el script SQL con los INSERT de categorías_productos.
                </p>
              )}
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaDollarSign className="text-[#8f5cff]" />
                Precio de Venta (S/) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => handleChange('precio', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:border-[#8f5cff] focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            {/* Costo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaDollarSign className="text-orange-500" />
                Costo (S/)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => handleChange('costo', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:border-[#8f5cff] focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaBox className="text-[#8f5cff]" />
                Stock Inicial *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:border-[#8f5cff] focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Stock Mínimo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaBox className="text-red-500" />
                Stock Mínimo
              </label>
              <input
                type="number"
                value={formData.stock_minimo}
                onChange={(e) => handleChange('stock_minimo', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:border-[#8f5cff] focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                placeholder="5"
                min="0"
              />
            </div>

            {/* Tallas */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaRuler className="text-[#8f5cff]" />
                Tallas Disponibles
              </label>
              <Select
                value={formData.tallas}
                onChange={(val) => handleChange('tallas', val)}
                options={tallasOptions}
                styles={customSelectStyles}
                placeholder="Selecciona tallas"
                isMulti
                isSearchable
              />
            </div>

            {/* Colores */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaPalette className="text-[#8f5cff]" />
                Colores Disponibles
              </label>
              <Select
                value={formData.colores}
                onChange={(val) => handleChange('colores', val)}
                options={coloresOptions}
                styles={customSelectStyles}
                placeholder="Selecciona colores"
                isMulti
                isSearchable
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:border-[#8f5cff] focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none"
                rows="3"
                placeholder="Descripción detallada del producto..."
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 mt-8">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              disabled={loading}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-300 transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave />
                  Guardar Producto
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
}

export default NuevoProductoModal;
