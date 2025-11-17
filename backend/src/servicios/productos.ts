import prisma from '../configuracion/baseDatos';
import { ErrorApi } from '../middlewares/errorHandler';
import type {
  CrearProductoInput,
  ActualizarProductoInput,
  FiltrosProductoInput,
} from '../validaciones/productos';

export class ServicioProductos {
  // Crear nuevo producto
  static async crear(datos: CrearProductoInput) {
    // Verificar si la clave ya existe
    const productoExistente = await prisma.producto.findUnique({
      where: { clave: datos.clave },
    });

    if (productoExistente) {
      throw new ErrorApi('La clave ya está registrada', 409);
    }

    // Crear producto
    const producto = await prisma.producto.create({
      data: {
        ...datos,
        descripcion: datos.descripcion || null,
        categoria: datos.categoria || null,
        claveProdServ: datos.claveProdServ || null,
        claveUnidad: datos.claveUnidad || null,
        costo: datos.costo || null,
        ieps: datos.ieps || null,
        stockActual: datos.stockActual || null,
        stockMinimo: datos.stockMinimo || null,
        stockMaximo: datos.stockMaximo || null,
      },
    });

    return producto;
  }

  // Obtener todos los productos con filtros y paginación
  static async obtenerTodos(filtros: FiltrosProductoInput) {
    const {
      busqueda,
      categoria,
      tipo,
      activo,
      controlaInventario,
      stockBajo,
      limite,
      pagina,
    } = filtros;

    // Construir condiciones WHERE
    const where: any = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (controlaInventario !== undefined) {
      where.controlaInventario = controlaInventario;
    }

    if (busqueda) {
      where.OR = [
        { clave: { contains: busqueda, mode: 'insensitive' } },
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    // Filtro de stock bajo (stock actual < stock mínimo)
    if (stockBajo) {
      where.controlaInventario = true;
      where.AND = [
        { stockActual: { not: null } },
        { stockMinimo: { not: null } },
      ];
      // Esta condición se manejará en el código después de obtener los resultados
      // ya que Prisma no permite comparar dos campos directamente en WHERE
    }

    // Calcular skip para paginación
    const skip = (pagina - 1) * limite;

    // Obtener productos y total
    let [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        skip,
        take: limite,
        orderBy: { nombre: 'asc' },
      }),
      prisma.producto.count({ where }),
    ]);

    // Filtrar productos con stock bajo si se solicitó
    if (stockBajo) {
      productos = productos.filter(
        (p) =>
          p.stockActual !== null &&
          p.stockMinimo !== null &&
          p.stockActual < p.stockMinimo
      );
      total = productos.length;
    }

