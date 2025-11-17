import api from './api';
import type {
  Cliente,
  CrearClienteInput,
  ActualizarClienteInput,
  FiltrosCliente,
  RespuestaClientes,
  EstadisticasCliente,
} from '@/tipos/clientes';

export const servicioClientes = {
  // Crear cliente
  async crear(datos: CrearClienteInput): Promise<Cliente> {
    const { data } = await api.post<{ mensaje: string; cliente: Cliente }>(
      '/clientes',
      datos
    );
    return data.cliente;
  },

  // Obtener todos con filtros
  async obtenerTodos(filtros?: FiltrosCliente): Promise<RespuestaClientes> {
    const { data } = await api.get<RespuestaClientes>('/clientes', {
      params: filtros,
    });
    return data;
  },

  // Obtener por ID
  async obtenerPorId(id: string): Promise<Cliente> {
    const { data } = await api.get<{ cliente: Cliente }>(`/clientes/${id}`);
    return data.cliente;
  },

  // Actualizar
  async actualizar(id: string, datos: ActualizarClienteInput): Promise<Cliente> {
    const { data } = await api.put<{ mensaje: string; cliente: Cliente }>(
      `/clientes/${id}`,
      datos
    );
    return data.cliente;
  },

  // Eliminar
  async eliminar(id: string): Promise<{ mensaje: string; desactivado: boolean }> {
    const { data } = await api.delete<{ mensaje: string; desactivado: boolean }>(
      `/clientes/${id}`
    );
    return data;
  },

  // Cambiar estado (activar/desactivar)
  async cambiarEstado(id: string, activo: boolean): Promise<{ mensaje: string }> {
    const { data } = await api.patch<{ mensaje: string }>(
      `/clientes/${id}/estado`,
      { activo }
    );
    return data;
  },

  // Obtener estadísticas
  async obtenerEstadisticas(id: string): Promise<EstadisticasCliente> {
    const { data } = await api.get<{ estadisticas: EstadisticasCliente }>(
      `/clientes/${id}/estadisticas`
    );
    return data.estadisticas;
  },
};
