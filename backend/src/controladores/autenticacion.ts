import { Request, Response, NextFunction } from 'express';
import { ServicioAutenticacion } from '../servicios/autenticacion';
import {
  esquemaRegistro,
  esquemaLogin,
  esquemaCambioPassword,
} from '../validaciones/autenticacion';

export class ControladorAutenticacion {
  // POST /api/auth/registro
  static async registro(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar datos
      const datos = esquemaRegistro.parse(req.body);

      // Registrar usuario
      const resultado = await ServicioAutenticacion.registrar(datos);

      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        ...resultado,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar datos
      const datos = esquemaLogin.parse(req.body);

      // Login
      const resultado = await ServicioAutenticacion.login(datos);

      res.status(200).json({
        mensaje: 'Login exitoso',
        ...resultado,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/perfil
  static async obtenerPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const usuario = await ServicioAutenticacion.obtenerPerfil(req.usuario.usuarioId);

      res.status(200).json({ usuario });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/cambiar-password
  static async cambiarPassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Validar datos
      const datos = esquemaCambioPassword.parse(req.body);

      // Cambiar contraseña
      const resultado = await ServicioAutenticacion.cambiarPassword(
        req.usuario.usuarioId,
        datos.passwordActual,
        datos.passwordNueva
      );

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/refresh
  static async refrescarToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Token de refresco requerido' });
      }

      const tokens = await ServicioAutenticacion.refrescarToken(refreshToken);

      res.status(200).json({
        mensaje: 'Token refrescado exitosamente',
        ...tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // En un sistema con Redis, aquí invalidarías el token
      // Por ahora solo respondemos éxito
      res.status(200).json({ mensaje: 'Logout exitoso' });
    } catch (error) {
      next(error);
    }
  }
}
