# 🚀 Configuración del Sistema de Inventario - Funcionalidad Completa

## ✅ Pasos para hacer funcionar "Agregar Producto"

### 1. **Configurar Supabase**

#### a) Ejecutar el script SQL en Supabase
1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. En el menú lateral, selecciona **SQL Editor**
3. Copia y pega el script SQL completo de la base de datos
4. Haz clic en **Run** para ejecutarlo
5. Verifica que se crearon todas las tablas

#### b) ⚠️ IMPORTANTE: Configurar políticas RLS (Row Level Security)

**El error "permission denied for schema public" significa que RLS está bloqueando el acceso.**

**SOLUCIÓN RÁPIDA:** Ejecuta el script `DESHABILITAR_RLS.sql` que está en la raíz del proyecto.

Este script hace 3 cosas:
1. Deshabilita RLS en todas las tablas
2. Elimina todas las políticas restrictivas
3. Crea políticas permisivas que permiten acceso completo (solo para desarrollo)

**Cómo ejecutarlo:**
1. Ve a Supabase SQL Editor
2. Abre el archivo `DESHABILITAR_RLS.sql`
3. Copia todo el contenido
4. Pégalo en el SQL Editor
5. Haz clic en **Run**
6. Verifica que aparezca: "✅ RLS DESHABILITADO EXITOSAMENTE"

**Alternativa manual rápida:**
```sql
-- Deshabilitar RLS solo en las tablas necesarias
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
```

⚠️ **ADVERTENCIA:** Esto es SOLO para desarrollo. En producción necesitas políticas de seguridad adecuadas.

### 2. **Verificar credenciales de Supabase**

Revisa el archivo `src/supabaseClient.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'TU_URL_AQUI'; // Debe ser tu URL real
const supabaseAnonKey = 'TU_KEY_AQUI'; // Debe ser tu key real

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Dónde encontrar tus credenciales:**
1. Ve a tu proyecto en Supabase
2. Clic en **Settings** (⚙️) > **API**
3. Copia:
   - **Project URL** → `supabaseUrl`
   - **anon/public key** → `supabaseAnonKey`

### 3. **Verificar instalación de dependencias**

Asegúrate de tener todas las dependencias instaladas:

```bash
npm install
```

### 4. **Ejecutar la aplicación**

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173/`

## 🎯 Cómo funciona "Agregar Producto"

### Flujo completo:

1. **Abrir modal**: Haz clic en el botón **"Nuevo Producto"** (botón morado con ícono +)

2. **Código automático**: 
   - Se genera automáticamente: `PROD001`, `PROD002`, `PROD003`, etc.
   - El sistema consulta el último producto y genera el siguiente número
   
3. **Categorías** (⚠️ IMPORTANTE):
   - **Las categorías se cargan automáticamente desde Supabase**
   - Si el select aparece vacío o con error, ejecuta: `INSERTAR_CATEGORIAS.sql`
   - Debes tener al menos 1 categoría para crear productos
   - Categorías por defecto: Polo, Pantalón, Vestido, Chaqueta, Falda, Camisa, Short, Accesorio
   
4. **Llenar formulario**:
   - **Nombre**: Obligatorio (ej: "Camisa Casual Azul")
   - **Categoría**: Obligatorio (select con iconos, se carga desde BD)
   - **Precio**: Obligatorio, mayor a 0
   - **Stock**: Obligatorio, no negativo
   - **Costo**: Opcional
   - **Stock Mínimo**: Opcional (default: 5)
   - **Tallas**: Opcional (multiselección: XS, S, M, L, XL, XXL, 28-36)
   - **Colores**: Opcional (multiselección con iconos)
   - **Descripción**: Opcional

5. **Guardar**: 
   - Se valida el formulario
   - Se envía a Supabase (tabla: productos)
   - Se muestra notificación de éxito
   - Se recarga automáticamente la lista de productos

## 🎯 Cómo abrir el modal "Nuevo Producto"

El botón **"Nuevo Producto"** es el botón **MORADO con ícono de +** en la esquina superior derecha de la vista de Productos.

**Ubicación exacta:**
- Vista: Productos
- Posición: Esquina superior derecha, junto al botón "Exportar"
- Apariencia: Fondo degradado morado/azul, texto blanco, ícono de + (FaPlus)
- Al hacer clic: Abre el modal para crear un nuevo producto

**Si el modal no se abre:**
1. Verifica que no haya errores en la consola del navegador (F12)
2. Verifica que el archivo `src/components/NuevoProductoModal.jsx` exista
3. Verifica que no haya errores de compilación

**El modal debe:**
- Aparecer centrado en la pantalla
- Mostrar un código auto-generado (PROD001, PROD002, etc.)
- Cargar las categorías automáticamente desde Supabase
- Tener un formulario completo con todos los campos

## 🔍 Archivos modificados/creados

