import { supabase } from '../supabaseClient';

/**
 * Servicio para generar reportes y analíticas desde Supabase
 */

// Obtener ventas mensuales con desglose completo
export async function obtenerVentasMensuales(añoActual = new Date().getFullYear()) {
  try {
    console.log('📊 Consultando ventas mensuales desde Supabase...');
    
    // Obtener pedidos completados y entregados del año actual
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('fecha_pedido, total, estado, subtotal, descuento')
      .in('estado', ['Completado', 'Entregado'])
      .gte('fecha_pedido', `${añoActual}-01-01`)
      .lte('fecha_pedido', `${añoActual}-12-31`)
      .order('fecha_pedido');

    if (error) throw error;

    // Agrupar por mes
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ventasPorMes = meses.map((mes, index) => ({
      mes,
      ventas: 0,
      costos: 0,
      pedidos: 0,
      ganancias: 0
    }));

    pedidos.forEach(pedido => {
      const fecha = new Date(pedido.fecha_pedido);
      const mesIndex = fecha.getMonth();
      
      ventasPorMes[mesIndex].ventas += parseFloat(pedido.total || 0);
      ventasPorMes[mesIndex].costos += parseFloat(pedido.subtotal || 0) * 0.6; // Estimar costo como 60% del subtotal
      ventasPorMes[mesIndex].pedidos += 1;
      ventasPorMes[mesIndex].ganancias = ventasPorMes[mesIndex].ventas - ventasPorMes[mesIndex].costos;
    });

    console.log('✅ Ventas mensuales obtenidas:', ventasPorMes);
    return { success: true, data: ventasPorMes };
  } catch (error) {
    console.error('❌ Error al obtener ventas mensuales:', error);
    return { success: false, error: error.message };
  }
}

// Obtener productos más vendidos
export async function obtenerProductosMasVendidos(limite = 5) {
  try {
    console.log('🏆 Consultando productos más vendidos...');
    
    const { data: detalles, error } = await supabase
      .from('detalles_pedido')
      .select(`
        producto_nombre,
        cantidad,
        precio_unitario,
        producto:productos(categoria:categorias_productos(nombre))
      `);

    if (error) throw error;

    // Agrupar por producto
    const productosMap = {};
    detalles.forEach(detalle => {
      const nombre = detalle.producto_nombre;
      if (!productosMap[nombre]) {
        productosMap[nombre] = {
          nombre,
          cantidad: 0,
          ingresos: 0,
          categoria: detalle.producto?.categoria?.nombre || 'Sin categoría'
        };
      }
      productosMap[nombre].cantidad += parseInt(detalle.cantidad || 0);
      productosMap[nombre].ingresos += parseFloat(detalle.cantidad || 0) * parseFloat(detalle.precio_unitario || 0);
    });

    // Convertir a array y ordenar
    const productos = Object.values(productosMap)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, limite);

    console.log('✅ Productos más vendidos:', productos);
    return { success: true, data: productos };
  } catch (error) {
    console.error('❌ Error al obtener productos más vendidos:', error);
    return { success: false, error: error.message };
  }
}

// Obtener ventas por categoría
export async function obtenerVentasPorCategoria() {
  try {
    console.log('📦 Consultando ventas por categoría...');
    
    const { data: detalles, error } = await supabase
      .from('detalles_pedido')
      .select(`
        cantidad,
        precio_unitario,
        subtotal,
        producto:productos(categoria:categorias_productos(nombre))
      `);

    if (error) throw error;

    // Agrupar por categoría
    const categoriasMap = {};
    detalles.forEach(detalle => {
      const categoria = detalle.producto?.categoria?.nombre || 'Sin categoría';
      if (!categoriasMap[categoria]) {
        categoriasMap[categoria] = { categoria, ventas: 0 };
      }
      categoriasMap[categoria].ventas += parseFloat(detalle.subtotal || 0);
    });

    // Convertir a array y calcular porcentajes
    const categorias = Object.values(categoriasMap);
    const totalVentas = categorias.reduce((sum, cat) => sum + cat.ventas, 0);
    
    categorias.forEach(cat => {
      cat.porcentaje = totalVentas > 0 ? Math.round((cat.ventas / totalVentas) * 100) : 0;
    });

    categorias.sort((a, b) => b.ventas - a.ventas);

    console.log('✅ Ventas por categoría:', categorias);
    return { success: true, data: categorias };
  } catch (error) {
    console.error('❌ Error al obtener ventas por categoría:', error);
    return { success: false, error: error.message };
  }
}

