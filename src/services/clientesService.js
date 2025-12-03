import { supabase } from '../supabaseClient';

/**
 * Servicio para manejar clientes en Supabase
 */

// Obtener todos los clientes
export async function obtenerClientes() {
  try {
    console.log('🔍 Consultando clientes desde Supabase...');
    
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error de Supabase al obtener clientes:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Clientes obtenidos:', data);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error al obtener clientes:', error);
    return { success: false, error: error.message };
  }
}
