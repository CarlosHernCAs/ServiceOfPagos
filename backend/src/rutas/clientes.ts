import { Router } from 'express';
import { ControladorClientes } from '../controladores/clientes';
import { verificarToken } from '../middlewares/autenticacion';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// CRUD básico
router.post('/', ControladorClientes.crear);
router.get('/', ControladorClientes.obtenerTodos);
router.get('/:id', ControladorClientes.obtenerPorId);
router.put('/:id', ControladorClientes.actualizar);
router.delete('/:id', ControladorClientes.eliminar);

// Rutas adicionales
router.patch('/:id/estado', ControladorClientes.cambiarEstado);
router.get('/:id/estadisticas', ControladorClientes.obtenerEstadisticas);

export default router;
