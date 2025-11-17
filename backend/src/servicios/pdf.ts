import PDFDocument from 'pdfkit';
import { Response } from 'express';
import prisma from '../configuracion/baseDatos';
import { ErrorApi } from '../middlewares/errorHandler';

/**
 * Servicio para generar PDFs de facturas
 * Genera documentos profesionales con formato de factura mexicana
 */
export class ServicioPDF {
  /**
   * Genera el PDF de una factura y lo envía como stream a la respuesta HTTP
   */
  static async generarFacturaPDF(facturaId: string, res: Response): Promise<void> {
    // Obtener factura con todas sus relaciones
    const factura = await prisma.factura.findUnique({
      where: { id: facturaId },
      include: {
        cliente: true,
        lineas: {
          include: {
            producto: true,
          },
        },
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

    if (!factura) {
      throw new ErrorApi('Factura no encontrada', 404);
    }

    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
      info: {
        Title: `Factura ${factura.folio}`,
        Author: 'Sistema de Facturación',
        Subject: `Factura ${factura.folio} - ${factura.cliente.razonSocial}`,
      },
    });

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Factura-${factura.folio}.pdf"`
    );

    // Pipe del PDF a la respuesta HTTP
    doc.pipe(res);

    // ============================================
    // ENCABEZADO DE LA FACTURA
    // ============================================
    this.dibujarEncabezado(doc, factura);

    // Línea separadora
    doc.moveTo(50, 180).lineTo(562, 180).stroke();

    // ============================================
    // INFORMACIÓN DEL CLIENTE
    // ============================================
    this.dibujarInfoCliente(doc, factura);

    // ============================================
    // TABLA DE PRODUCTOS/SERVICIOS
    // ============================================
    this.dibujarTablaProductos(doc, factura);

    // ============================================
    // TOTALES
    // ============================================
    this.dibujarTotales(doc, factura);

    // ============================================
    // PIE DE PÁGINA
    // ============================================
    this.dibujarPiePagina(doc, factura);

    // Finalizar el PDF
    doc.end();
  }

  /**
   * Dibuja el encabezado de la factura con logo y datos de emisor
   */
  private static dibujarEncabezado(doc: PDFDocument, factura: any): void {
    // Título principal
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('FACTURA', 50, 50, { align: 'left' });

    // Folio y fecha en la parte derecha
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Folio:', 400, 50)
      .font('Helvetica')
      .text(factura.folio, 450, 50);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Fecha:', 400, 70)
      .font('Helvetica')
      .text(this.formatearFecha(factura.fecha), 450, 70);

    doc
      .font('Helvetica-Bold')
      .text('Serie:', 400, 85)
      .font('Helvetica')
      .text(factura.serie, 450, 85);

    // Estado de la factura
    const colorEstado = this.obtenerColorEstado(factura.estado);
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(colorEstado)
      .text(factura.estado, 400, 100);
    doc.fillColor('#000000'); // Reset color

    // Información del emisor (puede venir de configuración)
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Sistema de Facturación', 50, 90);

    doc
      .fontSize(9)
      .font('Helvetica')
      .text('RFC: XAXX010101000', 50, 110)
      .text('Régimen Fiscal: 601 - General de Ley Personas Morales', 50, 122)
      .text('Dirección: Av. Reforma 123, Col. Centro, CDMX', 50, 134);
  }

  /**
   * Dibuja la información del cliente
   */
  private static dibujarInfoCliente(doc: PDFDocument, factura: any): void {
    const cliente = factura.cliente;
    const yInicio = 195;

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('CLIENTE', 50, yInicio);

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Razón Social:', 50, yInicio + 18)
      .font('Helvetica')
      .text(cliente.razonSocial, 130, yInicio + 18, { width: 430 });

    if (cliente.nombreComercial) {
      doc
        .font('Helvetica-Bold')
        .text('Nombre Comercial:', 50, yInicio + 33)
        .font('Helvetica')
        .text(cliente.nombreComercial, 130, yInicio + 33);
    }

    doc
      .font('Helvetica-Bold')
      .text('RFC:', 50, yInicio + 48)
      .font('Helvetica')
      .text(cliente.rfc, 130, yInicio + 48);

    doc
      .font('Helvetica-Bold')
      .text('Régimen Fiscal:', 50, yInicio + 63)
      .font('Helvetica')
      .text(cliente.regimenFiscal, 130, yInicio + 63);

    // Dirección del cliente
    const direccion = this.construirDireccion(cliente);
    if (direccion) {
      doc
        .font('Helvetica-Bold')
        .text('Dirección:', 50, yInicio + 78)
        .font('Helvetica')
        .text(direccion, 130, yInicio + 78, { width: 430 });
    }

    // Email y teléfono
    let yContacto = direccion ? yInicio + 108 : yInicio + 78;
    if (cliente.email) {
      doc
        .font('Helvetica-Bold')
        .text('Email:', 50, yContacto)
        .font('Helvetica')
        .text(cliente.email, 130, yContacto);
      yContacto += 15;
    }

    if (cliente.telefono || cliente.celular) {
      doc
        .font('Helvetica-Bold')
        .text('Teléfono:', 50, yContacto)
        .font('Helvetica')
        .text(cliente.telefono || cliente.celular, 130, yContacto);
    }
  }

