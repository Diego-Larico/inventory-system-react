import { supabase } from '../supabaseClient';

/**
 * Obtiene las estadísticas principales del dashboard
 */
export async function obtenerEstadisticasPrincipales() {
  try {
    // Obtener totales en paralelo
    const [
      { count: totalProductos },
      { count: totalMateriales },
      { count: totalClientes },
      { data: pedidos },
      { data: pedidosHoy },
      { data: ventasMes }
    ] = await Promise.all([
      // Total productos activos
      supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .neq('estado', 'descontinuado'),
      
      // Total materiales
      supabase
        .from('materiales')
        .select('*', { count: 'exact', head: true }),
      
      // Total clientes activos
      supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true),
      
      // Pedidos activos (Pendiente, En Proceso)
      supabase
        .from('pedidos')
        .select('id, total, estado')
        .in('estado', ['Pendiente', 'En Proceso']),
      
      // Pedidos de hoy
      supabase
        .from('pedidos')
        .select('id')
        .gte('fecha_pedido', new Date().toISOString().split('T')[0]),
      
      // Ventas del mes
      supabase
        .from('pedidos')
        .select('total')
        .in('estado', ['Completado', 'Entregado'])
        .gte('fecha_pedido', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ]);

    // Calcular totales
    const pedidosActivos = pedidos?.length || 0;
    const ventasTotales = ventasMes?.reduce((sum, p) => sum + parseFloat(p.total || 0), 0) || 0;

    // Obtener stock total de productos
    const { data: productosStock } = await supabase
      .from('productos')
      .select('stock')
      .neq('estado', 'descontinuado');

    const stockTotal = productosStock?.reduce((sum, p) => sum + parseInt(p.stock || 0), 0) || 0;

    return {
      success: true,
      data: {
        ventasTotales: Math.round(ventasTotales),
        pedidosActivos,
        totalProductos: totalProductos || 0,
        stockTotal,
        totalMateriales: totalMateriales || 0,
        totalClientes: totalClientes || 0,
        pedidosHoy: pedidosHoy?.length || 0,
        cambioVentas: '+12.5%', // Calcularemos esto más adelante
        cambioPedidos: '+8.3%',
        cambioProductos: '+15.2%',
        cambioStock: '-3.1%'
      }
    };
  } catch (error) {
    console.error('Error al obtener estadísticas principales:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene las ventas mensuales de los últimos 6 meses
 */
export async function obtenerVentasMensuales() {
  try {
    const hoy = new Date();
    const hace6Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 6, 1);

    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('fecha_pedido, total')
      .in('estado', ['Completado', 'Entregado'])
      .gte('fecha_pedido', hace6Meses.toISOString());

    if (error) throw error;

    // Agrupar por mes
    const mesesMap = {};
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      mesesMap[clave] = {
        mes: nombresMeses[fecha.getMonth()],
        ventas: 0,
        pedidos: 0,
        productos: 0
      };
    }

    // Sumar ventas por mes
    pedidos?.forEach(pedido => {
      const fecha = new Date(pedido.fecha_pedido);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (mesesMap[clave]) {
        mesesMap[clave].ventas += parseFloat(pedido.total || 0);
        mesesMap[clave].pedidos += 1;
      }
    });

    // Obtener productos vendidos por mes (detalles_pedido)
    const { data: detalles } = await supabase
      .from('detalles_pedido')
      .select(`
        cantidad,
        pedidos!inner(fecha_pedido, estado)
      `)
      .in('pedidos.estado', ['Completado', 'Entregado'])
      .gte('pedidos.fecha_pedido', hace6Meses.toISOString());

    detalles?.forEach(detalle => {
      const fecha = new Date(detalle.pedidos.fecha_pedido);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (mesesMap[clave]) {
        mesesMap[clave].productos += parseInt(detalle.cantidad || 0);
      }
    });

    const resultado = Object.values(mesesMap).map(mes => ({
      mes: mes.mes,
      ventas: Math.round(mes.ventas),
      pedidos: mes.pedidos,
      productos: mes.productos
    }));

    return { success: true, data: resultado };
  } catch (error) {
    console.error('Error al obtener ventas mensuales:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene la distribución de productos por categoría
 */
export async function obtenerDistribucionProductos() {
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select(`
        id,
        categorias_productos!inner(nombre, color)
      `)
      .neq('estado', 'descontinuado');

    if (error) throw error;

    // Agrupar por categoría
    const categoriasMap = {};
    
    productos?.forEach(producto => {
      const nombreCategoria = producto.categorias_productos?.nombre || 'Sin categoría';
      const color = producto.categorias_productos?.color || '#6b7280';
      
      if (!categoriasMap[nombreCategoria]) {
        categoriasMap[nombreCategoria] = {
          name: nombreCategoria,
          value: 0,
          color: color
        };
      }
      categoriasMap[nombreCategoria].value += 1;
    });

    const resultado = Object.values(categoriasMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categorías

    return { success: true, data: resultado };
  } catch (error) {
    console.error('Error al obtener distribución de productos:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene el inventario por categoría
 */
export async function obtenerInventarioCategorias() {
  try {
    // Productos por categoría
    const { data: productos } = await supabase
      .from('productos')
      .select(`
        stock,
        stock_minimo,
        categorias_productos!inner(nombre)
      `)
      .neq('estado', 'descontinuado');

    // Materiales por categoría
    const { data: materiales } = await supabase
      .from('materiales')
      .select(`
        cantidad,
        stock_minimo,
        categorias_materiales!inner(nombre)
      `);

    const resultado = [];

    // Agrupar productos
    const productosMap = {};
    productos?.forEach(p => {
      const cat = p.categorias_productos?.nombre || 'Sin categoría';
      if (!productosMap[cat]) {
        productosMap[cat] = { cantidad: 0, minimo: 0 };
      }
      productosMap[cat].cantidad += parseInt(p.stock || 0);
      productosMap[cat].minimo += parseInt(p.stock_minimo || 0);
    });

    // Agrupar materiales
    const materialesMap = {};
    materiales?.forEach(m => {
      const cat = m.categorias_materiales?.nombre || 'Sin categoría';
      if (!materialesMap[cat]) {
        materialesMap[cat] = { cantidad: 0, minimo: 0 };
      }
      materialesMap[cat].cantidad += parseFloat(m.cantidad || 0);
      materialesMap[cat].minimo += parseFloat(m.stock_minimo || 0);
    });

    // Combinar resultados
    Object.entries(productosMap).forEach(([categoria, datos]) => {
      resultado.push({
        categoria: `Prod: ${categoria}`,
        cantidad: Math.round(datos.cantidad),
        minimo: Math.round(datos.minimo)
      });
    });

    Object.entries(materialesMap).forEach(([categoria, datos]) => {
      resultado.push({
        categoria: `Mat: ${categoria}`,
        cantidad: Math.round(datos.cantidad),
        minimo: Math.round(datos.minimo)
      });
    });

    return { success: true, data: resultado.slice(0, 5) };
  } catch (error) {
    console.error('Error al obtener inventario por categorías:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene los productos más vendidos
 */
export async function obtenerTopProductos() {
  try {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const { data: detalles, error } = await supabase
      .from('detalles_pedido')
      .select(`
        producto_id,
        producto_nombre,
        cantidad,
        pedidos!inner(fecha_pedido, estado)
      `)
      .in('pedidos.estado', ['Completado', 'Entregado'])
      .gte('pedidos.fecha_pedido', hace30Dias.toISOString());

    if (error) throw error;

    // Agrupar por producto
    const productosMap = {};
    
    detalles?.forEach(detalle => {
      const id = detalle.producto_id;
      const nombre = detalle.producto_nombre;
      
      if (!productosMap[id]) {
        productosMap[id] = {
          nombre: nombre,
          ventas: 0
        };
      }
      productosMap[id].ventas += parseInt(detalle.cantidad || 0);
    });

    // Convertir a array y ordenar
    const resultado = Object.values(productosMap)
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 4)
      .map(p => ({
        nombre: p.nombre,
        ventas: p.ventas,
        tendencia: Math.random() > 0.3 ? 'up' : 'down', // Aleatorizamos por ahora
        imagen: '👕' // Podemos mapear esto a emojis según categoría
      }));

    return { success: true, data: resultado };
  } catch (error) {
    console.error('Error al obtener top productos:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene las alertas importantes
 */
export async function obtenerAlertas() {
  try {
    const alertas = [];

    // Productos con stock bajo
    const { data: productosStockBajo } = await supabase
      .from('productos')
      .select('id')
      .eq('estado', 'bajo_stock');

    if (productosStockBajo && productosStockBajo.length > 0) {
      alertas.push({
        id: 1,
        tipo: 'warning',
        mensaje: `${productosStockBajo.length} productos con stock bajo`,
        color: 'orange'
      });
    }

    // Pedidos pendientes
    const { data: pedidosPendientes } = await supabase
      .from('pedidos')
      .select('id')
      .in('estado', ['Pendiente', 'En Proceso']);

    if (pedidosPendientes && pedidosPendientes.length > 0) {
      alertas.push({
        id: 2,
        tipo: 'info',
        mensaje: `${pedidosPendientes.length} pedidos pendientes de entrega`,
        color: 'blue'
      });
    }

    // Pedidos completados hoy
    const { data: pedidosHoy } = await supabase
      .from('pedidos')
      .select('id')
      .in('estado', ['Completado', 'Entregado'])
      .gte('fecha_pedido', new Date().toISOString().split('T')[0]);

    if (pedidosHoy && pedidosHoy.length > 0) {
      alertas.push({
        id: 3,
        tipo: 'success',
        mensaje: `${pedidosHoy.length} pedidos completados hoy`,
        color: 'green'
      });
    }

    // Si no hay alertas, agregar una por defecto
    if (alertas.length === 0) {
      alertas.push({
        id: 1,
        tipo: 'info',
        mensaje: 'Todo funcionando correctamente',
        color: 'blue'
      });
    }

    return { success: true, data: alertas };
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene la actividad reciente
 */
export async function obtenerActividadReciente() {
  try {
    const hace24Horas = new Date();
    hace24Horas.setHours(hace24Horas.getHours() - 24);

    // Obtener movimientos recientes
    const { data: movimientos, error } = await supabase
      .from('movimientos_inventario')
      .select('id, tipo, tipo_item, item_nombre, created_at')
      .gte('created_at', hace24Horas.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Obtener pedidos recientes
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('id, numero_pedido, estado, created_at')
      .gte('created_at', hace24Horas.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    const actividades = [];

    // Agregar pedidos
    pedidos?.forEach(pedido => {
      const tiempoTranscurrido = calcularTiempoTranscurrido(pedido.created_at);
      
      if (pedido.estado === 'Pendiente') {
        actividades.push({
          id: `pedido-${pedido.id}`,
          accion: `Nuevo pedido ${pedido.numero_pedido}`,
          tiempo: tiempoTranscurrido,
          color: 'purple'
        });
      } else if (pedido.estado === 'Completado' || pedido.estado === 'Entregado') {
        actividades.push({
          id: `pedido-${pedido.id}`,
          accion: `Pedido ${pedido.numero_pedido} completado`,
          tiempo: tiempoTranscurrido,
          color: 'green'
        });
      }
    });

    // Agregar movimientos
    movimientos?.slice(0, 6).forEach(mov => {
      const tiempoTranscurrido = calcularTiempoTranscurrido(mov.created_at);
      let accion = '';
      let color = 'blue';

      if (mov.tipo === 'entrada') {
        accion = `Stock actualizado: ${mov.item_nombre}`;
        color = 'blue';
      } else if (mov.tipo === 'salida') {
        accion = `Salida de inventario: ${mov.item_nombre}`;
        color = 'orange';
      } else {
        accion = `${mov.tipo}: ${mov.item_nombre}`;
        color = 'blue';
      }

      actividades.push({
        id: `mov-${mov.id}`,
        accion,
        tiempo: tiempoTranscurrido,
        color
      });
    });

    // Ordenar por más reciente y limitar a 4
    return { 
      success: true, 
      data: actividades
        .sort((a, b) => a.tiempo.localeCompare(b.tiempo))
        .slice(0, 4) 
    };
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
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

  if (diff < 60) return 'Hace menos de 1 min';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) > 1 ? 's' : ''}`;
  return `Hace ${Math.floor(diff / 86400)} día${Math.floor(diff / 86400) > 1 ? 's' : ''}`;
}

/**
 * Obtiene todas las estadísticas del dashboard en una sola llamada
 */
export async function obtenerDashboardCompleto() {
  try {
    const [
      estadisticas,
      ventasMensuales,
      distribucion,
      inventario,
      topProductos,
      alertas,
      actividad
    ] = await Promise.all([
      obtenerEstadisticasPrincipales(),
      obtenerVentasMensuales(),
      obtenerDistribucionProductos(),
      obtenerInventarioCategorias(),
      obtenerTopProductos(),
      obtenerAlertas(),
      obtenerActividadReciente()
    ]);

    return {
      success: true,
      data: {
        estadisticas: estadisticas.success ? estadisticas.data : null,
        ventasMensuales: ventasMensuales.success ? ventasMensuales.data : [],
        distribucionProductos: distribucion.success ? distribucion.data : [],
        inventarioCategorias: inventario.success ? inventario.data : [],
        topProductos: topProductos.success ? topProductos.data : [],
        alertas: alertas.success ? alertas.data : [],
        actividadReciente: actividad.success ? actividad.data : []
      }
    };
  } catch (error) {
    console.error('Error al obtener dashboard completo:', error);
    return { success: false, error: error.message };
  }
}
