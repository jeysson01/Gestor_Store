# Sistema de Gestión de Inventario y Compras

Una aplicación profesional de gestión de inventario y compras construida con Next.js 16, Neon PostgreSQL y Tailwind CSS.

## 🚀 Características

- **Dashboard**: Estadísticas en tiempo real, gráficos y alertas de stock
- **Gestión de Productos**: CRUD completo, búsqueda, categorías y control de stock
- **Sistema de Compras**: Crear órdenes, rastrear estado, recibir parcialmente
- **Alertas de Stock**: Notificaciones automáticas de stock bajo
- **Reportes**: Exportación a Excel de productos y compras
- **Movimientos de Stock**: Registro completo de todas las transacciones
- **Interfaz moderna**: Diseño minimalista blanco/negro tipo Stripe/Notion

## 📋 Requisitos

- Node.js 18+
- pnpm (o npm/yarn)
- Base de datos Neon PostgreSQL
- Vercel (para despliegue)

## 🔧 Configuración Local

### 1. Clonar y instalar dependencias

```bash
git clone <repository>
cd proyecto
pnpm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host/database
NEON_AUTH_COOKIE_SECRET=tu_secret_generado_con_openssl
```

Para generar el secret:
```bash
openssl rand -base64 32
```

### 3. Ejecutar migraciones

```bash
pnpm tsx lib/db/migrate.ts
```

### 4. Iniciar servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
├── app/
│   ├── page.tsx              # Dashboard
│   ├── productos/            # Gestión de productos
│   ├── compras/              # Gestión de compras
│   ├── reportes/             # Reportes y exportaciones
│   └── layout.tsx            # Layout raíz
├── components/
│   ├── navigation.tsx        # Navegación
│   ├── dashboard-stats.tsx   # Estadísticas del dashboard
│   ├── products-list.tsx     # Listado de productos
│   └── purchases-list.tsx    # Listado de compras
├── lib/
│   ├── db/
│   │   ├── schema.ts         # Esquema de base de datos
│   │   ├── index.ts          # Conexión a BD
│   │   ├── migrate.ts        # Script de migraciones
│   │   └── migrations/       # Archivos de migración
│   ├── actions/
│   │   ├── products.ts       # Server actions de productos
│   │   ├── purchases.ts      # Server actions de compras
│   │   └── export.ts         # Server actions de exportación
│   └── validations/
│       └── index.ts          # Schemas de validación con Zod
└── public/                   # Archivos estáticos
```

## 🗄️ Esquema de Base de Datos

### Tablas principales:

- **products**: Catálogo de productos
- **purchases**: Órdenes de compra
- **purchase_details**: Líneas de detalle de compras
- **categories**: Categorías de productos
- **stock_movements**: Historial de cambios de stock
- **users**: Usuarios (integrado con Better Auth)

## 🔐 Seguridad

- **Validación**: Todos los datos se validan con Zod
- **Server Actions**: Las operaciones sensibles se ejecutan en el servidor
- **Parámetros**: Se usan parámetros seguros para evitar SQL injection
- **Caché**: Revalidación automática de datos con `revalidateTag`

## 🚀 Despliegue en Vercel

### 1. Push a GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Conectar Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repositorio de GitHub
3. Configura variables de entorno:
   - `DATABASE_URL`
   - `NEON_AUTH_COOKIE_SECRET`
4. Click en "Deploy"

### 3. Aplicar migraciones en producción

Después del despliegue, ejecuta migraciones en Vercel:

```bash
vercel env pull
pnpm tsx lib/db/migrate.ts
```

O usa una función serverless para ejecutarlas automáticamente.

## 📊 APIs / Server Actions

### Productos
- `getProducts(search?)` - Obtener productos
- `createProduct(data)` - Crear producto
- `updateProduct(id, data)` - Actualizar producto
- `deleteProduct(id)` - Eliminar producto
- `adjustStock(productId, quantity, type)` - Ajustar stock
- `getStockAlerts()` - Obtener alertas de stock

### Compras
- `getPurchases()` - Obtener compras
- `createPurchase(data)` - Crear compra
- `getPurchaseById(id)` - Obtener detalle de compra
- `updatePurchaseStatus(id, data)` - Actualizar estado
- `receivePurchaseItems(purchaseId, items)` - Registrar recepción
- `getPurchaseStats()` - Estadísticas de compras

### Reportes
- `exportProductsToExcel()` - Exportar productos
- `exportPurchasesToExcel()` - Exportar compras
- `exportDetailedPurchaseToExcel(purchaseId)` - Exportar detalle

## 🎨 Personalización

### Temas y colores

Los colores se definen en `globals.css` usando CSS variables. Modifica los tokens de diseño:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.6%;
  --border: 0 0% 89.8%;
  --accent: 0 0% 0%;
  --accent-foreground: 0 0% 100%;
  /* ... más variables */
}
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit los cambios (`git commit -m 'Agrega mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo licencia MIT.

## 📧 Soporte

Para reportar problemas o sugerencias, abre un issue en GitHub.
