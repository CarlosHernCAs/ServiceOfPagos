import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../configuracion/env';
import { ErrorApi } from './errorHandler';

export interface PayloadJWT {
  usuarioId: string;
  email: string;
  rol: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: PayloadJWT;
    }
  }
}

export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ErrorApi('Token no proporcionado', 401);
    }

    const token = authHeader.substring(7);

    const payload = jwt.verify(token, env.JWT_SECRET) as PayloadJWT;
    req.usuario = payload;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ErrorApi('Token inválido', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ErrorApi('Token expirado', 401));
    }
    next(error);
  }
};

export const verificarRol = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return next(new ErrorApi('No autenticado', 401));
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(new ErrorApi('No autorizado', 403));
    }

    next();
  };
};
