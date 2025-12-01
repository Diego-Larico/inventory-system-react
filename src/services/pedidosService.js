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
    
    // Obtener todos los pedidos para calcular estadísticas detalladas
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('id, estado, total, fecha_pedido');

    if (error) throw error;

    // Total de ventas del mes actual
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const ventasMes = pedidos
      .filter(p => {
        const fechaPedido = new Date(p.fecha_pedido);
        return (p.estado === 'Completado' || p.estado === 'Entregado') &&
               fechaPedido >= inicioMes;
      })
      .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);

    const estadisticas = {
      totalPedidos: pedidos.length,
      pendientes: pedidos.filter(p => p.estado === 'Pendiente').length,
      enProceso: pedidos.filter(p => p.estado === 'En Proceso').length,
      completados: pedidos.filter(p => p.estado === 'Completado').length,
      cancelados: pedidos.filter(p => p.estado === 'Cancelado').length,
      entregados: pedidos.filter(p => p.estado === 'Entregado').length,
      ventasMes: ventasMes
    };

    console.log('✅ Estadísticas obtenidas:', estadisticas);
    return {
      success: true,
      data: estadisticas
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return {
      success: false,
      error: error.message,
      data: {
        totalPedidos: 0,
        pendientes: 0,
        enProceso: 0,
        completados: 0,
        cancelados: 0,
        entregados: 0,
        ventasMes: 0
      }
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

// Obtener pedidos por semana (últimos 7 días)
export async function obtenerPedidosPorSemana() {
  try {
    console.log('📊 Obteniendo pedidos por semana...');
    
    const hoy = new Date();
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hoy.getDate() - 6); // Últimos 7 días incluyendo hoy

    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('id, fecha_pedido')
      .gte('fecha_pedido', hace7Dias.toISOString())
      .lte('fecha_pedido', hoy.toISOString());

    if (error) throw error;

    // Inicializar contadores para cada día
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dataPorDia = [];

    // Generar datos para cada uno de los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      const diaSemana = diasSemana[fecha.getDay()];
      
      const pedidosDelDia = pedidos.filter(p => {
        const fechaPedido = new Date(p.fecha_pedido);
        return fechaPedido.toDateString() === fecha.toDateString();
      }).length;

      dataPorDia.push({
        dia: diaSemana,
        pedidos: pedidosDelDia
      });
    }

    console.log('✅ Pedidos por semana:', dataPorDia);
    return {
      success: true,
      data: dataPorDia
    };
  } catch (error) {
    console.error('❌ Error al obtener pedidos por semana:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Obtener ingresos mensuales (últimos 5 meses)
export async function obtenerIngresosMensuales() {
  try {
    console.log('📊 Obteniendo ingresos mensuales...');
    
    const hoy = new Date();
    const hace5Meses = new Date(hoy);
    hace5Meses.setMonth(hoy.getMonth() - 4); // Últimos 5 meses incluyendo el actual

    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('total, fecha_pedido, estado')
      .gte('fecha_pedido', hace5Meses.toISOString())
      .in('estado', ['Completado', 'Entregado']);

    if (error) throw error;

    // Nombres de meses en español (abreviados)
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const ingresosPorMes = [];

    // Generar datos para cada uno de los últimos 5 meses
    for (let i = 4; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setMonth(hoy.getMonth() - i);
      const mes = nombresMeses[fecha.getMonth()];
      
      const ingresosDelMes = pedidos
        .filter(p => {
          const fechaPedido = new Date(p.fecha_pedido);
          return fechaPedido.getMonth() === fecha.getMonth() &&
                 fechaPedido.getFullYear() === fecha.getFullYear();
        })
        .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

      ingresosPorMes.push({
        mes: mes,
        ingresos: parseFloat(ingresosDelMes.toFixed(2))
      });
    }

    console.log('✅ Ingresos mensuales:', ingresosPorMes);
    return {
      success: true,
      data: ingresosPorMes
    };
  } catch (error) {
    console.error('❌ Error al obtener ingresos mensuales:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
