import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCog, 
  FaBuilding, 
  FaDollarSign, 
  FaPercentage, 
  FaBell, 
  FaCalendar,
  FaCode,
  FaSave,
  FaUndo,
  FaSpinner,
  FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { obtenerConfiguraciones, actualizarConfiguracion } from './services/configuracionService';

function ConfiguracionView() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  useEffect(() => {
    // Detectar si hay cambios
    const changed = Object.keys(editedValues).length > 0;
    setHasChanges(changed);
  }, [editedValues]);

  async function cargarConfiguraciones() {
    setLoading(true);
    const resultado = await obtenerConfiguraciones();
    if (resultado.success) {
      setConfigs(resultado.data);
    } else {
      toast.error('Error al cargar configuraciones');
    }
    setLoading(false);
  }

  function handleChange(id, valor) {
    setEditedValues(prev => ({
      ...prev,
      [id]: valor
    }));
  }

  async function handleSave() {
    setSaving(true);
    let errores = 0;

    for (const [id, valor] of Object.entries(editedValues)) {
      const resultado = await actualizarConfiguracion(id, valor);
      if (!resultado.success) {
        errores++;
      }
    }

    if (errores === 0) {
      toast.success('✅ Configuraciones guardadas exitosamente', {
        icon: '💾',
        style: { 
          borderRadius: '12px', 
          background: '#10b981', 
          color: '#fff',
          fontWeight: 'bold'
        },
      });
      setEditedValues({});
      await cargarConfiguraciones();
    } else {
      toast.error(`❌ Error al guardar ${errores} configuración(es)`, {
        icon: '⚠️',
        style: { 
          borderRadius: '12px', 
          background: '#ef4444', 
          color: '#fff',
          fontWeight: 'bold'
        },
      });
    }

    setSaving(false);
  }

  function handleReset() {
    setEditedValues({});
    toast.info('Cambios descartados', {
      icon: '↩️',
      style: { borderRadius: '12px' },
    });
  }

  function getIcon(clave) {
    switch(clave) {
      case 'nombre_empresa': return <FaBuilding />;
      case 'moneda': return <FaDollarSign />;
      case 'impuesto_porcentaje': return <FaPercentage />;
      case 'dias_alerta_stock': return <FaCalendar />;
      case 'email_notificaciones': return <FaBell />;
      case 'generar_codigo_automatico': return <FaCode />;
      default: return <FaCog />;
    }
  }

  function getColor(clave) {
    switch(clave) {
      case 'nombre_empresa': return 'from-purple-500 to-purple-600';
      case 'moneda': return 'from-green-500 to-green-600';
      case 'impuesto_porcentaje': return 'from-blue-500 to-blue-600';
      case 'dias_alerta_stock': return 'from-orange-500 to-orange-600';
      case 'email_notificaciones': return 'from-pink-500 to-pink-600';
      case 'generar_codigo_automatico': return 'from-indigo-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  }

  function getCurrentValue(config) {
    return editedValues[config.id] !== undefined 
      ? editedValues[config.id] 
      : config.valor;
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <FaSpinner className="text-6xl text-[#8f5cff] animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">Cargando configuraciones...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <FaCog className="text-3xl text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] bg-clip-text text-transparent">
                Configuración
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Personaliza tu sistema de inventario
              </p>
            </div>
          </div>
        </motion.div>

        {/* Botones de Acción */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 flex gap-3 justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-lg disabled:opacity-50"
              >
                <FaUndo />
                Descartar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white rounded-xl font-bold hover:shadow-2xl transition-all shadow-lg disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Guardar Cambios
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de Configuraciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configs.map((config, index) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 hover:border-[#8f5cff] transition-all duration-300"
            >
              <div className={`bg-gradient-to-r ${getColor(config.clave)} p-4 flex items-center gap-3`}>
                <div className="text-white text-2xl">
                  {getIcon(config.clave)}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">
                    {config.clave.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </h3>
                  <p className="text-white text-xs opacity-90">
                    {config.descripcion}
                  </p>
                </div>
                {editedValues[config.id] !== undefined && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-white text-green-500 rounded-full p-2"
                  >
                    <FaCheckCircle />
                  </motion.div>
                )}
              </div>

              <div className="p-6">
                {config.tipo === 'booleano' ? (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={getCurrentValue(config) === 'true'}
                        onChange={(e) => handleChange(config.id, e.target.checked ? 'true' : 'false')}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-[#8f5cff]"></div>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">
                      {getCurrentValue(config) === 'true' ? 'Activado' : 'Desactivado'}
                    </span>
                  </label>
                ) : config.tipo === 'numero' ? (
                  <input
                    type="number"
                    value={getCurrentValue(config)}
                    onChange={(e) => handleChange(config.id, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-[#8f5cff] focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold text-lg"
                  />
                ) : (
                  <input
                    type="text"
                    value={getCurrentValue(config)}
                    onChange={(e) => handleChange(config.id, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-[#8f5cff] focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold"
                    placeholder={`Ingresa ${config.clave.split('_').join(' ')}`}
                  />
                )}

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-mono">
                    ID: {config.id}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Tipo: <span className="font-bold text-[#8f5cff]">{config.tipo}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-xl text-white"
        >
          <div className="flex items-start gap-4">
            <FaBell className="text-3xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-2">💡 Información Importante</h3>
              <ul className="space-y-1 text-sm opacity-90">
                <li>• Los cambios se guardan inmediatamente en la base de datos</li>
                <li>• El símbolo de moneda afectará a todos los precios del sistema</li>
                <li>• Los códigos automáticos se generan según el formato: PROD001, MAT001, etc.</li>
                <li>• Las alertas de stock se activarán según los días configurados</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ConfiguracionView;
