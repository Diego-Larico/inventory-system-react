# ⚠️ SOLUCIÓN RÁPIDA - Errores de RLS en Supabase

## 🔴 Error que estás viendo:

```
GET https://[tu-proyecto].supabase.co/rest/v1/productos 403 (Forbidden)
Error: permission denied for schema public
code: "42501"
```

## ✅ SOLUCIÓN INMEDIATA:

### Opción 1: Ejecutar script automático (RECOMENDADO)

1. Abre tu proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor** (ícono de código en el menú lateral)
3. Haz clic en **"+ New query"**
4. Copia y pega **TODO** el contenido del archivo `DESHABILITAR_RLS.sql`
5. Haz clic en **RUN** (botón verde)
6. Espera a que termine (verás mensaje de éxito)
7. **Recarga tu aplicación** en el navegador (F5)

### Opción 2: Comando rápido (si tienes prisa)

Solo copia y ejecuta esto en SQL Editor:

```sql
-- DESHABILITAR RLS EN TABLAS PRINCIPALES
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_pedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos_materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_inventario DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver productos" ON public.productos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear productos" ON public.productos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar productos" ON public.productos;

-- Crear política permisiva
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público productos"
    ON public.productos FOR ALL
    USING (true)
    WITH CHECK (true);

ALTER TABLE public.categorias_productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo acceso público categorias_productos"
    ON public.categorias_productos FOR ALL
    USING (true)
    WITH CHECK (true);

-- Mensaje de confirmación
SELECT 'RLS deshabilitado exitosamente' as status;
```

## 🎯 ¿Por qué pasa esto?

**Row Level Security (RLS)** es una función de seguridad de PostgreSQL/Supabase que **bloquea por defecto** todo acceso a las tablas.

Cuando ejecutaste el script SQL original, RLS se habilitó PERO las políticas que se crearon requieren **autenticación** (`auth.uid()`, `auth.role()`).

Como tu aplicación NO está usando autenticación de Supabase (no hay login), **todas las consultas fallan** con error 403.

## 📋 Después de ejecutar el script:

1. ✅ **Recarga la aplicación** (F5 en el navegador)
2. ✅ **Verifica la consola** (F12 → Console)
3. ✅ **NO deberías ver** más errores 403
4. ✅ **Deberías ver** productos cargándose (aunque esté vacío)
5. ✅ **Haz clic** en el botón morado "Nuevo Producto"
6. ✅ **Verifica** que se genere el código PROD001 automáticamente

## 🔍 Cómo verificar que funcionó:

Ejecuta esto en SQL Editor de Supabase:

```sql
-- Ver estado de RLS en tablas
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Deberías ver:**
- `productos`: `true` (RLS habilitado PERO con políticas permisivas)
- `categorias_productos`: `true`

O si deshabilitaste completamente:
- Todas las tablas con `false`

## ⚠️ IMPORTANTE:

**Esto es SOLO para desarrollo.**

En producción, necesitas:
- Implementar autenticación de Supabase
- Crear políticas RLS adecuadas según roles
- Validar permisos por usuario

## 📍 Ubicación del botón "Nuevo Producto":

El botón para agregar productos está en:

```
Vista: Productos
Ubicación: Esquina superior derecha
Apariencia: Botón morado con degradado
Texto: "Nuevo Producto" con ícono de +
Posición: Junto al botón verde "Exportar"
```

Al hacer clic:
- Se abre un modal
- Muestra código auto-generado (PROD001)
- Carga categorías automáticamente
- Permite llenar el formulario

Si el modal no se abre:
1. Verifica errores en consola (F12)
2. Asegúrate de que RLS esté configurado
3. Verifica que `NuevoProductoModal.jsx` exista en `src/components/`

## 🆘 ¿Sigue sin funcionar?

1. **Limpia caché del navegador:** Ctrl + F5
2. **Reinicia el servidor:** Detén con Ctrl+C y ejecuta `npm run dev`
3. **Verifica credenciales:** Revisa `src/supabaseClient.js`
4. **Revisa consola:** F12 → Console → busca errores en rojo

## 📞 Checklist de verificación:

- [ ] Script SQL de base de datos ejecutado
- [ ] Script DESHABILITAR_RLS.sql ejecutado
- [ ] Credenciales de Supabase correctas en `supabaseClient.js`
- [ ] Navegador recargado después de ejecutar scripts
- [ ] No hay errores 403 en consola
- [ ] Servidor de desarrollo corriendo (`npm run dev`)
- [ ] Botón "Nuevo Producto" visible en vista Productos
- [ ] Modal se abre al hacer clic
- [ ] Código PROD001 aparece automáticamente

---

**Una vez que todo funcione, deberías poder:**
- ✅ Ver la lista de productos (aunque esté vacía)
- ✅ Abrir el modal "Nuevo Producto"
- ✅ Ver código auto-generado
- ✅ Seleccionar categorías
- ✅ Guardar productos nuevos
- ✅ Ver productos en la lista después de guardar
