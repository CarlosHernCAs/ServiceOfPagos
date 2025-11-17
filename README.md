# 💼 Sistema de Facturación Completo

Sistema completo de facturación electrónica desarrollado con Node.js, Express, PostgreSQL, React y TypeScript.

## 🚀 Stack Tecnológico

### Backend
- **Node.js 20 LTS** → Runtime de JavaScript
- **Express.js** → Framework web
- **PostgreSQL 16** → Base de datos relacional
- **Prisma** → ORM moderno
- **JWT** → Autenticación
- **Zod** → Validación de datos
- **Winston** → Logging
- **PDFKit** → Generación de PDFs

### Frontend
- **React 18** → Librería UI
- **Vite** → Build tool
- **TypeScript** → Tipado estático
- **Tailwind CSS** → Estilos
- **shadcn/ui** → Componentes UI
- **TanStack Query** → Manejo de estado servidor
- **TanStack Table** → Tablas de datos
- **Recharts** → Gráficas
- **Lucide React** → Iconos
- **React Hook Form** → Formularios
- **Zustand** → Estado global

### DevOps
- **Docker** → Contenedores
- **Docker Compose** → Orquestación
- **GitHub Actions** → CI/CD

## 📁 Estructura del Proyecto

```
ServiceOfPagos/
├── backend/
│   ├── src/
│   │   ├── configuracion/     → Configuración (BD, logger, env)
│   │   ├── controladores/     → Lógica de negocio
│   │   ├── modelos/            → Modelos de datos
│   │   ├── rutas/              → Endpoints API
│   │   ├── servicios/          → Servicios reutilizables
│   │   ├── middlewares/        → Middlewares Express
│   │   ├── utilidades/         → Funciones helper
│   │   ├── validaciones/       → Schemas Zod
│   │   └── servidor.ts         → Entry point
│   ├── prisma/
│   │   └── schema.prisma       → Schema de BD
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── componentes/
│   │   │   ├── ui/             → Componentes shadcn/ui
│   │   │   ├── facturas/       → Componentes de facturas
│   │   │   ├── clientes/       → Componentes de clientes
│   │   │   ├── productos/      → Componentes de productos
│   │   │   ├── pagos/          → Componentes de pagos
│   │   │   ├── reportes/       → Componentes de reportes
│   │   │   └── comunes/        → Componentes reutilizables
│   │   ├── paginas/            → Páginas/Vistas
│   │   ├── servicios/          → API calls
│   │   ├── hooks/              → Custom hooks
│   │   ├── contextos/          → React contexts
│   │   ├── utilidades/         → Helpers
│   │   ├── tipos/              → TypeScript types
│   │   └── esquemas/           → Zod schemas
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml          → Servicios Docker
├── ROADMAP.md                  → Plan de desarrollo
└── README.md                   → Este archivo
```

## 🔧 Instalación

### Requisitos Previos

- Node.js 20+ LTS
- Docker y Docker Compose
- npm o pnpm

### 1. Clonar repositorio

```bash
git clone <tu-repo>
cd ServiceOfPagos
```

### 2. Iniciar servicios Docker

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en `localhost:5432`
- Redis en `localhost:6379`
- pgAdmin en `localhost:5050`

### 3. Configurar Backend

```bash
cd backend
npm install
```

Copiar `.env.example` a `.env` y configurar:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/facturacion_db"
JWT_SECRET="tu-secreto-super-seguro"
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

Generar cliente de Prisma y migrar BD:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Iniciar servidor:

```bash
npm run dev
```

Backend corriendo en `http://localhost:3000`

### 4. Configurar Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend corriendo en `http://localhost:5173`

## 📚 Documentación

- [ROADMAP.md](./ROADMAP.md) → Plan de desarrollo completo por fases
- API Docs → (próximamente)

## 🎯 Funcionalidades

### Fase 1 - Fundación ✅ COMPLETADO
- ✅ Estructura del proyecto
- ✅ Configuración de backend
- ✅ Configuración de frontend
- ✅ Docker Compose
- ⏳ Autenticación (próximo)

### Fase 2 - Catálogos Base (próximo)
- Clientes
- Productos/Servicios
- Configuración fiscal

### Fase 3 - Facturación Core
- Generación de facturas
- Cálculo de impuestos
- PDFs

### Fase 4+ - Ver [ROADMAP.md](./ROADMAP.md)

## 🔐 Seguridad

- Autenticación con JWT
- Passwords hasheados con bcrypt
- Rate limiting
- Helmet para headers seguros
- Validación de inputs con Zod
- CORS configurado
- Audit trail completo

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📊 Base de Datos

Acceder a pgAdmin:
- URL: `http://localhost:5050`
- Email: `admin@facturacion.com`
- Password: `admin`

Acceder a Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

## 🚢 Deployment

(Próximamente)

## 📝 Convenciones de Código

- Todo en español (variables, funciones, comentarios)
- Nombres descriptivos y claros
- Código limpio y modular
- Comentarios mínimos (código auto-explicativo)
- Usar librerías open source
- Principio: código limpio = menos bugs

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

MIT

## 👤 Autor

Carlos

---

**Estado del proyecto:** 🟢 En desarrollo activo

**Última actualización:** 2025-11-17