### Nuevos archivos:
- ✅ `src/services/productosService.js` - Servicio para manejar productos en Supabase
- ✅ `DESHABILITAR_RLS.sql` - Script para deshabilitar RLS en Supabase
- ✅ `INSERTAR_CATEGORIAS.sql` - Script para insertar categorías de productos

### Archivos modificados:
- ✅ `src/components/NuevoProductoModal.jsx` - Modal con carga dinámica de categorías
- ✅ `src/ProductosView.jsx` - Integración con Supabase y carga dinámica
- ✅ `src/services/productosService.js` - Logging detallado de errores

## 📝 Funciones principales del servicio

### `productosService.js`

```javascript
// Generar código automático (PROD001, PROD002, etc.)
generarCodigoProducto()

// Obtener categorías desde la BD
obtenerCategorias()

// Crear producto nuevo
crearProducto(productoData)

// Obtener todos los productos
obtenerProductos()

// Actualizar producto existente
actualizarProducto(id, productoData)

// Eliminar producto
eliminarProducto(id)

// Buscar productos por nombre o código
buscarProductos(termino)
```

## 🐛 Solución de problemas comunes

### ❌ Error: "Failed to fetch" o "Network error"
**Causa**: Credenciales incorrectas de Supabase
**Solución**: Verifica `supabaseClient.js` con las credenciales correctas de tu proyecto

### ❌ Error: "permission denied for schema public" (403 Forbidden)
**Causa**: Row Level Security (RLS) está bloqueando el acceso
**Síntoma**: Aparece en la consola al cargar productos
**Solución**: 
1. Ejecuta el script `DESHABILITAR_RLS.sql` completo en Supabase
2. O ejecuta manualmente:
```sql
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_productos DISABLE ROW LEVEL SECURITY;
```
3. Recarga la página (F5)

### ❌ Error: "RLS policy violation" 
**Causa**: Políticas RLS restrictivas
**Solución**: Ejecuta `DESHABILITAR_RLS.sql` que elimina políticas y crea unas permisivas

### Error: "relation 'productos' does not exist"
**Causa**: Script SQL no ejecutado
**Solución**: Ejecuta el script SQL completo en Supabase

### Código no se genera (aparece vacío)
**Causa**: Error al consultar la BD
**Solución**: Revisa la consola del navegador (F12) para ver el error exacto

### ❌ Error: No se cargan las categorías (select vacío)
**Causa**: Tabla `categorias_productos` vacía o sin acceso
**Síntoma**: El select de categoría aparece vacío o con mensaje "No hay categorías disponibles"
**Solución**: 
1. Abre Supabase SQL Editor
2. Ejecuta el archivo `INSERTAR_CATEGORIAS.sql`
3. Verifica con:
```sql
-- Verificar que existan categorías
SELECT * FROM categorias_productos ORDER BY nombre;

-- Debe mostrar 8 categorías: Polo, Pantalón, Vestido, etc.
```
4. Si aún no cargan, verifica RLS:
```sql
-- Verificar que RLS esté deshabilitado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'categorias_productos';

-- Debe mostrar: rowsecurity = false
```

## 🎨 Características implementadas

✅ Código automático secuencial (PROD001, PROD002...)
✅ Categorías dinámicas desde BD
✅ Validación de formulario completa
✅ Notificaciones toast elegantes
✅ Animaciones con Framer Motion
✅ Carga automática de productos
✅ Estado de loading mientras carga
✅ Multiselección de tallas y colores
✅ Diseño responsive y moderno

## 📊 Estructura de datos en Supabase

### Tabla: productos
```sql
{
  id: UUID (automático),
  codigo: "PROD001" (generado automáticamente),
  nombre: "Camisa Casual",
  categoria_id: UUID (FK a categorias_productos),
  descripcion: "Descripción del producto",
  precio: 45.00,
  costo: 30.00,
  stock: 25,
  stock_minimo: 5,
  tallas: ["S", "M", "L"],
  colores: ["Azul", "Blanco"],
  estado: "disponible" | "agotado" | "bajo_stock" | "descontinuado",
  imagen_url: null,
  created_at: timestamp,
  updated_at: timestamp
}
```

## 🚀 Próximos pasos

1. ✅ **Agregar productos** - ¡Ya funcional!
2. ⏳ **Editar productos** - Por implementar
3. ⏳ **Eliminar productos** - Por implementar
4. ⏳ **Subir imágenes a Supabase Storage** - Por implementar
5. ⏳ **Agregar materiales** - Por implementar
6. ⏳ **Crear pedidos** - Por implementar

## 📞 ¿Necesitas ayuda?

Si encuentras algún problema:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Console**
3. Busca mensajes de error en rojo
4. Comparte el error para obtener ayuda específica

---

**¡El sistema está listo para agregar productos!** 🎉
