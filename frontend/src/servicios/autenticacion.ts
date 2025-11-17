import api from './api';
import type {
  DatosLogin,
  DatosRegistro,
  RespuestaAutenticacion,
  Usuario,
} from '@/tipos/autenticacion';

export const servicioAutenticacion = {
  // Login
  async login(datos: DatosLogin): Promise<RespuestaAutenticacion> {
    const { data } = await api.post<RespuestaAutenticacion>('/auth/login', datos);
    return data;
  },

  // Registro
  async registrar(datos: DatosRegistro): Promise<RespuestaAutenticacion> {
    const { data } = await api.post<RespuestaAutenticacion>('/auth/registro', datos);
    return data;
  },

  // Obtener perfil
  async obtenerPerfil(): Promise<Usuario> {
    const { data } = await api.get<{ usuario: Usuario }>('/auth/perfil');
    return data.usuario;
  },

  // Cambiar contraseña
  async cambiarPassword(datos: {
    passwordActual: string;
    passwordNueva: string;
    passwordConfirmacion: string;
  }): Promise<{ mensaje: string }> {
    const { data } = await api.post<{ mensaje: string }>('/auth/cambiar-password', datos);
    return data;
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  // Guardar tokens en localStorage
  guardarTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  // Guardar usuario en localStorage
  guardarUsuario(usuario: Usuario): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  },

  // Obtener usuario de localStorage
  obtenerUsuarioLocal(): Usuario | null {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Limpiar storage
  limpiarStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
  },
};
