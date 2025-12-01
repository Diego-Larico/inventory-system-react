-- ============================================
-- SCRIPT PARA DESHABILITAR RLS COMPLETAMENTE
-- Sistema de Inventario - Supabase
-- USAR SOLO EN DESARROLLO
-- ============================================

-- ============================================
-- PASO 1: DESHABILITAR RLS EN TODAS LAS TABLAS
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
-- PASO 2: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- ============================================

-- Políticas de usuarios
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Administradores pueden ver todos los usuarios" ON public.usuarios;

-- Políticas de materiales
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver materiales" ON public.materiales;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear materiales" ON public.materiales;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar materiales" ON public.materiales;

-- Políticas de productos
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver productos" ON public.productos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear productos" ON public.productos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar productos" ON public.productos;

-- Políticas de pedidos
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar pedidos" ON public.pedidos;

-- Políticas de detalles_pedido
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver detalles" ON public.detalles_pedido;

-- Políticas de notificaciones
DROP POLICY IF EXISTS "Usuarios ven sus propias notificaciones" ON public.notificaciones;
DROP POLICY IF EXISTS "Usuarios crean sus propias notificaciones" ON public.notificaciones;
DROP POLICY IF EXISTS "Usuarios actualizan sus propias notificaciones" ON public.notificaciones;

-- Políticas de tareas
DROP POLICY IF EXISTS "Usuarios ven sus propias tareas" ON public.tareas;
DROP POLICY IF EXISTS "Usuarios crean sus propias tareas" ON public.tareas;
DROP POLICY IF EXISTS "Usuarios actualizan sus propias tareas" ON public.tareas;
DROP POLICY IF EXISTS "Usuarios eliminan sus propias tareas" ON public.tareas;

-- ============================================
-- PASO 3: CREAR POLÍTICAS PERMISIVAS PARA ANON
-- (Permite acceso sin autenticación)
-- ============================================

-- USUARIOS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público usuarios"
    ON public.usuarios FOR ALL
    USING (true)
    WITH CHECK (true);

-- CATEGORÍAS MATERIALES
ALTER TABLE public.categorias_materiales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público categorias_materiales"
    ON public.categorias_materiales FOR ALL
    USING (true)
    WITH CHECK (true);

-- MATERIALES
ALTER TABLE public.materiales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público materiales"
    ON public.materiales FOR ALL
    USING (true)
    WITH CHECK (true);

-- CATEGORÍAS PRODUCTOS
ALTER TABLE public.categorias_productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público categorias_productos"
    ON public.categorias_productos FOR ALL
    USING (true)
    WITH CHECK (true);

-- PRODUCTOS
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público productos"
    ON public.productos FOR ALL
    USING (true)
    WITH CHECK (true);

-- PRODUCTOS_MATERIALES
ALTER TABLE public.productos_materiales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público productos_materiales"
    ON public.productos_materiales FOR ALL
    USING (true)
    WITH CHECK (true);

-- CLIENTES
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público clientes"
    ON public.clientes FOR ALL
    USING (true)
    WITH CHECK (true);

-- PEDIDOS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público pedidos"
    ON public.pedidos FOR ALL
    USING (true)
    WITH CHECK (true);

-- DETALLES_PEDIDO
ALTER TABLE public.detalles_pedido ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público detalles_pedido"
    ON public.detalles_pedido FOR ALL
    USING (true)
    WITH CHECK (true);

-- MOVIMIENTOS_INVENTARIO
ALTER TABLE public.movimientos_inventario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público movimientos_inventario"
    ON public.movimientos_inventario FOR ALL
    USING (true)
    WITH CHECK (true);

-- CONFIGURACIÓN
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público configuracion"
    ON public.configuracion FOR ALL
    USING (true)
    WITH CHECK (true);

-- NOTIFICACIONES
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público notificaciones"
    ON public.notificaciones FOR ALL
    USING (true)
    WITH CHECK (true);

-- TAREAS
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público tareas"
    ON public.tareas FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Consultar estado de RLS en todas las tablas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Consultar todas las políticas activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- MENSAJE FINAL
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS DESHABILITADO EXITOSAMENTE';
    RAISE NOTICE '✅ Políticas permisivas creadas para todas las tablas';
    RAISE NOTICE '⚠️  ADVERTENCIA: Esto es SOLO para desarrollo';
    RAISE NOTICE '⚠️  En producción, debes implementar políticas de seguridad adecuadas';
END $$;
