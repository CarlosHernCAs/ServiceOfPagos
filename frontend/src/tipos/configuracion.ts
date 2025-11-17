// Catálogos SAT
export interface CatalogoSAT {
  clave: string;
  descripcion: string;
}

export interface CatalogosSAT {
  regimenesFiscales: CatalogoSAT[];
  metodosPago: CatalogoSAT[];
  formasPago: CatalogoSAT[];
  usosCFDI: CatalogoSAT[];
  tiposComprobante: CatalogoSAT[];
  monedas: CatalogoSAT[];
  unidadesMedida: CatalogoSAT[];
  tiposRelacion: CatalogoSAT[];
}

// Configuración
export interface Configuracion {
  id: string;
  clave: string;
  valor: any;
  tipo: 'string' | 'number' | 'boolean' | 'json';
  descripcion?: string | null;
}

export interface DatosEmpresa {
  razonSocial: string;
  rfc: string;
  regimenFiscal: string;
  direccion: {
    calle: string;
    numeroExterior: string;
    numeroInterior?: string;
    colonia: string;
    codigoPostal: string;
    ciudad: string;
    estado: string;
    pais: string;
  };
  contacto: {
    email: string;
    telefono: string;
    sitioWeb?: string;
  };
  logo?: string;
}
