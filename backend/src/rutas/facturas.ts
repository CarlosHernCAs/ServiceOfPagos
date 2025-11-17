import { Router } from 'express';
import { ControladorFacturas } from '../controladores/facturas';
import { verificarToken } from '../middlewares/autenticacion';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas especiales (antes de las rutas con parámetros)
router.get('/estadisticas/general', ControladorFacturas.obtenerEstadisticas);

// CRUD básico
router.post('/', ControladorFacturas.crear);
router.get('/', ControladorFacturas.obtenerTodos);
router.get('/:id', ControladorFacturas.obtenerPorId);
router.put('/:id', ControladorFacturas.actualizar);
router.delete('/:id', ControladorFacturas.eliminar);

// Rutas adicionales
router.patch('/:id/estado', ControladorFacturas.cambiarEstado);
router.post('/:id/cancelar', ControladorFacturas.cancelar);

// Buscar por folio (al final para no conflictuar con :id)
router.get('/folio/:folioCompleto', ControladorFacturas.obtenerPorFolio);

export default router;
