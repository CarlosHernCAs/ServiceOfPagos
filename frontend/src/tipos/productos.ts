export type TipoProducto = 'PRODUCTO' | 'SERVICIO';

export interface Producto {
  id: string;
  clave: string;
  nombre: string;
  descripcion?: string | null;
  categoria?: string | null;
  unidadMedida: string;
  claveProdServ?: string | null;
  claveUnidad?: string | null;
  tipo: TipoProducto;
  precio: number;
  costo?: number | null;
  iva: number;
  ieps?: number | null;
  controlaInventario: boolean;
  stockActual?: number | null;
  stockMinimo?: number | null;
  stockMaximo?: number | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearProductoInput {
  clave: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  unidadMedida?: string;
  claveProdServ?: string;
  claveUnidad?: string;
  tipo?: TipoProducto;
  precio: number;
  costo?: number;
  iva?: number;
  ieps?: number;
  controlaInventario?: boolean;
  stockActual?: number;
  stockMinimo?: number;
  stockMaximo?: number;
  activo?: boolean;
}

export interface ActualizarProductoInput extends Partial<CrearProductoInput> {}

export interface FiltrosProducto {
  busqueda?: string;
  categoria?: string;
  tipo?: TipoProducto;
  activo?: 'true' | 'false' | 'all';
  controlaInventario?: 'true' | 'false' | 'all';
  stockBajo?: 'true' | 'false';
  limite?: number;
  pagina?: number;
}

export interface RespuestaProductos {
  productos: Producto[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export interface AjustarStockInput {
  cantidad: number;
  tipo: 'entrada' | 'salida';
}
