import { supabase } from '../supabaseClient';

/**
 * Servicio para manejar tareas en Supabase
 */

// Obtener todas las tareas del usuario actual
export async function obtenerTareas(usuarioId = 'USR001') {
  try {
    console.log('🔍 Consultando tareas desde Supabase...');
    
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error de Supabase al obtener tareas:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Tareas obtenidas:', data);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error al obtener tareas:', error);
    return { success: false, error: error.message };
  }
}

// Crear nueva tarea
export async function crearTarea(tareaData, usuarioId = 'USR001') {
  try {
    console.log('📝 Creando nueva tarea:', tareaData);
    
    const { data, error } = await supabase
      .from('tareas')
      .insert([{
        ...tareaData,
        usuario_id: usuarioId,
        completada: false,
        orden: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear tarea:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Tarea creada:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al crear tarea:', error);
    return { success: false, error: error.message };
  }
}

// Actualizar tarea
export async function actualizarTarea(id, tareaData) {
  try {
    console.log('📝 Actualizando tarea:', id, tareaData);
    
    const { data, error } = await supabase
      .from('tareas')
      .update({
        ...tareaData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar tarea:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Tarea actualizada:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al actualizar tarea:', error);
    return { success: false, error: error.message };
  }
}

// Eliminar tarea
export async function eliminarTarea(id) {
  try {
    console.log('🗑️ Eliminando tarea:', id);
    
    const { error } = await supabase
      .from('tareas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar tarea:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Tarea eliminada');
    return { success: true };
  } catch (error) {
    console.error('❌ Error al eliminar tarea:', error);
    return { success: false, error: error.message };
  }
}

// Actualizar orden de tareas (para drag and drop)
export async function actualizarOrdenTareas(tareas) {
  try {
    console.log('🔄 Actualizando orden de tareas...');
    
    const updates = tareas.map((tarea, index) => ({
      id: tarea.id,
      orden: index
    }));

    const { error } = await supabase
      .from('tareas')
      .upsert(updates.map(update => ({
        id: update.id,
        orden: update.orden,
        updated_at: new Date().toISOString()
      })));

    if (error) {
      console.error('❌ Error al actualizar orden:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Orden actualizado');
    return { success: true };
  } catch (error) {
    console.error('❌ Error al actualizar orden:', error);
    return { success: false, error: error.message };
  }
}

// Toggle completada
export async function toggleTareaCompletada(id, completada) {
  return actualizarTarea(id, { completada });
}
