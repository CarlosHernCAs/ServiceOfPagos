export enum RolUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  VENDEDOR = 'VENDEDOR',
  CONTADOR = 'CONTADOR',
  USUARIO = 'USUARIO',
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido?: string | null;
  rol: RolUsuario;
  activo: boolean;
  creadoEn: string;
  ultimoAcceso?: string | null;
}

export interface DatosLogin {
  email: string;
  password: string;
}

export interface DatosRegistro {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
}

export interface RespuestaAutenticacion {
  mensaje: string;
  usuario: Usuario;
  accessToken: string;
  refreshToken: string;
}

export interface ContextoAutenticacion {
  usuario: Usuario | null;
  cargando: boolean;
  login: (datos: DatosLogin) => Promise<void>;
  registrar: (datos: DatosRegistro) => Promise<void>;
  logout: () => void;
  actualizarPerfil: () => Promise<void>;
  estaAutenticado: boolean;
}
