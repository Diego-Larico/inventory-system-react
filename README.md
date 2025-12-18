# 📦 Sistema de Gestión de Inventario

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.83.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**Sistema web moderno para la gestión integral de inventario, productos, materiales y pedidos en empresas de manufactura de ropa.**

[Demo](#) · [Reportar Bug](../../issues) · [Solicitar Feature](../../issues)

</div>

---

## 🎯 Características Principales

### 📊 Dashboard Interactivo
- **Estadísticas en tiempo real**: Ventas totales, pedidos activos, stock de productos y materiales
- **Gráficos dinámicos**: Ventas mensuales, distribución por categorías, inventario
- **Alertas inteligentes**: Notificaciones de stock bajo/crítico
- **Actividad reciente**: Registro de acciones del sistema

### 🛍️ Gestión de Productos
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- 🔢 Códigos auto-generados (PROD001, PROD002...)
- 🏷️ Categorización flexible
- 📸 Carga de imágenes
- 📦 Control de stock con alertas
- 🎨 Gestión de tallas y colores
- 💰 Seguimiento de costos y precios

### 🧵 Gestión de Materiales
- 📝 Control de materias primas (telas, hilos, botones, etc.)
- 📊 Múltiples unidades de medida
- 🔄 Ajustes de inventario con motivos
- 🏢 Gestión de proveedores
- ⚠️ Alertas de stock mínimo

### 📋 Gestión de Pedidos
- 🚀 Creación de pedidos multi-paso
- 👥 Gestión de clientes integrada
- 📅 Fechas de entrega y seguimiento
- 🎯 Estados personalizables (Pendiente, En Proceso, Completado, Entregado)
- 💳 Métodos de pago y anticipos
- 📱 Vista Kanban y calendario

### 📈 Reportes y Analíticas
- 📊 Ventas mensuales y comparativos anuales
- 🏆 Productos más vendidos
- 💰 Márgenes de ganancia por producto
- 🔄 Rotación de inventario
- 👥 Análisis de clientes frecuentes
- 📥 Exportación a PDF y Excel

### ⚙️ Sistema Completo
- 🌓 Modo oscuro/claro
- 🔔 Sistema de notificaciones en tiempo real
- ✅ Lista de tareas pendientes
- 🔍 Búsqueda global
- 📱 Diseño responsivo
- 🎨 Animaciones fluidas con Framer Motion

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React** | 18.2.0 | Framework principal |
| **Vite** | 7.2.2 | Build tool & dev server |
| **Tailwind CSS** | 3.4.17 | Estilos y diseño |
| **Framer Motion** | 12.23.24 | Animaciones |
| **React Router** | 7.6.3 | Navegación SPA |
| **Recharts** | 2.15.0 | Gráficos y visualizaciones |
| **React Icons** | 4.12.0 | Iconografía |
| **SweetAlert2** | 11.15.10 | Modales elegantes |
| **React Hot Toast** | 2.4.1 | Notificaciones toast |

### Backend & Base de Datos
| Tecnología | Descripción |
|------------|-------------|
| **Supabase** | Backend as a Service (BaaS) |
| **PostgreSQL** | Base de datos relacional |
| **Supabase Auth** | Sistema de autenticación |
| **Supabase Storage** | Almacenamiento de imágenes |

### Herramientas de Desarrollo
- **Bun** - Package manager rápido
- **ESLint** - Linter de código
- **PostCSS & Autoprefixer** - Procesamiento de CSS

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ o **Bun** 1.0+
- **Git**
- Cuenta en [Supabase](https://supabase.com)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Diego-Larico/inventory-system-react.git
cd inventory-system-react
```

2. **Instalar dependencias**
```bash
# Con Bun (recomendado)
bun install

# O con npm
npm install
```

3. **Configurar Supabase**

Edita el archivo `src/supabaseClient.js`:

```javascript
const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseAnonKey = 'TU_SUPABASE_ANON_KEY';
```

> 💡 **Obtener credenciales:** Supabase Dashboard → Settings → API

4. **Configurar Base de Datos**

- Ve a Supabase Dashboard → SQL Editor
- Ejecuta el script de creación de tablas (disponible en documentación)
- Inserta categorías iniciales

5. **Ejecutar en desarrollo**
```bash
# Con Bun
bun run dev

# Con npm
npm run dev
```

6. **Abrir en navegador**
```
http://localhost:5173
```

---

## 📁 Estructura del Proyecto

```
inventory-system-react/
├── src/
│   ├── components/              # Componentes reutilizables
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── DashboardMain.jsx
│   │   ├── DashboardRightPanel.jsx
│   │   ├── Nuevo*.jsx           # Modales de creación
│   │   ├── Editar*.jsx          # Modales de edición
│   │   └── ...
│   ├── context/
│   │   └── ThemeContext.jsx     # Context API para tema
│   ├── services/                # Servicios de API
│   │   ├── productosService.js
│   │   ├── materialesService.js
│   │   ├── pedidosService.js
│   │   ├── clientesService.js
│   │   ├── dashboardService.js
│   │   ├── reportesService.js
│   │   └── ...
│   ├── styles/                  # Estilos globales
│   ├── utils/                   # Utilidades
│   │   ├── confirmationModals.js
│   │   ├── notifications.js
│   │   └── iconMapping.js
│   ├── App.jsx                  # Componente raíz
│   ├── Login.jsx                # Autenticación
│   ├── *View.jsx                # Vistas principales
│   ├── supabaseClient.js        # Cliente Supabase
│   └── main.jsx                 # Entry point
├── public/                      # Assets estáticos
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
bun run dev          # Inicia servidor de desarrollo
npm run dev

# Producción
bun run build        # Construye para producción
npm run build

bun run preview      # Preview del build
npm run preview

# Linting
bun run lint         # Analiza código con ESLint
npm run lint
```

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales

- **productos** - Productos terminados (PROD001, PROD002...)
- **materiales** - Materias primas (MAT001, MAT002...)
- **pedidos** - Pedidos de clientes (PED001, PED002...)
- **detalles_pedido** - Líneas de pedidos
- **clientes** - Base de clientes (CLI001, CLI002...)
- **categorias_productos** - Categorías de productos
- **categorias_materiales** - Categorías de materiales
- **notificaciones** - Sistema de alertas
- **tareas** - Lista de tareas pendientes
- **configuraciones** - Configuración del sistema

### Relaciones

```
clientes 1 ──── N pedidos 1 ──── N detalles_pedido N ──── 1 productos
categorias_productos 1 ──── N productos
categorias_materiales 1 ──── N materiales
```

---

## 🔐 Autenticación

El sistema utiliza **Supabase Auth** con email y contraseña.

```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@ejemplo.com',
  password: 'contraseña'
});

