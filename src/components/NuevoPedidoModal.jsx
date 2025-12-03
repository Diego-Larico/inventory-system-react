import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes, FaBox, FaUser, FaCalendar, FaMapMarkerAlt, FaPhone, FaDollarSign, FaShoppingCart, FaClipboardList, FaPlus, FaTrash } from 'react-icons/fa';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { confirmarGuardar, mostrarExito, mostrarError } from '../utils/confirmationModals';
import {
  obtenerClientes,
  obtenerProductosDisponibles,
  crearPedido,
  crearCliente,
} from '../services/pedidosService';

Modal.setAppElement('#root');

function NuevoPedidoModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    clienteSeleccionado: null,
    clienteNombre: '',
    clienteTelefono: '',
    clienteDireccion: '',
    clienteEmail: '',
    productosSeleccionados: [],
    prioridad: null,
    fechaEntrega: '',
    notas: '',
    metodoPago: null,
    anticipo: 0,
    descuento: 0,
  });

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [crearNuevoCliente, setCrearNuevoCliente] = useState(false);

  const prioridadOptions = [
    { value: 'Alta', label: '🔴 Alta', color: '#ef4444' },
    { value: 'Media', label: '🟡 Media', color: '#f59e0b' },
    { value: 'Baja', label: '🟢 Baja', color: '#10b981' },
  ];

  const metodoPagoOptions = [
    { value: 'Efectivo', label: '💵 Efectivo' },
    { value: 'Transferencia', label: '💳 Transferencia' },
    { value: 'Tarjeta', label: '💳 Tarjeta' },
    { value: 'Yape/Plin', label: '📱 Yape/Plin' },
    { value: 'Otro', label: '📋 Otro' },
  ];

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarDatosIniciales();
    }
  }, [isOpen]);

  // Monitorear cuando se actualicen los estados (para debug)
  useEffect(() => {
    console.log('🔄 Estado de clientes actualizado:', clientes);
  }, [clientes]);

  useEffect(() => {
    console.log('🔄 Estado de productos actualizado:', productos);
  }, [productos]);

  const cargarDatosIniciales = async () => {
    console.log('🔄 Cargando datos iniciales del modal...');
    setLoading(true);
    try {
      // Cargar clientes y productos en paralelo
      const [clientesRes, productosRes] = await Promise.all([
        obtenerClientes(),
        obtenerProductosDisponibles(),
      ]);

      console.log('📦 Respuesta clientes:', clientesRes);
      console.log('📦 Respuesta productos:', productosRes);

      if (clientesRes.success && clientesRes.data) {
        // Formatear clientes para react-select
        const clientesFormateados = clientesRes.data.map((cliente) => ({
          value: cliente.id,
          label: `${cliente.nombre_completo} - ${cliente.telefono || 'Sin teléfono'}`,
          data: cliente,
        }));
        console.log('✅ Clientes formateados para Select:', clientesFormateados);
        setClientes(clientesFormateados);
      } else {
        console.log('❌ No se obtuvieron clientes o hubo error');
        setClientes([]);
      }

      if (productosRes.success && productosRes.data) {
        // Formatear productos para react-select con info de stock
        const productosFormateados = productosRes.data.map((producto) => ({
          value: producto.id,
          label: `${producto.nombre} - S/ ${producto.precio.toFixed(2)} (Stock: ${producto.stock})`,
          data: producto,
        }));
        console.log('✅ Productos formateados para Select:', productosFormateados);
        setProductos(productosFormateados);
      } else {
        console.log('❌ No se obtuvieron productos o hubo error');
        setProductos([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      toast.error('Error al cargar datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Si se selecciona un cliente existente, autocompletar sus datos
    if (field === 'clienteSeleccionado' && value) {
      setFormData({
        ...formData,
        clienteSeleccionado: value,
        clienteNombre: value.data.nombre_completo,
        clienteTelefono: value.data.telefono || '',
        clienteDireccion: value.data.direccion || '',
        clienteEmail: value.data.email || '',
      });
      setCrearNuevoCliente(false);
    }
  };

  const handleAgregarProducto = (productoSeleccionado) => {
    if (!productoSeleccionado) return;

    const producto = productoSeleccionado.data;
    const yaExiste = formData.productosSeleccionados.find(
      (p) => p.producto_id === producto.id
    );

    if (yaExiste) {
      toast.error('Este producto ya está en el pedido');
      return;
    }

    const nuevoProducto = {
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      cantidad: 1,
      precio_unitario: producto.precio,
      subtotal: producto.precio,
      talla: producto.tallas && producto.tallas.length > 0 ? producto.tallas[0] : '',
      color: producto.colores && producto.colores.length > 0 ? producto.colores[0] : '',
      stock_disponible: producto.stock,
    };

    setFormData({
      ...formData,
      productosSeleccionados: [...formData.productosSeleccionados, nuevoProducto],
    });
  };

  const handleActualizarProducto = (index, campo, valor) => {
    const nuevosProductos = [...formData.productosSeleccionados];
    nuevosProductos[index][campo] = valor;

    // Validar cantidad vs stock
    if (campo === 'cantidad') {
      const cantidad = parseInt(valor) || 0;
      const stockDisponible = nuevosProductos[index].stock_disponible;

      if (cantidad > stockDisponible) {
        toast.error(`Stock insuficiente. Disponible: ${stockDisponible}`);
        nuevosProductos[index][campo] = stockDisponible;
      }
    }

    // Recalcular subtotal
    nuevosProductos[index].subtotal =
      nuevosProductos[index].cantidad * nuevosProductos[index].precio_unitario;

    setFormData({ ...formData, productosSeleccionados: nuevosProductos });
  };

  const handleEliminarProducto = (index) => {
    const nuevosProductos = formData.productosSeleccionados.filter((_, i) => i !== index);
    setFormData({ ...formData, productosSeleccionados: nuevosProductos });
  };

  const calcularTotales = () => {
    const subtotal = formData.productosSeleccionados.reduce(
      (sum, p) => sum + p.subtotal,
      0
    );
    const descuento = parseFloat(formData.descuento) || 0;
    const total = subtotal - descuento;
    const anticipo = parseFloat(formData.anticipo) || 0;
    const saldo = total - anticipo;

    return { subtotal, descuento, total, anticipo, saldo };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones paso 1
    if (!formData.clienteNombre.trim()) {
      toast.error('El nombre del cliente es obligatorio', {
        icon: '👤',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }
    if (!formData.clienteTelefono.trim()) {
      toast.error('El teléfono es obligatorio', {
        icon: '📱',
        style: { borderRadius: '12px', background: '#333', color: '#fff' },
      });
      return;
    }

    // Validaciones paso 2
    if (formData.productosSeleccionados.length === 0) {
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

    // Confirmación antes de crear el pedido
    const confirmado = await confirmarGuardar(`Nuevo Pedido para "${formData.clienteNombre}"`);
    if (!confirmado) return;

    setLoading(true);

    try {
      let clienteId = formData.clienteSeleccionado?.value;

      // Si no hay cliente seleccionado o se marcó crear nuevo, crear cliente
      if (!clienteId || crearNuevoCliente) {
        const nuevoClienteRes = await crearCliente({
          nombre_completo: formData.clienteNombre,
          telefono: formData.clienteTelefono,
          direccion: formData.clienteDireccion,
          email: formData.clienteEmail,
        });

        if (!nuevoClienteRes.success) {
          toast.error('Error al crear el cliente');
          setLoading(false);
          return;
        }

        clienteId = nuevoClienteRes.data.id;
        
        // Notificar que se creó un cliente
        window.dispatchEvent(new Event('clientesActualizados'));
      }

      // Calcular totales
      const { subtotal, descuento, total, anticipo, saldo } = calcularTotales();

      // Preparar datos del pedido
      const pedidoData = {
        cliente_id: clienteId,
        cliente_nombre: formData.clienteNombre,
        cliente_telefono: formData.clienteTelefono,
        cliente_direccion: formData.clienteDireccion,
        cliente_email: formData.clienteEmail,
        estado: 'Pendiente',
        prioridad: formData.prioridad.value,
        fecha_entrega: formData.fechaEntrega,
        subtotal,
        descuento,
        total,
        metodo_pago: formData.metodoPago?.value || null,
        anticipo,
        saldo,
        notas: formData.notas,
      };

      // Preparar detalles del pedido
      const detalles = formData.productosSeleccionados.map((p) => ({
        producto_id: p.producto_id,
        producto_nombre: p.producto_nombre,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario,
        subtotal: p.subtotal,
        talla: p.talla,
        color: p.color,
      }));

      // Crear pedido
      const resultado = await crearPedido(pedidoData, detalles);

      if (resultado.success) {
        await mostrarExito(
          '¡Pedido creado exitosamente!',
          `Pedido registrado con éxito en el sistema`
        );
        
        // Notificar al Sidebar para actualizar el badge
        window.dispatchEvent(new Event('pedidosActualizados'));
        
        if (onSubmit) {
          onSubmit(resultado.data);
        }
        
        handleClose();
      } else {
        toast.error(`Error al crear el pedido: ${resultado.error}`);
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast.error('Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      clienteSeleccionado: null,
      clienteNombre: '',
      clienteTelefono: '',
      clienteDireccion: '',
      clienteEmail: '',
      productosSeleccionados: [],
      prioridad: null,
      fechaEntrega: '',
      notas: '',
      metodoPago: null,
      anticipo: 0,
      descuento: 0,
    });
    setStep(1);
    setCrearNuevoCliente(false);
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
      overlayClassName="fixed inset-0 bg-black dark:bg-gray-950 bg-opacity-60 dark:bg-opacity-80 backdrop-blur-sm z-40"
      closeTimeoutMS={300}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
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
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Información del Cliente</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Datos de contacto y ubicación</p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <FaUser className="text-[#8f5cff]" />
                    Seleccionar cliente existente
                  </label>
                  <Select
                    options={clientes}
                    value={formData.clienteSeleccionado}
                    onChange={(value) => handleChange('clienteSeleccionado', value)}
                    placeholder="Buscar cliente por nombre o teléfono..."
                    styles={customSelectStyles}
                    isClearable
                    isDisabled={crearNuevoCliente}
                    isLoading={loading}
                  />
                  <div className="mt-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={crearNuevoCliente}
                        onChange={(e) => {
                          setCrearNuevoCliente(e.target.checked);
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              clienteSeleccionado: null,
                              clienteNombre: '',
                              clienteTelefono: '',
                              clienteDireccion: '',
                              clienteEmail: '',
                            });
                          }
                        }}
                        className="w-4 h-4 text-[#8f5cff] rounded"
                      />
                      Crear nuevo cliente
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <FaUser className="text-[#8f5cff]" />
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={formData.clienteNombre}
                      onChange={(e) => handleChange('clienteNombre', e.target.value)}
                      placeholder="Nombre completo del cliente"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 group-hover:border-gray-300"
                      disabled={!crearNuevoCliente && formData.clienteSeleccionado}
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <FaPhone className="text-[#8f5cff]" />
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.clienteTelefono}
                      onChange={(e) => handleChange('clienteTelefono', e.target.value)}
                      placeholder="+51 999 999 999"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 group-hover:border-gray-300"
                      disabled={!crearNuevoCliente && formData.clienteSeleccionado}
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
                    value={formData.clienteDireccion}
                    onChange={(e) => handleChange('clienteDireccion', e.target.value)}
                    placeholder="Calle, número, distrito, ciudad"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 group-hover:border-gray-300"
                    disabled={!crearNuevoCliente && formData.clienteSeleccionado}
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={formData.clienteEmail}
                    onChange={(e) => handleChange('clienteEmail', e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 group-hover:border-gray-300"
                    disabled={!crearNuevoCliente && formData.clienteSeleccionado}
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
                    Agregar productos *
                  </label>
                  <Select
                    options={productos}
                    onChange={handleAgregarProducto}
                    placeholder="Buscar producto por nombre..."
                    styles={customSelectStyles}
                    isLoading={loading}
                    value={null}
                  />
                </div>

                {/* Lista de productos agregados */}
                {formData.productosSeleccionados.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Productos agregados:</h4>
                    {formData.productosSeleccionados.map((producto, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">{producto.producto_nombre}</p>
                            <p className="text-sm text-gray-500">Stock disponible: {producto.stock_disponible}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEliminarProducto(index)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-gray-600">Cantidad</label>
                            <input
                              type="number"
                              min="1"
                              max={producto.stock_disponible}
                              value={producto.cantidad}
                              onChange={(e) =>
                                handleActualizarProducto(index, 'cantidad', parseInt(e.target.value) || 1)
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8f5cff]"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Precio Unit.</label>
                            <input
                              type="number"
                              step="0.01"
                              value={producto.precio_unitario}
                              onChange={(e) =>
                                handleActualizarProducto(index, 'precio_unitario', parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8f5cff]"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Talla</label>
                            <input
                              type="text"
                              value={producto.talla}
                              onChange={(e) =>
                                handleActualizarProducto(index, 'talla', e.target.value)
                              }
                              placeholder="S, M, L..."
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8f5cff]"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Color</label>
                            <input
                              type="text"
                              value={producto.color}
                              onChange={(e) =>
                                handleActualizarProducto(index, 'color', e.target.value)
                              }
                              placeholder="Rojo, Azul..."
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8f5cff]"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <p className="text-lg font-bold text-[#8f5cff]">
                            Subtotal: S/ {producto.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
                      min={new Date().toISOString().split('T')[0]}
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

                {/* Resumen de totales */}
                <div className="bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white p-6 rounded-2xl shadow-lg">
                  <h4 className="text-lg font-semibold mb-4">Resumen del pedido</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold">S/ {calcularTotales().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Descuento:</span>
                      <span className="font-bold">- S/ {calcularTotales().descuento.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-white border-opacity-30 pt-2 flex justify-between text-xl">
                      <span>Total:</span>
                      <span className="font-bold">S/ {calcularTotales().total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Anticipo:</span>
                      <span className="font-bold">- S/ {calcularTotales().anticipo.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-white border-opacity-30 pt-2 flex justify-between text-xl">
                      <span>Saldo:</span>
                      <span className="font-bold">S/ {calcularTotales().saldo.toFixed(2)}</span>
                    </div>
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
                      isClearable
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <FaDollarSign className="text-[#8f5cff]" />
                      Descuento (S/)
                    </label>
                    <input
                      type="number"
                      value={formData.descuento}
                      onChange={(e) => handleChange('descuento', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 group-hover:border-gray-300"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaDollarSign className="text-[#8f5cff]" />
                    Anticipo (S/)
                  </label>
                  <input
                    type="number"
                    value={formData.anticipo}
                    onChange={(e) => handleChange('anticipo', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    max={calcularTotales().total}
                    step="0.01"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8f5cff] focus:ring-opacity-20 focus:border-[#8f5cff] transition-all duration-200 group-hover:border-gray-300"
                  />
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
                  disabled={loading}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <FaShoppingCart />
                        Crear Pedido
                      </>
                    )}
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
