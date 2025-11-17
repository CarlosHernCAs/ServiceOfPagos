# 🚀 Inicio Rápido

Pasos para tener el sistema corriendo en menos de 5 minutos.

## 1. Iniciar Base de Datos

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto inicia PostgreSQL y Redis en segundo plano.

## 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Generar Prisma Client
npm run prisma:generate

# Crear base de datos
npm run prisma:migrate

# Iniciar servidor de desarrollo
npm run dev
```

Backend listo en `http://localhost:3000`

## 3. Frontend

Abrir otra terminal:

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Frontend listo en `http://localhost:5173`

## 4. Verificar

### Backend
```bash
curl http://localhost:3000/api/salud
```

Respuesta esperada:
```json
{
  "estado": "OK",
  "timestamp": "2025-11-17T...",
  "uptime": 123.45
}
```

### Frontend
Abre `http://localhost:5173` en tu navegador.

## 5. Acceder a Herramientas

### pgAdmin (Administrador de PostgreSQL)
- URL: `http://localhost:5050`
- Email: `admin@facturacion.com`
- Password: `admin`

Para conectar a la BD:
- Host: `postgres` (si estás en Docker) o `localhost`
- Port: `5432`
- Database: `facturacion_db`
- Username: `postgres`
- Password: `postgres`

### Prisma Studio (Ver datos)
```bash
cd backend
npm run prisma:studio
```

Se abre en `http://localhost:5555`

## Próximos Pasos

1. Lee [ROADMAP.md](./ROADMAP.md) para ver el plan completo
2. Revisa la estructura del proyecto en [README.md](./README.md)
3. Empieza a desarrollar siguiendo el roadmap

## Problemas Comunes

### Error: Puerto 5432 ya está en uso
```bash
# Detener PostgreSQL local
sudo service postgresql stop
# O cambiar puerto en docker-compose.yml
```

### Error: Cannot find module '@prisma/client'
```bash
cd backend
npm run prisma:generate
```

### Error de permisos en Docker
```bash
sudo docker-compose up -d
```

## Detener Todo

```bash
# Detener servicios Docker
docker-compose down

# O mantener datos
docker-compose stop
```

## Comandos Útiles

```bash
# Ver logs de Docker
docker-compose logs -f

# Reiniciar solo PostgreSQL
docker-compose restart postgres

# Borrar TODO (¡cuidado!)
docker-compose down -v
```

---

¿Problemas? Revisa los logs o abre un issue.
