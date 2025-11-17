import api from './api';
import type {
  Factura,
  CrearFacturaInput,
  ActualizarFacturaInput,
  FiltrosFactura,
  RespuestaFacturas,
  EstadoFactura,
  EstadisticasFacturas,
} from '@/tipos/facturas';

export const servicioFacturas = {
  // Crear factura
  async crear(datos: CrearFacturaInput): Promise<Factura> {
    const { data } = await api.post<{ mensaje: string; factura: Factura }>(
      '/facturas',
      datos
    );
    return data.factura;
  },

  // Obtener todas con filtros
  async obtenerTodas(filtros?: FiltrosFactura): Promise<RespuestaFacturas> {
    const { data } = await api.get<RespuestaFacturas>('/facturas', {
      params: filtros,
    });
    return data;
  },

  // Obtener por ID
  async obtenerPorId(id: string): Promise<Factura> {
    const { data } = await api.get<{ factura: Factura }>(`/facturas/${id}`);
    return data.factura;
  },

  // Obtener por folio
  async obtenerPorFolio(folioCompleto: string): Promise<Factura> {
    const { data } = await api.get<{ factura: Factura }>(`/facturas/folio/${folioCompleto}`);
    return data.factura;
  },

  // Actualizar
  async actualizar(id: string, datos: ActualizarFacturaInput): Promise<Factura> {
    const { data } = await api.put<{ mensaje: string; factura: Factura }>(
      `/facturas/${id}`,
      datos
    );
    return data.factura;
  },

  // Cambiar estado
  async cambiarEstado(id: string, estado: EstadoFactura, motivo?: string): Promise<Factura> {
    const { data } = await api.patch<{ mensaje: string; factura: Factura }>(
      `/facturas/${id}/estado`,
      { estado, motivo }
    );
    return data.factura;
  },

  // Eliminar (solo borradores)
  async eliminar(id: string): Promise<{ mensaje: string }> {
    const { data } = await api.delete<{ mensaje: string }>(`/facturas/${id}`);
    return data;
  },

  // Cancelar
  async cancelar(id: string, motivo?: string): Promise<{ mensaje: string; factura: Factura }> {
    const { data } = await api.post<{ mensaje: string; factura: Factura }>(
      `/facturas/${id}/cancelar`,
      { motivo }
    );
    return data;
  },

  // Estadísticas
  async obtenerEstadisticas(): Promise<EstadisticasFacturas> {
    const { data } = await api.get<{ estadisticas: EstadisticasFacturas }>(
      '/facturas/estadisticas/general'
    );
    return data.estadisticas;
  },
};
