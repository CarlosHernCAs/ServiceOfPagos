import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const esquemaEnv = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  LOG_LEVEL: z.string().default('info'),
});

const validarEnv = () => {
  try {
    return esquemaEnv.parse(process.env);
  } catch (error) {
    console.error('❌ Variables de entorno inválidas:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

export const env = validarEnv();
