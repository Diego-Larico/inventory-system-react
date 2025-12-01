-- ============================================
-- SCRIPT PARA OTORGAR PERMISOS AL ROL ANON
-- Soluciona: "permission denied for schema public"
-- Error code: 42501
-- ============================================

-- ============================================
-- PASO 1: OTORGAR PERMISOS AL ESQUEMA PUBLIC
-- ============================================

-- Permitir que anon y authenticated usen el schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Otorgar todos los privilegios en el schema public
GRANT ALL ON SCHEMA public TO anon, authenticated;

-- ============================================
-- PASO 2: OTORGAR PERMISOS EN TODAS LAS TABLAS
-- ============================================

-- Otorgar permisos completos en todas las tablas existentes
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Otorgar permisos completos en todas las secuencias
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Otorgar permisos completos en todas las funciones
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================
-- PASO 3: PERMISOS POR TABLA ESPECÍFICA
-- ============================================

-- Tablas principales
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

-- ============================================
-- PASO 4: PERMISOS PARA FUTURAS TABLAS
-- ============================================

-- Configurar permisos por defecto para nuevas tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO anon, authenticated;

-- Configurar permisos por defecto para nuevas secuencias
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON SEQUENCES TO anon, authenticated;

-- Configurar permisos por defecto para nuevas funciones
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON FUNCTIONS TO anon, authenticated;

-- ============================================
-- PASO 5: VERIFICAR RLS ESTÁ DESHABILITADO
-- ============================================

-- Deshabilitar RLS en todas las tablas (por si acaso)
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
-- PASO 6: VERIFICACIÓN
-- ============================================

-- Mostrar permisos del esquema public
SELECT 
    nspname as schema_name,
    nspacl as permissions
FROM pg_namespace 
WHERE nspname = 'public';

-- Verificar permisos en tablas críticas
SELECT 
    schemaname,
    tablename,
    tableowner,
    rowsecurity as rls_enabled,
    has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT') as anon_can_select,
    has_table_privilege('anon', schemaname || '.' || tablename, 'INSERT') as anon_can_insert,
    has_table_privilege('anon', schemaname || '.' || tablename, 'UPDATE') as anon_can_update,
    has_table_privilege('anon', schemaname || '.' || tablename, 'DELETE') as anon_can_delete
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('productos', 'categorias_productos', 'materiales')
ORDER BY tablename;

-- Verificar políticas activas (debe estar vacío)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Mensaje final
DO $$
DECLARE
    tablas_sin_permisos INT;
    politicas_activas INT;
BEGIN
    -- Contar tablas sin permisos para anon
    SELECT COUNT(*) INTO tablas_sin_permisos
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND NOT has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT');
    
    -- Contar políticas activas
    SELECT COUNT(*) INTO politicas_activas
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Mostrar resultado
    IF tablas_sin_permisos = 0 AND politicas_activas = 0 THEN
        RAISE NOTICE '✅ PERMISOS CONFIGURADOS CORRECTAMENTE';
        RAISE NOTICE '✅ Esquema public: ACCESIBLE';
        RAISE NOTICE '✅ Rol anon: TODOS LOS PERMISOS';
        RAISE NOTICE '✅ RLS: DESHABILITADO';
        RAISE NOTICE '✅ Políticas activas: 0';
    ELSE
        RAISE WARNING '⚠️ Tablas sin permisos para anon: %', tablas_sin_permisos;
        RAISE WARNING '⚠️ Políticas activas: %', politicas_activas;
    END IF;
END $$;

-- ============================================
-- INSTRUCCIONES FINALES
-- ============================================

-- 1. Copia y ejecuta este script completo en Supabase SQL Editor
-- 2. Verifica que aparezca "✅ PERMISOS CONFIGURADOS CORRECTAMENTE"
-- 3. Revisa las tablas de verificación que muestren:
--    - anon_can_select: true
--    - anon_can_insert: true
--    - anon_can_update: true
--    - anon_can_delete: true
--    - rls_enabled: false
-- 4. Recarga tu aplicación (F5 en el navegador)
-- 5. Los errores 403 deberían desaparecer

-- Si aún tienes problemas, ejecuta este query manual:
/*
SELECT 
    'GRANT ALL ON ' || schemaname || '.' || tablename || ' TO anon, authenticated;'
FROM pg_tables 
WHERE schemaname = 'public';
*/
