# 🧪 Probar Sistema de Autenticación

Guía paso a paso para probar el sistema de autenticación completo.

## Requisitos Previos

Asegurar que tienes instalado:
- Node.js 20+
- Docker y Docker Compose
- npm

## 1. Iniciar Base de Datos

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto inicia PostgreSQL en puerto 5432.

## 2. Iniciar Backend

```bash
cd backend

# Instalar dependencias (primera vez)
npm install

# Copiar archivo de entorno
cp .env.example .env

# Generar cliente de Prisma
npm run prisma:generate

# Crear y migrar base de datos
npm run prisma:migrate

# Iniciar servidor
npm run dev
```

El backend estará corriendo en `http://localhost:3000`

### Verificar Backend

```bash
curl http://localhost:3000/api/salud
```

Deberías ver:
```json
{
  "estado": "OK",
  "timestamp": "...",
  "uptime": ...
}
```

## 3. Iniciar Frontend

En otra terminal:

```bash
cd frontend

# Instalar dependencias (primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará corriendo en `http://localhost:5173`

## 4. Probar Flujo Completo

### A. Registro de Usuario

1. Abre `http://localhost:5173` en tu navegador
2. Haz clic en "Regístrate"
3. Completa el formulario:
   - Nombre: `Carlos`
   - Apellido: `Hernández`
   - Email: `carlos@test.com`
   - Contraseña: `Test1234` (debe tener mayúscula, minúscula y número)
   - Confirmar Contraseña: `Test1234`
4. Haz clic en "Crear Cuenta"
5. Deberías ser redirigido al Dashboard automáticamente

### B. Cerrar Sesión

1. En el Dashboard, haz clic en "Cerrar Sesión"
2. Deberías ser redirigido a la página de Login

### C. Iniciar Sesión

1. En la página de Login, ingresa:
   - Email: `carlos@test.com`
   - Contraseña: `Test1234`
2. Haz clic en "Iniciar Sesión"
3. Deberías ser redirigido al Dashboard

### D. Probar Rutas Protegidas

1. Con sesión iniciada, visita `http://localhost:5173/dashboard` → ✅ Debe funcionar
2. Cierra sesión
3. Intenta acceder a `http://localhost:5173/dashboard` → ❌ Debe redirigir a `/login`

## 5. Probar API Directamente

### Registro
```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@test.com",
    "password": "Test1234"
  }'
```

Respuesta esperada:
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": "...",
    "email": "juan@test.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "USUARIO",
    "activo": true,
    "creadoEn": "..."
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@test.com",
    "password": "Test1234"
  }'
```

### Obtener Perfil (con token)
```bash
# Reemplaza TOKEN con el accessToken que obtuviste
curl http://localhost:3000/api/auth/perfil \
  -H "Authorization: Bearer TOKEN"
```

## 6. Ver Base de Datos

### Opción A: Prisma Studio
```bash
cd backend
npm run prisma:studio
```

Se abre en `http://localhost:5555`

### Opción B: pgAdmin
1. Visita `http://localhost:5050`
2. Login:
   - Email: `admin@facturacion.com`
   - Password: `admin`
3. Conectar servidor:
   - Host: `postgres` (o `localhost` si estás fuera de Docker)
   - Puerto: `5432`
   - Database: `facturacion_db`
   - Username: `postgres`
   - Password: `postgres`

## 7. Casos de Prueba

### ✅ Casos Exitosos

1. **Registro con datos válidos**
   - Email único
   - Contraseña con mayúscula, minúscula y número
   - Nombre mínimo 2 caracteres

2. **Login con credenciales correctas**
   - Email registrado
   - Contraseña correcta

3. **Acceso a ruta protegida con sesión activa**
   - Token válido en localStorage
   - Usuario autenticado

4. **Cerrar sesión**
   - Limpia localStorage
   - Redirige a login

### ❌ Casos de Error

1. **Registro con email duplicado**
   - Mensaje: "El email ya está registrado"
   - Status: 409

2. **Registro con contraseña débil**
   - Sin mayúscula: "Debe contener al menos una mayúscula"
   - Sin número: "Debe contener al menos un número"
   - Menos de 8 caracteres: "La contraseña debe tener al menos 8 caracteres"

3. **Login con credenciales incorrectas**
   - Mensaje: "Credenciales inválidas"
   - Status: 401

4. **Acceso a ruta protegida sin sesión**
   - Redirige a `/login`

5. **Token expirado**
   - Intenta refresh automático
   - Si falla, redirige a login

## 8. Verificar LocalStorage

En las DevTools del navegador:
1. Abre la consola (F12)
2. Ve a Application → Local Storage → `http://localhost:5173`
3. Deberías ver:
   - `accessToken`: Token JWT
   - `refreshToken`: Token de refresco
   - `usuario`: Objeto JSON del usuario

## 9. Logs del Backend

Verifica los logs en la terminal donde corre el backend:
- Requests HTTP
- Queries a la base de datos
- Errores (si los hay)

También puedes ver `backend/logs/combined.log`

## 10. Detener Todo

```bash
# Backend: Ctrl+C en la terminal

# Frontend: Ctrl+C en la terminal

# Docker
docker-compose down

# O solo detener sin borrar datos
docker-compose stop
```

## Problemas Comunes

### Error: "Cannot find module '@prisma/client'"
```bash
cd backend
npm run prisma:generate
```

### Error: Puerto 5432 en uso
```bash
# Detener PostgreSQL local
sudo service postgresql stop
```

### Error 401 en todas las peticiones
- Verifica que el JWT_SECRET en .env sea el mismo
- Borra localStorage y vuelve a hacer login

### Frontend no se conecta al backend
- Verifica que ambos estén corriendo
- Revisa la configuración del proxy en `vite.config.ts`

## Siguientes Pasos

Una vez que todo funcione:
1. ✅ Autenticación completa
2. 🔜 CRUD de Clientes (próximo)
3. 🔜 CRUD de Productos
4. 🔜 Sistema de Facturación

---

**¿Problemas?** Revisa los logs del backend y la consola del navegador.
