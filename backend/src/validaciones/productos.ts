import { z } from 'zod';

// Enum de tipo de producto
export const TipoProductoEnum = z.enum(['PRODUCTO', 'SERVICIO']);

// Schema para crear producto
export const esquemaCrearProducto = z.object({
  // Identificación
  clave: z
    .string({ required_error: 'La clave es requerida' })
    .min(1, 'La clave debe tener al menos 1 carácter')
    .max(50, 'La clave no puede exceder 50 caracteres')
    .trim()
    .toUpperCase(),
  nombre: z
    .string({ required_error: 'El nombre es requerido' })
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .trim(),
  descripcion: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  categoria: z
    .string()
    .max(100, 'La categoría no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  unidadMedida: z
    .string()
    .max(10, 'La unidad de medida no puede exceder 10 caracteres')
    .trim()
    .toUpperCase()
    .default('PZA'),

  // SAT (México)
  claveProdServ: z
    .string()
    .max(20, 'La clave del SAT no puede exceder 20 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  claveUnidad: z
    .string()
    .max(10, 'La clave de unidad del SAT no puede exceder 10 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  // Tipo
  tipo: TipoProductoEnum.default('PRODUCTO'),

  // Precios
  precio: z
    .number({ required_error: 'El precio es requerido' })
    .min(0, 'El precio no puede ser negativo')
    .max(9999999999.99, 'El precio excede el límite permitido'),
  costo: z
    .number()
    .min(0, 'El costo no puede ser negativo')
    .max(9999999999.99, 'El costo excede el límite permitido')
    .optional(),

  // Impuestos
  iva: z
    .number()
    .min(0, 'El IVA no puede ser negativo')
    .max(100, 'El IVA no puede exceder 100%')
    .default(16),
  ieps: z
    .number()
    .min(0, 'El IEPS no puede ser negativo')
    .max(100, 'El IEPS no puede exceder 100%')
    .optional(),

  // Inventario
  controlaInventario: z.boolean().default(false),
  stockActual: z
    .number()
    .min(0, 'El stock actual no puede ser negativo')
    .max(9999999999.999, 'El stock excede el límite permitido')
    .optional(),
  stockMinimo: z
    .number()
    .min(0, 'El stock mínimo no puede ser negativo')
    .max(9999999999.999, 'El stock excede el límite permitido')
    .optional(),
  stockMaximo: z
    .number()
    .min(0, 'El stock máximo no puede ser negativo')
    .max(9999999999.999, 'El stock excede el límite permitido')
    .optional(),

  // Estado
  activo: z.boolean().default(true),
}).refine(
  (data) => {
    // Si controla inventario, validar que stock mínimo <= stock máximo
    if (data.controlaInventario && data.stockMinimo !== undefined && data.stockMaximo !== undefined) {
      return data.stockMinimo <= data.stockMaximo;
    }
    return true;
  },
  {
    message: 'El stock mínimo no puede ser mayor que el stock máximo',
    path: ['stockMinimo'],
  }
);

// Schema para actualizar producto (todos los campos opcionales)
export const esquemaActualizarProducto = esquemaCrearProducto.partial();

// Schema para filtros de búsqueda
export const esquemaFiltrosProducto = z.object({
  busqueda: z.string().optional(), // Búsqueda por clave, nombre, descripción
  categoria: z.string().optional(),
  tipo: TipoProductoEnum.optional(),
  activo: z
    .enum(['true', 'false', 'all'])
    .transform((val) => {
      if (val === 'all') return undefined;
      return val === 'true';
    })
    .optional(),
  controlaInventario: z
    .enum(['true', 'false', 'all'])
    .transform((val) => {
      if (val === 'all') return undefined;
      return val === 'true';
    })
    .optional(),
  stockBajo: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(), // Productos con stock actual < stock mínimo
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
export type CrearProductoInput = z.infer<typeof esquemaCrearProducto>;
export type ActualizarProductoInput = z.infer<typeof esquemaActualizarProducto>;
export type FiltrosProductoInput = z.infer<typeof esquemaFiltrosProducto>;
