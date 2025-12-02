import { supabase } from '../supabaseClient';

/**
 * Obtiene las notificaciones del sistema
 */
export async function obtenerNotificaciones(usuarioId = null) {
  try {
    let query = supabase
      .from('notificaciones')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }

    const { data: notificaciones, error } = await query;

    if (error) throw error;

    // Mapear notificaciones al formato esperado por el frontend
    const notificacionesMapeadas = notificaciones?.map(n => ({
      id: n.id,
      type: n.tipo, // 'order', 'alert', 'success', 'info', 'warning'
      title: n.titulo,
      message: n.mensaje,
      time: calcularTiempoTranscurrido(n.created_at),
      unread: !n.leida,
      url: n.url
    })) || [];

    return {
      success: true,
      data: notificacionesMapeadas,
      unreadCount: notificacionesMapeadas.filter(n => n.unread).length
    };
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marca una notificación como leída
 */
export async function marcarComoLeida(notificacionId) {
  try {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', notificacionId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marca todas las notificaciones como leídas
 */
export async function marcarTodasComoLeidas(usuarioId = null) {
  try {
    let query = supabase
      .from('notificaciones')
      .update({ leida: true });

    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }

    const { error } = await query.eq('leida', false);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error al marcar todas las notificaciones:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crea una nueva notificación
 */
export async function crearNotificacion(notificacion) {
  try {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert([{
        usuario_id: notificacion.usuarioId || null,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        url: notificacion.url || null
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Genera notificaciones automáticas basadas en el estado del sistema
 */
export async function generarNotificacionesAutomaticas() {
  try {
    const notificaciones = [];

    // 1. Productos con stock bajo
    const { data: productosStockBajo } = await supabase
      .from('productos')
      .select('nombre, stock, stock_minimo')
      .eq('estado', 'bajo_stock')
      .limit(5);

    if (productosStockBajo && productosStockBajo.length > 0) {
      for (const producto of productosStockBajo) {
        notificaciones.push({
          tipo: 'alert',
          titulo: 'Stock bajo',
          mensaje: `${producto.nombre}: ${producto.stock} unidades (mínimo: ${producto.stock_minimo})`
        });
      }
    }

    // 2. Pedidos pendientes
    const { data: pedidosPendientes } = await supabase
      .from('pedidos')
      .select('numero_pedido, cliente_nombre')
      .in('estado', ['Pendiente', 'En Proceso'])
      .order('created_at', { ascending: false })
      .limit(3);

    if (pedidosPendientes && pedidosPendientes.length > 0) {
      for (const pedido of pedidosPendientes) {
        notificaciones.push({
          tipo: 'info',
          titulo: `Pedido ${pedido.numero_pedido}`,
          mensaje: `Cliente: ${pedido.cliente_nombre}`
        });
      }
    }

    // 3. Pedidos completados hoy
    const hoy = new Date().toISOString().split('T')[0];
    const { count: pedidosCompletadosHoy } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['Completado', 'Entregado'])
      .gte('fecha_completado', hoy);

    if (pedidosCompletadosHoy > 0) {
      notificaciones.push({
        tipo: 'success',
        titulo: 'Pedidos completados',
        mensaje: `${pedidosCompletadosHoy} pedido${pedidosCompletadosHoy > 1 ? 's' : ''} completado${pedidosCompletadosHoy > 1 ? 's' : ''} hoy`
      });
    }

    return {
      success: true,
      data: notificaciones
    };
  } catch (error) {
    console.error('Error al generar notificaciones automáticas:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Calcula el tiempo transcurrido desde una fecha
 */
function calcularTiempoTranscurrido(fecha) {
  const ahora = new Date();
  const entonces = new Date(fecha);
  const diff = Math.floor((ahora - entonces) / 1000); // diferencia en segundos

  if (diff < 60) return 'Ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) > 1 ? 's' : ''}`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} día${Math.floor(diff / 86400) > 1 ? 's' : ''}`;
  return `${Math.floor(diff / 604800)} semana${Math.floor(diff / 604800) > 1 ? 's' : ''}`;
}
