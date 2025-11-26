import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaTimes, FaBox, FaUser, FaCalendar, FaMapMarkerAlt, FaPhone, FaDollarSign, FaShoppingCart, FaClipboardList } from 'react-icons/fa';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

Modal.setAppElement('#root');

function NuevoPedidoModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    direccion: '',
    productos: [],
    prioridad: null,
    fechaEntrega: '',
    notas: '',
    metodoPago: null,
    anticipo: '',
  });

  const [step, setStep] = useState(1);

  const prioridadOptions = [
    { value: 'alta', label: '🔴 Alta', color: '#ef4444' },
    { value: 'media', label: '🟡 Media', color: '#f59e0b' },
    { value: 'baja', label: '🟢 Baja', color: '#10b981' },
  ];

  const metodoPagoOptions = [
    { value: 'efectivo', label: '💵 Efectivo' },
    { value: 'transferencia', label: '💳 Transferencia' },
    { value: 'tarjeta', label: '💳 Tarjeta' },
    { value: 'yape', label: '📱 Yape/Plin' },
  ];

  const productosOptions = [
    { value: 'P-001', label: 'Polo básico blanco', precio: 45 },
    { value: 'P-002', label: 'Pantalón jean azul', precio: 89 },
    { value: 'P-003', label: 'Chaqueta denim', precio: 150 },
    { value: 'P-004', label: 'Vestido floral', precio: 120 },
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.cliente.trim()) {
      toast.error('El nombre del cliente es obligatorio', {
        icon: '👤',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }
    if (!formData.telefono.trim()) {
      toast.error('El teléfono es obligatorio', {
        icon: '📱',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }
    if (!formData.productos || formData.productos.length === 0) {
      toast.error('Debes agregar al menos un producto', {
        icon: '📦',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }
    if (!formData.prioridad) {
      toast.error('Selecciona una prioridad', {
        icon: '⚠️',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }
    if (!formData.fechaEntrega) {
      toast.error('Selecciona una fecha de entrega', {
        icon: '📅',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }

    toast.success('¡Pedido creado exitosamente!', {
      icon: '🎉',
      style: { borderRadius: '12px', background: '#8f5cff', color: '#fff' },
      duration: 3000,
    });
    
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      cliente: '',
      telefono: '',
      direccion: '',
      productos: [],
      prioridad: null,
      fechaEntrega: '',
      notas: '',
      metodoPago: null,
      anticipo: '',
    });
    setStep(1);
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
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
      >
        {/* Header con diseño premium */}
        <div className="sticky top-0 bg-gradient-to-br from-[#8f5cff] via-[#7d4eea] to-[#6e7ff3] text-white p-8 relative overflow-hidden z-10">
          {/* Patrón de fondo decorativo */}
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
                <FaShoppingCart className="text-3xl" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Nuevo Pedido</h2>
                <p className="text-sm opacity-90">Completa los detalles del pedido</p>
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

          {/* Indicador de progreso */}
          <div className="mt-6 flex gap-2">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                className={`h-2 rounded-full flex-1 transition-all duration-300 ${step >= s ? 'bg-white' : 'bg-white bg-opacity-30'}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: s * 0.1 }}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Información del Cliente */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] p-3 rounded-xl shadow-lg">
                    <FaUser className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Información del Cliente</h3>
                    <p className="text-sm text-gray-500">Datos de contacto y ubicación</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <FaUser className="text-[#8f5cff]" />
                      Cliente *
                    </label>
                    <input
                      type="text"
                      value={formData.cliente}
                      onChange={(e) => handleChange('cliente', e.target.value)}
                      placeholder="Nombre completo del cliente"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 group-hover:border-gray-300"
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <FaPhone className="text-[#8f5cff]" />
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="+51 999 999 999"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 group-hover:border-gray-300"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaMapMarkerAlt className="text-[#8f5cff]" />
                    Dirección de entrega
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    placeholder="Calle, número, distrito, ciudad"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Detalles del Pedido */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] p-3 rounded-xl shadow-lg">
                    <FaBox className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Detalles del Pedido</h3>
                    <p className="text-sm text-gray-500">Productos, prioridad y fecha de entrega</p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaBox className="text-[#8f5cff]" />
                    Productos *
                  </label>
                  <Select
                    isMulti
                    options={productosOptions}
                    value={formData.productos}
                    onChange={(value) => handleChange('productos', value)}
                    placeholder="Selecciona los productos"
                    styles={customSelectStyles}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      Prioridad *
                    </label>
                    <Select
                      options={prioridadOptions}
                      value={formData.prioridad}
                      onChange={(value) => handleChange('prioridad', value)}
                      placeholder="Selecciona prioridad"
                      styles={customSelectStyles}
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <FaCalendar className="text-[#8f5cff]" />
                      Fecha de entrega *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaEntrega}
                      onChange={(e) => handleChange('fechaEntrega', e.target.value)}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 group-hover:border-gray-300"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Pago y Notas */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] p-3 rounded-xl shadow-lg">
                    <FaDollarSign className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Pago y Notas</h3>
                    <p className="text-sm text-gray-500">Información de pago y detalles adicionales</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <FaDollarSign className="text-[#8f5cff]" />
                      Método de pago
                    </label>
                    <Select
                      options={metodoPagoOptions}
                      value={formData.metodoPago}
                      onChange={(value) => handleChange('metodoPago', value)}
                      placeholder="Selecciona método"
                      styles={customSelectStyles}
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <FaDollarSign className="text-[#8f5cff]" />
                      Anticipo (S/)
                    </label>
                    <input
                      type="number"
                      value={formData.anticipo}
                      onChange={(e) => handleChange('anticipo', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 group-hover:border-gray-300"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaClipboardList className="text-[#8f5cff]" />
                    Notas adicionales
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => handleChange('notas', e.target.value)}
                    placeholder="Detalles especiales, preferencias del cliente, etc."
                    rows={4}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 resize-none group-hover:border-gray-300"
                  />
                </div>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm"
                >
                  ← Anterior
                </motion.button>
              )}
              {step < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 shadow-md"
                >
                  Siguiente →
                </motion.button>
              ) : (
                <>
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
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart />
                    Crear Pedido
                  </motion.button>
                </>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </Modal>
  );
}

export default NuevoPedidoModal;
