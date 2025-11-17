import { Request, Response, NextFunction } from 'express';
import { logger } from '../configuracion/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class ErrorApi extends Error {
  statusCode: number;

  constructor(mensaje: string, statusCode: number = 500) {
    super(mensaje);
    this.statusCode = statusCode;
    this.name = 'ErrorApi';
  }
}

export const manejadorErrores = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${error.message}`);
  logger.error(`Stack: ${error.stack}`);

  // Error de validación con Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Error de validación',
      detalles: error.errors.map((err) => ({
        campo: err.path.join('.'),
        mensaje: err.message,
      })),
    });
  }

  // Error de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Registro duplicado',
        campo: error.meta?.target,
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Registro no encontrado',
      });
    }
  }

  // Error personalizado de la API
  if (error instanceof ErrorApi) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  // Error genérico
  return res.status(500).json({
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { detalles: error.message }),
  });
};

export const noEncontrado = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
  });
};
