export interface Cliente {
  id: string;
  razonSocial: string;
  nombreComercial?: string | null;
  rfc: string;
  regimenFiscal: string;
  usoCfdi?: string | null;
  email?: string | null;
  telefono?: string | null;
  celular?: string | null;
  sitioWeb?: string | null;
  calle?: string | null;
  numeroExterior?: string | null;
  numeroInterior?: string | null;
  colonia?: string | null;
  codigoPostal?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  pais: string;
  diasCredito: number;
  limiteCredito?: number | null;
  descuentoGeneral?: number | null;
  activo: boolean;
  notas?: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearClienteInput {
  razonSocial: string;
  nombreComercial?: string;
  rfc: string;
  regimenFiscal: string;
  usoCfdi?: string;
  email?: string;
  telefono?: string;
  celular?: string;
  sitioWeb?: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  codigoPostal?: string;
  ciudad?: string;
  estado?: string;
  pais?: string;
  diasCredito?: number;
  limiteCredito?: number;
  descuentoGeneral?: number;
  activo?: boolean;
  notas?: string;
}

export interface ActualizarClienteInput extends Partial<CrearClienteInput> {}

export interface FiltrosCliente {
  busqueda?: string;
  activo?: 'true' | 'false' | 'all';
  regimenFiscal?: string;
  limite?: number;
  pagina?: number;
}

export interface RespuestaClientes {
  clientes: Cliente[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export interface EstadisticasCliente {
  totalFacturas: number;
  totalPagado: number;
  facturasVencidas: number;
}
