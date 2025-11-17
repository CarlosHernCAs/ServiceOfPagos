import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Log de queries en desarrollo
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// Verificar conexión
export const conectarBaseDatos = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Conectado a PostgreSQL exitosamente');
  } catch (error) {
    logger.error('❌ Error al conectar a PostgreSQL:', error);
    process.exit(1);
  }
};

// Desconectar
export const desconectarBaseDatos = async () => {
  await prisma.$disconnect();
  logger.info('Desconectado de PostgreSQL');
};

export default prisma;
