import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../configuracion/baseDatos';
import { env } from '../configuracion/env';
import { ErrorApi } from '../middlewares/errorHandler';
import type { RegistroInput, LoginInput } from '../validaciones/autenticacion';
import { RolUsuario } from '@prisma/client';

interface TokenPayload {
  usuarioId: string;
  email: string;
  rol: RolUsuario;
}

export class ServicioAutenticacion {
  // Registrar nuevo usuario
  static async registrar(datos: RegistroInput) {
    // Verificar si el email ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: datos.email },
    });

    if (usuarioExistente) {
      throw new ErrorApi('El email ya está registrado', 409);
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(datos.password, 12);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        email: datos.email,
        password: passwordHash,
        nombre: datos.nombre,
        apellido: datos.apellido,
        rol: RolUsuario.USUARIO, // Rol por defecto
        activo: true,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        creadoEn: true,
      },
    });

    // Generar tokens
    const { accessToken, refreshToken } = this.generarTokens({
      usuarioId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return {
      usuario,
      accessToken,
      refreshToken,
    };
  }

  // Login
  static async login(datos: LoginInput) {
    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email: datos.email },
    });

    if (!usuario) {
      throw new ErrorApi('Credenciales inválidas', 401);
    }

    // Verificar si está activo
    if (!usuario.activo) {
      throw new ErrorApi('Usuario inactivo', 403);
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(datos.password, usuario.password);

    if (!passwordValida) {
      throw new ErrorApi('Credenciales inválidas', 401);
    }

    // Actualizar último acceso
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    // Generar tokens
    const { accessToken, refreshToken } = this.generarTokens({
      usuarioId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        activo: usuario.activo,
        creadoEn: usuario.creadoEn,
      },
      accessToken,
      refreshToken,
    };
  }

  // Obtener perfil del usuario
  static async obtenerPerfil(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        creadoEn: true,
        ultimoAcceso: true,
      },
    });

    if (!usuario) {
      throw new ErrorApi('Usuario no encontrado', 404);
    }

    return usuario;
  }

  // Cambiar contraseña
  static async cambiarPassword(
    usuarioId: string,
    passwordActual: string,
    passwordNueva: string
  ) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new ErrorApi('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);

    if (!passwordValida) {
      throw new ErrorApi('Contraseña actual incorrecta', 401);
    }

    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(passwordNueva, 12);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { password: passwordHash },
    });

    return { mensaje: 'Contraseña actualizada exitosamente' };
  }

  // Generar tokens JWT
  private static generarTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  // Verificar y refrescar token
  static async refrescarToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_SECRET) as TokenPayload;

      // Verificar que el usuario siga existiendo y activo
      const usuario = await prisma.usuario.findUnique({
        where: { id: payload.usuarioId },
      });

      if (!usuario || !usuario.activo) {
        throw new ErrorApi('Usuario no válido', 401);
      }

      // Generar nuevos tokens
      const tokens = this.generarTokens({
        usuarioId: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      });

      return tokens;
    } catch (error) {
      throw new ErrorApi('Token de refresco inválido', 401);
    }
  }
}
