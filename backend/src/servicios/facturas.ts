import prisma from '../configuracion/baseDatos';
import { ErrorApi } from '../middlewares/errorHandler';
import { ServicioConfiguracion } from './configuracion';
import { Decimal } from '@prisma/client/runtime/library';
import type {
  CrearFacturaInput,
  ActualizarFacturaInput,
  FiltrosFacturaInput,
  LineaFacturaInput,
  CambiarEstadoInput,
} from '../validaciones/facturas';

export class ServicioFacturas {
  // ============================================
  // HELPERS PARA CÁLCULOS
  // ============================================

  private static calcularLineaFactura(linea: LineaFacturaInput) {
    const cantidad = linea.cantidad;
    const precioUnitario = linea.precioUnitario;
    const descuento = linea.descuento || 0;
    const tasaIVA = linea.iva || 16;
    const tasaIEPS = linea.ieps || 0;

    // Subtotal de la línea (cantidad * precio)
    const subtotal = cantidad * precioUnitario;

    // Aplicar descuento
    const subtotalConDescuento = subtotal - descuento;

    // Calcular impuestos
    const montoIVA = subtotalConDescuento * (tasaIVA / 100);
    const montoIEPS = subtotalConDescuento * (tasaIEPS / 100);

    // Total de la línea
    const total = subtotalConDescuento + montoIVA + montoIEPS;

    return {
      cantidad,
      precioUnitario,
      descuento,
      iva: tasaIVA,
      ieps: tasaIEPS,
      subtotal,
      total,
    };
  }

  private static calcularTotalesFactura(lineas: LineaFacturaInput[]) {
    let subtotal = 0;
    let descuento = 0;
    let totalIVA = 0;
    let totalIEPS = 0;

    lineas.forEach((linea) => {
      const calculoLinea = this.calcularLineaFactura(linea);
      subtotal += calculoLinea.subtotal;
      descuento += calculoLinea.descuento;

      // Calcular impuestos sobre (subtotal - descuento)
      const baseImpuestos = calculoLinea.subtotal - calculoLinea.descuento;
      totalIVA += baseImpuestos * (linea.iva / 100);
      totalIEPS += baseImpuestos * ((linea.ieps || 0) / 100);
    });

    const total = subtotal - descuento + totalIVA + totalIEPS;

    return {
      subtotal,
      descuento,
      iva: totalIVA,
      ieps: totalIEPS,
      total,
    };
  }

  // ============================================
  // CREAR FACTURA
  // ============================================

