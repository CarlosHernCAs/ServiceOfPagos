# Changelog

Registro de todos los cambios importantes del proyecto.

---

## [0.2.0] - 2025-11-17

### ✨ Nuevo - Sistema de Autenticación Completo

**NOTA:** Esta versión también incluye el CRUD completo de Clientes (ver detalles al final).

#### Backend
- **Validaciones con Zod**
  - Schema de registro con validación de email, password, nombre
  - Schema de login
  - Schema de cambio de contraseña
  - Validación de contraseñas seguras (mayúscula, minúscula, número, 8+ caracteres)

- **Servicio de Autenticación**
  - Registro de usuarios con bcrypt (12 rounds)
  - Login con verificación de credenciales
  - Generación de JWT (access y refresh tokens)
  - Obtener perfil de usuario
  - Cambio de contraseña
  - Refresh de tokens

- **Controladores**
  - `POST /api/auth/registro` - Registro de nuevos usuarios
  - `POST /api/auth/login` - Inicio de sesión
  - `GET /api/auth/perfil` - Obtener perfil (protegido)
  - `POST /api/auth/cambiar-password` - Cambiar contraseña (protegido)
  - `POST /api/auth/refresh` - Refrescar token
  - `POST /api/auth/logout` - Cerrar sesión (protegido)

- **Middlewares**
  - `verificarToken` - Verifica JWT en headers
  - `verificarRol` - Verifica permisos por rol
  - Manejo centralizado de errores con Zod
  - Manejo de errores de Prisma

#### Frontend
- **Tipos TypeScript**
  - Interfaces para Usuario, Login, Registro
  - Enums para roles de usuario
  - Tipos para contexto de autenticación

- **Servicios**
  - API client con Axios e interceptores
  - Interceptor de request para agregar JWT
  - Interceptor de response para refresh automático
  - Servicio de autenticación con todos los endpoints
  - Gestión de localStorage para tokens y usuario

- **Contexto Global**
  - `ProveedorAutenticacion` con Context API
  - Estado global de usuario y cargando
  - Funciones: login, registrar, logout, actualizarPerfil
  - Verificación automática de sesión al iniciar
  - Hook personalizado `useAutenticacion`

- **Componentes UI (shadcn/ui)**
  - Button con variantes (default, destructive, outline, ghost, link)
  - Input con estilos consistentes
  - Label para formularios
  - Card con Header, Content, Footer, Title, Description

- **Páginas**
  - Login - Formulario de inicio de sesión
  - Registro - Formulario de registro con validación
  - Dashboard - Vista principal protegida con info del usuario

- **Routing**
  - React Router configurado
  - Componente `RutaProtegida` para rutas privadas
  - Redirecciones automáticas según estado de autenticación
  - Ruta 404 con redirect a login

#### Características
- ✅ Registro de usuarios con validación completa
- ✅ Login con JWT
- ✅ Protección de rutas privadas
- ✅ Persistencia de sesión con localStorage
- ✅ Refresh automático de tokens
- ✅ Logout y limpieza de sesión
- ✅ Manejo de errores con mensajes claros
- ✅ Indicadores de carga
- ✅ Responsive design con Tailwind CSS
- ✅ Dark mode preparado (colores CSS variables)

#### Seguridad
- Passwords hasheados con bcrypt (12 rounds)
- JWT con expiración configurable
- Refresh tokens para sesiones largas
- Validación de inputs en backend y frontend
- Rate limiting en endpoints de API
- CORS configurado
- Helmet para headers seguros
- Sanitización automática de Zod

### ✨ Nuevo - CRUD Completo de Clientes

#### Backend
- **Modelo de Datos (Prisma)**
  - Datos fiscales completos (RFC, razón social, régimen fiscal, uso CFDI)
  - Contacto (email, teléfono, celular, sitio web)
  - Dirección fiscal completa (calle, números, colonia, CP, ciudad, estado)
  - Configuración comercial (días de crédito, límite de crédito, descuento general)
  - Soft delete (campo activo)
  - Relaciones con facturas y pagos

- **Validaciones con Zod**
  - Schema de creación con validación de RFC (formato México)
  - Schema de actualización
  - Schema de filtros con búsqueda por: razón social, RFC, email
  - Validación de régimen fiscal y uso CFDI

