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
