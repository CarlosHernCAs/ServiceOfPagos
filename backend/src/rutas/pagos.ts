import { Router } from 'express';
import { ControladorPagos } from '../controladores/pagos';
import { verificarToken } from '../middlewares/autenticacion';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas especiales (antes de las rutas con parámetros)
router.get('/cliente/:clienteId/estado-cuenta', ControladorPagos.estadoDeCuenta);

// CRUD básico
router.post('/', ControladorPagos.crear);
router.get('/', ControladorPagos.obtenerTodos);

// Rutas con acciones específicas
router.post('/:id/aplicar', ControladorPagos.aplicarAFactura);
router.patch('/:id/estado', ControladorPagos.cambiarEstado);

// Rutas CRUD genéricas
router.get('/:id', ControladorPagos.obtenerPorId);
router.put('/:id', ControladorPagos.actualizar);
router.delete('/:id', ControladorPagos.eliminar);

export default router;