// Obtener comparativo anual (año actual vs anterior)
export async function obtenerComparativoAnual() {
  try {
    console.log('📈 Consultando comparativo anual...');
    
    const añoActual = new Date().getFullYear();
    const añoAnterior = añoActual - 1;

    // Obtener datos de ambos años
    const { data: pedidosActual, error: errorActual } = await supabase
      .from('pedidos')
      .select('fecha_pedido, total')
      .in('estado', ['Completado', 'Entregado'])
      .gte('fecha_pedido', `${añoActual}-01-01`)
      .lte('fecha_pedido', `${añoActual}-12-31`);

    const { data: pedidosAnterior, error: errorAnterior } = await supabase
      .from('pedidos')
      .select('fecha_pedido, total')
      .in('estado', ['Completado', 'Entregado'])
      .gte('fecha_pedido', `${añoAnterior}-01-01`)
      .lte('fecha_pedido', `${añoAnterior}-12-31`);

    if (errorActual || errorAnterior) throw errorActual || errorAnterior;

    // Agrupar por mes
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const comparativo = meses.map((mes, index) => ({
      mes,
      [añoAnterior.toString()]: 0,
      [añoActual.toString()]: 0
    }));

    pedidosAnterior?.forEach(pedido => {
      const mesIndex = new Date(pedido.fecha_pedido).getMonth();
      comparativo[mesIndex][añoAnterior.toString()] += parseFloat(pedido.total || 0);
    });

    pedidosActual?.forEach(pedido => {
      const mesIndex = new Date(pedido.fecha_pedido).getMonth();
      comparativo[mesIndex][añoActual.toString()] += parseFloat(pedido.total || 0);
    });

    console.log('✅ Comparativo anual obtenido:', comparativo);
    return { success: true, data: comparativo, añoActual, añoAnterior };
  } catch (error) {
    console.error('❌ Error al obtener comparativo anual:', error);
    return { success: false, error: error.message };
  }
}

// Obtener métricas clave del dashboard
export async function obtenerMetricasClave() {
  try {
    console.log('🎯 Consultando métricas clave...');
    
    const ahora = new Date();
    const mesActual = ahora.toISOString().slice(0, 7); // YYYY-MM

    // Ventas totales del mes
    const { data: pedidosMes, error: errorPedidos } = await supabase
      .from('pedidos')
      .select('total, anticipo')
      .in('estado', ['Completado', 'Entregado'])
      .gte('fecha_pedido', `${mesActual}-01`)
      .lte('fecha_pedido', `${mesActual}-31`);

    if (errorPedidos) throw errorPedidos;

    const ventasTotales = pedidosMes.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
    const pedidosCompletados = pedidosMes.length;

    // Calcular crecimiento (vs mes anterior)
    const fechaMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const mesAnterior = fechaMesAnterior.toISOString().slice(0, 7);
    const { data: pedidosMesAnterior } = await supabase
      .from('pedidos')
      .select('total')
      .in('estado', ['Completado', 'Entregado'])
      .gte('fecha_pedido', `${mesAnterior}-01`)
      .lte('fecha_pedido', `${mesAnterior}-31`);

    const ventasMesAnterior = pedidosMesAnterior?.reduce((sum, p) => sum + parseFloat(p.total || 0), 0) || 0;
    let crecimiento = 0;
    if (ventasMesAnterior > 0) {
      crecimiento = ((ventasTotales - ventasMesAnterior) / ventasMesAnterior * 100).toFixed(1);
    } else if (ventasTotales > 0) {
      crecimiento = 100; // Si antes era 0 y ahora hay ventas, es 100% de crecimiento
    }

    // Ticket promedio
    const ticketPromedio = pedidosCompletados > 0 ? ventasTotales / pedidosCompletados : 0;

    // Margen de ganancia estimado (40% del total)
    const margenGanancia = 40;

    // Clientes nuevos y recurrentes (estimado)
    const { count: totalClientes } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true);

    const metricas = {
      ventasTotales: Math.round(ventasTotales),
      crecimiento: parseFloat(crecimiento),
      pedidosCompletados,
      ticketPromedio: parseFloat(ticketPromedio.toFixed(2)),
      margenGanancia,
      tasaConversion: 3.8, // Estimado
      clientesNuevos: Math.round(totalClientes * 0.25) || 0,
      clientesRecurrentes: Math.round(totalClientes * 0.75) || 0,
    };

    console.log('✅ Métricas clave obtenidas:', metricas);
    return { success: true, data: metricas };
  } catch (error) {
    console.error('❌ Error al obtener métricas clave:', error);
    return { success: false, error: error.message };
  }
}

