import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { servicioAutenticacion } from '@/servicios/autenticacion';
import type {
  Usuario,
  DatosLogin,
  DatosRegistro,
  ContextoAutenticacion as TipoContextoAutenticacion,
} from '@/tipos/autenticacion';

const ContextoAutenticacion = createContext<TipoContextoAutenticacion | undefined>(
  undefined
);

interface ProveedorAutenticacionProps {
  children: ReactNode;
}

export function ProveedorAutenticacion({ children }: ProveedorAutenticacionProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Verificar si hay usuario en localStorage al iniciar
  useEffect(() => {
    const inicializar = async () => {
      try {
        const usuarioLocal = servicioAutenticacion.obtenerUsuarioLocal();
        const token = localStorage.getItem('accessToken');

        if (usuarioLocal && token) {
          // Verificar que el token sea válido obteniendo el perfil
          const perfilActualizado = await servicioAutenticacion.obtenerPerfil();
          setUsuario(perfilActualizado);
          servicioAutenticacion.guardarUsuario(perfilActualizado);
        }
      } catch (error) {
        // Si falla, limpiar storage
        servicioAutenticacion.limpiarStorage();
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    inicializar();
  }, []);

  const login = async (datos: DatosLogin) => {
    try {
      const respuesta = await servicioAutenticacion.login(datos);

      // Guardar tokens y usuario
      servicioAutenticacion.guardarTokens(
        respuesta.accessToken,
        respuesta.refreshToken
      );
      servicioAutenticacion.guardarUsuario(respuesta.usuario);

      setUsuario(respuesta.usuario);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Error al iniciar sesión'
      );
    }
  };

  const registrar = async (datos: DatosRegistro) => {
    try {
      const respuesta = await servicioAutenticacion.registrar(datos);

      // Guardar tokens y usuario
      servicioAutenticacion.guardarTokens(
        respuesta.accessToken,
        respuesta.refreshToken
      );
      servicioAutenticacion.guardarUsuario(respuesta.usuario);

      setUsuario(respuesta.usuario);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Error al registrar usuario'
      );
    }
  };

  const logout = () => {
    // Limpiar storage
    servicioAutenticacion.limpiarStorage();
    setUsuario(null);

    // Opcional: llamar al endpoint de logout en el backend
    servicioAutenticacion.logout().catch(() => {
      // Ignorar errores del logout en backend
    });
  };

  const actualizarPerfil = async () => {
    try {
      const perfilActualizado = await servicioAutenticacion.obtenerPerfil();
      setUsuario(perfilActualizado);
      servicioAutenticacion.guardarUsuario(perfilActualizado);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    }
  };

  const valor: TipoContextoAutenticacion = {
    usuario,
    cargando,
    login,
    registrar,
    logout,
    actualizarPerfil,
    estaAutenticado: !!usuario,
  };

  return (
    <ContextoAutenticacion.Provider value={valor}>
      {children}
    </ContextoAutenticacion.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAutenticacion() {
  const contexto = useContext(ContextoAutenticacion);
  if (contexto === undefined) {
    throw new Error(
      'useAutenticacion debe ser usado dentro de un ProveedorAutenticacion'
    );
  }
  return contexto;
}