// Logout
await supabase.auth.signOut();
```

---

## 🎨 Personalización

### Colores Principales

El sistema utiliza una paleta de colores personalizada:

```css
/* Gradiente principal */
--primary: #8f5cff → #6e7ff3

/* Estados */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

### Modo Oscuro

El tema oscuro se activa/desactiva desde:
- Botón en Topbar
- Configuración del sistema
- Persistencia en `localStorage`

---

## 📦 Build y Deployment

### Build de Producción

```bash
bun run build
# Output: dist/
```

### Variables de Entorno

Para producción, crea `.env.production`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Opciones de Deployment

| Plataforma | Configuración |
|------------|---------------|
| **Vercel** | Framework: Vite, Build: `bun run build`, Output: `dist` |
| **Netlify** | Build command: `bun run build`, Publish: `dist` |
| **GitHub Pages** | Configurar `base` en `vite.config.js` |
| **VPS** | Apache/Nginx con SPA rewrites |

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push al Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- **Componentes:** `PascalCase.jsx`
- **Servicios:** `camelCase.js`
- **Variables:** `camelCase`
- **Constantes:** `UPPER_SNAKE_CASE`

---

## 🐛 Reportar Issues

Si encuentras un bug o tienes una sugerencia:

1. Verifica que no exista un issue similar
2. Crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots (si aplica)
   - Información del entorno

---

## 📝 Roadmap

- [ ] Sistema de roles y permisos
- [ ] Módulo de proveedores completo
- [ ] Integración con pasarela de pagos
- [ ] Aplicación móvil (React Native)
- [ ] Sistema de códigos de barras/QR
- [ ] Notificaciones push
- [ ] API pública REST
- [ ] Migración a TypeScript
- [ ] Tests automatizados
- [ ] PWA (Progressive Web App)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- [React](https://react.dev/) - Framework UI
- [Vite](https://vitejs.dev/) - Build tool
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Recharts](https://recharts.org/) - Librería de gráficos
- [Framer Motion](https://www.framer.com/motion/) - Animaciones

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella ⭐**

Hecho con ❤️ por [Diego Larico](https://github.com/Diego-Larico)

</div>