// Obtener estado del inventario
export async function obtenerEstadoInventario() {
  try {
    console.log('📊 Consultando estado del inventario...');
    
    const { data: productos, error } = await supabase
      .from('productos')
      .select('estado');

    if (error) throw error;

    const estado = {
      disponible: productos.filter(p => p.estado === 'disponible').length,
      bajo_stock: productos.filter(p => p.estado === 'bajo_stock').length,
      agotado: productos.filter(p => p.estado === 'agotado').length,
    };

    const estadoFormateado = [
      { categoria: 'Stock disponible', valor: estado.disponible, color: '#8f5cff' },
      { categoria: 'Bajo stock', valor: estado.bajo_stock, color: '#f59e42' },
      { categoria: 'Sin stock', valor: estado.agotado, color: '#f87171' },
    ];

    console.log('✅ Estado del inventario obtenido:', estadoFormateado);
    return { success: true, data: estadoFormateado };
  } catch (error) {
    console.error('❌ Error al obtener estado del inventario:', error);
    return { success: false, error: error.message };
  }
}

// Obtener rendimiento por método de pago (canal de venta)
export async function obtenerRendimientoPorCanal() {
  try {
    console.log('💳 Consultando rendimiento por canal...');
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('metodo_pago, total')
      .in('estado', ['Completado', 'Entregado']);

    if (error) throw error;

    const canalesMap = {};
    pedidos.forEach(pedido => {
      const canal = pedido.metodo_pago || 'Otro';
      if (!canalesMap[canal]) {
        canalesMap[canal] = { canal, ventas: 0, pedidos: 0, ticketPromedio: 0 };
      }
      canalesMap[canal].ventas += parseFloat(pedido.total || 0);
      canalesMap[canal].pedidos += 1;
    });

    const canales = Object.values(canalesMap).map(canal => ({
      ...canal,
      ticketPromedio: canal.pedidos > 0 ? Math.round(canal.ventas / canal.pedidos) : 0
    }));

    console.log('✅ Rendimiento por canal obtenido:', canales);
    return { success: true, data: canales };
  } catch (error) {
    console.error('❌ Error al obtener rendimiento por canal:', error);
    return { success: false, error: error.message };
  }
}

