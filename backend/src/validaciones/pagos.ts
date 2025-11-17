import { z } from 'zod';

// Enum de estado de pago
export const EstadoPagoEnum = z.enum(['APLICADO', 'PENDIENTE', 'CANCELADO']);

// Esquema para crear un pago
export const esquemaCrearPago = z.object({
  clienteId: z.string().uuid({ message: 'El clienteId debe ser un UUID válido' }),
  monto: z
    .number({ invalid_type_error: 'El monto debe ser un número' })
    .positive({ message: 'El monto debe ser mayor a cero' }),
  formaPago: z.string().min(1, { message: 'La forma de pago es requerida' }),
  fecha: z
    .string()
    .datetime()
    .optional()
    .or(z.date())
    .transform((val) => (val ? new Date(val) : new Date())),
  referencia: z.string().optional(),
  banco: z.string().optional(),
  cuentaBancaria: z.string().optional(),
  observaciones: z.string().max(1000).optional(),
  aplicaciones: z
    .array(
      z.object({
        facturaId: z.string().uuid(),
        monto: z.number().positive(),
      })
    )
    .optional(),
});

export type CrearPagoInput = z.infer<typeof esquemaCrearPago>;

// Esquema para actualizar un pago
export const esquemaActualizarPago = z.object({
  monto: z.number().positive().optional(),
  formaPago: z.string().min(1).optional(),
  referencia: z.string().optional(),
  banco: z.string().optional(),
  cuentaBancaria: z.string().optional(),
  observaciones: z.string().max(1000).optional(),
});

export type ActualizarPagoInput = z.infer<typeof esquemaActualizarPago>;

// Esquema para aplicar pago a factura
export const esquemaAplicarPago = z.object({
  facturaId: z.string().uuid(),
  monto: z.number().positive(),
});

export type AplicarPagoInput = z.infer<typeof esquemaAplicarPago>;

// Esquema para filtros de pagos
export const esquemaFiltrosPago = z.object({
  busqueda: z.string().optional(),
  clienteId: z.string().uuid().optional(),
  estado: EstadoPagoEnum.optional(),
  formaPago: z.string().optional(),
  fechaDesde: z.string().datetime().optional().or(z.date()).optional(),
  fechaHasta: z.string().datetime().optional().or(z.date()).optional(),
  limite: z.coerce.number().int().min(1).max(100).default(10),
  pagina: z.coerce.number().int().min(1).default(1),
});

export type FiltrosPagoInput = z.infer<typeof esquemaFiltrosPago>;

// Esquema para cambiar estado de pago
export const esquemaCambiarEstadoPago = z.object({
  estado: EstadoPagoEnum,
  motivo: z.string().max(500).optional(),
});

export type CambiarEstadoPagoInput = z.infer<typeof esquemaCambiarEstadoPago>;
