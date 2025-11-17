import prisma from '../configuracion/baseDatos';
import { ErrorApi } from '../middlewares/errorHandler';
import { Decimal } from '@prisma/client/runtime/library';
import type {
  CrearPagoInput,
  ActualizarPagoInput,
  AplicarPagoInput,
  FiltrosPagoInput,
  CambiarEstadoPagoInput,
} from '../validaciones/pagos';

export class ServicioPagos {
  // ============================================
  // CREAR PAGO
  // ============================================

  static async crear(datos: CrearPagoInput) {
    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: datos.clienteId },
    });

    if (!cliente) {
      throw new ErrorApi('Cliente no encontrado', 404);
    }

    // Generar folio automático
    const ultimoPago = await prisma.pago.findFirst({
      orderBy: { creadoEn: 'desc' },
      select: { folio: true },
    });

    const siguienteFolio = ultimoPago
      ? `P-${(parseInt(ultimoPago.folio.split('-')[1]) + 1).toString().padStart(6, '0')}`
      : 'P-000001';

    // Crear pago con aplicaciones si existen
    const pago = await prisma.$transaction(async (tx) => {
      const nuevoPago = await tx.pago.create({
        data: {
          folio: siguienteFolio,
          clienteId: datos.clienteId,
          fecha: datos.fecha || new Date(),
          monto: datos.monto,
          formaPago: datos.formaPago,
          referencia: datos.referencia,
          banco: datos.banco,
          cuentaBancaria: datos.cuentaBancaria,
          observaciones: datos.observaciones,
          estado: 'APLICADO',
        },
      });

      // Si hay aplicaciones, crear y actualizar facturas
      if (datos.aplicaciones && datos.aplicaciones.length > 0) {
        let montoRestante = datos.monto;

        for (const aplicacion of datos.aplicaciones) {
          // Verificar que la factura existe
          const factura = await tx.factura.findUnique({
            where: { id: aplicacion.facturaId },
          });

          if (!factura) {
            throw new ErrorApi(`Factura ${aplicacion.facturaId} no encontrada`, 404);
          }

          if (factura.estado === 'PAGADA') {
            throw new ErrorApi(`La factura ${factura.folioCompleto} ya está pagada`, 400);
          }

          if (factura.estado === 'CANCELADA') {
            throw new ErrorApi(`La factura ${factura.folioCompleto} está cancelada`, 400);
          }

          // Validar que el monto no exceda el monto del pago
          if (aplicacion.monto > montoRestante) {
            throw new ErrorApi(
              `El monto de la aplicación excede el monto disponible del pago`,
              400
            );
          }

          // Crear aplicación de pago
          await tx.aplicacionPago.create({
            data: {
              pagoId: nuevoPago.id,
              facturaId: aplicacion.facturaId,
              monto: aplicacion.monto,
            },
          });

          // Calcular total pagado de la factura
          const totalPagado = await tx.aplicacionPago.aggregate({
            where: { facturaId: aplicacion.facturaId },
            _sum: { monto: true },
          });

          const montoPagado = totalPagado._sum.monto || new Decimal(0);
          const totalFactura = factura.total;

          // Actualizar estado de la factura
          let nuevoEstado = factura.estado;
          if (montoPagado.greaterThanOrEqualTo(totalFactura)) {
            nuevoEstado = 'PAGADA';
          } else if (montoPagado.greaterThan(0)) {
            nuevoEstado = 'PARCIALMENTE_PAGADA';
          }

          await tx.factura.update({
            where: { id: aplicacion.facturaId },
            data: { estado: nuevoEstado },
          });

          montoRestante -= aplicacion.monto;
        }
      }

      return nuevoPago;
    });

    return await this.obtenerPorId(pago.id);
  }

  // ============================================
  // OBTENER PAGOS
  // ============================================

  static async obtenerTodos(filtros: FiltrosPagoInput) {
    const { busqueda, clienteId, estado, formaPago, fechaDesde, fechaHasta, limite, pagina } =
      filtros;

    const where: any = {};

    // Filtro por búsqueda (folio o referencia)
    if (busqueda) {
      where.OR = [
        { folio: { contains: busqueda, mode: 'insensitive' } },
        { referencia: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (clienteId) where.clienteId = clienteId;
    if (estado) where.estado = estado;
    if (formaPago) where.formaPago = formaPago;

    // Filtros de fecha
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta);
    }

    // Contar total
    const total = await prisma.pago.count({ where });

    // Obtener pagos
    const pagos = await prisma.pago.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            razonSocial: true,
            rfc: true,
          },
        },
        aplicaciones: {
          include: {
            factura: {
              select: {
                id: true,
                folioCompleto: true,
                total: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
      take: limite,
      skip: (pagina - 1) * limite,
    });

    return {
      pagos,
      paginacion: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  static async obtenerPorId(id: string) {
    const pago = await prisma.pago.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            razonSocial: true,
            rfc: true,
            email: true,
          },
        },
        aplicaciones: {
          include: {
            factura: {
              select: {
                id: true,
                folioCompleto: true,
                total: true,
                estado: true,
                fecha: true,
              },
            },
          },
        },
      },
    });

    if (!pago) {
      throw new ErrorApi('Pago no encontrado', 404);
    }

    return pago;
  }

  // ============================================
  // ACTUALIZAR PAGO
  // ============================================

  static async actualizar(id: string, datos: ActualizarPagoInput) {
    const pago = await prisma.pago.findUnique({
      where: { id },
    });

    if (!pago) {
      throw new ErrorApi('Pago no encontrado', 404);
    }

    if (pago.estado === 'CANCELADO') {
      throw new ErrorApi('No se puede actualizar un pago cancelado', 400);
    }

    const pagoActualizado = await prisma.pago.update({
      where: { id },
      data: datos,
    });

    return await this.obtenerPorId(pagoActualizado.id);
  }

  // ============================================
  // APLICAR PAGO A FACTURA
  // ============================================

  static async aplicarAFactura(id: string, datos: AplicarPagoInput) {
    const pago = await prisma.pago.findUnique({
      where: { id },
      include: {
        aplicaciones: true,
      },
    });

    if (!pago) {
      throw new ErrorApi('Pago no encontrado', 404);
    }

    if (pago.estado === 'CANCELADO') {
      throw new ErrorApi('No se puede aplicar un pago cancelado', 400);
    }

    // Verificar factura
    const factura = await prisma.factura.findUnique({
      where: { id: datos.facturaId },
    });

    if (!factura) {
      throw new ErrorApi('Factura no encontrada', 404);
    }

    if (factura.estado === 'PAGADA') {
      throw new ErrorApi(`La factura ${factura.folioCompleto} ya está pagada`, 400);
    }

    if (factura.estado === 'CANCELADA') {
      throw new ErrorApi(`La factura ${factura.folioCompleto} está cancelada`, 400);
    }

    // Calcular monto ya aplicado
    const montoAplicado = pago.aplicaciones.reduce(
      (sum, app) => sum + Number(app.monto),
      0
    );
    const montoDisponible = Number(pago.monto) - montoAplicado;

    if (datos.monto > montoDisponible) {
      throw new ErrorApi(
        `El monto excede el disponible del pago. Disponible: ${montoDisponible}`,
        400
      );
    }

    // Aplicar pago y actualizar factura
    await prisma.$transaction(async (tx) => {
      // Crear aplicación
      await tx.aplicacionPago.create({
        data: {
          pagoId: id,
          facturaId: datos.facturaId,
          monto: datos.monto,
        },
      });

      // Calcular total pagado de la factura
      const totalPagado = await tx.aplicacionPago.aggregate({
        where: { facturaId: datos.facturaId },
        _sum: { monto: true },
      });

      const montoPagado = totalPagado._sum.monto || new Decimal(0);
      const totalFactura = factura.total;

      // Actualizar estado de la factura
      let nuevoEstado = factura.estado;
      if (montoPagado.greaterThanOrEqualTo(totalFactura)) {
        nuevoEstado = 'PAGADA';
      } else if (montoPagado.greaterThan(0)) {
        nuevoEstado = 'PARCIALMENTE_PAGADA';
      }

      await tx.factura.update({
        where: { id: datos.facturaId },
        data: { estado: nuevoEstado },
      });
    });

    return await this.obtenerPorId(id);
  }

  // ============================================
  // CAMBIAR ESTADO
  // ============================================

  static async cambiarEstado(id: string, datos: CambiarEstadoPagoInput) {
    const pago = await prisma.pago.findUnique({
      where: { id },
      include: {
        aplicaciones: true,
      },
    });

    if (!pago) {
      throw new ErrorApi('Pago no encontrado', 404);
    }

    // Si se cancela, revertir aplicaciones
    if (datos.estado === 'CANCELADO' && pago.estado !== 'CANCELADO') {
      if (pago.aplicaciones.length > 0) {
        await prisma.$transaction(async (tx) => {
          // Eliminar aplicaciones
          await tx.aplicacionPago.deleteMany({
            where: { pagoId: id },
          });

          // Actualizar estado de facturas afectadas
          for (const aplicacion of pago.aplicaciones) {
            const factura = await tx.factura.findUnique({
              where: { id: aplicacion.facturaId },
            });

            if (factura) {
              // Recalcular total pagado sin esta aplicación
              const totalPagado = await tx.aplicacionPago.aggregate({
                where: { facturaId: aplicacion.facturaId },
                _sum: { monto: true },
              });

              const montoPagado = totalPagado._sum.monto || new Decimal(0);
              const totalFactura = factura.total;

              let nuevoEstado = factura.estado;
              if (montoPagado.equals(0)) {
                nuevoEstado = 'EMITIDA';
              } else if (montoPagado.greaterThan(0) && montoPagado.lessThan(totalFactura)) {
                nuevoEstado = 'PARCIALMENTE_PAGADA';
              } else if (montoPagado.greaterThanOrEqualTo(totalFactura)) {
                nuevoEstado = 'PAGADA';
              }

              await tx.factura.update({
                where: { id: aplicacion.facturaId },
                data: { estado: nuevoEstado },
              });
            }
          }

          // Actualizar pago
          await tx.pago.update({
            where: { id },
            data: {
              estado: datos.estado,
              observaciones: datos.motivo
                ? `${datos.motivo}\n\n${pago.observaciones || ''}`
                : pago.observaciones,
            },
          });
        });
      } else {
        await prisma.pago.update({
          where: { id },
          data: { estado: datos.estado },
        });
      }
    } else {
      await prisma.pago.update({
        where: { id },
        data: { estado: datos.estado },
      });
    }

    return await this.obtenerPorId(id);
  }

  // ============================================
  // ELIMINAR PAGO
  // ============================================

  static async eliminar(id: string) {
    const pago = await prisma.pago.findUnique({
      where: { id },
      include: {
        aplicaciones: true,
      },
    });

    if (!pago) {
      throw new ErrorApi('Pago no encontrado', 404);
    }

    if (pago.aplicaciones.length > 0) {
      throw new ErrorApi('No se puede eliminar un pago con aplicaciones. Cancélelo primero.', 400);
    }

    await prisma.pago.delete({
      where: { id },
    });

    return { mensaje: 'Pago eliminado exitosamente' };
  }

  // ============================================
  // ESTADO DE CUENTA POR CLIENTE
  // ============================================

  static async estadoDeCuenta(clienteId: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new ErrorApi('Cliente no encontrado', 404);
    }

    // Facturas del cliente
    const facturas = await prisma.factura.findMany({
      where: {
        clienteId,
        estado: { notIn: ['BORRADOR', 'CANCELADA'] },
      },
      include: {
        aplicaciones: {
          include: {
            pago: {
              select: {
                id: true,
                folio: true,
                fecha: true,
                formaPago: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    // Pagos del cliente
    const pagos = await prisma.pago.findMany({
      where: {
        clienteId,
        estado: 'APLICADO',
      },
      include: {
        aplicaciones: {
          include: {
            factura: {
              select: {
                id: true,
                folioCompleto: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    // Calcular totales
    const totalFacturado = facturas.reduce((sum, f) => sum + Number(f.total), 0);
    const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto), 0);
    const saldo = totalFacturado - totalPagado;

    // Facturas vencidas
    const hoy = new Date();
    const facturasVencidas = facturas.filter(
      (f) =>
        f.fechaVencimiento &&
        new Date(f.fechaVencimiento) < hoy &&
        f.estado !== 'PAGADA'
    );

    return {
      cliente: {
        id: cliente.id,
        razonSocial: cliente.razonSocial,
        rfc: cliente.rfc,
      },
      resumen: {
        totalFacturado,
        totalPagado,
        saldo,
        facturasPendientes: facturas.filter((f) => f.estado !== 'PAGADA').length,
        facturasVencidas: facturasVencidas.length,
      },
      facturas: facturas.map((f) => {
        const montoPagado = f.aplicaciones.reduce(
          (sum, app) => sum + Number(app.monto),
          0
        );
        return {
          ...f,
          montoPagado,
          saldo: Number(f.total) - montoPagado,
        };
      }),
      pagos,
    };
  }
}