    return {
      productos,
      paginacion: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  // Obtener producto por ID
  static async obtenerPorId(id: string) {
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        lineasFactura: {
          take: 5,
          orderBy: { factura: { fecha: 'desc' } },
          include: {
            factura: {
              select: {
                id: true,
                folioCompleto: true,
                fecha: true,
                cliente: {
                  select: {
                    razonSocial: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!producto) {
      throw new ErrorApi('Producto no encontrado', 404);
    }

    return producto;
  }

  // Obtener producto por clave
  static async obtenerPorClave(clave: string) {
    const producto = await prisma.producto.findUnique({
      where: { clave },
    });

    if (!producto) {
      throw new ErrorApi('Producto no encontrado', 404);
    }

    return producto;
  }

  // Actualizar producto
  static async actualizar(id: string, datos: ActualizarProductoInput) {
    // Verificar que el producto existe
    const productoExistente = await prisma.producto.findUnique({
      where: { id },
    });

    if (!productoExistente) {
      throw new ErrorApi('Producto no encontrado', 404);
    }

    // Si se está actualizando la clave, verificar que no esté duplicada
    if (datos.clave && datos.clave !== productoExistente.clave) {
      const claveDuplicada = await prisma.producto.findUnique({
        where: { clave: datos.clave },
      });

      if (claveDuplicada) {
        throw new ErrorApi('La clave ya está registrada', 409);
      }
    }

    // Actualizar producto
    const producto = await prisma.producto.update({
      where: { id },
      data: {
        ...datos,
        descripcion: datos.descripcion || null,
        categoria: datos.categoria || null,
        claveProdServ: datos.claveProdServ || null,
        claveUnidad: datos.claveUnidad || null,
        costo: datos.costo || null,
        ieps: datos.ieps || null,
        stockActual: datos.stockActual !== undefined ? datos.stockActual : undefined,
        stockMinimo: datos.stockMinimo !== undefined ? datos.stockMinimo : undefined,
        stockMaximo: datos.stockMaximo !== undefined ? datos.stockMaximo : undefined,
      },
    });

    return producto;
  }

  // Eliminar producto (soft delete - solo cambiar activo a false)
  static async eliminar(id: string) {
    const producto = await prisma.producto.findUnique({
      where: { id },
    });

    if (!producto) {
      throw new ErrorApi('Producto no encontrado', 404);
    }

    // Verificar si tiene líneas de factura
    const cantidadLineas = await prisma.lineaFactura.count({
      where: { productoId: id },
    });

    if (cantidadLineas > 0) {
      // Si tiene líneas de factura, solo desactivar
      await prisma.producto.update({
        where: { id },
        data: { activo: false },
      });

      return {
        mensaje: 'Producto desactivado (tiene facturas asociadas)',
        desactivado: true,
      };
    }

    // Si no tiene facturas, eliminar permanentemente
    await prisma.producto.delete({
      where: { id },
    });

    return {
      mensaje: 'Producto eliminado exitosamente',
      desactivado: false,
    };
  }

  // Activar/Desactivar producto
  static async cambiarEstado(id: string, activo: boolean) {
    const producto = await prisma.producto.findUnique({
      where: { id },
    });

    if (!producto) {
      throw new ErrorApi('Producto no encontrado', 404);
    }

    await prisma.producto.update({
      where: { id },
      data: { activo },
    });

    return {
      mensaje: `Producto ${activo ? 'activado' : 'desactivado'} exitosamente`,
    };
  }

  // Obtener categorías únicas
  static async obtenerCategorias() {
    const productos = await prisma.producto.findMany({
      where: {
        categoria: { not: null },
      },
      select: {
        categoria: true,
      },
      distinct: ['categoria'],
      orderBy: {
        categoria: 'asc',
      },
    });

    return productos
      .map((p) => p.categoria)
      .filter((c): c is string => c !== null);
  }

  // Obtener productos con stock bajo
  static async obtenerStockBajo() {
    const productos = await prisma.producto.findMany({
      where: {
        controlaInventario: true,
        activo: true,
        AND: [
          { stockActual: { not: null } },
          { stockMinimo: { not: null } },
        ],
      },
    });

    // Filtrar productos donde stock actual < stock mínimo
    const productosStockBajo = productos.filter(
      (p) =>
        p.stockActual !== null &&
        p.stockMinimo !== null &&
        p.stockActual < p.stockMinimo
    );

    return productosStockBajo;
  }

  // Ajustar stock (aumentar o disminuir)
  static async ajustarStock(id: string, cantidad: number, tipo: 'entrada' | 'salida') {
    const producto = await prisma.producto.findUnique({
      where: { id },
    });

    if (!producto) {
      throw new ErrorApi('Producto no encontrado', 404);
    }

    if (!producto.controlaInventario) {
      throw new ErrorApi('Este producto no controla inventario', 400);
    }

    const stockActual = producto.stockActual?.toNumber() || 0;
    let nuevoStock: number;

    if (tipo === 'entrada') {
      nuevoStock = stockActual + cantidad;
    } else {
      nuevoStock = stockActual - cantidad;
      if (nuevoStock < 0) {
        throw new ErrorApi('Stock insuficiente', 400);
      }
    }

    const productoActualizado = await prisma.producto.update({
      where: { id },
      data: { stockActual: nuevoStock },
    });

    return productoActualizado;
  }
}