  /**
   * Dibuja la tabla de productos/servicios
   */
  private static dibujarTablaProductos(doc: PDFDocument, factura: any): void {
    const yInicio = 350;
    const anchoColumnas = {
      cantidad: 50,
      clave: 80,
      descripcion: 200,
      precio: 70,
      descuento: 70,
      total: 92,
    };

    // Encabezados de la tabla
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .rect(50, yInicio, 512, 20)
      .fill('#2563eb'); // Fondo azul

    doc
      .fillColor('#FFFFFF')
      .text('Cant.', 55, yInicio + 6, { width: anchoColumnas.cantidad })
      .text('Clave', 110, yInicio + 6, { width: anchoColumnas.clave })
      .text('Descripción', 195, yInicio + 6, { width: anchoColumnas.descripcion })
      .text('Precio Unit.', 400, yInicio + 6, { width: anchoColumnas.precio, align: 'right' })
      .text('Descuento', 470, yInicio + 6, { width: anchoColumnas.descuento, align: 'right' })
      .text('Total', 520, yInicio + 6, { width: anchoColumnas.total, align: 'right' });

    doc.fillColor('#000000'); // Reset color

    // Líneas de la factura
    let yActual = yInicio + 25;
    let alternar = false;

    for (const linea of factura.lineas) {
      // Fondo alternado para mejor legibilidad
      if (alternar) {
        doc.rect(50, yActual - 2, 512, 18).fill('#f3f4f6');
      }
      alternar = !alternar;

      // Calcular totales de la línea
      const subtotal = Number(linea.cantidad) * Number(linea.precioUnitario);
      const descuento = Number(linea.descuento) || 0;
      const baseImponible = subtotal - descuento;
      const iva = baseImponible * (Number(linea.iva) / 100);
      const ieps = baseImponible * ((Number(linea.ieps) || 0) / 100);
      const total = baseImponible + iva + ieps;

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#000000')
        .text(linea.cantidad.toString(), 55, yActual, { width: anchoColumnas.cantidad })
        .text(linea.producto.clave, 110, yActual, { width: anchoColumnas.clave })
        .text(linea.producto.nombre, 195, yActual, { width: anchoColumnas.descripcion })
        .text(this.formatearMoneda(Number(linea.precioUnitario)), 400, yActual, {
          width: anchoColumnas.precio,
          align: 'right',
        })
        .text(this.formatearMoneda(descuento), 470, yActual, {
          width: anchoColumnas.descuento,
          align: 'right',
        })
        .text(this.formatearMoneda(total), 520, yActual, {
          width: anchoColumnas.total,
          align: 'right',
        });

      // Mostrar IVA y IEPS si aplican
      yActual += 12;
      if (linea.iva > 0 || linea.ieps > 0) {
        doc
          .fontSize(7)
          .fillColor('#666666')
          .text(
            `IVA ${linea.iva}%: ${this.formatearMoneda(iva)}` +
              (linea.ieps > 0 ? ` | IEPS ${linea.ieps}%: ${this.formatearMoneda(ieps)}` : ''),
            195,
            yActual,
            { width: anchoColumnas.descripcion }
          );
        yActual += 10;
      } else {
        yActual += 6;
      }

      // Prevenir desbordamiento de página
      if (yActual > 680) {
        doc.addPage();
        yActual = 50;
      }
    }

    // Línea final de la tabla
    doc.moveTo(50, yActual + 5).lineTo(562, yActual + 5).stroke();
  }

