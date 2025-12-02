import Swal from 'sweetalert2';

// Estilos personalizados para que coincidan con el tema de la aplicación
const customStyles = {
  popup: 'rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-700',
  confirmButton: 'bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white font-bold py-3 px-10 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1',
  cancelButton: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-10 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105',
  denyButton: 'bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-10 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1',
  actions: 'gap-4 mt-6',
  title: 'text-gray-800 dark:text-gray-100 font-black text-2xl',
  htmlContainer: 'text-gray-600 dark:text-gray-400',
};

/**
 * Modal de confirmación para guardar cambios
 */
export const confirmarGuardar = async (tipo = 'cambios') => {
  const result = await Swal.fire({
    title: '<i class="fas fa-save" style="color: #8f5cff; margin-right: 12px;"></i>¿Guardar cambios?',
    html: `
      <div style="text-align: center; padding: 1.5rem 1rem;">
        <p style="color: #6b7280; margin-bottom: 1.5rem; font-size: 1rem; line-height: 1.6;">
          Los cambios se aplicarán de inmediato en el sistema.
        </p>
        <div style="background: linear-gradient(135deg, #8f5cff 0%, #6e7ff3 100%); padding: 1.5rem; border-radius: 16px; color: white; box-shadow: 0 10px 30px rgba(143, 92, 255, 0.3);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;"><i class="fas fa-check-circle"></i></div>
          <div style="font-size: 0.95rem; opacity: 0.9;">Se actualizará</div>
          <div style="font-size: 1.2rem; font-weight: bold; margin-top: 0.5rem;">${tipo}</div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-save"></i> Guardar cambios</span>',
    cancelButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-times"></i> Cancelar</span>',
    customClass: customStyles,
    buttonsStyling: false,
    reverseButtons: true,
    backdrop: 'rgba(0, 0, 0, 0.75)',
    allowOutsideClick: false,
    width: '500px',
  });

  return result.isConfirmed;
};

/**
 * Modal de confirmación para eliminar
 */
export const confirmarEliminar = async (nombre, tipo = 'elemento') => {
  const result = await Swal.fire({
    title: '<i class="fas fa-trash-alt" style="color: #ef4444; margin-right: 12px;"></i>¿Eliminar definitivamente?',
    html: `
      <div style="text-align: center; padding: 1.5rem 1rem;">
        <p style="color: #ef4444; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 600;">
          <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>Esta acción no se puede deshacer
        </p>
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 1.5rem; border-radius: 16px; color: white; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;"><i class="fas fa-trash"></i></div>
          <div style="font-size: 0.95rem; opacity: 0.9;">Se eliminará</div>
          <div style="font-size: 1.2rem; font-weight: bold; margin-top: 0.5rem; word-break: break-word;">${nombre}</div>
          <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">${tipo}</div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-trash-alt"></i> Sí, eliminar</span>',
    cancelButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-times"></i> Cancelar</span>',
    customClass: customStyles,
    buttonsStyling: false,
    reverseButtons: true,
    backdrop: 'rgba(0, 0, 0, 0.75)',
    allowOutsideClick: false,
    width: '500px',
  });

  return result.isConfirmed;
};

/**
 * Modal de confirmación para editar (NO SE USA - editar abre directamente el modal)
 * Mantenido por compatibilidad
 */
export const confirmarEditar = async (nombre, tipo = 'elemento') => {
  // Retorna true directamente - no muestra confirmación
  return true;
};

/**
 * Modal de éxito
 */
export const mostrarExito = async (mensaje, detalle = '') => {
  await Swal.fire({
    title: '<i class="fas fa-check-circle" style="color: #10b981; margin-right: 12px;"></i>¡Éxito!',
    html: `
      <div style="text-align: center; padding: 1.5rem 1rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem; animation: bounce 0.6s; color: #10b981;"><i class="fas fa-check-circle"></i></div>
        <p style="color: #10b981; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">
          ${mensaje}
        </p>
        ${detalle ? `<p style="color: #6b7280; font-size: 0.95rem; line-height: 1.6;">${detalle}</p>` : ''}
      </div>
      <style>
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      </style>
    `,
    confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-thumbs-up"></i> Entendido</span>',
    customClass: {
      ...customStyles,
      confirmButton: 'bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-10 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1',
    },
    buttonsStyling: false,
    timer: 3000,
    timerProgressBar: true,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    width: '500px',
  });
};

/**
 * Modal de error
 */
export const mostrarError = async (mensaje, detalle = '') => {
  await Swal.fire({
    title: '<i class="fas fa-times-circle" style="color: #ef4444; margin-right: 12px;"></i>Error',
    html: `
      <div style="text-align: center; padding: 1.5rem 1rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem; color: #ef4444;"><i class="fas fa-times-circle"></i></div>
        <p style="color: #ef4444; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">
          ${mensaje}
        </p>
        ${detalle ? `<p style="color: #6b7280; font-size: 0.95rem; line-height: 1.6; background: #f3f4f6; padding: 1rem; border-radius: 12px; margin-top: 1rem;">${detalle}</p>` : ''}
      </div>
    `,
    confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-thumbs-up"></i> Entendido</span>',
    customClass: {
      ...customStyles,
      confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-10 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1',
    },
    buttonsStyling: false,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    width: '500px',
  });
};

/**
 * Modal de confirmación con input personalizado
 */
export const confirmarConMensaje = async (titulo, placeholder = 'Escribe aquí...') => {
  const result = await Swal.fire({
    title: titulo,
    input: 'textarea',
    inputPlaceholder: placeholder,
    inputAttributes: {
      'aria-label': placeholder,
      style: 'border-radius: 12px; padding: 12px; border: 2px solid #e5e7eb;',
    },
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-check"></i> Confirmar',
    cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
    customClass: customStyles,
    buttonsStyling: false,
    reverseButtons: true,
    backdrop: 'rgba(0, 0, 0, 0.6)',
    inputValidator: (value) => {
      if (!value) {
        return 'Por favor escribe un mensaje';
      }
    },
  });

  if (result.isConfirmed) {
    return { confirmed: true, message: result.value };
  }
  return { confirmed: false, message: '' };
};

/**
 * Modal de confirmación para descartar cambios
 */
export const confirmarDescartarCambios = async () => {
  const result = await Swal.fire({
    title: '<i class="fas fa-exclamation-triangle" style="color: #f59e0b; margin-right: 12px;"></i>¿Descartar cambios?',
    html: `
      <div style="text-align: center; padding: 1.5rem 1rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem; color: #f59e0b;"><i class="fas fa-question-circle"></i></div>
        <p style="color: #6b7280; margin-bottom: 1.5rem; font-size: 1rem; line-height: 1.6;">
          Hay cambios sin guardar que se perderán.
        </p>
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 1.5rem; border-radius: 16px; color: white; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;"><i class="fas fa-exclamation-circle"></i></div>
          <div style="font-size: 1.1rem; font-weight: 600;">Los cambios no se guardarán</div>
        </div>
      </div>
    `,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-save"></i> Guardar y salir</span>',
    denyButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-trash-alt"></i> Descartar</span>',
    cancelButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-times"></i> Continuar editando</span>',
    customClass: customStyles,
    buttonsStyling: false,
    reverseButtons: true,
    backdrop: 'rgba(0, 0, 0, 0.75)',
    allowOutsideClick: false,
    width: '550px',
  });

  if (result.isConfirmed) {
    return 'save';
  } else if (result.isDenied) {
    return 'discard';
  }
  return 'cancel';
};