// Obtener reporte completo
export async function obtenerReporteCompleto() {
  try {
    console.log('📋 Generando reporte completo...');
    
    const [
      ventasMensuales,
      productosMasVendidos,
      ventasPorCategoria,
      comparativoAnual,
      metricasClave,
      estadoInventario,
      rendimientoPorCanal
    ] = await Promise.all([
      obtenerVentasMensuales(),
      obtenerProductosMasVendidos(),
      obtenerVentasPorCategoria(),
      obtenerComparativoAnual(),
      obtenerMetricasClave(),
      obtenerEstadoInventario(),
      obtenerRendimientoPorCanal()
    ]);

    const reporte = {
      ventasMensuales: ventasMensuales.data || [],
      productosMasVendidos: productosMasVendidos.data || [],
      ventasPorCategoria: ventasPorCategoria.data || [],
      comparativoAnual: comparativoAnual.data || [],
      metricasClave: metricasClave.data || {},
      estadoInventario: estadoInventario.data || [],
      rendimientoPorCanal: rendimientoPorCanal.data || [],
      añoActual: comparativoAnual.añoActual,
      añoAnterior: comparativoAnual.añoAnterior
    };

    console.log('✅ Reporte completo generado exitosamente');
    return { success: true, data: reporte };
  } catch (error) {
    console.error('❌ Error al generar reporte completo:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// NUEVAS FUNCIONES PARA GRÁFICOS ADICIONALES
// ============================================

/**
 * Obtener productos agrupados por estado
 */
export async function obtenerProductosPorEstado() {
  try {
    console.log('📊 Consultando productos por estado...');
    
    const { data: productos, error } = await supabase
      .from('productos')
      .select('estado');

    if (error) throw error;

    const estadosCount = {
      'disponible': 0,
      'bajo_stock': 0,
      'agotado': 0,
      'descontinuado': 0
    };

    productos.forEach(p => {
      const estado = p.estado?.toLowerCase() || 'disponible';
      if (estadosCount.hasOwnProperty(estado)) {
        estadosCount[estado]++;
      }
    });

    const total = productos.length;
    const resultado = [
      { 
        estado: 'Disponible', 
        cantidad: estadosCount.disponible, 
        porcentaje: ((estadosCount.disponible / total) * 100).toFixed(1),
        color: '#10b981' 
      },
      { 
        estado: 'Bajo Stock', 
        cantidad: estadosCount.bajo_stock, 
        porcentaje: ((estadosCount.bajo_stock / total) * 100).toFixed(1),
        color: '#f59e42' 
      },
      { 
        estado: 'Agotado', 
        cantidad: estadosCount.agotado, 
        porcentaje: ((estadosCount.agotado / total) * 100).toFixed(1),
        color: '#ef4444' 
      },
      { 
        estado: 'Descontinuado', 
        cantidad: estadosCount.descontinuado, 
        porcentaje: ((estadosCount.descontinuado / total) * 100).toFixed(1),
        color: '#6b7280' 
      }
    ];

    console.log('✅ Productos por estado:', resultado);
    return { success: true, data: resultado };
  } catch (error) {
    console.error('❌ Error al obtener productos por estado:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Calcular rotación de inventario
 * Rotación = Ventas del período / Inventario promedio
 */
export async function obtenerRotacionInventario() {
  try {
    console.log('📊 Calculando rotación de inventario...');
    
    // Obtener productos con sus ventas de los últimos 30 días
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 30);
    
    const { data: detalles, error: errorDetalles } = await supabase
      .from('detalles_pedido')
      .select(`
        producto_id,
        producto_nombre,
        cantidad,
        pedidos!inner(fecha_pedido, estado)
      `)
      .gte('pedidos.fecha_pedido', fechaInicio.toISOString())
      .in('pedidos.estado', ['Completado', 'Entregado']);

    if (errorDetalles) throw errorDetalles;

    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('id, nombre, stock');

    if (errorProductos) throw errorProductos;

    // Agrupar ventas por producto
    const ventasPorProducto = {};
    detalles.forEach(detalle => {
      const id = detalle.producto_id;
      if (!ventasPorProducto[id]) {
        ventasPorProducto[id] = {
          nombre: detalle.producto_nombre,
          cantidadVendida: 0
        };
      }
      ventasPorProducto[id].cantidadVendida += detalle.cantidad;
    });

    // Calcular rotación (ventas mensuales / stock actual)
    const rotaciones = [];
    Object.keys(ventasPorProducto).forEach(id => {
      const producto = productos.find(p => p.id === id);
      if (producto && producto.stock > 0) {
        const rotacion = ventasPorProducto[id].cantidadVendida / producto.stock;
        const diasInventario = Math.round(30 / (rotacion || 0.1));
        
        rotaciones.push({
          producto: ventasPorProducto[id].nombre,
          rotacion: parseFloat(rotacion.toFixed(1)),
          dias: diasInventario > 365 ? 365 : diasInventario
        });
      }
    });

    // Ordenar por rotación descendente y tomar top 5
    const top5 = rotaciones
      .sort((a, b) => b.rotacion - a.rotacion)
      .slice(0, 5);

    console.log('✅ Rotación de inventario:', top5);
    return { success: true, data: top5 };
  } catch (error) {
    console.error('❌ Error al calcular rotación:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener margen de ganancia por producto
 */
export async function obtenerMargenGananciaPorProducto() {
  try {
    console.log('📊 Calculando margen de ganancia por producto...');
    
    const { data: productos, error } = await supabase
      .from('productos')
      .select('nombre, precio, costo')
      .gt('precio', 0)
      .gt('costo', 0)
      .limit(5)
      .order('precio', { ascending: false });

    if (error) throw error;

    const resultado = productos.map(p => ({
      producto: p.nombre,
      precio: parseFloat(p.precio),
      costo: parseFloat(p.costo),
      margen: (((p.precio - p.costo) / p.precio) * 100).toFixed(0)
    }));

    console.log('✅ Margen de ganancia:', resultado);
    return { success: true, data: resultado };
  } catch (error) {
    console.error('❌ Error al calcular margen:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener segmentación de clientes por tipo
 */
export async function obtenerTiposCliente() {
  try {
    console.log('📊 Obteniendo segmentación de clientes...');
    
    const { data: clientes, error: errorClientes } = await supabase
      .from('clientes')
      .select('id, tipo_cliente')
      .eq('activo', true);

    if (errorClientes) throw errorClientes;

    const { data: pedidos, error: errorPedidos } = await supabase
      .from('pedidos')
      .select('cliente_id, total, estado')
      .in('estado', ['Completado', 'Entregado'])
      .not('cliente_id', 'is', null);

    if (errorPedidos) throw errorPedidos;

    // Agrupar por tipo de cliente
    const tiposMap = {
      'regular': { cantidad: 0, ventas: 0, color: '#8f5cff' },
      'vip': { cantidad: 0, ventas: 0, color: '#f59e42' },
      'mayorista': { cantidad: 0, ventas: 0, color: '#10b981' }
    };

    // Contar clientes por tipo
    clientes.forEach(cliente => {
      const tipo = cliente.tipo_cliente || 'regular';
      if (tiposMap[tipo]) {
        tiposMap[tipo].cantidad++;
      }
    });

    // Sumar ventas por tipo de cliente
    pedidos.forEach(pedido => {
      const cliente = clientes.find(c => c.id === pedido.cliente_id);
      if (cliente) {
        const tipo = cliente.tipo_cliente || 'regular';
        if (tiposMap[tipo]) {
          tiposMap[tipo].ventas += parseFloat(pedido.total || 0);
        }
      }
    });

    const resultado = [
      { tipo: 'Regular', ...tiposMap.regular },
      { tipo: 'VIP', ...tiposMap.vip },
      { tipo: 'Mayorista', ...tiposMap.mayorista }
    ];

    console.log('✅ Tipos de cliente:', resultado);
    return { success: true, data: resultado };
  } catch (error) {
    console.error('❌ Error al obtener tipos de cliente:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener clientes más frecuentes
 */
export async function obtenerClientesFrecuentes() {
  try {
    console.log('📊 Obteniendo clientes frecuentes...');
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('cliente_id, cliente_nombre, total, estado')
      .in('estado', ['Completado', 'Entregado'])
      .not('cliente_id', 'is', null);

    if (error) throw error;

    // Agrupar por cliente
    const clientesMap = {};
    pedidos.forEach(pedido => {
      const id = pedido.cliente_id;
      if (!clientesMap[id]) {
        clientesMap[id] = {
          nombre: pedido.cliente_nombre || 'Cliente sin nombre',
          pedidos: 0,
          total: 0
        };
      }
      clientesMap[id].pedidos++;
      clientesMap[id].total += parseFloat(pedido.total || 0);
    });

    // Convertir a array y ordenar por número de pedidos
    const resultado = Object.values(clientesMap)
      .sort((a, b) => b.pedidos - a.pedidos)
      .slice(0, 5)
      .map(c => ({
        nombre: c.nombre,
        pedidos: c.pedidos,
        total: Math.round(c.total)
      }));

    console.log('✅ Clientes frecuentes:', resultado);
    return { success: true, data: resultado };
  } catch (error) {
    console.error('❌ Error al obtener clientes frecuentes:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener desglose de costos mensuales
 */
export async function obtenerCostosMensuales() {
  try {
    console.log('📊 Calculando costos mensuales...');
    
    const añoActual = new Date().getFullYear();
    
    // Obtener pedidos completados
    const { data: pedidos, error: errorPedidos } = await supabase
      .from('pedidos')
      .select('fecha_pedido, total, subtotal')
      .in('estado', ['Completado', 'Entregado'])
      .gte('fecha_pedido', `${añoActual}-01-01`)
      .lte('fecha_pedido', `${añoActual}-12-31`);

    if (errorPedidos) throw errorPedidos;

    // Obtener movimientos de materiales (entradas = compras de materiales)
    const { data: movimientos, error: errorMovimientos } = await supabase
      .from('movimientos_inventario')
      .select('created_at, tipo, tipo_item')
      .eq('tipo', 'entrada')
      .gte('created_at', `${añoActual}-01-01`);

    if (errorMovimientos) throw errorMovimientos;

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const costosPorMes = meses.map((mes, index) => ({
      mes,
      materiales: 0,
      operativos: 0,
      personal: 0
    }));

    // Calcular costos de materiales (estimado como compras de materiales)
    pedidos.forEach(pedido => {
      const fecha = new Date(pedido.fecha_pedido);
      const mesIndex = fecha.getMonth();
      
      // Estimar costos:
      // - Materiales: 50% del subtotal
      // - Operativos: 15% del subtotal
      // - Personal: costo fijo de 12000 por mes
      costosPorMes[mesIndex].materiales += parseFloat(pedido.subtotal || 0) * 0.5;
      costosPorMes[mesIndex].operativos += parseFloat(pedido.subtotal || 0) * 0.15;
      costosPorMes[mesIndex].personal = 12000; // Costo fijo mensual
    });

    // Redondear valores
    costosPorMes.forEach(mes => {
      mes.materiales = Math.round(mes.materiales);
      mes.operativos = Math.round(mes.operativos);
    });

    // Tomar solo últimos 6 meses
    const mesActual = new Date().getMonth();
    const ultimos6Meses = costosPorMes.slice(Math.max(0, mesActual - 5), mesActual + 1);

    console.log('✅ Costos mensuales:', ultimos6Meses);
    return { success: true, data: ultimos6Meses };
  } catch (error) {
    console.error('❌ Error al calcular costos:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener análisis de rentabilidad mensual
 */
export async function obtenerRentabilidadMensual() {
  try {
    console.log('📊 Calculando rentabilidad mensual...');
    
    const añoActual = new Date().getFullYear();
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('fecha_pedido, total, subtotal')
      .in('estado', ['Completado', 'Entregado'])
      .gte('fecha_pedido', `${añoActual}-01-01`)
      .lte('fecha_pedido', `${añoActual}-12-31`);

    if (error) throw error;

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const rentabilidadPorMes = meses.map((mes, index) => ({
      mes,
      ingresos: 0,
      costos: 0,
      utilidad: 0,
      margen: 0
    }));

    pedidos.forEach(pedido => {
      const fecha = new Date(pedido.fecha_pedido);
      const mesIndex = fecha.getMonth();
      
      const ingresos = parseFloat(pedido.total || 0);
      const costos = parseFloat(pedido.subtotal || 0) * 0.65; // 65% del subtotal como costos totales
      
      rentabilidadPorMes[mesIndex].ingresos += ingresos;
      rentabilidadPorMes[mesIndex].costos += costos;
    });

    // Calcular utilidad y margen
    rentabilidadPorMes.forEach(mes => {
      mes.ingresos = Math.round(mes.ingresos);
      mes.costos = Math.round(mes.costos);
      mes.utilidad = mes.ingresos - mes.costos;
      mes.margen = mes.ingresos > 0 ? Math.round((mes.utilidad / mes.ingresos) * 100) : 0;
    });

    // Tomar solo últimos 6 meses
    const mesActual = new Date().getMonth();
    const ultimos6Meses = rentabilidadPorMes.slice(Math.max(0, mesActual - 5), mesActual + 1);

    console.log('✅ Rentabilidad mensual:', ultimos6Meses);
    return { success: true, data: ultimos6Meses };
  } catch (error) {
    console.error('❌ Error al calcular rentabilidad:', error);
    return { success: false, error: error.message };
  }
}
