import { Router } from 'express';
import { ControladorConfiguracion } from '../controladores/configuracion';
import { verificarToken } from '../middlewares/autenticacion';

const router = Router();

// Rutas de catálogos SAT (públicas o con autenticación mínima)
router.get('/catalogos-sat', ControladorConfiguracion.obtenerCatalogosSAT);
router.get('/regimenes-fiscales', ControladorConfiguracion.obtenerRegimenesFiscales);
router.get('/metodos-pago', ControladorConfiguracion.obtenerMetodosPago);
router.get('/formas-pago', ControladorConfiguracion.obtenerFormasPago);
router.get('/usos-cfdi', ControladorConfiguracion.obtenerUsosCFDI);
router.get('/unidades-medida', ControladorConfiguracion.obtenerUnidadesMedida);

// Rutas de configuración de empresa (requieren autenticación)
router.use(verificarToken);

router.get('/empresa/datos', ControladorConfiguracion.obtenerDatosEmpresa);
router.post('/empresa/datos', ControladorConfiguracion.guardarDatosEmpresa);

// CRUD de configuraciones generales
router.get('/', ControladorConfiguracion.obtenerTodas);
router.get('/:clave', ControladorConfiguracion.obtenerPorClave);
router.post('/', ControladorConfiguracion.guardar);
router.delete('/:clave', ControladorConfiguracion.eliminar);

export default router;