  /**
   * Dibuja la sección de totales
   */
  private static dibujarTotales(doc: PDFDocument, factura: any): void {
    const yInicio = doc.y + 20;
    const xEtiqueta = 420;
    const xValor = 520;

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000');

    // Subtotal
    doc
      .text('Subtotal:', xEtiqueta, yInicio, { align: 'right', width: 80 })
      .font('Helvetica')
      .text(this.formatearMoneda(Number(factura.subtotal)), xValor, yInicio, {
        align: 'right',
        width: 42,
      });

    // Descuento
    if (Number(factura.descuento) > 0) {
      doc
        .font('Helvetica-Bold')
        .text('Descuento:', xEtiqueta, yInicio + 15, { align: 'right', width: 80 })
        .font('Helvetica')
        .text(this.formatearMoneda(Number(factura.descuento)), xValor, yInicio + 15, {
          align: 'right',
          width: 42,
        });
    }

    // IVA
    doc
      .font('Helvetica-Bold')
      .text('IVA (16%):', xEtiqueta, yInicio + 30, { align: 'right', width: 80 })
      .font('Helvetica')
      .text(this.formatearMoneda(Number(factura.iva)), xValor, yInicio + 30, {
        align: 'right',
        width: 42,
      });

    // IEPS (si aplica)
    if (Number(factura.ieps) > 0) {
      doc
        .font('Helvetica-Bold')
        .text('IEPS:', xEtiqueta, yInicio + 45, { align: 'right', width: 80 })
        .font('Helvetica')
        .text(this.formatearMoneda(Number(factura.ieps)), xValor, yInicio + 45, {
          align: 'right',
          width: 42,
        });
    }

    // Línea antes del total
    doc
      .moveTo(420, yInicio + 55)
      .lineTo(562, yInicio + 55)
      .stroke();

    // Total
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1e40af')
      .text('TOTAL:', xEtiqueta, yInicio + 60, { align: 'right', width: 80 })
      .text(this.formatearMoneda(Number(factura.total)), xValor, yInicio + 60, {
        align: 'right',
        width: 42,
      });

    doc.fillColor('#000000'); // Reset color

    // Información de pago
    if (factura.metodoPago || factura.formaPago) {
      const yPago = yInicio + 90;
      doc.fontSize(8).font('Helvetica');

      if (factura.metodoPago) {
        doc
          .font('Helvetica-Bold')
          .text('Método de Pago:', 50, yPago)
          .font('Helvetica')
          .text(factura.metodoPago, 140, yPago);
      }

      if (factura.formaPago) {
        doc
          .font('Helvetica-Bold')
          .text('Forma de Pago:', 50, yPago + 12)
          .font('Helvetica')
          .text(factura.formaPago, 140, yPago + 12);
      }

      if (factura.condicionPago) {
        doc
          .font('Helvetica-Bold')
          .text('Condiciones:', 50, yPago + 24)
          .font('Helvetica')
          .text(factura.condicionPago, 140, yPago + 24);
      }
    }

    // Observaciones
    if (factura.observaciones) {
      const yObs = doc.y + 15;
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('Observaciones:', 50, yObs)
        .font('Helvetica')
        .text(factura.observaciones, 50, yObs + 12, { width: 500 });
    }
  }

  /**
   * Dibuja el pie de página
   */
  private static dibujarPiePagina(doc: PDFDocument, factura: any): void {
    const yPie = 720;

    // Línea separadora
    doc.moveTo(50, yPie).lineTo(562, yPie).stroke();

    // Información adicional
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Este documento fue generado electrónicamente', 50, yPie + 10, {
        align: 'center',
        width: 512,
      })
      .text(
        `Generado por: ${factura.usuario.nombre} ${factura.usuario.apellido} | ${this.formatearFechaHora(
          new Date()
        )}`,
        50,
        yPie + 20,
        { align: 'center', width: 512 }
      );

    doc.fillColor('#000000'); // Reset color
  }

  // ============================================
  // UTILIDADES
  // ============================================

  private static formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(valor);
  }

  private static formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(fecha));
  }

  private static formatearFechaHora(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fecha));
  }

  private static construirDireccion(cliente: any): string {
    const partes = [];
    if (cliente.calle) partes.push(cliente.calle);
    if (cliente.numeroExterior) partes.push(`#${cliente.numeroExterior}`);
    if (cliente.numeroInterior) partes.push(`Int. ${cliente.numeroInterior}`);
    if (cliente.colonia) partes.push(cliente.colonia);
    if (cliente.codigoPostal) partes.push(`C.P. ${cliente.codigoPostal}`);
    if (cliente.ciudad) partes.push(cliente.ciudad);
    if (cliente.estado) partes.push(cliente.estado);

    return partes.join(', ');
  }

  private static obtenerColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      BORRADOR: '#6b7280', // gris
      EMITIDA: '#3b82f6', // azul
      TIMBRADA: '#8b5cf6', // púrpura
      PAGADA: '#10b981', // verde
      PARCIALMENTE_PAGADA: '#f59e0b', // ámbar
      VENCIDA: '#ef4444', // rojo
      CANCELADA: '#dc2626', // rojo oscuro
    };

    return colores[estado] || '#000000';
  }
}
