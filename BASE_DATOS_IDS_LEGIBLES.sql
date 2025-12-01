-- ============================================
-- SCRIPT COMPLETO BASE DE DATOS SUPABASE
-- Sistema de Inventario para Confección
-- PostgreSQL CON IDs LEGIBLES + SIN RLS
-- ⚠️ ADVERTENCIA: Sin seguridad - SOLO para desarrollo
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE public.usuarios (
    id VARCHAR(20) PRIMARY KEY, -- USR001, USR002, etc.
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'operario' CHECK (rol IN ('administrador', 'operario', 'vendedor')),
    avatar_url TEXT,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX idx_usuarios_activo ON public.usuarios(activo);

-- Secuencia para usuarios
CREATE SEQUENCE IF NOT EXISTS usuarios_seq START 1;

-- Función para generar ID de usuario
CREATE OR REPLACE FUNCTION generar_id_usuario()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'USR' || LPAD(NEXTVAL('usuarios_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_usuario
    BEFORE INSERT ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_usuario();

-- ============================================
-- TABLA: categorias_materiales
-- ============================================
CREATE TABLE public.categorias_materiales (
    id VARCHAR(20) PRIMARY KEY, -- CAT_MAT001, CAT_MAT002, etc.
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secuencia para categorías de materiales
CREATE SEQUENCE IF NOT EXISTS categorias_materiales_seq START 1;

-- Función para generar ID de categoría material
CREATE OR REPLACE FUNCTION generar_id_categoria_material()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'CAT_MAT' || LPAD(NEXTVAL('categorias_materiales_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_categoria_material
    BEFORE INSERT ON public.categorias_materiales
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_categoria_material();

-- Insertar categorías por defecto
INSERT INTO public.categorias_materiales (nombre, descripcion, icono, color) VALUES
    ('Hilo', 'Hilos de diferentes materiales y colores', '🧵', '#8f5cff'),
    ('Tela', 'Telas para confección', '🧶', '#6e7ff3'),
    ('Botón', 'Botones diversos', '⚪', '#f59e42'),
    ('Cremallera', 'Cremalleras y cierres', '🔒', '#10b981'),
    ('Accesorio', 'Accesorios varios', '📎', '#ef4444'),
    ('Etiqueta', 'Etiquetas y marquillas', '🏷️', '#f59e0b'),
    ('Otro', 'Otros materiales', '📦', '#6b7280')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- TABLA: materiales
-- ============================================
CREATE TABLE public.materiales (
    id VARCHAR(20) PRIMARY KEY, -- MAT001, MAT002, etc.
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    categoria_id VARCHAR(20) REFERENCES public.categorias_materiales(id) ON DELETE SET NULL,
    tipo VARCHAR(100) NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unidad VARCHAR(50) DEFAULT 'unidades' CHECK (unidad IN ('metros', 'unidades', 'rollos', 'cajas', 'kilos', 'gramos')),
    stock_minimo DECIMAL(10, 2) DEFAULT 10,
    precio_unitario DECIMAL(10, 2) DEFAULT 0,
    proveedor VARCHAR(255),
    ubicacion VARCHAR(100),
    color VARCHAR(50),
    notas TEXT,
    estado VARCHAR(50) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'agotado', 'bajo_stock')),
    imagen_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(20) REFERENCES public.usuarios(id) ON DELETE SET NULL
);

-- Índices para materiales
CREATE INDEX idx_materiales_codigo ON public.materiales(codigo);
CREATE INDEX idx_materiales_nombre ON public.materiales(nombre);
CREATE INDEX idx_materiales_categoria ON public.materiales(categoria_id);
CREATE INDEX idx_materiales_tipo ON public.materiales(tipo);
CREATE INDEX idx_materiales_estado ON public.materiales(estado);
CREATE INDEX idx_materiales_proveedor ON public.materiales(proveedor);

-- Secuencia para materiales
CREATE SEQUENCE IF NOT EXISTS materiales_seq START 1;

-- Función para generar ID de material
CREATE OR REPLACE FUNCTION generar_id_material()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'MAT' || LPAD(NEXTVAL('materiales_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_material
    BEFORE INSERT ON public.materiales
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_material();

-- Trigger para actualizar estado automáticamente
CREATE OR REPLACE FUNCTION actualizar_estado_material()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cantidad <= 0 THEN
        NEW.estado := 'agotado';
    ELSIF NEW.cantidad <= NEW.stock_minimo THEN
        NEW.estado := 'bajo_stock';
    ELSE
        NEW.estado := 'disponible';
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_estado_material
    BEFORE INSERT OR UPDATE OF cantidad, stock_minimo ON public.materiales
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_material();

-- ============================================
-- TABLA: categorias_productos
-- ============================================
CREATE TABLE public.categorias_productos (
    id VARCHAR(20) PRIMARY KEY, -- CAT_PROD001, CAT_PROD002, etc.
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secuencia para categorías de productos
CREATE SEQUENCE IF NOT EXISTS categorias_productos_seq START 1;

-- Función para generar ID de categoría producto
CREATE OR REPLACE FUNCTION generar_id_categoria_producto()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'CAT_PROD' || LPAD(NEXTVAL('categorias_productos_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_categoria_producto
    BEFORE INSERT ON public.categorias_productos
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_categoria_producto();

-- Insertar categorías de productos por defecto
INSERT INTO public.categorias_productos (nombre, descripcion, icono, color) VALUES
    ('Polo', 'Polos y camisetas', '👕', '#8f5cff'),
    ('Pantalón', 'Pantalones diversos', '👖', '#6e7ff3'),
    ('Vestido', 'Vestidos', '👗', '#f59e42'),
    ('Chaqueta', 'Chaquetas y abrigos', '🧥', '#10b981'),
    ('Falda', 'Faldas', '👗', '#ef4444'),
    ('Camisa', 'Camisas formales', '👔', '#f59e0b'),
    ('Short', 'Shorts y bermudas', '🩳', '#6b7280'),
    ('Accesorio', 'Accesorios de moda', '👜', '#ec4899')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE public.productos (
    id VARCHAR(20) PRIMARY KEY, -- PROD001, PROD002, etc.
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    categoria_id VARCHAR(20) REFERENCES public.categorias_productos(id) ON DELETE SET NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    costo DECIMAL(10, 2) DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    imagen_url TEXT,
    imagenes_adicionales TEXT[], -- Array de URLs
    estado VARCHAR(50) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'agotado', 'bajo_stock', 'descontinuado')),
    tallas TEXT[], -- Array de tallas disponibles
    colores TEXT[], -- Array de colores disponibles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(20) REFERENCES public.usuarios(id) ON DELETE SET NULL
);

-- Índices para productos
CREATE INDEX idx_productos_codigo ON public.productos(codigo);
CREATE INDEX idx_productos_nombre ON public.productos(nombre);
CREATE INDEX idx_productos_categoria ON public.productos(categoria_id);
CREATE INDEX idx_productos_estado ON public.productos(estado);
CREATE INDEX idx_productos_precio ON public.productos(precio);

-- Secuencia para productos
CREATE SEQUENCE IF NOT EXISTS productos_seq START 1;

-- Función para generar ID de producto
CREATE OR REPLACE FUNCTION generar_id_producto()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'PROD' || LPAD(NEXTVAL('productos_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_producto
    BEFORE INSERT ON public.productos
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_producto();

-- Trigger para actualizar estado de producto
CREATE OR REPLACE FUNCTION actualizar_estado_producto()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock <= 0 THEN
        NEW.estado := 'agotado';
    ELSIF NEW.stock <= NEW.stock_minimo THEN
        NEW.estado := 'bajo_stock';
    ELSE
        NEW.estado := 'disponible';
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_estado_producto
    BEFORE INSERT OR UPDATE OF stock, stock_minimo ON public.productos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_producto();

-- ============================================
-- TABLA: productos_materiales (relación muchos a muchos)
-- ============================================
CREATE TABLE public.productos_materiales (
    id VARCHAR(20) PRIMARY KEY, -- PROD_MAT001, PROD_MAT002, etc.
    producto_id VARCHAR(20) REFERENCES public.productos(id) ON DELETE CASCADE,
    material_id VARCHAR(20) REFERENCES public.materiales(id) ON DELETE CASCADE,
    cantidad_necesaria DECIMAL(10, 2) NOT NULL,
    unidad VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(producto_id, material_id)
);

CREATE INDEX idx_productos_materiales_producto ON public.productos_materiales(producto_id);
CREATE INDEX idx_productos_materiales_material ON public.productos_materiales(material_id);

-- Secuencia para productos_materiales
CREATE SEQUENCE IF NOT EXISTS productos_materiales_seq START 1;

-- Función para generar ID de producto_material
CREATE OR REPLACE FUNCTION generar_id_producto_material()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'PROD_MAT' || LPAD(NEXTVAL('productos_materiales_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_producto_material
    BEFORE INSERT ON public.productos_materiales
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_producto_material();

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE public.clientes (
    id VARCHAR(20) PRIMARY KEY, -- CLI001, CLI002, etc.
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20),
    direccion TEXT,
    documento VARCHAR(20),
    tipo_documento VARCHAR(20) DEFAULT 'DNI' CHECK (tipo_documento IN ('DNI', 'RUC', 'CE', 'Pasaporte')),
    notas TEXT,
    tipo_cliente VARCHAR(50) DEFAULT 'regular' CHECK (tipo_cliente IN ('regular', 'vip', 'mayorista')),
    descuento_porcentaje DECIMAL(5, 2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clientes_nombre ON public.clientes(nombre_completo);
CREATE INDEX idx_clientes_telefono ON public.clientes(telefono);
CREATE INDEX idx_clientes_documento ON public.clientes(documento);

-- Secuencia para clientes
CREATE SEQUENCE IF NOT EXISTS clientes_seq START 1;

-- Función para generar ID de cliente
CREATE OR REPLACE FUNCTION generar_id_cliente()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'CLI' || LPAD(NEXTVAL('clientes_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_cliente
    BEFORE INSERT ON public.clientes
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_cliente();

-- ============================================
-- TABLA: pedidos
-- ============================================
CREATE TABLE public.pedidos (
    id VARCHAR(20) PRIMARY KEY, -- PED001, PED002, etc.
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    cliente_id VARCHAR(20) REFERENCES public.clientes(id) ON DELETE SET NULL,
    cliente_nombre VARCHAR(255), -- Para pedidos sin cliente registrado
    cliente_telefono VARCHAR(20),
    cliente_direccion TEXT,
    cliente_email VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Completado', 'Cancelado', 'Entregado')),
    prioridad VARCHAR(50) DEFAULT 'Media' CHECK (prioridad IN ('Baja', 'Media', 'Alta')),
    fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_entrega DATE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    descuento DECIMAL(10, 2) DEFAULT 0,
    impuestos DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    metodo_pago VARCHAR(50) CHECK (metodo_pago IN ('Efectivo', 'Tarjeta', 'Transferencia', 'Yape/Plin', 'Otro')),
    anticipo DECIMAL(10, 2) DEFAULT 0,
    saldo DECIMAL(10, 2) DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(20) REFERENCES public.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_pedidos_numero ON public.pedidos(numero_pedido);
CREATE INDEX idx_pedidos_cliente ON public.pedidos(cliente_id);
CREATE INDEX idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX idx_pedidos_prioridad ON public.pedidos(prioridad);
CREATE INDEX idx_pedidos_fecha_pedido ON public.pedidos(fecha_pedido);
CREATE INDEX idx_pedidos_fecha_entrega ON public.pedidos(fecha_entrega);

-- Secuencia para pedidos
CREATE SEQUENCE IF NOT EXISTS pedidos_seq START 1;

-- Función para generar ID de pedido
CREATE OR REPLACE FUNCTION generar_id_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'PED' || LPAD(NEXTVAL('pedidos_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_pedido
    BEFORE INSERT ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_pedido();

-- Función para generar número de pedido automático
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_pedido IS NULL OR NEW.numero_pedido = '' THEN
        NEW.numero_pedido := 'PED-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CURRVAL('pedidos_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_numero_pedido
    BEFORE INSERT ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION generar_numero_pedido();

-- Trigger para calcular saldo
CREATE OR REPLACE FUNCTION calcular_saldo_pedido()
RETURNS TRIGGER AS $$
BEGIN
    NEW.saldo := NEW.total - COALESCE(NEW.anticipo, 0);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_saldo_pedido
    BEFORE INSERT OR UPDATE OF total, anticipo ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_saldo_pedido();

-- ============================================
-- TABLA: detalles_pedido
-- ============================================
CREATE TABLE public.detalles_pedido (
    id VARCHAR(20) PRIMARY KEY, -- DET_PED001, DET_PED002, etc.
    pedido_id VARCHAR(20) REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id VARCHAR(20) REFERENCES public.productos(id) ON DELETE SET NULL,
    producto_nombre VARCHAR(255) NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    talla VARCHAR(10),
    color VARCHAR(50),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_detalles_pedido_pedido ON public.detalles_pedido(pedido_id);
CREATE INDEX idx_detalles_pedido_producto ON public.detalles_pedido(producto_id);

-- Secuencia para detalles_pedido
CREATE SEQUENCE IF NOT EXISTS detalles_pedido_seq START 1;

-- Función para generar ID de detalle_pedido
CREATE OR REPLACE FUNCTION generar_id_detalle_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'DET_PED' || LPAD(NEXTVAL('detalles_pedido_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_detalle_pedido
    BEFORE INSERT ON public.detalles_pedido
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_detalle_pedido();

-- Trigger para calcular subtotal del detalle
CREATE OR REPLACE FUNCTION calcular_subtotal_detalle()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := NEW.cantidad * NEW.precio_unitario;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_subtotal_detalle
    BEFORE INSERT OR UPDATE OF cantidad, precio_unitario ON public.detalles_pedido
    FOR EACH ROW
    EXECUTE FUNCTION calcular_subtotal_detalle();

-- Trigger para actualizar total del pedido
CREATE OR REPLACE FUNCTION actualizar_total_pedido()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.pedidos
    SET subtotal = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM public.detalles_pedido
        WHERE pedido_id = COALESCE(NEW.pedido_id, OLD.pedido_id)
    ),
    total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM public.detalles_pedido
        WHERE pedido_id = COALESCE(NEW.pedido_id, OLD.pedido_id)
    ) - COALESCE(descuento, 0) + COALESCE(impuestos, 0)
    WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_total_pedido
    AFTER INSERT OR UPDATE OR DELETE ON public.detalles_pedido
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_total_pedido();

-- ============================================
-- TABLA: movimientos_inventario
-- ============================================
CREATE TABLE public.movimientos_inventario (
    id VARCHAR(20) PRIMARY KEY, -- MOV001, MOV002, etc.
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste', 'devolucion')),
    tipo_item VARCHAR(50) NOT NULL CHECK (tipo_item IN ('material', 'producto')),
    item_id VARCHAR(20) NOT NULL, -- Puede ser material_id o producto_id
    item_nombre VARCHAR(255) NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    cantidad_anterior DECIMAL(10, 2),
    cantidad_nueva DECIMAL(10, 2),
    motivo VARCHAR(255),
    referencia VARCHAR(100), -- Número de pedido, factura, etc.
    pedido_id VARCHAR(20) REFERENCES public.pedidos(id) ON DELETE SET NULL,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(20) REFERENCES public.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_movimientos_tipo ON public.movimientos_inventario(tipo);
CREATE INDEX idx_movimientos_tipo_item ON public.movimientos_inventario(tipo_item);
CREATE INDEX idx_movimientos_item_id ON public.movimientos_inventario(item_id);
CREATE INDEX idx_movimientos_pedido ON public.movimientos_inventario(pedido_id);
CREATE INDEX idx_movimientos_fecha ON public.movimientos_inventario(created_at);

-- Secuencia para movimientos
CREATE SEQUENCE IF NOT EXISTS movimientos_seq START 1;

-- Función para generar ID de movimiento
CREATE OR REPLACE FUNCTION generar_id_movimiento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'MOV' || LPAD(NEXTVAL('movimientos_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_movimiento
    BEFORE INSERT ON public.movimientos_inventario
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_movimiento();

-- ============================================
-- TABLA: configuracion
-- ============================================
CREATE TABLE public.configuracion (
    id VARCHAR(20) PRIMARY KEY, -- CFG001, CFG002, etc.
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(50) DEFAULT 'texto' CHECK (tipo IN ('texto', 'numero', 'booleano', 'json')),
    descripcion TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secuencia para configuración
CREATE SEQUENCE IF NOT EXISTS configuracion_seq START 1;

-- Función para generar ID de configuración
CREATE OR REPLACE FUNCTION generar_id_configuracion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'CFG' || LPAD(NEXTVAL('configuracion_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_configuracion
    BEFORE INSERT ON public.configuracion
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_configuracion();

-- Configuraciones por defecto
INSERT INTO public.configuracion (clave, valor, tipo, descripcion) VALUES
    ('nombre_empresa', 'Sistema de Inventario', 'texto', 'Nombre de la empresa'),
    ('moneda', 'S/', 'texto', 'Símbolo de moneda'),
    ('impuesto_porcentaje', '18', 'numero', 'Porcentaje de IGV/IVA'),
    ('dias_alerta_stock', '7', 'numero', 'Días para alertar sobre stock bajo'),
    ('email_notificaciones', '', 'texto', 'Email para notificaciones'),
    ('generar_codigo_automatico', 'true', 'booleano', 'Generar códigos automáticamente')
ON CONFLICT (clave) DO NOTHING;

-- ============================================
-- TABLA: notificaciones
-- ============================================
CREATE TABLE public.notificaciones (
    id VARCHAR(20) PRIMARY KEY, -- NOTIF001, NOTIF002, etc.
    usuario_id VARCHAR(20) REFERENCES public.usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('order', 'alert', 'success', 'info', 'warning')),
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT false,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notificaciones_usuario ON public.notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON public.notificaciones(leida);
CREATE INDEX idx_notificaciones_fecha ON public.notificaciones(created_at);

-- Secuencia para notificaciones
CREATE SEQUENCE IF NOT EXISTS notificaciones_seq START 1;

-- Función para generar ID de notificación
CREATE OR REPLACE FUNCTION generar_id_notificacion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'NOTIF' || LPAD(NEXTVAL('notificaciones_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_notificacion
    BEFORE INSERT ON public.notificaciones
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_notificacion();

-- ============================================
-- TABLA: tareas
-- ============================================
CREATE TABLE public.tareas (
    id VARCHAR(20) PRIMARY KEY, -- TASK001, TASK002, etc.
    usuario_id VARCHAR(20) REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    completada BOOLEAN DEFAULT false,
    prioridad VARCHAR(50) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
    fecha_vencimiento DATE,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tareas_usuario ON public.tareas(usuario_id);
CREATE INDEX idx_tareas_completada ON public.tareas(completada);
CREATE INDEX idx_tareas_fecha_vencimiento ON public.tareas(fecha_vencimiento);

-- Secuencia para tareas
CREATE SEQUENCE IF NOT EXISTS tareas_seq START 1;

-- Función para generar ID de tarea
CREATE OR REPLACE FUNCTION generar_id_tarea()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := 'TASK' || LPAD(NEXTVAL('tareas_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_id_tarea
    BEFORE INSERT ON public.tareas
    FOR EACH ROW
    EXECUTE FUNCTION generar_id_tarea();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de productos con stock bajo
CREATE OR REPLACE VIEW vista_productos_bajo_stock AS
SELECT 
    p.id,
    p.codigo,
    p.nombre,
    c.nombre as categoria,
    p.stock,
    p.stock_minimo,
    p.precio,
    p.estado
FROM public.productos p
LEFT JOIN public.categorias_productos c ON p.categoria_id = c.id
WHERE p.stock <= p.stock_minimo AND p.estado != 'descontinuado';

-- Vista de materiales con stock bajo
CREATE OR REPLACE VIEW vista_materiales_bajo_stock AS
SELECT 
    m.id,
    m.codigo,
    m.nombre,
    m.tipo,
    m.cantidad,
    m.stock_minimo,
    m.unidad,
    m.proveedor,
    m.estado
FROM public.materiales m
WHERE m.cantidad <= m.stock_minimo;

-- Vista de pedidos pendientes
CREATE OR REPLACE VIEW vista_pedidos_pendientes AS
SELECT 
    p.id,
    p.numero_pedido,
    p.cliente_nombre,
    p.estado,
    p.prioridad,
    p.total,
    p.saldo,
    p.fecha_pedido,
    p.fecha_entrega,
    COUNT(dp.id) as cantidad_items
FROM public.pedidos p
LEFT JOIN public.detalles_pedido dp ON p.id = dp.pedido_id
WHERE p.estado IN ('Pendiente', 'En Proceso')
GROUP BY p.id;

-- Vista de ventas por mes
CREATE OR REPLACE VIEW vista_ventas_mensuales AS
SELECT 
    DATE_TRUNC('month', fecha_pedido) as mes,
    COUNT(*) as total_pedidos,
    SUM(total) as total_ventas,
    AVG(total) as promedio_venta,
    COUNT(DISTINCT cliente_id) as clientes_unicos
FROM public.pedidos
WHERE estado IN ('Completado', 'Entregado')
GROUP BY DATE_TRUNC('month', fecha_pedido)
ORDER BY mes DESC;

-- ============================================
-- DESHABILITAR ROW LEVEL SECURITY (RLS)
-- ⚠️ TODAS LAS TABLAS SIN SEGURIDAD
-- ============================================

ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos_materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_pedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_inventario DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas DISABLE ROW LEVEL SECURITY;

-- ============================================
-- OTORGAR PERMISOS AL ROL ANON
-- Solución al error 42501
-- ============================================

-- Permitir que anon y authenticated usen el schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON SCHEMA public TO anon, authenticated;

-- Otorgar permisos completos en todas las tablas existentes
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Permisos por tabla específica
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias_materiales TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materiales TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias_productos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.productos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.productos_materiales TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.detalles_pedido TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movimientos_inventario TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracion TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificaciones TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tareas TO anon, authenticated;

-- Permisos para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON SEQUENCES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON FUNCTIONS TO anon, authenticated;

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION obtener_estadisticas_dashboard()
RETURNS JSON AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_build_object(
        'total_productos', (SELECT COUNT(*) FROM public.productos WHERE estado != 'descontinuado'),
        'total_materiales', (SELECT COUNT(*) FROM public.materiales),
        'productos_bajo_stock', (SELECT COUNT(*) FROM public.productos WHERE estado = 'bajo_stock'),
        'materiales_bajo_stock', (SELECT COUNT(*) FROM public.materiales WHERE estado = 'bajo_stock'),
        'pedidos_pendientes', (SELECT COUNT(*) FROM public.pedidos WHERE estado IN ('Pendiente', 'En Proceso')),
        'pedidos_hoy', (SELECT COUNT(*) FROM public.pedidos WHERE DATE(fecha_pedido) = CURRENT_DATE),
        'ventas_mes', (SELECT COALESCE(SUM(total), 0) FROM public.pedidos WHERE estado IN ('Completado', 'Entregado') AND DATE_TRUNC('month', fecha_pedido) = DATE_TRUNC('month', CURRENT_DATE)),
        'total_clientes', (SELECT COUNT(*) FROM public.clientes WHERE activo = true)
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar movimiento de inventario
CREATE OR REPLACE FUNCTION registrar_movimiento_inventario(
    p_tipo VARCHAR,
    p_tipo_item VARCHAR,
    p_item_id VARCHAR,
    p_cantidad DECIMAL,
    p_motivo VARCHAR DEFAULT NULL,
    p_referencia VARCHAR DEFAULT NULL,
    p_pedido_id VARCHAR DEFAULT NULL,
    p_usuario_id VARCHAR DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
    v_movimiento_id VARCHAR;
    v_item_nombre VARCHAR;
    v_cantidad_anterior DECIMAL;
    v_cantidad_nueva DECIMAL;
BEGIN
    -- Obtener nombre y cantidad actual del item
    IF p_tipo_item = 'material' THEN
        SELECT nombre, cantidad INTO v_item_nombre, v_cantidad_anterior
        FROM public.materiales WHERE id = p_item_id;
    ELSIF p_tipo_item = 'producto' THEN
        SELECT nombre, stock INTO v_item_nombre, v_cantidad_anterior
        FROM public.productos WHERE id = p_item_id;
    END IF;
    
    -- Calcular nueva cantidad
    IF p_tipo = 'entrada' THEN
        v_cantidad_nueva := v_cantidad_anterior + p_cantidad;
    ELSIF p_tipo IN ('salida', 'ajuste') THEN
        v_cantidad_nueva := v_cantidad_anterior - p_cantidad;
    ELSIF p_tipo = 'devolucion' THEN
        v_cantidad_nueva := v_cantidad_anterior + p_cantidad;
    END IF;
    
    -- Registrar movimiento
    INSERT INTO public.movimientos_inventario (
        tipo, tipo_item, item_id, item_nombre, cantidad,
        cantidad_anterior, cantidad_nueva, motivo, referencia,
        pedido_id, created_by
    ) VALUES (
        p_tipo, p_tipo_item, p_item_id, v_item_nombre, p_cantidad,
        v_cantidad_anterior, v_cantidad_nueva, p_motivo, p_referencia,
        p_pedido_id, p_usuario_id
    ) RETURNING id INTO v_movimiento_id;
    
    -- Actualizar inventario
    IF p_tipo_item = 'material' THEN
        UPDATE public.materiales SET cantidad = v_cantidad_nueva WHERE id = p_item_id;
    ELSIF p_tipo_item = 'producto' THEN
        UPDATE public.productos SET stock = v_cantidad_nueva WHERE id = p_item_id;
    END IF;
    
    RETURN v_movimiento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================

-- Usuario administrador por defecto (password: admin123)
INSERT INTO public.usuarios (email, password_hash, nombre_completo, rol) VALUES
    ('admin@inventario.com', crypt('admin123', gen_salt('bf')), 'Diego Larico', 'administrador')
ON CONFLICT (email) DO NOTHING;

-- Clientes de ejemplo
INSERT INTO public.clientes (nombre_completo, telefono, direccion) VALUES
    ('María García', '987654321', 'Av. Principal 123, Lima'),
    ('Juan Pérez', '912345678', 'Jr. Comercio 456, Ica')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE public.usuarios IS 'Tabla de usuarios del sistema - IDs: USR001, USR002, etc.';
COMMENT ON TABLE public.materiales IS 'Inventario de materiales - IDs: MAT001, MAT002, etc.';
COMMENT ON TABLE public.productos IS 'Catálogo de productos terminados - IDs: PROD001, PROD002, etc.';
COMMENT ON TABLE public.pedidos IS 'Registro de pedidos - IDs: PED001, PED002, etc.';
COMMENT ON TABLE public.detalles_pedido IS 'Detalle de productos por pedido - IDs: DET_PED001, DET_PED002, etc.';
COMMENT ON TABLE public.movimientos_inventario IS 'Historial de movimientos - IDs: MOV001, MOV002, etc.';
COMMENT ON TABLE public.clientes IS 'Base de datos de clientes - IDs: CLI001, CLI002, etc.';
COMMENT ON TABLE public.notificaciones IS 'Sistema de notificaciones - IDs: NOTIF001, NOTIF002, etc.';
COMMENT ON TABLE public.tareas IS 'Lista de tareas - IDs: TASK001, TASK002, etc.';

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que RLS esté deshabilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar permisos para anon
SELECT 
    schemaname,
    tablename,
    has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT') as can_select,
    has_table_privilege('anon', schemaname || '.' || tablename, 'INSERT') as can_insert
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('productos', 'categorias_productos', 'materiales')
ORDER BY tablename;

-- Contar registros en tablas principales
SELECT 
    'usuarios' as tabla, COUNT(*) as total FROM public.usuarios
UNION ALL
SELECT 'categorias_materiales', COUNT(*) FROM public.categorias_materiales
UNION ALL
SELECT 'categorias_productos', COUNT(*) FROM public.categorias_productos
UNION ALL
SELECT 'materiales', COUNT(*) FROM public.materiales
UNION ALL
SELECT 'productos', COUNT(*) FROM public.productos
UNION ALL
SELECT 'clientes', COUNT(*) FROM public.clientes
UNION ALL
SELECT 'pedidos', COUNT(*) FROM public.pedidos;

-- ============================================
-- MENSAJE FINAL
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ BASE DE DATOS CON IDs LEGIBLES CREADA EXITOSAMENTE';
    RAISE NOTICE '✅ Estructura de IDs:';
    RAISE NOTICE '   - Productos: PROD001, PROD002, PROD003...';
    RAISE NOTICE '   - Materiales: MAT001, MAT002, MAT003...';
    RAISE NOTICE '   - Clientes: CLI001, CLI002, CLI003...';
    RAISE NOTICE '   - Pedidos: PED001, PED002, PED003...';
    RAISE NOTICE '   - Categorías Productos: CAT_PROD001, CAT_PROD002...';
    RAISE NOTICE '   - Categorías Materiales: CAT_MAT001, CAT_MAT002...';
    RAISE NOTICE '   - Usuarios: USR001, USR002, USR003...';
    RAISE NOTICE '✅ RLS COMPLETAMENTE DESHABILITADO';
    RAISE NOTICE '✅ PERMISOS ANON CONFIGURADOS';
    RAISE NOTICE '✅ Usuario admin: admin@inventario.com / admin123';
    RAISE NOTICE '⚠️  ADVERTENCIA: Sin seguridad - SOLO para desarrollo';
END $$;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