- **Servicio de Clientes**
  - `crear()` - Crear cliente con validación de RFC único
  - `obtenerTodos()` - Listar con paginación y filtros
  - `obtenerPorId()` - Obtener cliente específico
  - `actualizar()` - Actualizar datos
  - `eliminar()` - Soft delete
  - Búsqueda por múltiples criterios
  - Estadísticas por cliente (facturas, pagos, vencidas)

- **Controladores**
  - `POST /api/clientes` - Crear cliente
  - `GET /api/clientes` - Listar con paginación
  - `GET /api/clientes/:id` - Obtener uno
  - `PUT /api/clientes/:id` - Actualizar
  - `DELETE /api/clientes/:id` - Eliminar (soft delete)
  - Todos los endpoints protegidos con JWT

#### Frontend
- **Tipos TypeScript**
  - Interfaces para Cliente, CrearCliente, ActualizarCliente
  - Tipos para filtros y paginación
  - Enums para régimen fiscal

- **Servicios API**
  - Servicio completo con Axios
  - Métodos para todas las operaciones CRUD
  - Manejo de errores

- **Componentes**
  - `TablaClientes.tsx` - Tabla con TanStack Table
    - Columnas: RFC, Razón Social, Email, Teléfono, Régimen Fiscal, Estado
    - Acciones: Ver, Editar, Eliminar
    - Búsqueda en tiempo real
    - Paginación
  - `FormularioCliente.tsx` - Formulario de alta/edición
    - React Hook Form + Zod
    - Validación en tiempo real
    - Campos agrupados por sección (Datos Fiscales, Contacto, Dirección, Comercial)

- **Páginas**
  - `Clientes.tsx` - Página principal de gestión
    - Modal de creación/edición
    - Confirmación de eliminación
    - Indicadores de carga
    - Manejo de errores con toast/alert

#### Características
- ✅ CRUD completo funcional
- ✅ Validación de RFC formato México
- ✅ Búsqueda y filtros avanzados
- ✅ Paginación eficiente
- ✅ Soft delete (desactivación)
- ✅ Responsive design
- ✅ Manejo de errores robusto
- ✅ Integrado con sistema de autenticación

---

## [0.1.0] - 2025-11-17

### 🎉 Configuración Inicial del Proyecto

#### Estructura
- Estructura completa backend/frontend
- Carpetas organizadas por responsabilidad
- Git configurado con .gitignore

#### Backend
- Node.js + Express + TypeScript
- PostgreSQL con Prisma ORM
- Schema de base de datos completo:
  - Usuarios (con roles)
  - Clientes (datos fiscales completos)
  - Productos (con inventario)
  - Facturas (con líneas)
  - Pagos (con aplicaciones)
  - Configuración
  - Auditoría
- Middlewares de seguridad (helmet, cors, rate-limit)
- Sistema de logging con Winston
- Validación de variables de entorno con Zod
- Manejo centralizado de errores

#### Frontend
- React 18 + Vite + TypeScript
- Tailwind CSS configurado
- shadcn/ui listo para usar
- Path aliases (@/componentes, @/utilidades, etc.)
- Estructura de carpetas por dominio
- Dependencias:
  - React Router DOM
  - TanStack Query
  - TanStack Table
  - Recharts
  - Lucide React
  - Axios
  - Zod
  - React Hook Form
  - Zustand

#### DevOps
- Docker Compose con:
  - PostgreSQL 16
  - Redis 7
  - pgAdmin 4
- Scripts npm para desarrollo
- Hot reload en backend y frontend

#### Documentación
- README.md completo
- ROADMAP.md con plan de 30 semanas
- INICIO-RAPIDO.md para setup rápido
- Ejemplos de uso
- Arquitectura del proyecto

---

## Formato

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)

### Tipos de cambios
- ✨ `Nuevo` - Nueva funcionalidad
- 🔧 `Cambiado` - Cambios en funcionalidad existente
- 🐛 `Corregido` - Bug fixes
- 🗑️ `Eliminado` - Funcionalidad eliminada
- 🔒 `Seguridad` - Mejoras de seguridad
- 📝 `Documentación` - Cambios solo en documentación
