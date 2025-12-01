-- ============================================
-- SCRIPT PARA DESHABILITAR RLS EXISTENTE
-- Ejecuta SOLO este script si ya tienes las tablas creadas
-- ============================================

-- ============================================
-- PASO 1: DESHABILITAR RLS EN TODAS LAS TABLAS
-- ============================================
ALTER TABLE IF EXISTS public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categorias_materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categorias_productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.productos_materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.detalles_pedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.movimientos_inventario DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notificaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tareas DISABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 2: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- ============================================

-- Eliminar políticas de usuarios
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Administradores pueden ver todos los usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir todo acceso público usuarios" ON public.usuarios;

-- Eliminar políticas de categorias_materiales
DROP POLICY IF EXISTS "Permitir todo acceso público categorias_materiales" ON public.categorias_materiales;

-- Eliminar políticas de materiales
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver materiales" ON public.materiales;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear materiales" ON public.materiales;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar materiales" ON public.materiales;
DROP POLICY IF EXISTS "Permitir todo acceso público materiales" ON public.materiales;

-- Eliminar políticas de categorias_productos
DROP POLICY IF EXISTS "Permitir todo acceso público categorias_productos" ON public.categorias_productos;

-- Eliminar políticas de productos
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver productos" ON public.productos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear productos" ON public.productos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar productos" ON public.productos;
DROP POLICY IF EXISTS "Permitir todo acceso público productos" ON public.productos;

-- Eliminar políticas de productos_materiales
DROP POLICY IF EXISTS "Permitir todo acceso público productos_materiales" ON public.productos_materiales;

-- Eliminar políticas de clientes
DROP POLICY IF EXISTS "Permitir todo acceso público clientes" ON public.clientes;

-- Eliminar políticas de pedidos
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir todo acceso público pedidos" ON public.pedidos;

-- Eliminar políticas de detalles_pedido
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver detalles" ON public.detalles_pedido;
DROP POLICY IF EXISTS "Permitir todo acceso público detalles_pedido" ON public.detalles_pedido;

-- Eliminar políticas de movimientos_inventario
DROP POLICY IF EXISTS "Permitir todo acceso público movimientos_inventario" ON public.movimientos_inventario;

-- Eliminar políticas de configuracion
DROP POLICY IF EXISTS "Permitir todo acceso público configuracion" ON public.configuracion;

-- Eliminar políticas de notificaciones
DROP POLICY IF EXISTS "Usuarios ven sus propias notificaciones" ON public.notificaciones;
DROP POLICY IF EXISTS "Usuarios crean sus propias notificaciones" ON public.notificaciones;
DROP POLICY IF EXISTS "Usuarios actualizan sus propias notificaciones" ON public.notificaciones;
DROP POLICY IF EXISTS "Permitir todo acceso público notificaciones" ON public.notificaciones;

-- Eliminar políticas de tareas
DROP POLICY IF EXISTS "Usuarios ven sus propias tareas" ON public.tareas;
DROP POLICY IF EXISTS "Usuarios crean sus propias tareas" ON public.tareas;
DROP POLICY IF EXISTS "Usuarios actualizan sus propias tareas" ON public.tareas;
DROP POLICY IF EXISTS "Usuarios eliminan sus propias tareas" ON public.tareas;
DROP POLICY IF EXISTS "Permitir todo acceso público tareas" ON public.tareas;

-- ============================================
-- PASO 3: VERIFICACIÓN
-- ============================================

-- Verificar estado de RLS en todas las tablas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'usuarios', 'categorias_materiales', 'materiales', 
    'categorias_productos', 'productos', 'productos_materiales',
    'clientes', 'pedidos', 'detalles_pedido', 
    'movimientos_inventario', 'configuracion', 
    'notificaciones', 'tareas'
)
ORDER BY tablename;

-- Verificar que NO existan políticas activas
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- MENSAJE FINAL
-- ============================================

DO $$
DECLARE
    v_tablas_rls INTEGER;
    v_politicas INTEGER;
BEGIN
    -- Contar tablas con RLS habilitado
    SELECT COUNT(*) INTO v_tablas_rls
    FROM pg_tables
    WHERE schemaname = 'public'
    AND rowsecurity = true;
    
    -- Contar políticas activas
    SELECT COUNT(*) INTO v_politicas
    FROM pg_policies
    WHERE schemaname = 'public';
    
    IF v_tablas_rls = 0 AND v_politicas = 0 THEN
        RAISE NOTICE '✅ SUCCESS: RLS completamente deshabilitado';
        RAISE NOTICE '✅ Tablas con RLS: %', v_tablas_rls;
        RAISE NOTICE '✅ Políticas activas: %', v_politicas;
        RAISE NOTICE '✅ La aplicación ahora debe funcionar sin errores 403';
    ELSE
        RAISE WARNING '⚠️  ATENCIÓN: Aún hay configuraciones de seguridad activas';
        RAISE WARNING '⚠️  Tablas con RLS habilitado: %', v_tablas_rls;
        RAISE WARNING '⚠️  Políticas activas: %', v_politicas;
        RAISE WARNING '⚠️  Revisa los resultados de las consultas SELECT anteriores';
    END IF;
END $$;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
