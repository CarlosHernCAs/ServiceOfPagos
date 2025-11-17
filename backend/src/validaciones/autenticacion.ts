import { z } from 'zod';

// Schema de registro
export const esquemaRegistro = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  nombre: z
    .string({ required_error: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  apellido: z
    .string()
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .trim()
    .optional(),
});

// Schema de login
export const esquemaLogin = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'La contraseña es requerida' }),
});

// Schema de cambio de contraseña
export const esquemaCambioPassword = z
  .object({
    passwordActual: z.string({ required_error: 'La contraseña actual es requerida' }),
    passwordNueva: z
      .string({ required_error: 'La nueva contraseña es requerida' })
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    passwordConfirmacion: z.string({ required_error: 'Confirma la nueva contraseña' }),
  })
  .refine((data) => data.passwordNueva === data.passwordConfirmacion, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirmacion'],
  });

// Tipos inferidos
export type RegistroInput = z.infer<typeof esquemaRegistro>;
export type LoginInput = z.infer<typeof esquemaLogin>;
export type CambioPasswordInput = z.infer<typeof esquemaCambioPassword>;
