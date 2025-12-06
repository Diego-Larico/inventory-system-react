import { supabase } from '../supabaseClient';

/**
 * Servicio para manejar productos en Supabase
 */

// Generar próximo código de producto (PROD001, PROD002, etc.)
export async function generarCodigoProducto() {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('codigo')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      return 'PROD001';
    }

    // Extraer el número del último código
    const ultimoCodigo = data[0].codigo;
    const numeroMatch = ultimoCodigo.match(/\d+$/);
    
    if (numeroMatch) {
      const ultimoNumero = parseInt(numeroMatch[0]);
      const nuevoNumero = ultimoNumero + 1;
      return `PROD${String(nuevoNumero).padStart(3, '0')}`;
    }

    return 'PROD001';
  } catch (error) {
    console.error('Error al generar código:', error);
    return 'PROD001';
  }
}

// Obtener todas las categorías de productos
export async function obtenerCategorias() {
  try {
    console.log('🔍 Consultando categorías desde Supabase...');
    
    const { data, error } = await supabase
      .from('categorias_productos')
      .select('id, nombre, descripcion, icono, color')
      .order('nombre');

    if (error) {
      console.error('❌ Error de Supabase al obtener categorías:', error);
      throw error;
    }
    
    console.log('✅ Categorías obtenidas:', data);
    return data || [];
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    console.error('Detalle del error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw error; // Re-lanzar el error para que el modal pueda manejarlo
  }
}

// Crear un nuevo producto
export async function crearProducto(productoData) {
  try {
    // Preparar los datos para insertar
    const datosProducto = {
      codigo: productoData.codigo,
      nombre: productoData.nombre,
      categoria_id: productoData.categoria_id,
      descripcion: productoData.descripcion || null,
      precio: parseFloat(productoData.precio),
      costo: productoData.costo ? parseFloat(productoData.costo) : 0,
      stock: parseInt(productoData.stock) || 0,
      stock_minimo: productoData.stock_minimo ? parseInt(productoData.stock_minimo) : 5,
      imagen_url: productoData.imagen_url || null,
      tallas: productoData.tallas || [],
      colores: productoData.colores || [],
      // created_by se puede agregar si tienes auth
    };

    const { data, error } = await supabase
      .from('productos')
      .insert([datosProducto])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al crear producto:', error);
    return { success: false, error: error.message };
  }
}

// Obtener todos los productos
export async function obtenerProductos() {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categoria:categorias_productos(nombre, icono, color)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
}

// Actualizar un producto
export async function actualizarProducto(id, productoData) {
  try {
    const datosActualizados = {
      nombre: productoData.nombre,
      categoria_id: productoData.categoria_id,
      descripcion: productoData.descripcion || null,
      precio: parseFloat(productoData.precio),
      costo: productoData.costo ? parseFloat(productoData.costo) : 0,
      stock: parseInt(productoData.stock) || 0,
      stock_minimo: productoData.stock_minimo ? parseInt(productoData.stock_minimo) : 5,
      imagen_url: productoData.imagen_url || null,
      tallas: productoData.tallas || [],
      colores: productoData.colores || [],
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('productos')
      .update(datosActualizados)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return { success: false, error: error.message };
  }
}

// Eliminar un producto
export async function eliminarProducto(id) {
  try {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return { success: false, error: error.message };
  }
}

// Obtener un producto por ID
export async function obtenerProductoPorId(id) {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categoria:categorias_productos(nombre, icono, color)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return null;
  }
}

// Buscar productos
export async function buscarProductos(termino) {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categoria:categorias_productos(nombre, icono, color)
      `)
      .or(`nombre.ilike.%${termino}%,codigo.ilike.%${termino}%`)
      .order('nombre');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al buscar productos:', error);
    return [];
  }
}

// Obtener categorías de productos
export async function obtenerCategoriasProductos() {
  try {
    const { data, error } = await supabase
      .from('categorias_productos')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error al obtener categorías de productos:', error);
    return { success: false, data: [], error: error.message };
  }
}

// Subir imagen a Supabase Storage (opcional)
export async function subirImagenProducto(file, productoId) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productoId}_${Date.now()}.${fileExt}`;
    const filePath = `productos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('imagenes')
      .upload(filePath, file);

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('imagenes')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return null;
  }
}
