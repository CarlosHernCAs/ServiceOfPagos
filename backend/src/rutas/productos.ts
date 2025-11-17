import { Router } from 'express';
import { ControladorProductos } from '../controladores/productos';
import { verificarToken } from '../middlewares/autenticacion';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas especiales (deben ir antes de las rutas con parámetros)
router.get('/categorias/listar', ControladorProductos.obtenerCategorias);
router.get('/inventario/stock-bajo', ControladorProductos.obtenerStockBajo);

// CRUD básico
router.post('/', ControladorProductos.crear);
router.get('/', ControladorProductos.obtenerTodos);
router.get('/:id', ControladorProductos.obtenerPorId);
router.put('/:id', ControladorProductos.actualizar);
router.delete('/:id', ControladorProductos.eliminar);

// Rutas adicionales
router.patch('/:id/estado', ControladorProductos.cambiarEstado);
router.post('/:id/ajustar-stock', ControladorProductos.ajustarStock);

// Buscar por clave (al final para no conflictuar con :id)
router.get('/clave/:clave', ControladorProductos.obtenerPorClave);

export default router;
