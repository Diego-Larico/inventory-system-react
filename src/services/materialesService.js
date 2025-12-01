import { supabase } from '../supabaseClient';

/**
 * Servicio para manejar materiales en Supabase
 */

// Obtener todos los materiales con sus categorías
export async function obtenerMateriales() {
  try {
    console.log('🔍 Consultando materiales desde Supabase...');
    
    const { data, error } = await supabase
      .from('materiales')
      .select(`
        *,
        categoria:categorias_materiales(id, nombre, icono, color)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error de Supabase al obtener materiales:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Materiales obtenidos:', data);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error al obtener materiales:', error);
    return { success: false, error: error.message };
  }
}

// Obtener un material por ID
export async function obtenerMaterialPorId(id) {
  try {
    console.log('🔍 Consultando material:', id);
    
    const { data, error } = await supabase
      .from('materiales')
      .select(`
        *,
        categoria:categorias_materiales(id, nombre, icono, color)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error al obtener material:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Material obtenido:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al obtener material:', error);
    return { success: false, error: error.message };
  }
}

// Crear un nuevo material
export async function crearMaterial(materialData) {
  try {
    console.log('📝 Creando material en Supabase...', materialData);

    // Generar código automático si no se proporciona
    if (!materialData.codigo) {
      const timestamp = Date.now().toString().slice(-6);
      materialData.codigo = `MAT-${timestamp}`;
    }

    const { data, error } = await supabase
      .from('materiales')
      .insert([materialData])
      .select(`
        *,
        categoria:categorias_materiales(id, nombre, icono, color)
      `)
      .single();

    if (error) {
      console.error('❌ Error al crear material:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Material creado:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al crear material:', error);
    return { success: false, error: error.message };
  }
}

// Actualizar un material
export async function actualizarMaterial(id, materialData) {
  try {
    console.log('📝 Actualizando material:', id, materialData);
    
    const { data, error } = await supabase
      .from('materiales')
      .update(materialData)
      .eq('id', id)
      .select(`
        *,
        categoria:categorias_materiales(id, nombre, icono, color)
      `)
      .single();

    if (error) {
      console.error('❌ Error al actualizar material:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Material actualizado:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al actualizar material:', error);
    return { success: false, error: error.message };
  }
}

// Eliminar un material
export async function eliminarMaterial(id) {
  try {
    console.log('🗑️ Eliminando material:', id);
    
    const { error } = await supabase
      .from('materiales')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar material:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Material eliminado exitosamente');
    return { success: true };
  } catch (error) {
    console.error('❌ Error al eliminar material:', error);
    return { success: false, error: error.message };
  }
}

// Obtener todas las categorías de materiales
export async function obtenerCategoriasMateriales() {
  try {
    console.log('🔍 Consultando categorías de materiales...');
    
    const { data, error } = await supabase
      .from('categorias_materiales')
      .select('*')
      .order('nombre');

    if (error) {
      console.error('❌ Error al obtener categorías:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Categorías obtenidas:', data);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    return { success: false, error: error.message };
  }
}

// Buscar materiales por nombre, código o proveedor
export async function buscarMateriales(termino) {
  try {
    console.log('🔍 Buscando materiales:', termino);
    
    const { data, error } = await supabase
      .from('materiales')
      .select(`
        *,
        categoria:categorias_materiales(id, nombre, icono, color)
      `)
      .or(`nombre.ilike.%${termino}%,codigo.ilike.%${termino}%,proveedor.ilike.%${termino}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al buscar materiales:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Materiales encontrados:', data);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error al buscar materiales:', error);
    return { success: false, error: error.message };
  }
}

// Obtener estadísticas de materiales
export async function obtenerEstadisticasMateriales() {
  try {
    console.log('📊 Obteniendo estadísticas de materiales...');
    
    const { data: materiales, error } = await supabase
      .from('materiales')
      .select('id, estado, cantidad, precio_unitario');

    if (error) throw error;

    // Calcular estadísticas
    const estadisticas = {
      totalMateriales: materiales.length,
      disponibles: materiales.filter(m => m.estado === 'disponible').length,
      bajoStock: materiales.filter(m => m.estado === 'bajo_stock').length,
      agotados: materiales.filter(m => m.estado === 'agotado').length,
      valorInventario: materiales.reduce((sum, m) => sum + (parseFloat(m.cantidad || 0) * parseFloat(m.precio_unitario || 0)), 0)
    };

    console.log('✅ Estadísticas calculadas:', estadisticas);
    return { success: true, data: estadisticas };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return {
      success: false,
      error: error.message,
      data: {
        totalMateriales: 0,
        disponibles: 0,
        bajoStock: 0,
        agotados: 0,
        valorInventario: 0
      }
    };
  }
}

// Ajustar cantidad de material (entrada o salida)
export async function ajustarCantidadMaterial(id, nuevaCantidad, motivo = '') {
  try {
    console.log('📝 Ajustando cantidad de material:', id, nuevaCantidad);
    
    const { data, error } = await supabase
      .from('materiales')
      .update({ cantidad: nuevaCantidad })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al ajustar cantidad:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Cantidad ajustada:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al ajustar cantidad:', error);
    return { success: false, error: error.message };
  }
}
