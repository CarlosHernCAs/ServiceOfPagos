import { z } from 'zod';

// Enum de estado de factura
export const EstadoFacturaEnum = z.enum([
  'BORRADOR',
  'EMITIDA',
  'TIMBRADA',
  'PAGADA',
  'PARCIALMENTE_PAGADA',
  'VENCIDA',
  'CANCELADA',
]);

// Schema para línea de factura
export const esquemaLineaFactura = z.object({
  productoId: z.string().uuid('ID de producto inválido'),
  cantidad: z
    .number({ required_error: 'La cantidad es requerida' })
    .positive('La cantidad debe ser mayor a 0')
    .max(9999999.999, 'La cantidad excede el límite permitido'),
  precioUnitario: z
    .number({ required_error: 'El precio unitario es requerido' })
    .min(0, 'El precio unitario no puede ser negativo')
    .max(9999999999.99, 'El precio excede el límite permitido'),
  descuento: z
    .number()
    .min(0, 'El descuento no puede ser negativo')
    .max(9999999999.99, 'El descuento excede el límite permitido')
    .default(0),
  iva: z
    .number()
    .min(0, 'El IVA no puede ser negativo')
    .max(100, 'El IVA no puede exceder 100%')
    .default(16),
  ieps: z
    .number()
    .min(0, 'El IEPS no puede ser negativo')
    .max(100, 'El IEPS no puede exceder 100%')
    .default(0),
});

// Schema para crear factura
export const esquemaCrearFactura = z.object({
  // Cliente
  clienteId: z
    .string({ required_error: 'El cliente es requerido' })
    .uuid('ID de cliente inválido'),

  // Serie y folio (opcional, se puede auto-generar)
  serie: z
    .string()
    .max(10, 'La serie no puede exceder 10 caracteres')
    .toUpperCase()
    .default('A'),

  // Fechas
  fecha: z
    .string()
    .datetime()
    .optional()
    .or(z.date())
    .transform((val) => (val ? new Date(val) : new Date())),
  fechaVencimiento: z
    .string()
    .datetime()
    .optional()
    .or(z.date())
    .transform((val) => (val ? new Date(val) : undefined))
    .optional(),

  // Estado
  estado: EstadoFacturaEnum.default('BORRADOR'),

  // Pago
  metodoPago: z
    .string()
    .max(10, 'El método de pago no puede exceder 10 caracteres')
    .optional(), // PUE, PPD
  formaPago: z
    .string()
    .max(10, 'La forma de pago no puede exceder 10 caracteres')
    .optional(), // 01, 02, 03, etc
  condicionPago: z
    .string()
    .max(200, 'La condición de pago no puede exceder 200 caracteres')
    .optional(),

  // Observaciones
  observaciones: z
    .string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),

  // Líneas de factura
  lineas: z
    .array(esquemaLineaFactura)
    .min(1, 'La factura debe tener al menos una línea')
    .max(100, 'La factura no puede tener más de 100 líneas'),
}).refine(
  (data) => {
    // Si tiene fecha de vencimiento, debe ser posterior a la fecha de emisión
    if (data.fechaVencimiento && data.fecha) {
      return data.fechaVencimiento > data.fecha;
    }
    return true;
  },
  {
    message: 'La fecha de vencimiento debe ser posterior a la fecha de emisión',
    path: ['fechaVencimiento'],
  }
);

// Schema para actualizar factura
export const esquemaActualizarFactura = z.object({
  clienteId: z.string().uuid().optional(),
  serie: z.string().max(10).toUpperCase().optional(),
  fecha: z
    .string()
    .datetime()
    .optional()
    .or(z.date())
    .transform((val) => (val ? new Date(val) : undefined))
    .optional(),
  fechaVencimiento: z
    .string()
    .datetime()
    .optional()
    .or(z.date())
    .transform((val) => (val ? new Date(val) : undefined))
    .optional(),
  estado: EstadoFacturaEnum.optional(),
  metodoPago: z.string().max(10).optional(),
  formaPago: z.string().max(10).optional(),
  condicionPago: z.string().max(200).optional(),
  observaciones: z.string().max(1000).optional().or(z.literal('')),
  lineas: z
    .array(esquemaLineaFactura)
    .min(1)
    .max(100)
    .optional(),
});

// Schema para filtros de búsqueda
export const esquemaFiltrosFactura = z.object({
  busqueda: z.string().optional(), // Búsqueda por folio, cliente
  clienteId: z.string().uuid().optional(),
  estado: EstadoFacturaEnum.optional(),
  serie: z.string().optional(),
  fechaDesde: z
    .string()
    .datetime()
    .optional()
    .or(z.date())
    .transform((val) => (val ? new Date(val) : undefined))
    .optional(),
  fechaHasta: z
    .string()
    .datetime()
    .optional()
    .or(z.date())
    .transform((val) => (val ? new Date(val) : undefined))
    .optional(),
  limite: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .default('10'),
  pagina: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .default('1'),
});

// Schema para cambiar estado de factura
export const esquemaCambiarEstado = z.object({
  estado: EstadoFacturaEnum,
  motivo: z.string().max(500).optional(),
});

// Tipos inferidos
export type CrearFacturaInput = z.infer<typeof esquemaCrearFactura>;
export type ActualizarFacturaInput = z.infer<typeof esquemaActualizarFactura>;
export type FiltrosFacturaInput = z.infer<typeof esquemaFiltrosFactura>;
export type LineaFacturaInput = z.infer<typeof esquemaLineaFactura>;
export type CambiarEstadoInput = z.infer<typeof esquemaCambiarEstado>;
