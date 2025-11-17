import type { Cliente } from './clientes';
import type { Producto } from './productos';

export type EstadoFactura =
  | 'BORRADOR'
  | 'EMITIDA'
  | 'TIMBRADA'
  | 'PAGADA'
  | 'PARCIALMENTE_PAGADA'
  | 'VENCIDA'
  | 'CANCELADA';

// Línea de factura
export interface LineaFactura {
  id: string;
  facturaId: string;
  productoId: string;
  producto?: Producto;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  iva: number;
  ieps: number;
  subtotal: number;
  total: number;
  orden: number;
}

// Línea de factura para crear
export interface LineaFacturaInput {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  iva?: number;
  ieps?: number;
}

// Factura completa
export interface Factura {
  id: string;
  serie: string;
  folio: number;
  folioCompleto: string;
  clienteId: string;
  cliente?: Cliente;
  fecha: string;
  fechaVencimiento?: string | null;
  subtotal: number;
  descuento: number;
  iva: number;
  ieps: number;
  total: number;
  estado: EstadoFactura;
  metodoPago?: string | null;
  formaPago?: string | null;
  condicionPago?: string | null;
  uuid?: string | null;
  xmlPath?: string | null;
  pdfPath?: string | null;
  fechaTimbrado?: string | null;
  observaciones?: string | null;
  usuarioId: string;
  usuario?: {
    nombre: string;
    apellido?: string;
    email: string;
  };
  lineas: LineaFactura[];
  creadoEn: string;
  actualizadoEn: string;
}

// Input para crear factura
export interface CrearFacturaInput {
  clienteId: string;
  serie?: string;
  fecha?: string | Date;
  fechaVencimiento?: string | Date;
  estado?: EstadoFactura;
  metodoPago?: string;
  formaPago?: string;
  condicionPago?: string;
  observaciones?: string;
  lineas: LineaFacturaInput[];
}

// Input para actualizar factura
export interface ActualizarFacturaInput extends Partial<CrearFacturaInput> {}

// Filtros de factura
export interface FiltrosFactura {
  busqueda?: string;
  clienteId?: string;
  estado?: EstadoFactura;
  serie?: string;
  fechaDesde?: string | Date;
  fechaHasta?: string | Date;
  limite?: number;
  pagina?: number;
}

// Respuesta de facturas
export interface RespuestaFacturas {
  facturas: Factura[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

// Estadísticas de facturas
export interface EstadisticasFacturas {
  totalFacturas: number;
  porEstado: {
    borradores: number;
    emitidas: number;
    timbradas: number;
    pagadas: number;
    vencidas: number;
  };
  montos: {
    total: number;
    pagado: number;
    porCobrar: number;
  };
}
