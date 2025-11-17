import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './configuracion/env';
import { logger } from './configuracion/logger';
import { conectarBaseDatos, desconectarBaseDatos } from './configuracion/baseDatos';
import { manejadorErrores, noEncontrado } from './middlewares/errorHandler';

// Importar rutas
import rutasAuth from './rutas/autenticacion';
import rutasClientes from './rutas/clientes';
import rutasProductos from './rutas/productos';
// import rutasFacturas from './rutas/facturas';

const app: Application = express();
const PORT = env.PORT || 3000;

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Seguridad
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde',
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger de requests
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path}`);
  next();
});

// ============================================
// RUTAS
// ============================================

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Sistema de Facturación',
    version: '1.0.0',
    estado: 'activo',
  });
});

app.get('/api/salud', (req, res) => {
  res.json({
    estado: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rutas de la API
app.use('/api/auth', rutasAuth);
app.use('/api/clientes', rutasClientes);
app.use('/api/productos', rutasProductos);
// app.use('/api/facturas', rutasFacturas);

// ============================================
// MANEJO DE ERRORES
// ============================================

app.use(noEncontrado);
app.use(manejadorErrores);

// ============================================
// INICIAR SERVIDOR
// ============================================

const iniciarServidor = async () => {
  try {
    // Conectar a base de datos
    await conectarBaseDatos();

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📝 Entorno: ${env.NODE_ENV}`);
      logger.info(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
    });
  } catch (error) {
    logger.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  await desconectarBaseDatos();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  await desconectarBaseDatos();
  process.exit(0);
});

// Iniciar
iniciarServidor();

export default app;
