import prisma from '../configuracion/baseDatos';
import { ErrorApi } from '../middlewares/errorHandler';
import type {
  CrearClienteInput,
  ActualizarClienteInput,
  FiltrosClienteInput,
} from '../validaciones/clientes';

export class ServicioClientes {
  // Crear nuevo cliente
  static async crear(datos: CrearClienteInput) {
    // Verificar si el RFC ya existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { rfc: datos.rfc },
    });

    if (clienteExistente) {
      throw new ErrorApi('El RFC ya está registrado', 409);
    }

    // Crear cliente
    const cliente = await prisma.cliente.create({
      data: {
        ...datos,
        email: datos.email || null,
        telefono: datos.telefono || null,
        celular: datos.celular || null,
        sitioWeb: datos.sitioWeb || null,
        calle: datos.calle || null,
        numeroExterior: datos.numeroExterior || null,
        numeroInterior: datos.numeroInterior || null,
        colonia: datos.colonia || null,
        codigoPostal: datos.codigoPostal || null,
        ciudad: datos.ciudad || null,
        estado: datos.estado || null,
        notas: datos.notas || null,
      },
    });

    return cliente;
  }

  // Obtener todos los clientes con filtros y paginación
  static async obtenerTodos(filtros: FiltrosClienteInput) {
    const { busqueda, activo, regimenFiscal, limite, pagina } = filtros;

    // Construir condiciones WHERE
    const where: any = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (regimenFiscal) {
      where.regimenFiscal = regimenFiscal;
    }

    if (busqueda) {
      where.OR = [
        { razonSocial: { contains: busqueda, mode: 'insensitive' } },
        { nombreComercial: { contains: busqueda, mode: 'insensitive' } },
        { rfc: { contains: busqueda, mode: 'insensitive' } },
        { email: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    // Calcular skip para paginación
    const skip = (pagina - 1) * limite;

    // Obtener clientes y total
    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limite,
        orderBy: { razonSocial: 'asc' },
      }),
      prisma.cliente.count({ where }),
    ]);

    return {
      clientes,
      paginacion: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  // Obtener cliente por ID
  static async obtenerPorId(id: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        facturas: {
          take: 5,
          orderBy: { fecha: 'desc' },
          select: {
            id: true,
            folioCompleto: true,
            fecha: true,
            total: true,
            estado: true,
          },
        },
      },
    });

    if (!cliente) {
      throw new ErrorApi('Cliente no encontrado', 404);
    }

    return cliente;
  }

  // Actualizar cliente
  static async actualizar(id: string, datos: ActualizarClienteInput) {
    // Verificar que el cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExistente) {
      throw new ErrorApi('Cliente no encontrado', 404);
    }

    // Si se está actualizando el RFC, verificar que no esté duplicado
    if (datos.rfc && datos.rfc !== clienteExistente.rfc) {
      const rfcDuplicado = await prisma.cliente.findUnique({
        where: { rfc: datos.rfc },
      });

      if (rfcDuplicado) {
        throw new ErrorApi('El RFC ya está registrado', 409);
      }
    }

    // Actualizar cliente
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        ...datos,
        email: datos.email || null,
        telefono: datos.telefono || null,
        celular: datos.celular || null,
        sitioWeb: datos.sitioWeb || null,
        calle: datos.calle || null,
        numeroExterior: datos.numeroExterior || null,
        numeroInterior: datos.numeroInterior || null,
        colonia: datos.colonia || null,
        codigoPostal: datos.codigoPostal || null,
        ciudad: datos.ciudad || null,
        estado: datos.estado || null,
        notas: datos.notas || null,
      },
    });

    return cliente;
  }

  // Eliminar cliente (soft delete - solo cambiar activo a false)
  static async eliminar(id: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      throw new ErrorApi('Cliente no encontrado', 404);
    }

    // Verificar si tiene facturas
    const cantidadFacturas = await prisma.factura.count({
      where: { clienteId: id },
    });

    if (cantidadFacturas > 0) {
      // Si tiene facturas, solo desactivar
      await prisma.cliente.update({
        where: { id },
        data: { activo: false },
      });

      return {
        mensaje: 'Cliente desactivado (tiene facturas asociadas)',
        desactivado: true,
      };
    }

    // Si no tiene facturas, eliminar permanentemente
    await prisma.cliente.delete({
      where: { id },
    });

    return {
      mensaje: 'Cliente eliminado exitosamente',
      desactivado: false,
    };
  }

  // Activar/Desactivar cliente
  static async cambiarEstado(id: string, activo: boolean) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      throw new ErrorApi('Cliente no encontrado', 404);
    }

    await prisma.cliente.update({
      where: { id },
      data: { activo },
    });

    return {
      mensaje: `Cliente ${activo ? 'activado' : 'desactivado'} exitosamente`,
    };
  }

  // Obtener estadísticas del cliente
  static async obtenerEstadisticas(id: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      throw new ErrorApi('Cliente no encontrado', 404);
    }

    const [totalFacturas, totalPagado, facturasVencidas] = await Promise.all([
      // Total de facturas
      prisma.factura.count({
        where: { clienteId: id },
      }),

      // Total pagado
      prisma.factura.aggregate({
        where: {
          clienteId: id,
          estado: 'PAGADA',
        },
        _sum: {
          total: true,
        },
      }),

      // Facturas vencidas
      prisma.factura.count({
        where: {
          clienteId: id,
          estado: 'VENCIDA',
        },
      }),
    ]);

    return {
      totalFacturas,
      totalPagado: totalPagado._sum.total || 0,
      facturasVencidas,
    };
  }
}
