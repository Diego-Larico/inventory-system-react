import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQuestionCircle,
  FaBook,
  FaVideo,
  FaHeadset,
  FaEnvelope,
  FaWhatsapp,
  FaChevronDown,
  FaChevronUp,
  FaRocket,
  FaLightbulb,
  FaSearch,
  FaExternalLinkAlt,
  FaPhone,
  FaGlobe
} from 'react-icons/fa';
import toast from 'react-hot-toast';

function AyudaView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      pregunta: '¿Cómo agregar un nuevo producto?',
      respuesta: 'Ve a la sección de Productos y haz clic en el botón "➕ Nuevo Producto". Completa el formulario con la información requerida como nombre, categoría, precio, stock, tallas y colores. El código se genera automáticamente.',
      categoria: 'Productos',
      icon: '📦'
    },
    {
      id: 2,
      pregunta: '¿Cómo crear un pedido?',
      respuesta: 'Accede a Pedidos y presiona "➕ Nuevo Pedido". Sigue los 3 pasos: 1) Información del cliente, 2) Selección de productos y detalles, 3) Método de pago y confirmación. El sistema calculará automáticamente los totales.',
      categoria: 'Pedidos',
      icon: '🛒'
    },
    {
      id: 3,
      pregunta: '¿Qué significan los estados de pedidos?',
      respuesta: 'Pendiente: Nuevo pedido registrado. En Proceso: Pedido en producción. Completado: Pedido terminado y listo. Entregado: Pedido entregado al cliente. Cancelado: Pedido cancelado por cualquier motivo.',
      categoria: 'Pedidos',
      icon: '📊'
    },
    {
      id: 4,
      pregunta: '¿Cómo gestionar el inventario de materiales?',
      respuesta: 'En la sección Materiales puedes agregar, editar y eliminar materiales. Cada material tiene stock mínimo configurable. El sistema te alertará cuando el stock sea bajo con notificaciones visuales.',
      categoria: 'Materiales',
      icon: '🧵'
    },
    {
      id: 5,
      pregunta: '¿Cómo funcionan las notificaciones de stock bajo?',
      respuesta: 'El sistema compara automáticamente el stock actual con el stock mínimo configurado. Si el stock es igual o menor, verás alertas en el dashboard y en las vistas de materiales/productos con colores de advertencia.',
      categoria: 'Inventario',
      icon: '⚠️'
    },
    {
      id: 6,
      pregunta: '¿Puedo personalizar la configuración del sistema?',
      respuesta: 'Sí, accede a la sección Configuración donde puedes modificar el nombre de la empresa, símbolo de moneda, porcentaje de impuestos, días de alerta de stock, email de notificaciones y más opciones.',
      categoria: 'Configuración',
      icon: '⚙️'
    },
    {
      id: 7,
      pregunta: '¿Cómo generar reportes?',
      respuesta: 'Ve a la sección Reportes donde encontrarás estadísticas de ventas, productos más vendidos, inventario bajo stock, clientes frecuentes y gráficos de rendimiento del negocio.',
      categoria: 'Reportes',
      icon: '📈'
    },
    {
      id: 8,
      pregunta: '¿Qué son los códigos automáticos?',
      respuesta: 'El sistema genera códigos únicos automáticamente para productos (PROD001), materiales (MAT001), pedidos (PED001), etc. Esto garantiza organización y trazabilidad en todos los registros.',
      categoria: 'Sistema',
      icon: '🔢'
    }
  ];

  const tutoriales = [
    {
      id: 1,
      titulo: 'Primeros Pasos',
      descripcion: 'Configuración inicial y tour por la interfaz',
      duracion: '8 min',
      color: 'from-blue-500 to-blue-600',
      icon: '🚀'
    },
    {
      id: 2,
      titulo: 'Gestión de Productos',
      descripcion: 'Cómo crear y administrar productos',
      duracion: '12 min',
      color: 'from-purple-500 to-purple-600',
      icon: '📦'
    },
    {
      id: 3,
      titulo: 'Crear Pedidos',
      descripcion: 'Proceso completo de creación de pedidos',
      duracion: '15 min',
      color: 'from-green-500 to-green-600',
      icon: '🛒'
    },
    {
      id: 4,
      titulo: 'Inventario de Materiales',
      descripcion: 'Control de stock y alertas',
      duracion: '10 min',
      color: 'from-orange-500 to-orange-600',
      icon: '🧵'
    }
  ];

  const contactos = [
    {
      id: 1,
      titulo: 'Soporte Técnico',
      descripcion: 'Lunes a Viernes, 9am - 6pm',
      tipo: 'email',
      valor: 'soporte@inventario.com',
      icon: FaEnvelope,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      titulo: 'WhatsApp',
      descripcion: 'Respuesta en menos de 1 hora',
      tipo: 'whatsapp',
      valor: '+51 987 654 321',
      icon: FaWhatsapp,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      titulo: 'Teléfono',
      descripcion: 'Atención inmediata',
      tipo: 'phone',
      valor: '+51 (01) 234-5678',
      icon: FaPhone,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 4,
      titulo: 'Sitio Web',
      descripcion: 'Documentación completa online',
      tipo: 'web',
      valor: 'www.inventario.com',
      icon: FaGlobe,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.pregunta.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.respuesta.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleContactClick(contacto) {
    toast.success(`📞 Contactando vía ${contacto.titulo}`, {
      icon: '📞',
      style: { 
        borderRadius: '12px', 
        background: '#10b981', 
        color: '#fff',
        fontWeight: 'bold'
      },
    });
  }

  function handleTutorialClick(tutorial) {
    toast.info(`▶️ Cargando tutorial: ${tutorial.titulo}`, {
      icon: '🎥',
      style: { 
        borderRadius: '12px',
        fontWeight: 'bold'
      },
    });
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl"
            >
              <FaQuestionCircle className="text-4xl text-white" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Centro de Ayuda
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Estamos aquí para ayudarte con tu sistema de inventario
              </p>
            </div>
          </div>

          {/* Buscador */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en preguntas frecuentes..."
              className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg shadow-lg"
            />
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FaBook, label: 'Guías', value: '25+', color: 'from-blue-500 to-blue-600' },
            { icon: FaVideo, label: 'Tutoriales', value: '12', color: 'from-purple-500 to-purple-600' },
            { icon: FaLightbulb, label: 'FAQs', value: filteredFaqs.length, color: 'from-yellow-500 to-yellow-600' },
            { icon: FaHeadset, label: 'Soporte 24/7', value: 'Activo', color: 'from-green-500 to-green-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-xl text-white cursor-pointer`}
            >
              <stat.icon className="text-3xl mb-2 opacity-90" />
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-90">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tutoriales en Video */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaVideo className="text-3xl text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Tutoriales en Video
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutoriales.map((tutorial, index) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={() => handleTutorialClick(tutorial)}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden cursor-pointer border-2 border-gray-100 dark:border-gray-700 hover:border-purple-500 transition-all"
              >
                <div className={`bg-gradient-to-br ${tutorial.color} p-6 flex items-center justify-center`}>
                  <span className="text-6xl">{tutorial.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-2">
                    {tutorial.titulo}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {tutorial.descripcion}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-600 font-semibold flex items-center gap-2">
                      <FaVideo /> {tutorial.duracion}
                    </span>
                    <FaExternalLinkAlt className="text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Preguntas Frecuentes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaLightbulb className="text-3xl text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Preguntas Frecuentes
            </h2>
          </div>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 dark:border-gray-700"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <span className="text-3xl">{faq.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                        {faq.pregunta}
                      </h3>
                      <span className="text-sm text-purple-600 font-semibold">
                        {faq.categoria}
                      </span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {expandedFaq === faq.id ? (
                      <FaChevronUp className="text-purple-600 text-xl" />
                    ) : (
                      <FaChevronDown className="text-gray-400 text-xl" />
                    )}
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border-l-4 border-purple-500">
                          <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                            {faq.respuesta}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contacto y Soporte */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaHeadset className="text-3xl text-green-500" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Contacto y Soporte
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactos.map((contacto, index) => (
              <motion.div
                key={contacto.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={() => handleContactClick(contacto)}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 cursor-pointer border-2 border-gray-100 dark:border-gray-700 hover:border-green-500 transition-all"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${contacto.color} rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                  <contacto.icon className="text-3xl text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 text-center mb-2">
                  {contacto.titulo}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-3">
                  {contacto.descripcion}
                </p>
                <p className="text-purple-600 font-bold text-center">
                  {contacto.valor}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Banner de Inicio Rápido */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="text-8xl"
            >
              🚀
            </motion.div>
            <div className="flex-1">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                ¿Necesitas Ayuda Inmediata?
              </h2>
              <p className="text-white text-lg opacity-90 mb-6">
                Nuestro equipo de soporte está disponible 24/7 para resolver todas tus dudas y ayudarte a sacar el máximo provecho de tu sistema de inventario.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success('Iniciando chat con soporte...', { icon: '💬' })}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-3"
              >
                <FaHeadset className="text-2xl" />
                Iniciar Chat en Vivo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AyudaView;
