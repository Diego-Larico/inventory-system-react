-- ============================================
-- SCRIPT DE DATOS DE PRUEBA
-- Sistema de Inventario para Confección
-- PostgreSQL - Supabase
-- ============================================

-- ============================================
-- LIMPIAR DATOS EXISTENTES (OPCIONAL)
-- ⚠️ Descomenta solo si quieres empezar desde cero
-- ============================================

-- DELETE FROM public.detalles_pedido;
-- DELETE FROM public.pedidos;
-- DELETE FROM public.productos_materiales;
-- DELETE FROM public.movimientos_inventario;
-- DELETE FROM public.productos;
-- DELETE FROM public.materiales;
-- DELETE FROM public.clientes;
-- DELETE FROM public.notificaciones;
-- DELETE FROM public.tareas;
-- DELETE FROM public.usuarios WHERE email != 'admin@inventario.com';

-- ============================================
-- USUARIOS
-- ============================================

INSERT INTO public.usuarios (email, password_hash, nombre_completo, rol, telefono, activo) VALUES
    ('admin@inventario.com', crypt('admin123', gen_salt('bf')), 'Diego Larico', 'administrador', '987654321', true),
    ('operario@inventario.com', crypt('operario123', gen_salt('bf')), 'Carlos Mendoza', 'operario', '912345678', true),
    ('vendedor@inventario.com', crypt('vendedor123', gen_salt('bf')), 'Ana Torres', 'vendedor', '923456789', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- CLIENTES
-- ============================================

INSERT INTO public.clientes (nombre_completo, email, telefono, direccion, documento, tipo_documento, tipo_cliente, descuento_porcentaje, activo) VALUES
    ('María García Pérez', 'maria.garcia@email.com', '987654321', 'Av. Principal 123, Miraflores, Lima', '45678912', 'DNI', 'vip', 10, true),
    ('Juan Pérez López', 'juan.perez@email.com', '912345678', 'Jr. Comercio 456, Ica', '78912345', 'DNI', 'regular', 0, true),
    ('Empresa Textil SAC', 'ventas@textilsac.com', '956789123', 'Av. Industrial 789, Lima', '20123456789', 'RUC', 'mayorista', 15, true),
    ('Rosa Martínez', 'rosa.martinez@email.com', '934567891', 'Calle Las Flores 234, San Isidro', '56789123', 'DNI', 'regular', 0, true),
    ('Luis Rodríguez', 'luis.rodriguez@email.com', '945678912', 'Av. Arequipa 567, Lima', '34567891', 'DNI', 'vip', 12, true),
    ('Boutique Fashion EIRL', 'contacto@fashionboutique.com', '967891234', 'Calle Conquistadores 890, Cusco', '20987654321', 'RUC', 'mayorista', 18, true),
    ('Carmen Silva', 'carmen.silva@email.com', '978912345', 'Jr. Libertad 345, Arequipa', '67891234', 'DNI', 'regular', 0, true),
    ('Pedro Castillo', 'pedro.castillo@email.com', '989123456', 'Av. Sol 678, Trujillo', '89123456', 'DNI', 'regular', 0, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- MATERIALES
-- ============================================

-- Obtener IDs de categorías (necesarios para foreign keys)
DO $$
DECLARE
    cat_hilo VARCHAR(20);
    cat_tela VARCHAR(20);
    cat_boton VARCHAR(20);
    cat_cremallera VARCHAR(20);
    cat_accesorio VARCHAR(20);
    cat_etiqueta VARCHAR(20);
    usr_admin VARCHAR(20);
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_hilo FROM public.categorias_materiales WHERE nombre = 'Hilo' LIMIT 1;
    SELECT id INTO cat_tela FROM public.categorias_materiales WHERE nombre = 'Tela' LIMIT 1;
    SELECT id INTO cat_boton FROM public.categorias_materiales WHERE nombre = 'Botón' LIMIT 1;
    SELECT id INTO cat_cremallera FROM public.categorias_materiales WHERE nombre = 'Cremallera' LIMIT 1;
    SELECT id INTO cat_accesorio FROM public.categorias_materiales WHERE nombre = 'Accesorio' LIMIT 1;
    SELECT id INTO cat_etiqueta FROM public.categorias_materiales WHERE nombre = 'Etiqueta' LIMIT 1;
    SELECT id INTO usr_admin FROM public.usuarios WHERE email = 'admin@inventario.com' LIMIT 1;

    -- Insertar materiales
    INSERT INTO public.materiales (codigo, nombre, categoria_id, tipo, cantidad, unidad, stock_minimo, precio_unitario, proveedor, ubicacion, color, estado, created_by) VALUES
        -- Hilos
        ('HIL-001', 'Hilo Poliéster Blanco', cat_hilo, 'Poliéster', 150, 'unidades', 50, 3.50, 'Textiles del Sur', 'Almacén A1', 'Blanco', 'disponible', usr_admin),
        ('HIL-002', 'Hilo Poliéster Negro', cat_hilo, 'Poliéster', 120, 'unidades', 50, 3.50, 'Textiles del Sur', 'Almacén A1', 'Negro', 'disponible', usr_admin),
        ('HIL-003', 'Hilo Poliéster Azul', cat_hilo, 'Poliéster', 80, 'unidades', 50, 3.50, 'Textiles del Sur', 'Almacén A1', 'Azul', 'disponible', usr_admin),
        ('HIL-004', 'Hilo Poliéster Rojo', cat_hilo, 'Poliéster', 45, 'unidades', 50, 3.50, 'Textiles del Sur', 'Almacén A1', 'Rojo', 'bajo_stock', usr_admin),
        ('HIL-005', 'Hilo Algodón Beige', cat_hilo, 'Algodón', 90, 'unidades', 40, 4.20, 'Hilos Premium', 'Almacén A1', 'Beige', 'disponible', usr_admin),
        
        -- Telas
        ('TEL-001', 'Tela Algodón Blanco', cat_tela, 'Algodón', 250, 'metros', 100, 15.50, 'Telas Import', 'Almacén B2', 'Blanco', 'disponible', usr_admin),
        ('TEL-002', 'Tela Denim Azul', cat_tela, 'Denim', 180, 'metros', 80, 22.00, 'Telas Import', 'Almacén B2', 'Azul', 'disponible', usr_admin),
        ('TEL-003', 'Tela Jersey Negro', cat_tela, 'Jersey', 95, 'metros', 100, 18.50, 'Textiles Express', 'Almacén B2', 'Negro', 'bajo_stock', usr_admin),
        ('TEL-004', 'Tela Gabardina Beige', cat_tela, 'Gabardina', 160, 'metros', 70, 25.00, 'Telas Import', 'Almacén B2', 'Beige', 'disponible', usr_admin),
        ('TEL-005', 'Tela Seda Roja', cat_tela, 'Seda', 55, 'metros', 60, 45.00, 'Importadora Textil', 'Almacén B3', 'Roja', 'bajo_stock', usr_admin),
        ('TEL-006', 'Tela Lino Crema', cat_tela, 'Lino', 120, 'metros', 80, 28.00, 'Textiles Express', 'Almacén B2', 'Crema', 'disponible', usr_admin),
        
        -- Botones
        ('BOT-001', 'Botones Plástico Blanco 15mm', cat_boton, 'Plástico', 2500, 'unidades', 500, 0.08, 'Accesorios Rápidos', 'Almacén C1', 'Blanco', 'disponible', usr_admin),
        ('BOT-002', 'Botones Metal Negro 18mm', cat_boton, 'Metal', 1200, 'unidades', 500, 0.25, 'Accesorios Rápidos', 'Almacén C1', 'Negro', 'disponible', usr_admin),
        ('BOT-003', 'Botones Madera Natural 20mm', cat_boton, 'Madera', 450, 'unidades', 500, 0.35, 'Botones Artesanales', 'Almacén C1', 'Natural', 'bajo_stock', usr_admin),
        ('BOT-004', 'Botones Nácar 12mm', cat_boton, 'Nácar', 800, 'unidades', 400, 0.50, 'Botones Premium', 'Almacén C1', 'Blanco', 'disponible', usr_admin),
        
        -- Cremalleras
        ('CRE-001', 'Cremallera Metal 20cm Negro', cat_cremallera, 'Metal', 350, 'unidades', 100, 2.50, 'Cierres Industriales', 'Almacén C2', 'Negro', 'disponible', usr_admin),
        ('CRE-002', 'Cremallera Plástico 30cm Blanco', cat_cremallera, 'Plástico', 280, 'unidades', 100, 1.80, 'Cierres Industriales', 'Almacén C2', 'Blanco', 'disponible', usr_admin),
        ('CRE-003', 'Cremallera Metal 50cm Azul', cat_cremallera, 'Metal', 95, 'unidades', 100, 3.20, 'Cierres Industriales', 'Almacén C2', 'Azul', 'bajo_stock', usr_admin),
        ('CRE-004', 'Cremallera Invisible 40cm Negro', cat_cremallera, 'Invisible', 180, 'unidades', 80, 4.50, 'Cierres Premium', 'Almacén C2', 'Negro', 'disponible', usr_admin),
        
        -- Accesorios
        ('ACC-001', 'Elástico 3cm Blanco', cat_accesorio, 'Elástico', 200, 'metros', 80, 2.20, 'Accesorios Varios', 'Almacén C3', 'Blanco', 'disponible', usr_admin),
        ('ACC-002', 'Entretela Blanca', cat_accesorio, 'Entretela', 150, 'metros', 100, 5.50, 'Forros y Más', 'Almacén C3', 'Blanco', 'disponible', usr_admin),
        ('ACC-003', 'Ribete Negro 2cm', cat_accesorio, 'Ribete', 120, 'metros', 60, 1.80, 'Accesorios Varios', 'Almacén C3', 'Negro', 'disponible', usr_admin),
        ('ACC-004', 'Velcro Adhesivo 5cm', cat_accesorio, 'Velcro', 85, 'metros', 50, 3.80, 'Accesorios Técnicos', 'Almacén C3', 'Blanco', 'disponible', usr_admin),
        
        -- Etiquetas
        ('ETI-001', 'Etiquetas Talla S-M-L-XL', cat_etiqueta, 'Talla', 5000, 'unidades', 1000, 0.05, 'Etiquetas Pro', 'Almacén D1', 'Blanco', 'disponible', usr_admin),
        ('ETI-002', 'Etiquetas Composición', cat_etiqueta, 'Composición', 3500, 'unidades', 1000, 0.06, 'Etiquetas Pro', 'Almacén D1', 'Blanco', 'disponible', usr_admin),
        ('ETI-003', 'Etiquetas Marca Personalizadas', cat_etiqueta, 'Marca', 2000, 'unidades', 500, 0.15, 'Etiquetas Premium', 'Almacén D1', 'Varios', 'disponible', usr_admin),
        ('ETI-004', 'Etiquetas Cuidado Lavado', cat_etiqueta, 'Cuidado', 4200, 'unidades', 1000, 0.04, 'Etiquetas Pro', 'Almacén D1', 'Blanco', 'disponible', usr_admin)
    ON CONFLICT (codigo) DO NOTHING;
END $$;

-- ============================================
-- PRODUCTOS
-- ============================================

DO $$
DECLARE
    cat_polo VARCHAR(20);
    cat_pantalon VARCHAR(20);
    cat_vestido VARCHAR(20);
    cat_chaqueta VARCHAR(20);
    cat_falda VARCHAR(20);
    cat_camisa VARCHAR(20);
    cat_short VARCHAR(20);
    usr_admin VARCHAR(20);
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_polo FROM public.categorias_productos WHERE nombre = 'Polo' LIMIT 1;
    SELECT id INTO cat_pantalon FROM public.categorias_productos WHERE nombre = 'Pantalón' LIMIT 1;
    SELECT id INTO cat_vestido FROM public.categorias_productos WHERE nombre = 'Vestido' LIMIT 1;
    SELECT id INTO cat_chaqueta FROM public.categorias_productos WHERE nombre = 'Chaqueta' LIMIT 1;
    SELECT id INTO cat_falda FROM public.categorias_productos WHERE nombre = 'Falda' LIMIT 1;
    SELECT id INTO cat_camisa FROM public.categorias_productos WHERE nombre = 'Camisa' LIMIT 1;
    SELECT id INTO cat_short FROM public.categorias_productos WHERE nombre = 'Short' LIMIT 1;
    SELECT id INTO usr_admin FROM public.usuarios WHERE email = 'admin@inventario.com' LIMIT 1;

    -- Insertar productos
    INSERT INTO public.productos (codigo, nombre, categoria_id, descripcion, precio, costo, stock, stock_minimo, tallas, colores, estado, imagen_url, created_by) VALUES
        -- Polos
        ('PROD-001', 'Polo Básico Algodón', cat_polo, 'Polo básico 100% algodón, diseño clásico', 45.00, 22.00, 85, 20, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Blanco', 'Negro', 'Gris'], 'disponible', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', usr_admin),
        ('PROD-002', 'Polo Deportivo Dri-Fit', cat_polo, 'Polo deportivo con tecnología absorbente', 65.00, 32.00, 55, 20, ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Azul', 'Negro', 'Rojo'], 'disponible', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400', usr_admin),
        ('PROD-003', 'Polo Cuello V Premium', cat_polo, 'Polo cuello V en algodón pima', 55.00, 28.00, 42, 20, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Blanco', 'Azul', 'Verde'], 'disponible', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', usr_admin),
        ('PROD-004', 'Polo Manga Larga Térmico', cat_polo, 'Polo térmico ideal para clima frío', 70.00, 35.00, 15, 20, ARRAY['M', 'L', 'XL'], ARRAY['Negro', 'Gris'], 'bajo_stock', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', usr_admin),
        
        -- Pantalones
        ('PROD-005', 'Pantalón Jean Clásico', cat_pantalon, 'Jean clásico corte recto, denim de calidad', 120.00, 65.00, 68, 15, ARRAY['28', '30', '32', '34', '36'], ARRAY['Azul', 'Negro'], 'disponible', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', usr_admin),
        ('PROD-006', 'Pantalón Drill Beige', cat_pantalon, 'Pantalón drill casual, tela resistente', 95.00, 48.00, 52, 15, ARRAY['28', '30', '32', '34', '36'], ARRAY['Beige', 'Negro', 'Azul'], 'disponible', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400', usr_admin),
        ('PROD-007', 'Pantalón Jogger Deportivo', cat_pantalon, 'Pantalón jogger estilo urbano', 85.00, 42.00, 38, 15, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Negro', 'Gris', 'Azul'], 'disponible', 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400', usr_admin),
        ('PROD-008', 'Pantalón Cargo Verde', cat_pantalon, 'Pantalón cargo con múltiples bolsillos', 110.00, 55.00, 12, 15, ARRAY['30', '32', '34', '36'], ARRAY['Verde', 'Beige'], 'bajo_stock', 'https://images.unsplash.com/photo-1608481337062-4093bf3ed404?w=400', usr_admin),
        
        -- Vestidos
        ('PROD-009', 'Vestido Casual Verano', cat_vestido, 'Vestido ligero ideal para verano', 135.00, 68.00, 45, 10, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Floral', 'Azul', 'Rosa'], 'disponible', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', usr_admin),
        ('PROD-010', 'Vestido Elegante Negro', cat_vestido, 'Vestido elegante para ocasiones especiales', 180.00, 90.00, 28, 10, ARRAY['S', 'M', 'L'], ARRAY['Negro'], 'disponible', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400', usr_admin),
        ('PROD-011', 'Vestido Midi Estampado', cat_vestido, 'Vestido midi con diseño moderno', 155.00, 78.00, 35, 10, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Estampado', 'Rojo', 'Azul'], 'disponible', 'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=400', usr_admin),
        
        -- Chaquetas
        ('PROD-012', 'Chaqueta Jean Clásica', cat_chaqueta, 'Chaqueta de jean estilo clásico', 145.00, 72.00, 32, 12, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Azul', 'Negro'], 'disponible', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', usr_admin),
        ('PROD-013', 'Chaqueta Bomber Negra', cat_chaqueta, 'Chaqueta bomber urbana', 165.00, 82.00, 22, 12, ARRAY['M', 'L', 'XL', 'XXL'], ARRAY['Negro', 'Verde'], 'disponible', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', usr_admin),
        ('PROD-014', 'Chaqueta Cuero Sintético', cat_chaqueta, 'Chaqueta de cuero sintético premium', 220.00, 110.00, 8, 12, ARRAY['M', 'L', 'XL'], ARRAY['Negro', 'Marrón'], 'bajo_stock', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', usr_admin),
        
        -- Faldas
        ('PROD-015', 'Falda Jean A-Line', cat_falda, 'Falda de jean corte A-line', 75.00, 38.00, 48, 15, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Azul', 'Negro'], 'disponible', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400', usr_admin),
        ('PROD-016', 'Falda Plisada Elegante', cat_falda, 'Falda plisada para oficina', 85.00, 42.00, 36, 15, ARRAY['S', 'M', 'L'], ARRAY['Negro', 'Gris', 'Beige'], 'disponible', 'https://images.unsplash.com/photo-1616847220575-c5ee1b4e8bc4?w=400', usr_admin),
        
        -- Camisas
        ('PROD-017', 'Camisa Formal Blanca', cat_camisa, 'Camisa formal de vestir', 95.00, 48.00, 58, 20, ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Blanco'], 'disponible', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', usr_admin),
        ('PROD-018', 'Camisa Casual Rayas', cat_camisa, 'Camisa casual con rayas', 75.00, 38.00, 44, 20, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Azul', 'Rosa', 'Verde'], 'disponible', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', usr_admin),
        ('PROD-019', 'Camisa Lino Verano', cat_camisa, 'Camisa de lino ligera', 105.00, 52.00, 28, 20, ARRAY['M', 'L', 'XL'], ARRAY['Blanco', 'Beige', 'Celeste'], 'disponible', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', usr_admin),
        
        -- Shorts
        ('PROD-020', 'Short Jean Bermuda', cat_short, 'Short de jean estilo bermuda', 65.00, 32.00, 52, 18, ARRAY['28', '30', '32', '34'], ARRAY['Azul', 'Negro'], 'disponible', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400', usr_admin),
        ('PROD-021', 'Short Deportivo Running', cat_short, 'Short deportivo para running', 55.00, 28.00, 65, 18, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Negro', 'Azul', 'Rojo'], 'disponible', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400', usr_admin)
    ON CONFLICT (codigo) DO NOTHING;
END $$;

-- ============================================
-- PRODUCTOS - MATERIALES (Relación)
-- ============================================

DO $$
DECLARE
    prod_polo1 VARCHAR(20);
    prod_pantalon1 VARCHAR(20);
    mat_tela_algodon VARCHAR(20);
    mat_tela_denim VARCHAR(20);
    mat_hilo_blanco VARCHAR(20);
    mat_hilo_negro VARCHAR(20);
    mat_boton VARCHAR(20);
    mat_etiqueta VARCHAR(20);
BEGIN
    -- Obtener algunos IDs de productos y materiales
    SELECT id INTO prod_polo1 FROM public.productos WHERE codigo = 'PROD-001' LIMIT 1;
    SELECT id INTO prod_pantalon1 FROM public.productos WHERE codigo = 'PROD-005' LIMIT 1;
    SELECT id INTO mat_tela_algodon FROM public.materiales WHERE codigo = 'TEL-001' LIMIT 1;
    SELECT id INTO mat_tela_denim FROM public.materiales WHERE codigo = 'TEL-002' LIMIT 1;
    SELECT id INTO mat_hilo_blanco FROM public.materiales WHERE codigo = 'HIL-001' LIMIT 1;
    SELECT id INTO mat_hilo_negro FROM public.materiales WHERE codigo = 'HIL-002' LIMIT 1;
    SELECT id INTO mat_boton FROM public.materiales WHERE codigo = 'BOT-001' LIMIT 1;
    SELECT id INTO mat_etiqueta FROM public.materiales WHERE codigo = 'ETI-001' LIMIT 1;

    -- Relacionar productos con materiales
    IF prod_polo1 IS NOT NULL AND mat_tela_algodon IS NOT NULL THEN
        INSERT INTO public.productos_materiales (producto_id, material_id, cantidad_necesaria, unidad) VALUES
            (prod_polo1, mat_tela_algodon, 1.2, 'metros'),
            (prod_polo1, mat_hilo_blanco, 2, 'unidades'),
            (prod_polo1, mat_etiqueta, 2, 'unidades')
        ON CONFLICT (producto_id, material_id) DO NOTHING;
    END IF;

    IF prod_pantalon1 IS NOT NULL AND mat_tela_denim IS NOT NULL THEN
        INSERT INTO public.productos_materiales (producto_id, material_id, cantidad_necesaria, unidad) VALUES
            (prod_pantalon1, mat_tela_denim, 1.8, 'metros'),
            (prod_pantalon1, mat_hilo_negro, 3, 'unidades'),
            (prod_pantalon1, mat_boton, 5, 'unidades'),
            (prod_pantalon1, mat_etiqueta, 2, 'unidades')
        ON CONFLICT (producto_id, material_id) DO NOTHING;
    END IF;
END $$;

-- ============================================
-- PEDIDOS
-- ============================================

DO $$
DECLARE
    cli1 VARCHAR(20);
    cli2 VARCHAR(20);
    cli3 VARCHAR(20);
    cli4 VARCHAR(20);
    usr_admin VARCHAR(20);
    ped1 VARCHAR(20);
    ped2 VARCHAR(20);
    ped3 VARCHAR(20);
    ped4 VARCHAR(20);
    prod1 VARCHAR(20);
    prod2 VARCHAR(20);
    prod5 VARCHAR(20);
    prod9 VARCHAR(20);
BEGIN
    -- Obtener IDs
    SELECT id INTO cli1 FROM public.clientes WHERE nombre_completo = 'María García Pérez' LIMIT 1;
    SELECT id INTO cli2 FROM public.clientes WHERE nombre_completo = 'Juan Pérez López' LIMIT 1;
    SELECT id INTO cli3 FROM public.clientes WHERE nombre_completo = 'Empresa Textil SAC' LIMIT 1;
    SELECT id INTO cli4 FROM public.clientes WHERE nombre_completo = 'Rosa Martínez' LIMIT 1;
    SELECT id INTO usr_admin FROM public.usuarios WHERE email = 'admin@inventario.com' LIMIT 1;

    -- Insertar pedidos
    INSERT INTO public.pedidos (numero_pedido, cliente_id, cliente_nombre, cliente_telefono, estado, prioridad, fecha_entrega, metodo_pago, anticipo, descuento, impuestos, notas, created_by, fecha_pedido) VALUES
        ('PED-20241201-0001', cli1, 'María García Pérez', '987654321', 'Pendiente', 'Alta', '2024-12-10', 'Transferencia', 100.00, 0, 0, 'Cliente VIP - Entregar antes de las 3pm', usr_admin, NOW() - INTERVAL '2 days'),
        ('PED-20241202-0002', cli2, 'Juan Pérez López', '912345678', 'En Proceso', 'Media', '2024-12-08', 'Efectivo', 0, 0, 0, 'Confirmar dirección antes de enviar', usr_admin, NOW() - INTERVAL '1 day'),
        ('PED-20241203-0003', cli3, 'Empresa Textil SAC', '956789123', 'Pendiente', 'Alta', '2024-12-15', 'Transferencia', 500.00, 150.00, 0, 'Pedido corporativo - 15% descuento', usr_admin, NOW()),
        ('PED-20241204-0004', cli4, 'Rosa Martínez', '934567891', 'Completado', 'Baja', '2024-12-05', 'Yape/Plin', 145.00, 0, 0, 'Pedido completado y entregado', usr_admin, NOW() - INTERVAL '5 days'),
        ('PED-20241205-0005', NULL, 'Cliente Anónimo Walk-in', '999888777', 'En Proceso', 'Media', '2024-12-07', 'Efectivo', 50.00, 0, 0, 'Cliente sin registro - Venta directa', usr_admin, NOW())
    ON CONFLICT (numero_pedido) DO NOTHING;

    -- Obtener IDs de pedidos insertados
    SELECT id INTO ped1 FROM public.pedidos WHERE numero_pedido = 'PED-20241201-0001' LIMIT 1;
    SELECT id INTO ped2 FROM public.pedidos WHERE numero_pedido = 'PED-20241202-0002' LIMIT 1;
    SELECT id INTO ped3 FROM public.pedidos WHERE numero_pedido = 'PED-20241203-0003' LIMIT 1;
    SELECT id INTO ped4 FROM public.pedidos WHERE numero_pedido = 'PED-20241204-0004' LIMIT 1;

    -- Obtener IDs de productos
    SELECT id INTO prod1 FROM public.productos WHERE codigo = 'PROD-001' LIMIT 1;
    SELECT id INTO prod2 FROM public.productos WHERE codigo = 'PROD-002' LIMIT 1;
    SELECT id INTO prod5 FROM public.productos WHERE codigo = 'PROD-005' LIMIT 1;
    SELECT id INTO prod9 FROM public.productos WHERE codigo = 'PROD-009' LIMIT 1;

    -- Insertar detalles de pedidos
    IF ped1 IS NOT NULL AND prod1 IS NOT NULL THEN
        INSERT INTO public.detalles_pedido (pedido_id, producto_id, producto_nombre, cantidad, precio_unitario, talla, color, notas) VALUES
            (ped1, prod1, 'Polo Básico Algodón', 3, 45.00, 'M', 'Blanco', 'Cliente prefiere talla M'),
            (ped1, prod2, 'Polo Deportivo Dri-Fit', 2, 65.00, 'L', 'Azul', NULL)
        ON CONFLICT DO NOTHING;
    END IF;

    IF ped2 IS NOT NULL AND prod5 IS NOT NULL THEN
        INSERT INTO public.detalles_pedido (pedido_id, producto_id, producto_nombre, cantidad, precio_unitario, talla, color, notas) VALUES
            (ped2, prod5, 'Pantalón Jean Clásico', 1, 120.00, '32', 'Azul', 'Talla verificada con cliente')
        ON CONFLICT DO NOTHING;
    END IF;

    IF ped3 IS NOT NULL AND prod1 IS NOT NULL THEN
        INSERT INTO public.detalles_pedido (pedido_id, producto_id, producto_nombre, cantidad, precio_unitario, talla, color, notas) VALUES
            (ped3, prod1, 'Polo Básico Algodón', 50, 45.00, 'M', 'Blanco', 'Pedido corporativo al por mayor'),
            (ped3, prod1, 'Polo Básico Algodón', 50, 45.00, 'L', 'Negro', 'Pedido corporativo al por mayor'),
            (ped3, prod5, 'Pantalón Jean Clásico', 30, 120.00, '32', 'Azul', 'Pedido corporativo al por mayor')
        ON CONFLICT DO NOTHING;
    END IF;

    IF ped4 IS NOT NULL AND prod9 IS NOT NULL THEN
        INSERT INTO public.detalles_pedido (pedido_id, producto_id, producto_nombre, cantidad, precio_unitario, talla, color, notas) VALUES
            (ped4, prod9, 'Vestido Casual Verano', 1, 135.00, 'M', 'Floral', 'Pedido completado')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================
-- NOTIFICACIONES
-- ============================================

DO $$
DECLARE
    usr_admin VARCHAR(20);
BEGIN
    SELECT id INTO usr_admin FROM public.usuarios WHERE email = 'admin@inventario.com' LIMIT 1;

    INSERT INTO public.notificaciones (usuario_id, tipo, titulo, mensaje, leida, created_at) VALUES
        (usr_admin, 'alert', 'Stock Bajo', 'El material "Hilo Poliéster Rojo" está por debajo del stock mínimo', false, NOW()),
        (usr_admin, 'alert', 'Stock Bajo', 'El material "Tela Jersey Negro" está por debajo del stock mínimo', false, NOW() - INTERVAL '2 hours'),
        (usr_admin, 'order', 'Nuevo Pedido', 'Se ha creado un nuevo pedido PED-20241205-0005', false, NOW()),
        (usr_admin, 'success', 'Pedido Completado', 'El pedido PED-20241204-0004 ha sido completado', true, NOW() - INTERVAL '1 day'),
        (usr_admin, 'warning', 'Pedido Próximo a Vencer', 'El pedido PED-20241202-0002 debe ser entregado en 3 días', false, NOW() - INTERVAL '3 hours'),
        (usr_admin, 'info', 'Actualización de Sistema', 'Nueva funcionalidad de reportes disponible', true, NOW() - INTERVAL '2 days')
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- TAREAS
-- ============================================

DO $$
DECLARE
    usr_admin VARCHAR(20);
    usr_operario VARCHAR(20);
BEGIN
    SELECT id INTO usr_admin FROM public.usuarios WHERE email = 'admin@inventario.com' LIMIT 1;
    SELECT id INTO usr_operario FROM public.usuarios WHERE email = 'operario@inventario.com' LIMIT 1;

    INSERT INTO public.tareas (usuario_id, titulo, descripcion, completada, prioridad, fecha_vencimiento, orden) VALUES
        (usr_admin, 'Revisar inventario de telas', 'Hacer conteo físico de todas las telas en Almacén B2', false, 'alta', CURRENT_DATE + INTERVAL '2 days', 1),
        (usr_admin, 'Contactar proveedor de hilos', 'Solicitar cotización para restock de hilos de colores', false, 'media', CURRENT_DATE + INTERVAL '5 days', 2),
        (usr_operario, 'Preparar pedido PED-20241201-0001', 'Separar productos y empaquetar para envío', false, 'alta', CURRENT_DATE + INTERVAL '1 day', 1),
        (usr_operario, 'Etiquetar productos nuevos', 'Colocar etiquetas a los productos PROD-020 y PROD-021', false, 'media', CURRENT_DATE + INTERVAL '3 days', 2),
        (usr_admin, 'Generar reporte de ventas', 'Crear reporte mensual de ventas de diciembre', true, 'baja', CURRENT_DATE - INTERVAL '1 day', 3)
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- MOVIMIENTOS DE INVENTARIO
-- ============================================

DO $$
DECLARE
    usr_admin VARCHAR(20);
    mat1 VARCHAR(20);
    prod1 VARCHAR(20);
BEGIN
    SELECT id INTO usr_admin FROM public.usuarios WHERE email = 'admin@inventario.com' LIMIT 1;
    SELECT id INTO mat1 FROM public.materiales WHERE codigo = 'HIL-001' LIMIT 1;
    SELECT id INTO prod1 FROM public.productos WHERE codigo = 'PROD-001' LIMIT 1;

    -- Registrar algunos movimientos de ejemplo
    INSERT INTO public.movimientos_inventario (tipo, tipo_item, item_id, item_nombre, cantidad, cantidad_anterior, cantidad_nueva, motivo, referencia, created_by, created_at) VALUES
        ('entrada', 'material', mat1, 'Hilo Poliéster Blanco', 50, 100, 150, 'Compra a proveedor', 'FAC-001', usr_admin, NOW() - INTERVAL '10 days'),
        ('salida', 'material', mat1, 'Hilo Poliéster Blanco', 10, 150, 140, 'Uso en producción', NULL, usr_admin, NOW() - INTERVAL '5 days'),
        ('salida', 'producto', prod1, 'Polo Básico Algodón', 5, 90, 85, 'Venta', 'PED-20241201-0001', usr_admin, NOW() - INTERVAL '2 days')
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- MENSAJE FINAL
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ DATOS DE PRUEBA INSERTADOS EXITOSAMENTE';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '📊 Resumen de datos insertados:';
    RAISE NOTICE '   • 3 Usuarios (admin, operario, vendedor)';
    RAISE NOTICE '   • 8 Clientes (incluyendo VIP y mayoristas)';
    RAISE NOTICE '   • 27 Materiales (hilos, telas, botones, etc.)';
    RAISE NOTICE '   • 21 Productos (polos, pantalones, vestidos, etc.)';
    RAISE NOTICE '   • 5 Pedidos (con diferentes estados)';
    RAISE NOTICE '   • 6 Notificaciones';
    RAISE NOTICE '   • 5 Tareas';
    RAISE NOTICE '   • 3 Movimientos de inventario';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '🔑 Credenciales de acceso:';
    RAISE NOTICE '   Admin: admin@inventario.com / admin123';
    RAISE NOTICE '   Operario: operario@inventario.com / operario123';
    RAISE NOTICE '   Vendedor: vendedor@inventario.com / vendedor123';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '⚠️  NOTAS IMPORTANTES:';
    RAISE NOTICE '   • Algunos productos están en estado "bajo_stock"';
    RAISE NOTICE '   • Hay pedidos pendientes que requieren atención';
    RAISE NOTICE '   • Las imágenes usan URLs de Unsplash (placeholder)';
    RAISE NOTICE '   • Los precios están en soles peruanos (S/)';
    RAISE NOTICE '═══════════════════════════════════════════════';
END $$;

-- ============================================
-- FIN DEL SCRIPT DE DATOS DE PRUEBA
-- ============================================
