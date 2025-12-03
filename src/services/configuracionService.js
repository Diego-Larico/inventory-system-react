import { supabase } from '../supabaseClient';

// Obtener todas las configuraciones
export async function obtenerConfiguraciones() {
  try {
    console.log('📥 Obteniendo configuraciones...');
    
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .order('clave', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener configuraciones:', error);
      throw error;
    }

    console.log('✅ Configuraciones obtenidas:', data);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('❌ Error en obtenerConfiguraciones:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Obtener una configuración por clave
export async function obtenerConfiguracionPorClave(clave) {
  try {
    console.log('📥 Obteniendo configuración:', clave);
    
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .eq('clave', clave)
      .single();

    if (error) {
      console.error('❌ Error al obtener configuración:', error);
      throw error;
    }

    console.log('✅ Configuración obtenida:', data);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('❌ Error en obtenerConfiguracionPorClave:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Actualizar una configuración
export async function actualizarConfiguracion(id, valor) {
  try {
    console.log('📝 Actualizando configuración:', id, valor);
    
    const { data, error } = await supabase
      .from('configuracion')
      .update({ 
        valor: valor,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar configuración:', error);
      throw error;
    }

    console.log('✅ Configuración actualizada:', data);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('❌ Error en actualizarConfiguracion:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Crear una nueva configuración
export async function crearConfiguracion(configData) {
  try {
    console.log('📝 Creando configuración:', configData);
    
    const { data, error } = await supabase
      .from('configuracion')
      .insert([configData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear configuración:', error);
      throw error;
    }

    console.log('✅ Configuración creada:', data);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('❌ Error en crearConfiguracion:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
