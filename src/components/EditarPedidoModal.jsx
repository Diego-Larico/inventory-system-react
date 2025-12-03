import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes, FaShoppingCart, FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaTshirt, FaStickyNote } from 'react-icons/fa';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

Modal.setAppElement('#root');

function EditarPedidoModal({ isOpen, onClose, onSubmit, pedido }) {
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    direccion: '',
    email: '',
    estado: null,
    prioridad: null,
    fechaEntrega: '',
    productos: [],
    metodoPago: null,
    adelanto: '',
    notas: '',
  });

  useEffect(() => {
    if (pedido && isOpen) {
      setFormData({
        cliente: pedido.cliente || '',
        telefono: pedido.telefono || '',
        direccion: pedido.direccion || '',
        email: pedido.email || '',
        estado: pedido.estado ? { value: pedido.estado, label: pedido.estado } : null,
        prioridad: pedido.prioridad ? { value: pedido.prioridad, label: pedido.prioridad } : null,
        fechaEntrega: pedido.fechaEntrega || '',
        productos: pedido.productos || [],
        metodoPago: pedido.metodoPago ? { value: pedido.metodoPago, label: pedido.metodoPago } : null,
        adelanto: pedido.adelanto?.toString() || '',
        notas: pedido.notas || '',
      });
    }
  }, [pedido, isOpen]);

  const estadoOptions = [
    { value: 'Pendiente', label: '⏳ Pendiente' },
    { value: 'En Proceso', label: '🔄 En Proceso' },
    { value: 'Completado', label: '✅ Completado' },
    { value: 'Cancelado', label: '❌ Cancelado' },
  ];

  const prioridadOptions = [
    { value: 'Baja', label: '🟢 Baja' },
    { value: 'Media', label: '🟡 Media' },
    { value: 'Alta', label: '🔴 Alta' },
  ];

  const metodoPagoOptions = [
    { value: 'Efectivo', label: '💵 Efectivo' },
    { value: 'Tarjeta', label: '💳 Tarjeta' },
    { value: 'Transferencia', label: '🏦 Transferencia' },
    { value: 'Yape/Plin', label: '📱 Yape/Plin' },
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
    if (!formData.estado) {
      toast.error('Selecciona el estado del pedido', {
        icon: '📋',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }
    if (!formData.fechaEntrega) {
      toast.error('La fecha de entrega es obligatoria', {
        icon: '📅',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }

    toast.success('¡Pedido actualizado exitosamente!', {
      icon: '🎉',
      style: { borderRadius: '12px', background: '#8f5cff', color: '#fff' },
      duration: 3000,
    });
    
    onSubmit({ ...formData, id: pedido.id });
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
      overlayClassName="fixed inset-0 bg-black dark:bg-gray-950 bg-opacity-60 dark:bg-opacity-80 backdrop-blur-sm z-40"
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
                <FaShoppingCart className="text-3xl" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Editar Pedido</h2>
                <p className="text-sm opacity-90">Modifica la información del pedido</p>
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
            {/* Información del Cliente */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-[#f59e42] to-[#ff7a42] p-3 rounded-xl shadow-lg">
                  <FaUser className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Información del Cliente</h3>
                  <p className="text-sm text-gray-500">Datos de contacto</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaUser className="text-[#f59e42]" />
                    Nombre del cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => handleChange('cliente', e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaPhone className="text-[#f59e42]" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    placeholder="Ej: +51 987654321"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mt-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaMapMarkerAlt className="text-[#f59e42]" />
                    Dirección de entrega
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    placeholder="Ej: Av. Principal 123, Lima"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
              </div>
            </motion.div>

            {/* Estado del Pedido */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-[#f59e42] to-[#ff7a42] p-3 rounded-xl shadow-lg">
                  <FaShoppingCart className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Estado del Pedido</h3>
                  <p className="text-sm text-gray-500">Progreso y prioridad</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaShoppingCart className="text-[#f59e42]" />
                    Estado *
                  </label>
                  <Select
                    options={estadoOptions}
                    value={formData.estado}
                    onChange={(value) => handleChange('estado', value)}
                    placeholder="Selecciona estado"
                    styles={customSelectStyles}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaShoppingCart className="text-[#f59e42]" />
                    Prioridad
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
                    <FaCalendarAlt className="text-[#f59e42]" />
                    Fecha de entrega *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => handleChange('fechaEntrega', e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
              </div>
            </motion.div>

            {/* Información de Pago */}
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
                  <h3 className="text-2xl font-bold text-gray-800">Información de Pago</h3>
                  <p className="text-sm text-gray-500">Método y adelantos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaDollarSign className="text-[#f59e42]" />
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
                    <FaDollarSign className="text-[#f59e42]" />
                    Adelanto (S/)
                  </label>
                  <input
                    type="number"
                    value={formData.adelanto}
                    onChange={(e) => handleChange('adelanto', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f59e42] focus:ring-opacity-20 focus:border-[#f59e42] transition-all duration-200 group-hover:border-gray-300"
                  />
                </div>
              </div>
            </motion.div>

            {/* Notas Adicionales */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-[#f59e42] to-[#ff7a42] p-3 rounded-xl shadow-lg">
                  <FaStickyNote className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Notas Adicionales</h3>
                  <p className="text-sm text-gray-500">Instrucciones especiales</p>
                </div>
              </div>

              <div className="group">
                <textarea
                  value={formData.notas}
                  onChange={(e) => handleChange('notas', e.target.value)}
                  placeholder="Instrucciones especiales, observaciones, etc."
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
                <FaShoppingCart />
                Guardar Cambios
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </Modal>
  );
}

export default EditarPedidoModal;
