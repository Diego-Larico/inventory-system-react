/**
 * Sistema de notificaciones con colores personalizados usando react-toastify
 */
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Configuración de colores según el tipo de notificación
 */
const notificationConfig = {
  // Exportaciones
  excel: { bg: '#10b981', icon: 'fa-file-excel' }, // Verde
  pdf: { bg: '#ef4444', icon: 'fa-file-pdf' }, // Rojo
  print: { bg: '#6366f1', icon: 'fa-print' }, // Azul índigo
  
  // Estados de pedidos
  completado: { bg: '#10b981', icon: 'fa-check-circle' }, // Verde
  proceso: { bg: '#3b82f6', icon: 'fa-spinner fa-spin' }, // Azul
  pendiente: { bg: '#f59e0b', icon: 'fa-clock' }, // Naranja
  cancelado: { bg: '#ef4444', icon: 'fa-times-circle' }, // Rojo
  
  // Alertas de stock
  stockBajo: { bg: '#f59e0b', icon: 'fa-exclamation-triangle' }, // Naranja
  stockCritico: { bg: '#ef4444', icon: 'fa-exclamation-circle' }, // Rojo
  stockNormal: { bg: '#10b981', icon: 'fa-check-circle' }, // Verde
  
  // Operaciones CRUD
  creado: { bg: '#10b981', icon: 'fa-plus-circle' }, // Verde
  actualizado: { bg: '#3b82f6', icon: 'fa-edit' }, // Azul
  eliminado: { bg: '#ef4444', icon: 'fa-trash-alt' }, // Rojo
  
  // Información general
  info: { bg: '#3b82f6', icon: 'fa-info-circle' }, // Azul
  warning: { bg: '#f59e0b', icon: 'fa-exclamation-triangle' }, // Naranja
  error: { bg: '#ef4444', icon: 'fa-times-circle' }, // Rojo
  success: { bg: '#10b981', icon: 'fa-check-circle' }, // Verde
  
  // Notificaciones de dashboard
  nuevo_pedido: { bg: '#8f5cff', icon: 'fa-shopping-bag' }, // Púrpura
  nuevo_producto: { bg: '#6e7ff3', icon: 'fa-box' }, // Azul violeta
  nuevo_material: { bg: '#f59e42', icon: 'fa-cubes' }, // Naranja
  entrega_programada: { bg: '#3b82f6', icon: 'fa-truck' }, // Azul
};

/**
 * Muestra una notificación toast con react-toastify
 * @param {string} type - Tipo de notificación (excel, pdf, stockBajo, etc.)
 * @param {string} message - Mensaje de la notificación
 * @param {number} duration - Tiempo en ms antes de auto-cerrar (default: 3000)
 */
export function mostrarNotificacion(type, message, duration = 3000) {
  const config = notificationConfig[type] || notificationConfig.info;
  
  const options = {
    position: 'top-right',
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      background: config.bg,
      color: '#ffffff',
      borderRadius: '8px',
      padding: '12px 16px',
      minHeight: '50px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.7)',
    },
  };
  
  return toast(message, options);
}

/**
 * Muestra notificaciones de inicio (alertas del dashboard) como toasts
 * @param {Array} alertas - Array de alertas del dashboard
 */
export function mostrarNotificacionesInicio(alertas) {
  if (!alertas || alertas.length === 0) return;
  
  // Mostrar cada alerta como un toast individual con delay progresivo
  alertas.forEach((alerta, index) => {
    setTimeout(() => {
      let type = 'info';
      
      // Determinar el tipo según la criticidad
      if (alerta.tipo === 'critico' || alerta.color === 'red') {
        type = 'stockCritico';
      } else if (alerta.tipo === 'importante' || alerta.tipo === 'warning' || alerta.color === 'orange') {
        type = 'stockBajo';
      } else if (alerta.tipo === 'success' || alerta.color === 'green') {
        type = 'success';
      } else if (alerta.color === 'blue') {
        type = 'info';
      }
      
      // Usar el mensaje de la alerta directamente
      const mensaje = alerta.mensaje || alerta.titulo || 'Notificación del sistema';
      
      mostrarNotificacion(type, mensaje, 5000);
    }, index * 600); // Delay de 600ms entre cada notificación
  });
}

/**
 * Notificaciones específicas para exportaciones
 */
export const notificaciones = {
  // Exportaciones
  excelExportado: (nombre = 'Reporte') => 
    mostrarNotificacion('excel', `Excel exportado: ${nombre}`, 3000),
  
  pdfExportado: (nombre = 'Reporte') => 
    mostrarNotificacion('pdf', `PDF generado: ${nombre}`, 3000),
  
  documentoImpreso: () => 
    mostrarNotificacion('print', 'Documento listo para imprimir', 2500),
  
  // Estados de pedidos
  pedidoCompletado: (numero) => 
    mostrarNotificacion('completado', `Pedido #${numero} completado`, 3000),
  
  pedidoEnProceso: (numero) => 
    mostrarNotificacion('proceso', `Pedido #${numero} en proceso`, 3000),
  
  pedidoPendiente: (numero) => 
    mostrarNotificacion('pendiente', `Pedido #${numero} pendiente`, 3000),
  
  pedidoCancelado: (numero) => 
    mostrarNotificacion('cancelado', `Pedido #${numero} cancelado`, 3000),
  
  // Alertas de stock
  stockBajo: (producto, cantidad) => 
    mostrarNotificacion('stockBajo', `${producto}: ${cantidad} unidades`, 4000),
  
  stockCritico: (producto) => 
    mostrarNotificacion('stockCritico', `¡Stock crítico! ${producto}`, 5000),
  
  stockNormalizado: (producto) => 
    mostrarNotificacion('stockNormal', `${producto} reabastecido`, 3000),
  
  // Operaciones CRUD
  elementoCreado: (tipo, nombre) => 
    mostrarNotificacion('creado', `${tipo} creado: ${nombre}`, 3000),
  
  elementoActualizado: (tipo, nombre) => 
    mostrarNotificacion('actualizado', `${tipo} actualizado: ${nombre}`, 3000),
  
  elementoEliminado: (tipo, nombre) => 
    mostrarNotificacion('eliminado', `${tipo} eliminado: ${nombre}`, 3000),
  
  // Generales
  operacionExitosa: (mensaje) => 
    mostrarNotificacion('success', mensaje, 3000),
  
  error: (mensaje) => 
    mostrarNotificacion('error', mensaje, 4000),
  
  advertencia: (mensaje) => 
    mostrarNotificacion('warning', mensaje, 4000),
  
  informacion: (mensaje) => 
    mostrarNotificacion('info', mensaje, 3000),
  
  // Notificaciones específicas del dashboard
  nuevoPedido: (cliente) => 
    mostrarNotificacion('nuevo_pedido', `Nuevo pedido de ${cliente}`, 4000),
  
  nuevoProducto: (producto) => 
    mostrarNotificacion('nuevo_producto', `Producto agregado: ${producto}`, 3000),
  
  nuevoMaterial: (material) => 
    mostrarNotificacion('nuevo_material', `Material registrado: ${material}`, 3000),
  
  entregaProgramada: (fecha) => 
    mostrarNotificacion('entrega_programada', `Entrega: ${fecha}`, 4000),
};
