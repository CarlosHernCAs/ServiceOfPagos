import { Router } from 'express';
import { ControladorAutenticacion } from '../controladores/autenticacion';
import { verificarToken } from '../middlewares/autenticacion';

const router = Router();

// Rutas públicas
router.post('/registro', ControladorAutenticacion.registro);
router.post('/login', ControladorAutenticacion.login);
router.post('/refresh', ControladorAutenticacion.refrescarToken);

// Rutas protegidas (requieren autenticación)
router.get('/perfil', verificarToken, ControladorAutenticacion.obtenerPerfil);
router.post('/cambiar-password', verificarToken, ControladorAutenticacion.cambiarPassword);
router.post('/logout', verificarToken, ControladorAutenticacion.logout);

export default router;
