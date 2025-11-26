import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes, FaTshirt, FaHashtag, FaTag, FaDollarSign, FaRuler, FaPalette, FaImage, FaBoxes } from 'react-icons/fa';
import Select from 'react-select';
import Dropzone from 'react-dropzone';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

Modal.setAppElement('#root');

function EditarProductoModal({ isOpen, onClose, onSubmit, producto }) {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    categoria: null,
    precio: '',
    costo: '',
    stock: '',
    tallas: [],
    colores: [],
    materiales: [],
    descripcion: '',
    imagen: null,
    imagenPreview: null,
  });

  useEffect(() => {
    if (producto && isOpen) {
      setFormData({
        nombre: producto.nombre || '',
        codigo: producto.codigo || '',
        categoria: producto.categoria ? { value: producto.categoria, label: `👕 ${producto.categoria}` } : null,
        precio: producto.precio?.toString() || '',
        costo: producto.costo?.toString() || '',
        stock: producto.stock?.toString() || '',
        tallas: producto.tallas || [],
        colores: producto.colores || [],
        materiales: producto.materiales || [],
        descripcion: producto.descripcion || '',
        imagen: null,
        imagenPreview: producto.imagenUrl || null,
      });
    }
  }, [producto, isOpen]);

  const categoriaOptions = [
    { value: 'Polo', label: '👕 Polo' },
    { value: 'Pantalón', label: '👖 Pantalón' },
    { value: 'Vestido', label: '👗 Vestido' },
    { value: 'Chaqueta', label: '🧥 Chaqueta' },
    { value: 'Falda', label: '👗 Falda' },
    { value: 'Camisa', label: '👔 Camisa' },
    { value: 'Short', label: '🩳 Short' },
    { value: 'Accesorio', label: '👜 Accesorio' },
  ];

  const tallasOptions = [
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' },
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
  ];

  const materialesOptions = [
    { value: 'MAT-001', label: 'Hilo blanco' },
    { value: 'MAT-002', label: 'Tela azul' },
    { value: 'MAT-003', label: 'Botón dorado' },
    { value: 'MAT-004', label: 'Cremallera' },
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFormData({ 
        ...formData, 
        imagen: acceptedFiles[0],
        imagenPreview: URL.createObjectURL(acceptedFiles[0])
      });
      toast.success('Imagen cargada correctamente', {
        icon: '📸',
        style: { borderRadius: '12px', background: '#8f5cff', color: '#fff' },
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
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
    if (!formData.precio || formData.precio <= 0) {
      toast.error('El precio debe ser mayor a 0', {
        icon: '💰',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }

    toast.success('¡Producto actualizado exitosamente!', {
      icon: '🎉',
      style: { borderRadius: '12px', background: '#8f5cff', color: '#fff' },
      duration: 3000,
    });
    
    onSubmit({ ...formData, id: producto.id || producto.codigo });
    handleClose();
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
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
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
                <FaTshirt className="text-3xl" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Editar Producto</h2>
                <p className="text-sm opacity-90">Modifica la información del producto</p>
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
            {/* Imagen del Producto */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-[#f59e42] to-[#ff7a42] p-3 rounded-xl shadow-lg">
                  <FaImage className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Imagen del Producto</h3>
                  <p className="text-sm text-gray-500">Actualiza la foto del producto</p>
                </div>
              </div>

              <Dropzone onDrop={handleDrop} accept={{ 'image/*': [] }} maxFiles={1}>
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragActive ? 'border-[#f59e42] bg-orange-50 scale-105' : 'border-gray-300 hover:border-[#f59e42] hover:bg-gray-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {formData.imagenPreview ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <img
                          src={formData.imagenPreview}
                          alt="Preview"
                          className="w-40 h-40 object-cover rounded-2xl shadow-lg"
                        />
                        <p className="text-sm text-gray-600 font-semibold">
                          {formData.imagen ? formData.imagen.name : 'Imagen actual'}
                        </p>
                        <p className="text-xs text-gray-400">Haz clic para cambiar la imagen</p>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <FaImage className="text-5xl text-gray-400" />
                        </motion.div>
                        <div>
                          <p className="text-gray-600 font-semibold">
                            {isDragActive ? '¡Suelta la imagen aquí!' : 'Arrastra una imagen o haz clic para seleccionar'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF hasta 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Dropzone>
            </motion.div>

            {/* Información Básica */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-[#f59e42] to-[#ff7a42] p-3 rounded-xl shadow-lg">
                  <FaTshirt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Información Básica</h3>
                  <p className="text-sm text-gray-500">Identificación del producto</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaTshirt className="text-[#f59e42]" />
                    Nombre del producto *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Ej: Polo básico cuello redondo"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaHashtag className="text-[#f59e42]" />
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => handleChange('codigo', e.target.value)}
                    placeholder="Ej: P-001"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <FaTag className="text-[#f59e42]" />
                  Categoría *
                </label>
                <Select
                  options={categoriaOptions}
                  value={formData.categoria}
                  onChange={(value) => handleChange('categoria', value)}
                  placeholder="Selecciona la categoría"
                  styles={customSelectStyles}
                />
              </div>
            </motion.div>

            {/* Precios y Stock */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-[#f59e42] to-[#ff7a42] p-3 rounded-xl shadow-lg">
                  <FaDollarSign className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Precios y Stock</h3>
                  <p className="text-sm text-gray-500">Valoración e inventario</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaDollarSign className="text-[#f59e42]" />
                    Precio de venta (S/) *
                  </label>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => handleChange('precio', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaDollarSign className="text-[#f59e42]" />
                    Costo de producción (S/)
                  </label>
                  <input
                    type="number"
                    value={formData.costo}
                    onChange={(e) => handleChange('costo', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaBoxes className="text-[#f59e42]" />
                    Stock actual *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
              </div>
            </motion.div>

            {/* Variantes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-[#f59e42] to-[#ff7a42] p-3 rounded-xl shadow-lg">
                  <FaPalette className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Variantes</h3>
                  <p className="text-sm text-gray-500">Tallas y colores disponibles</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaRuler className="text-[#f59e42]" />
                    Tallas disponibles
                  </label>
                  <Select
                    isMulti
                    options={tallasOptions}
                    value={formData.tallas}
                    onChange={(value) => handleChange('tallas', value)}
                    placeholder="Selecciona tallas"
                    styles={customSelectStyles}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaPalette className="text-[#f59e42]" />
                    Colores disponibles
                  </label>
                  <Select
                    isMulti
                    options={coloresOptions}
                    value={formData.colores}
                    onChange={(value) => handleChange('colores', value)}
                    placeholder="Selecciona colores"
                    styles={customSelectStyles}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <FaTshirt className="text-[#f59e42]" />
                  Materiales utilizados
                </label>
                <Select
                  isMulti
                  options={materialesOptions}
                  value={formData.materiales}
                  onChange={(value) => handleChange('materiales', value)}
                  placeholder="Selecciona los materiales"
                  styles={customSelectStyles}
                />
              </div>

              <div className="group mt-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Descripción del producto
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  placeholder="Características, detalles de diseño, cuidados, etc."
                  rows={4}
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
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 px-6 py-4 bg-gradient-to-r from-[#f59e42] to-[#ff7a42] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 shadow-md flex items-center justify-center gap-2"
              >
                <FaTshirt />
                Guardar Cambios
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </Modal>
  );
}

export default EditarProductoModal;
