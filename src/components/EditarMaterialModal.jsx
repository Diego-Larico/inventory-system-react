import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes, FaCube, FaHashtag, FaTag, FaBoxes, FaWarehouse } from 'react-icons/fa';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { actualizarMaterial, obtenerCategoriasMateriales } from '../services/materialesService';

Modal.setAppElement('#root');

function EditarMaterialModal({ isOpen, onClose, onSubmit, material }) {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria_id: null,
    tipo: '',
    cantidad: '',
    unidad: null,
    precio_unitario: '',
    proveedor: '',
    ubicacion: '',
    stock_minimo: '10',
    color: '',
    notas: '',
  });

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // Cargar categorías al abrir el modal
  useEffect(() => {
    const cargarCategorias = async () => {
      setLoadingCategorias(true);
      const resultado = await obtenerCategoriasMateriales();
      if (resultado.success) {
        setCategorias(resultado.data);
      } else {
        toast.error('Error al cargar categorías');
      }
      setLoadingCategorias(false);
    };

    if (isOpen) {
      cargarCategorias();
    }
  }, [isOpen]);

  // Cargar datos del material cuando se abre el modal
  useEffect(() => {
    if (material && isOpen) {
      setFormData({
        nombre: material.nombre || '',
        categoria_id: material.categoria_id ? { value: material.categoria_id, label: material.categoria?.nombre || '' } : null,
        tipo: material.tipo || '',
        cantidad: material.cantidad?.toString() || '',
        unidad: material.unidad ? { value: material.unidad, label: material.unidad } : null,
        precio_unitario: material.precio_unitario?.toString() || '',
        proveedor: material.proveedor || '',
        ubicacion: material.ubicacion || '',
        stock_minimo: material.stock_minimo?.toString() || '10',
        color: material.color || '',
        notas: material.notas || '',
      });
    }
  }, [material, isOpen]);

  const unidadOptions = [
    { value: 'metros', label: 'Metros' },
    { value: 'unidades', label: 'Unidades' },
    { value: 'rollos', label: 'Rollos' },
    { value: 'cajas', label: 'Cajas' },
    { value: 'kilos', label: 'Kilos' },
    { value: 'gramos', label: 'Gramos' },
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El nombre del material es obligatorio');
      return;
    }
    if (!formData.categoria_id) {
      toast.error('Selecciona una categoría');
      return;
    }
    if (!formData.tipo.trim()) {
      toast.error('El tipo es obligatorio');
      return;
    }
    if (!formData.cantidad || parseFloat(formData.cantidad) < 0) {
      toast.error('La cantidad no puede ser negativa');
      return;
    }

    setLoading(true);

    // Preparar datos para Supabase
    const materialData = {
      nombre: formData.nombre,
      categoria_id: formData.categoria_id.value,
      tipo: formData.tipo,
      cantidad: parseFloat(formData.cantidad),
      unidad: formData.unidad?.value || 'unidades',
      precio_unitario: parseFloat(formData.precio_unitario) || 0,
      proveedor: formData.proveedor,
      ubicacion: formData.ubicacion,
      stock_minimo: parseFloat(formData.stock_minimo) || 10,
      color: formData.color,
      notas: formData.notas,
    };

    const resultado = await actualizarMaterial(material.id, materialData);
    
    setLoading(false);

    if (resultado.success) {
      toast.success('¡Material actualizado exitosamente!');
      onSubmit();
    } else {
      toast.error('Error al actualizar: ' + resultado.error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      padding: '8px',
      borderRadius: '12px',
      borderColor: state.isFocused ? '#8f5cff' : '#e5e7eb',
      borderWidth: '2px',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(143, 92, 255, 0.1)' : 'none',
      '&:hover': { borderColor: '#8f5cff' },
      transition: 'all 0.2s',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#8f5cff' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s',
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
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header Premium */}
        <div className="sticky top-0 bg-gradient-to-br from-[#f59e42] via-[#ff8c42] to-[#ff7a42] text-white p-8 relative overflow-hidden z-10">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
                className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-md border border-white border-opacity-30"
              >
                <FaCube className="text-3xl" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Editar Material</h2>
                <p className="text-sm opacity-90">Modifica la información del material</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-3 transition backdrop-blur-sm"
            >
              <FaTimes className="text-2xl" />
            </motion.button>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Información Básica */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-[#f59e42] to-[#ff7a42] p-3 rounded-xl shadow-lg">
                  <FaCube className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Información Básica</h3>
                  <p className="text-sm text-gray-500">Datos principales del material</p>
                </div>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <FaCube className="text-[#f59e42]" />
                  Nombre del material *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ej: Hilo blanco premium"
                  disabled={loading}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300 disabled:opacity-50"
                />
              </div>
            </motion.div>

            {/* Clasificación */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-[#f59e42] to-[#ff7a42] p-3 rounded-xl shadow-lg">
                  <FaTag className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Clasificación</h3>
                  <p className="text-sm text-gray-500">Categoría y tipo</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaTag className="text-[#f59e42]" />
                    Categoría *
                  </label>
                  <Select
                    options={categorias.map(cat => ({
                      value: cat.id,
                      label: `${cat.icono} ${cat.nombre}`
                    }))}
                    value={formData.categoria_id}
                    onChange={(value) => handleChange('categoria_id', value)}
                    placeholder={loadingCategorias ? "Cargando..." : "Selecciona categoría"}
                    isDisabled={loading || loadingCategorias}
                    styles={customSelectStyles}
                  />
                </div>
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaTag className="text-[#f59e42]" />
                    Tipo *
                  </label>
                  <input
                    type="text"
                    value={formData.tipo}
                    onChange={(e) => handleChange('tipo', e.target.value)}
                    placeholder="Ej: Premium, Estándar, Especial"
                    disabled={loading}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="group mt-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <FaTag className="text-[#f59e42]" />
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  placeholder="Ej: Blanco, Negro, Azul"
                  disabled={loading}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300 disabled:opacity-50"
                />
              </div>
            </motion.div>

            {/* Cantidades */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-[#f59e42] to-[#ff7a42] p-3 rounded-xl shadow-lg">
                  <FaBoxes className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Cantidades</h3>
                  <p className="text-sm text-gray-500">Stock y niveles mínimos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaBoxes className="text-[#f59e42]" />
                    Cantidad actual *
                  </label>
                  <input
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) => handleChange('cantidad', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    disabled={loading}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaBoxes className="text-[#f59e42]" />
                    Unidad
                  </label>
                  <Select
                    options={unidadOptions}
                    value={formData.unidad}
                    onChange={(value) => handleChange('unidad', value)}
                    placeholder="Selecciona unidad"
                    isDisabled={loading}
                    styles={customSelectStyles}
                  />
                </div>
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaBoxes className="text-[#f59e42]" />
                    Stock mínimo
                  </label>
                  <input
                    type="number"
                    value={formData.stock_minimo}
                    onChange={(e) => handleChange('stock_minimo', e.target.value)}
                    placeholder="10"
                    min="0"
                    step="0.01"
                    disabled={loading}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300 disabled:opacity-50"
                  />
                </div>
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaTag className="text-[#f59e42]" />
                    Precio unitario
                  </label>
                  <input
                    type="number"
                    value={formData.precio_unitario}
                    onChange={(e) => handleChange('precio_unitario', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={loading}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300 disabled:opacity-50"
                  />
                </div>
              </div>
            </motion.div>

            {/* Almacenamiento */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-[#f59e42] to-[#ff7a42] p-3 rounded-xl shadow-lg">
                  <FaWarehouse className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Almacenamiento</h3>
                  <p className="text-sm text-gray-500">Ubicación y proveedor</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaWarehouse className="text-[#f59e42]" />
                    Ubicación en almacén
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => handleChange('ubicacion', e.target.value)}
                    placeholder="Ej: Estante A-3"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaTag className="text-[#f59e42]" />
                    Proveedor
                  </label>
                  <input
                    type="text"
                    value={formData.proveedor}
                    onChange={(e) => handleChange('proveedor', e.target.value)}
                    placeholder="Ej: Textiles SA"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
              </div>

              <div className="group mt-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Notas adicionales
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => handleChange('notas', e.target.value)}
                  placeholder="Observaciones, instrucciones especiales, etc."
                  rows={3}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 resize-none group-hover:border-gray-300"
                />
              </div>
            </motion.div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-[#f59e42] to-[#ff7a42] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <FaCube />
                    Guardar Cambios
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </Modal>
  );
}

export default EditarMaterialModal;
