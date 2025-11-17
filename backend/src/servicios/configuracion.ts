import prisma from '../configuracion/baseDatos';
import { ErrorApi } from '../middlewares/errorHandler';
import * as CatalogosSAT from '../catalogos/sat';

export class ServicioConfiguracion {
  // ============================================
  // CATÁLOGOS SAT
  // ============================================

  static async obtenerCatalogosSAT() {
    return {
      regimenesFiscales: CatalogosSAT.REGIMEN_FISCAL,
      metodosPago: CatalogosSAT.METODO_PAGO,
      formasPago: CatalogosSAT.FORMA_PAGO,
      usosCFDI: CatalogosSAT.USO_CFDI,
      tiposComprobante: CatalogosSAT.TIPO_COMPROBANTE,
      monedas: CatalogosSAT.MONEDA,
      unidadesMedida: CatalogosSAT.UNIDAD_MEDIDA,
      tiposRelacion: CatalogosSAT.TIPO_RELACION,
    };
  }

  static async obtenerRegimenesFiscales() {
    return CatalogosSAT.REGIMEN_FISCAL;
  }

  static async obtenerMetodosPago() {
    return CatalogosSAT.METODO_PAGO;
  }

  static async obtenerFormasPago() {
    return CatalogosSAT.FORMA_PAGO;
  }

  static async obtenerUsosCFDI() {
    return CatalogosSAT.USO_CFDI;
  }

  static async obtenerUnidadesMedida() {
    return CatalogosSAT.UNIDAD_MEDIDA;
  }

  // ============================================
  // CONFIGURACIÓN DE EMPRESA
  // ============================================

  static async obtenerConfiguracion(clave: string) {
    const config = await prisma.configuracion.findUnique({
      where: { clave },
    });

    if (!config) {
      throw new ErrorApi('Configuración no encontrada', 404);
    }

    // Parsear valor según tipo
    let valor: any = config.valor;
    switch (config.tipo) {
      case 'number':
        valor = parseFloat(config.valor);
        break;
      case 'boolean':
        valor = config.valor === 'true';
        break;
      case 'json':
        valor = JSON.parse(config.valor);
        break;
      default:
        valor = config.valor;
    }

    return {
      clave: config.clave,
      valor,
      tipo: config.tipo,
      descripcion: config.descripcion,
    };
  }

  static async obtenerTodasConfiguraciones() {
    const configs = await prisma.configuracion.findMany({
      orderBy: { clave: 'asc' },
    });

    return configs.map((config) => {
      let valor: any = config.valor;
      switch (config.tipo) {
        case 'number':
          valor = parseFloat(config.valor);
          break;
        case 'boolean':
          valor = config.valor === 'true';
          break;
        case 'json':
          valor = JSON.parse(config.valor);
          break;
        default:
          valor = config.valor;
      }

      return {
        id: config.id,
        clave: config.clave,
        valor,
        tipo: config.tipo,
        descripcion: config.descripcion,
      };
    });
  }

  static async guardarConfiguracion(
    clave: string,
    valor: any,
    tipo: 'string' | 'number' | 'boolean' | 'json' = 'string',
    descripcion?: string
  ) {
    // Convertir valor a string según tipo
    let valorString: string;
    switch (tipo) {
      case 'number':
        valorString = valor.toString();
        break;
      case 'boolean':
        valorString = valor ? 'true' : 'false';
        break;
      case 'json':
        valorString = JSON.stringify(valor);
        break;
      default:
        valorString = valor;
    }

    const config = await prisma.configuracion.upsert({
      where: { clave },
      update: {
        valor: valorString,
        tipo,
        descripcion,
      },
      create: {
        clave,
        valor: valorString,
        tipo,
        descripcion,
      },
    });

    return config;
  }

  static async eliminarConfiguracion(clave: string) {
    const config = await prisma.configuracion.findUnique({
      where: { clave },
    });

    if (!config) {
      throw new ErrorApi('Configuración no encontrada', 404);
    }

    await prisma.configuracion.delete({
      where: { clave },
    });

    return { mensaje: 'Configuración eliminada exitosamente' };
  }

  // ============================================
  // CONFIGURACIÓN DE EMPRESA (Helpers)
  // ============================================

  static async obtenerDatosEmpresa() {
    try {
      const config = await this.obtenerConfiguracion('datos_empresa');
      return config.valor;
    } catch {
      // Si no existe, retornar datos vacíos
      return {
        razonSocial: '',
        rfc: '',
        regimenFiscal: '',
        direccion: {
          calle: '',
          numeroExterior: '',
          numeroInterior: '',
          colonia: '',
          codigoPostal: '',
          ciudad: '',
          estado: '',
          pais: 'México',
        },
        contacto: {
          email: '',
          telefono: '',
          sitioWeb: '',
        },
        logo: '',
      };
    }
  }

  static async guardarDatosEmpresa(datos: any) {
    return this.guardarConfiguracion(
      'datos_empresa',
      datos,
      'json',
      'Datos fiscales de la empresa'
    );
  }

  // Configuración de numeración de facturas
  static async obtenerSiguienteFolio(serie: string = 'A') {
    const clave = `folio_${serie}`;
    try {
      const config = await this.obtenerConfiguracion(clave);
      const folioActual = parseInt(config.valor as string, 10);
      const siguienteFolio = folioActual + 1;

      // Actualizar el folio
      await this.guardarConfiguracion(clave, siguienteFolio.toString(), 'number');

      return siguienteFolio;
    } catch {
      // Si no existe, iniciar en 1
      await this.guardarConfiguracion(clave, '1', 'number', `Folio actual para serie ${serie}`);
      return 1;
    }
  }
}
