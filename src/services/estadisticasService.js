import { supabase } from '../supabaseClient';
import { obtenerProductos } from './productosService';
import { obtenerClientes } from './clientesService';

/**
 * Servicio para obtener estadísticas del dashboard
 */

export async function obtenerEstadisticasDashboard() {
  try {
    console.log('📊 Obteniendo estadísticas del dashboard...');

    // Obtener productos
    const productosData = await obtenerProductos();
    const productos = Array.isArray(productosData) ? productosData : [];
    const totalProductos = productos.length;

    // Obtener clientes
    const { data: clientes, error: errorClientes } = await supabase
      .from('clientes')
      .select('id')
      .eq('activo', true);

    if (errorClientes) {
      console.error('Error al obtener clientes:', errorClientes);
    }

    const totalClientes = clientes?.length || 0;

    // Calcular crecimiento (simulado - en producción vendría de histórico)
    const crecimiento = '+23%';

    // Calcular rendimiento basado en productos disponibles
    const productosDisponibles = productos.filter(p => p.estado === 'disponible').length;
    const rendimiento = totalProductos > 0 
      ? Math.round((productosDisponibles / totalProductos) * 100) 
      : 0;

    return {
      success: true,
      data: {
        clientes: totalClientes,
        productos: totalProductos,
        crecimiento: crecimiento,
        rendimiento: `${rendimiento}%`
      }
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return {
      success: false,
      error: error.message,
      data: {
        clientes: 0,
        productos: 0,
        crecimiento: '0%',
        rendimiento: '0%'
      }
    };
  }
}