  static async crear(datos: CrearFacturaInput, usuarioId: string) {
    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: datos.clienteId },
    });

    if (!cliente) {
      throw new ErrorApi('Cliente no encontrado', 404);
    }

    // Verificar que todos los productos existen y obtener sus datos
    const productosIds = datos.lineas.map((l) => l.productoId);
    const productos = await prisma.producto.findMany({
      where: { id: { in: productosIds } },
    });

    if (productos.length !== productosIds.length) {
      throw new ErrorApi('Uno o más productos no encontrados', 404);
    }

    // Validar stock si controla inventario
    for (const linea of datos.lineas) {
      const producto = productos.find((p) => p.id === linea.productoId);
      if (producto && producto.controlaInventario) {
        const stockActual = producto.stockActual?.toNumber() || 0;
        if (stockActual < linea.cantidad) {
          throw new ErrorApi(
            `Stock insuficiente para el producto ${producto.nombre}. Disponible: ${stockActual}`,
            400
          );
        }
      }
    }

    // Obtener siguiente folio
    const folio = await ServicioConfiguracion.obtenerSiguienteFolio(datos.serie);
    const folioCompleto = `${datos.serie}-${folio}`;

    // Calcular totales
    const totales = this.calcularTotalesFactura(datos.lineas);

    // Crear factura con transacción
    const factura = await prisma.$transaction(async (tx) => {
      // Crear la factura
      const nuevaFactura = await tx.factura.create({
        data: {
          serie: datos.serie,
          folio,
          folioCompleto,
          clienteId: datos.clienteId,
          usuarioId,
          fecha: datos.fecha || new Date(),
          fechaVencimiento: datos.fechaVencimiento,
          subtotal: totales.subtotal,
          descuento: totales.descuento,
          iva: totales.iva,
          ieps: totales.ieps,
          total: totales.total,
          estado: datos.estado,
          metodoPago: datos.metodoPago,
          formaPago: datos.formaPago,
          condicionPago: datos.condicionPago,
          observaciones: datos.observaciones || null,
        },
      });

      // Crear líneas de factura
      for (let i = 0; i < datos.lineas.length; i++) {
        const linea = datos.lineas[i];
        const calculoLinea = this.calcularLineaFactura(linea);

        await tx.lineaFactura.create({
          data: {
            facturaId: nuevaFactura.id,
            productoId: linea.productoId,
            cantidad: calculoLinea.cantidad,
            precioUnitario: calculoLinea.precioUnitario,
            descuento: calculoLinea.descuento,
            iva: calculoLinea.iva,
            ieps: calculoLinea.ieps,
            subtotal: calculoLinea.subtotal,
            total: calculoLinea.total,
            orden: i + 1,
          },
        });

        // Actualizar stock si aplica
        const producto = productos.find((p) => p.id === linea.productoId);
        if (producto && producto.controlaInventario && datos.estado !== 'BORRADOR') {
          const stockActual = producto.stockActual?.toNumber() || 0;
          const nuevoStock = stockActual - linea.cantidad;

          await tx.producto.update({
            where: { id: linea.productoId },
            data: { stockActual: nuevoStock },
          });
        }
      }

      return nuevaFactura;
    });

    // Retornar factura con relaciones
    return await this.obtenerPorId(factura.id);
  }

  // ============================================
  // OBTENER FACTURAS
  // ============================================

  static async obtenerTodos(filtros: FiltrosFacturaInput) {
    const { busqueda, clienteId, estado, serie, fechaDesde, fechaHasta, limite, pagina } = filtros;

    // Construir condiciones WHERE
    const where: any = {};

    if (clienteId) {
      where.clienteId = clienteId;
    }

    if (estado) {
      where.estado = estado;
    }

    if (serie) {
      where.serie = serie;
    }

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = fechaDesde;
      if (fechaHasta) where.fecha.lte = fechaHasta;
    }

    if (busqueda) {
      where.OR = [
        { folioCompleto: { contains: busqueda, mode: 'insensitive' } },
        { cliente: { razonSocial: { contains: busqueda, mode: 'insensitive' } } },
        { cliente: { rfc: { contains: busqueda, mode: 'insensitive' } } },
      ];
    }

    // Calcular skip para paginación
    const skip = (pagina - 1) * limite;

    // Obtener facturas y total
    const [facturas, total] = await Promise.all([
      prisma.factura.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fecha: 'desc' },
        include: {
          cliente: {
            select: {
              razonSocial: true,
              rfc: true,
              email: true,
            },
          },
          usuario: {
            select: {
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          lineas: {
            include: {
              producto: {
                select: {
                  clave: true,
                  nombre: true,
                  unidadMedida: true,
                },
              },
            },
            orderBy: { orden: 'asc' },
          },
        },
      }),
      prisma.factura.count({ where }),
    ]);

    return {
      facturas,
      paginacion: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  static async obtenerPorId(id: string) {
    const factura = await prisma.factura.findUnique({
      where: { id },
      include: {
        cliente: true,
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        lineas: {
          include: {
            producto: true,
          },
          orderBy: { orden: 'asc' },
        },
        pagos: {
          include: {
            pago: true,
          },
        },
      },
    });

    if (!factura) {
      throw new ErrorApi('Factura no encontrada', 404);
    }

    return factura;
  }

  static async obtenerPorFolio(folioCompleto: string) {
    const factura = await prisma.factura.findUnique({
      where: { folioCompleto },
      include: {
        cliente: true,
        lineas: {
          include: {
            producto: true,
          },
          orderBy: { orden: 'asc' },
        },
      },
    });

    if (!factura) {
      throw new ErrorApi('Factura no encontrada', 404);
    }

    return factura;
  }

  // ============================================
  // ACTUALIZAR FACTURA
  // ============================================

  static async actualizar(id: string, datos: ActualizarFacturaInput) {
    const facturaExistente = await prisma.factura.findUnique({
      where: { id },
      include: { lineas: true },
    });

    if (!facturaExistente) {
      throw new ErrorApi('Factura no encontrada', 404);
    }

    // No permitir editar facturas timbradas o canceladas
    if (['TIMBRADA', 'CANCELADA'].includes(facturaExistente.estado)) {
      throw new ErrorApi('No se puede editar una factura timbrada o cancelada', 400);
    }

    // Si se actualizan líneas, recalcular totales
    let totales: any = undefined;
    if (datos.lineas) {
      totales = this.calcularTotalesFactura(datos.lineas);
    }

    const factura = await prisma.$transaction(async (tx) => {
      // Si se actualizan líneas, eliminar las anteriores y crear nuevas
      if (datos.lineas) {
        await tx.lineaFactura.deleteMany({
          where: { facturaId: id },
        });

        for (let i = 0; i < datos.lineas.length; i++) {
          const linea = datos.lineas[i];
          const calculoLinea = this.calcularLineaFactura(linea);

          await tx.lineaFactura.create({
            data: {
              facturaId: id,
              productoId: linea.productoId,
              cantidad: calculoLinea.cantidad,
              precioUnitario: calculoLinea.precioUnitario,
              descuento: calculoLinea.descuento,
              iva: calculoLinea.iva,
              ieps: calculoLinea.ieps,
              subtotal: calculoLinea.subtotal,
              total: calculoLinea.total,
              orden: i + 1,
            },
          });
        }
      }

      // Actualizar factura
      return await tx.factura.update({
        where: { id },
        data: {
          ...datos,
          ...(totales && {
            subtotal: totales.subtotal,
            descuento: totales.descuento,
            iva: totales.iva,
            ieps: totales.ieps,
            total: totales.total,
          }),
          observaciones: datos.observaciones || null,
        },
      });
    });

    return await this.obtenerPorId(factura.id);
  }

  // ============================================
  // CAMBIAR ESTADO
  // ============================================

  static async cambiarEstado(id: string, datos: CambiarEstadoInput) {
    const factura = await prisma.factura.findUnique({
      where: { id },
    });

    if (!factura) {
      throw new ErrorApi('Factura no encontrada', 404);
    }

    // Validaciones de transiciones de estado
    if (factura.estado === 'CANCELADA') {
      throw new ErrorApi('No se puede cambiar el estado de una factura cancelada', 400);
    }

    if (datos.estado === 'TIMBRADA' && factura.estado !== 'EMITIDA') {
      throw new ErrorApi('Solo se pueden timbrar facturas emitidas', 400);
    }

    const facturaActualizada = await prisma.factura.update({
      where: { id },
      data: { estado: datos.estado },
    });

    return facturaActualizada;
  }

  // ============================================
  // ELIMINAR / CANCELAR
  // ============================================

  static async eliminar(id: string) {
    const factura = await prisma.factura.findUnique({
      where: { id },
      include: { lineas: true },
    });

    if (!factura) {
      throw new ErrorApi('Factura no encontrada', 404);
    }

    // Solo se pueden eliminar borradores
    if (factura.estado !== 'BORRADOR') {
      throw new ErrorApi('Solo se pueden eliminar facturas en borrador. Use cancelar para otros estados.', 400);
    }

    await prisma.factura.delete({
      where: { id },
    });

    return { mensaje: 'Factura eliminada exitosamente' };
  }

  static async cancelar(id: string, motivo?: string) {
    const factura = await prisma.factura.findUnique({
      where: { id },
    });

    if (!factura) {
      throw new ErrorApi('Factura no encontrada', 404);
    }

    if (factura.estado === 'CANCELADA') {
      throw new ErrorApi('La factura ya está cancelada', 400);
    }

    const facturaActualizada = await prisma.factura.update({
      where: { id },
      data: {
        estado: 'CANCELADA',
        observaciones: motivo ? `CANCELADA: ${motivo}` : factura.observaciones,
      },
    });

    return { mensaje: 'Factura cancelada exitosamente', factura: facturaActualizada };
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  static async obtenerEstadisticas() {
    // Fecha actual y hace 30 días
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    // Inicio del mes actual
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const [
      totalFacturas,
      totalBorradores,
      totalEmitidas,
      totalTimbradas,
      totalPagadas,
      totalVencidas,
      totalCanceladas,
      montoTotal,
      montoPagado,
      facturasDelMes,
      montosDelMes,
      facturasUltimos30Dias,
    ] = await Promise.all([
      prisma.factura.count(),
      prisma.factura.count({ where: { estado: 'BORRADOR' } }),
      prisma.factura.count({ where: { estado: 'EMITIDA' } }),
      prisma.factura.count({ where: { estado: 'TIMBRADA' } }),
      prisma.factura.count({ where: { estado: 'PAGADA' } }),
      prisma.factura.count({ where: { estado: 'VENCIDA' } }),
      prisma.factura.count({ where: { estado: 'CANCELADA' } }),
      prisma.factura.aggregate({
        _sum: { total: true },
        where: { estado: { notIn: ['BORRADOR', 'CANCELADA'] } },
      }),
      prisma.factura.aggregate({
        _sum: { total: true },
        where: { estado: 'PAGADA' },
      }),
      prisma.factura.count({
        where: {
          fecha: { gte: inicioMes },
          estado: { notIn: ['BORRADOR', 'CANCELADA'] },
        },
      }),
      prisma.factura.aggregate({
        _sum: { total: true },
        where: {
          fecha: { gte: inicioMes },
          estado: { notIn: ['BORRADOR', 'CANCELADA'] },
        },
      }),
      prisma.factura.groupBy({
        by: ['estado'],
        _count: { id: true },
        _sum: { total: true },
        where: {
          fecha: { gte: hace30Dias },
        },
      }),
    ]);

    // Facturas por mes (últimos 6 meses)
    const facturasPorMes = await this.obtenerFacturasPorMes(6);

    return {
      totalFacturas,
      porEstado: {
        borradores: totalBorradores,
        emitidas: totalEmitidas,
        timbradas: totalTimbradas,
        pagadas: totalPagadas,
        vencidas: totalVencidas,
        canceladas: totalCanceladas,
      },
      montos: {
        total: Number(montoTotal._sum.total || 0),
        pagado: Number(montoPagado._sum.total || 0),
        porCobrar: Number(montoTotal._sum.total || 0) - Number(montoPagado._sum.total || 0),
      },
      delMes: {
        cantidad: facturasDelMes,
        monto: Number(montosDelMes._sum.total || 0),
      },
      ultimos30Dias: facturasUltimos30Dias.map((item) => ({
        estado: item.estado,
        cantidad: item._count.id,
        monto: Number(item._sum.total || 0),
      })),
      facturasPorMes,
    };
  }

  private static async obtenerFacturasPorMes(meses: number = 6) {
    const resultado = [];
    const hoy = new Date();

    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

      const [cantidad, montos] = await Promise.all([
        prisma.factura.count({
          where: {
            fecha: { gte: inicioMes, lte: finMes },
            estado: { notIn: ['BORRADOR', 'CANCELADA'] },
          },
        }),
        prisma.factura.aggregate({
          _sum: { total: true },
          where: {
            fecha: { gte: inicioMes, lte: finMes },
            estado: { notIn: ['BORRADOR', 'CANCELADA'] },
          },
        }),
      ]);

      resultado.push({
        mes: fecha.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
        cantidad,
        monto: Number(montos._sum.total || 0),
      });
    }

    return resultado;
  }
}
