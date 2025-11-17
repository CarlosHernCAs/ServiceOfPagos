import api from './api';
import type {
  Producto,
  CrearProductoInput,
  ActualizarProductoInput,
  FiltrosProducto,
  RespuestaProductos,
  AjustarStockInput,
} from '@/tipos/productos';

export const servicioProductos = {
  // Crear producto
  async crear(datos: CrearProductoInput): Promise<Producto> {
    const { data } = await api.post<{ mensaje: string; producto: Producto }>(
      '/productos',
      datos
    );
    return data.producto;
  },

  // Obtener todos con filtros
  async obtenerTodos(filtros?: FiltrosProducto): Promise<RespuestaProductos> {
    const { data } = await api.get<RespuestaProductos>('/productos', {
      params: filtros,
    });
    return data;
  },

  // Obtener por ID
  async obtenerPorId(id: string): Promise<Producto> {
    const { data } = await api.get<{ producto: Producto }>(`/productos/${id}`);
    return data.producto;
  },

  // Obtener por clave
  async obtenerPorClave(clave: string): Promise<Producto> {
    const { data } = await api.get<{ producto: Producto }>(`/productos/clave/${clave}`);
    return data.producto;
  },

  // Actualizar
  async actualizar(id: string, datos: ActualizarProductoInput): Promise<Producto> {
    const { data } = await api.put<{ mensaje: string; producto: Producto }>(
      `/productos/${id}`,
      datos
    );
    return data.producto;
  },

  // Eliminar
  async eliminar(id: string): Promise<{ mensaje: string; desactivado: boolean }> {
    const { data } = await api.delete<{ mensaje: string; desactivado: boolean }>(
      `/productos/${id}`
    );
    return data;
  },

  // Cambiar estado (activar/desactivar)
  async cambiarEstado(id: string, activo: boolean): Promise<{ mensaje: string }> {
    const { data } = await api.patch<{ mensaje: string }>(
      `/productos/${id}/estado`,
      { activo }
    );
    return data;
  },

  // Obtener categorías
  async obtenerCategorias(): Promise<string[]> {
    const { data } = await api.get<{ categorias: string[] }>(
      '/productos/categorias/listar'
    );
    return data.categorias;
  },

  // Obtener productos con stock bajo
  async obtenerStockBajo(): Promise<{ productos: Producto[]; total: number }> {
    const { data } = await api.get<{ productos: Producto[]; total: number }>(
      '/productos/inventario/stock-bajo'
    );
    return data;
  },

  // Ajustar stock (entrada o salida)
  async ajustarStock(id: string, ajuste: AjustarStockInput): Promise<Producto> {
    const { data } = await api.post<{ mensaje: string; producto: Producto }>(
      `/productos/${id}/ajustar-stock`,
      ajuste
    );
    return data.producto;
  },
};
