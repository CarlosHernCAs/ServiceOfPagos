import { z } from 'zod';

// Regex para RFC México (puede ser persona física o moral)
const regexRFC = /^([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3})$/i;

// Schema para crear cliente
export const esquemaCrearCliente = z.object({
  // Datos fiscales
  razonSocial: z
    .string({ required_error: 'La razón social es requerida' })
    .min(3, 'La razón social debe tener al menos 3 caracteres')
    .max(200, 'La razón social no puede exceder 200 caracteres')
    .trim(),
  nombreComercial: z
    .string()
    .max(200, 'El nombre comercial no puede exceder 200 caracteres')
    .trim()
    .optional(),
  rfc: z
    .string({ required_error: 'El RFC es requerido' })
    .regex(regexRFC, 'RFC inválido')
    .toUpperCase()
    .trim(),
  regimenFiscal: z
    .string({ required_error: 'El régimen fiscal es requerido' })
    .min(3, 'Selecciona un régimen fiscal válido'),
  usoCfdi: z
    .string()
    .default('G03')
    .optional(),

  // Contacto
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal('')),
  telefono: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  celular: z
    .string()
    .max(20, 'El celular no puede exceder 20 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  sitioWeb: z
    .string()
    .url('URL inválida')
    .trim()
    .optional()
    .or(z.literal('')),

  // Dirección fiscal
  calle: z
    .string()
    .max(100, 'La calle no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  numeroExterior: z
    .string()
    .max(20, 'El número exterior no puede exceder 20 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  numeroInterior: z
    .string()
    .max(20, 'El número interior no puede exceder 20 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  colonia: z
    .string()
    .max(100, 'La colonia no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  codigoPostal: z
    .string()
    .regex(/^\d{5}$/, 'Código postal debe ser de 5 dígitos')
    .trim()
    .optional()
    .or(z.literal('')),
  ciudad: z
    .string()
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  estado: z
    .string()
    .max(100, 'El estado no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  pais: z
    .string()
    .max(100, 'El país no puede exceder 100 caracteres')
    .trim()
    .default('México'),

  // Configuración comercial
  diasCredito: z
    .number()
    .int('Días de crédito debe ser un número entero')
    .min(0, 'Días de crédito no puede ser negativo')
    .default(0),
  limiteCredito: z
    .number()
    .min(0, 'Límite de crédito no puede ser negativo')
    .optional(),
  descuentoGeneral: z
    .number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede exceder 100%')
    .optional(),

  // Estado
  activo: z.boolean().default(true),
  notas: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
});

// Schema para actualizar cliente (todos los campos opcionales excepto ID)
export const esquemaActualizarCliente = esquemaCrearCliente.partial();

// Schema para filtros de búsqueda
export const esquemaFiltrosCliente = z.object({
  busqueda: z.string().optional(), // Búsqueda por nombre, RFC, email
  activo: z
    .enum(['true', 'false', 'all'])
    .transform((val) => {
      if (val === 'all') return undefined;
      return val === 'true';
    })
    .optional(),
  regimenFiscal: z.string().optional(),
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

// Tipos inferidos
export type CrearClienteInput = z.infer<typeof esquemaCrearCliente>;
export type ActualizarClienteInput = z.infer<typeof esquemaActualizarCliente>;
export type FiltrosClienteInput = z.infer<typeof esquemaFiltrosCliente>;
