-- ============================================
-- INSERTAR CATEGORÍAS DE PRODUCTOS
-- Sistema de Inventario - Supabase
-- ============================================

-- Eliminar categorías existentes (opcional)
-- TRUNCATE TABLE public.categorias_productos CASCADE;

-- Insertar categorías de productos
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

-- Verificar que se insertaron
SELECT * FROM public.categorias_productos ORDER BY nombre;

-- Contar categorías
SELECT COUNT(*) as total_categorias FROM public.categorias_productos;
