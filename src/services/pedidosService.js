import { supabase } from '../supabaseClient';

/**
 * Servicio para manejar pedidos en Supabase
 */

// Obtener todos los pedidos con detalles
export async function obtenerPedidos() {
  try {
    console.log('🔍 Consultando pedidos desde Supabase...');
    
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes(id, nombre_completo, telefono, email),
        detalles:detalles_pedido(
          id,
          producto_id,
          producto_nombre,
          cantidad,
          precio_unitario,
          subtotal,
          talla,
          color
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error de Supabase al obtener pedidos:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Pedidos obtenidos:', data);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error al obtener pedidos:', error);
    console.error('Detalle del error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return { success: false, error: error.message };
  }
}

// Obtener un pedido por ID
export async function obtenerPedidoPorId(id) {
  try {
    console.log('🔍 Consultando pedido por ID:', id);
    
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes(id, nombre_completo, telefono, email, direccion),
        detalles:detalles_pedido(
          id,
          producto_id,
          producto_nombre,
          cantidad,
          precio_unitario,
          subtotal,
          talla,
          color,
          notas
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error al obtener pedido:', error);
      throw error;
    }

    console.log('✅ Pedido obtenido:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al obtener pedido por ID:', error);
    throw error;
  }
}

// Obtener todos los clientes
export async function obtenerClientes() {
  try {
    console.log('🔍 Consultando clientes desde Supabase...');
    
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .order('nombre_completo', { ascending: true });

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

// Obtener productos disponibles para el pedido
export async function obtenerProductosDisponibles() {
  try {
    console.log('🔍 Consultando productos disponibles desde Supabase...');
    
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id,
        codigo,
        nombre,
        precio,
        stock,
        tallas,
        colores,
        categoria:categorias_productos(nombre, icono)
      `)
      .neq('estado', 'descontinuado')
      .gt('stock', 0)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('❌ Error de Supabase al obtener productos:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Productos disponibles obtenidos:', data);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Error al obtener productos disponibles:', error);
    return { success: false, error: error.message };
  }
}

// Crear un nuevo pedido con detalles
export async function crearPedido(pedidoData, detalles) {
  try {
    console.log('📝 Creando pedido en Supabase...');
    console.log('Datos del pedido:', pedidoData);
    console.log('Detalles del pedido:', detalles);

    // 1. Crear el pedido principal
    const { data: pedidoCreado, error: errorPedido } = await supabase
      .from('pedidos')
      .insert([pedidoData])
      .select()
      .single();

    if (errorPedido) {
      console.error('❌ Error al crear pedido:', errorPedido);
      throw errorPedido;
    }

    console.log('✅ Pedido creado:', pedidoCreado);

    // 2. Crear los detalles del pedido
    if (detalles && detalles.length > 0) {
      const detallesConPedidoId = detalles.map(detalle => ({
        ...detalle,
        pedido_id: pedidoCreado.id
      }));

      const { data: detallesCreados, error: errorDetalles } = await supabase
        .from('detalles_pedido')
        .insert(detallesConPedidoId)
        .select();

      if (errorDetalles) {
        console.error('❌ Error al crear detalles del pedido:', errorDetalles);
        // Intentar eliminar el pedido si falló la creación de detalles
        await supabase.from('pedidos').delete().eq('id', pedidoCreado.id);
        throw errorDetalles;
      }

      console.log('✅ Detalles del pedido creados:', detallesCreados);
    }

    // 3. Actualizar stock de productos
    for (const detalle of detalles) {
      if (detalle.producto_id) {
        // Obtener stock actual
        const { data: producto, error: errorProducto } = await supabase
          .from('productos')
          .select('stock')
          .eq('id', detalle.producto_id)
          .single();

        if (!errorProducto && producto) {
          const nuevoStock = producto.stock - detalle.cantidad;
          
          // Actualizar stock
          await supabase
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id', detalle.producto_id);

          console.log(`✅ Stock actualizado para producto ${detalle.producto_id}: ${producto.stock} → ${nuevoStock}`);
        }
      }
    }

    return {
      success: true,
      data: pedidoCreado
    };
  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al crear el pedido'
    };
  }
}

// Actualizar estado del pedido
export async function actualizarEstadoPedido(id, nuevoEstado) {
  try {
    console.log('📝 Actualizando estado del pedido:', id, '→', nuevoEstado);
    
    const updateData = { estado: nuevoEstado };
    
    // Si se marca como completado, registrar la fecha
    if (nuevoEstado === 'Completado' || nuevoEstado === 'Entregado') {
      updateData.fecha_completado = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar estado:', error);
      throw error;
    }

    console.log('✅ Estado actualizado:', data);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('❌ Error al actualizar estado del pedido:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Actualizar pedido completo
export async function actualizarPedido(id, pedidoData) {
  try {
    console.log('📝 Actualizando pedido:', id);
    
    const { data, error } = await supabase
      .from('pedidos')
      .update(pedidoData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar pedido:', error);
      throw error;
    }

    console.log('✅ Pedido actualizado:', data);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('❌ Error al actualizar pedido:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Eliminar pedido
export async function eliminarPedido(id) {
  try {
    console.log('🗑️ Eliminando pedido:', id);
    
    // Los detalles se eliminan automáticamente por CASCADE
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar pedido:', error);
      throw error;
    }

    console.log('✅ Pedido eliminado exitosamente');
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ Error al eliminar pedido:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Buscar pedidos
export async function buscarPedidos(termino) {
  try {
    console.log('🔍 Buscando pedidos:', termino);
    
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes(id, nombre_completo, telefono),
        detalles:detalles_pedido(count)
      `)
      .or(`numero_pedido.ilike.%${termino}%,cliente_nombre.ilike.%${termino}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al buscar pedidos:', error);
      throw error;
    }

    console.log('✅ Pedidos encontrados:', data);
    return data || [];
  } catch (error) {
    console.error('❌ Error al buscar pedidos:', error);
    throw error;
  }
}

// Obtener estadísticas de pedidos
export async function obtenerEstadisticasPedidos() {
  try {
    console.log('📊 Obteniendo estadísticas de pedidos...');
    
    // Total de pedidos
    const { count: totalPedidos } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true });

    // Pedidos pendientes
    const { count: pedidosPendientes } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['Pendiente', 'En Proceso']);

    // Pedidos completados
    const { count: pedidosCompletados } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['Completado', 'Entregado']);

    // Total de ventas del mes actual
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: ventasMes } = await supabase
      .from('pedidos')
      .select('total')
      .gte('fecha_pedido', inicioMes)
      .in('estado', ['Completado', 'Entregado']);

    const totalVentasMes = ventasMes?.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0) || 0;

    const estadisticas = {
      totalPedidos: totalPedidos || 0,
      pedidosPendientes: pedidosPendientes || 0,
      pedidosCompletados: pedidosCompletados || 0,
      ventasMes: totalVentasMes
    };

    console.log('✅ Estadísticas obtenidas:', estadisticas);
    return estadisticas;
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return {
      totalPedidos: 0,
      pedidosPendientes: 0,
      pedidosCompletados: 0,
      ventasMes: 0
    };
  }
}

// Crear un nuevo cliente
export async function crearCliente(clienteData) {
  try {
    console.log('📝 Creando cliente en Supabase...');
    
    const { data, error } = await supabase
      .from('clientes')
      .insert([clienteData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear cliente:', error);
      throw error;
    }

    console.log('✅ Cliente creado:', data);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('❌ Error al crear cliente:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
