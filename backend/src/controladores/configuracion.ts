import { Request, Response, NextFunction } from 'express';
import { ServicioConfiguracion } from '../servicios/configuracion';

export class ControladorConfiguracion {
  // GET /api/configuracion/catalogos-sat
  static async obtenerCatalogosSAT(req: Request, res: Response, next: NextFunction) {
    try {
      const catalogos = await ServicioConfiguracion.obtenerCatalogosSAT();
      res.status(200).json(catalogos);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/configuracion/regimenes-fiscales
  static async obtenerRegimenesFiscales(req: Request, res: Response, next: NextFunction) {
    try {
      const regimenes = await ServicioConfiguracion.obtenerRegimenesFiscales();
      res.status(200).json({ regimenes });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/configuracion/metodos-pago
  static async obtenerMetodosPago(req: Request, res: Response, next: NextFunction) {
    try {
      const metodos = await ServicioConfiguracion.obtenerMetodosPago();
      res.status(200).json({ metodos });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/configuracion/formas-pago
  static async obtenerFormasPago(req: Request, res: Response, next: NextFunction) {
    try {
      const formas = await ServicioConfiguracion.obtenerFormasPago();
      res.status(200).json({ formas });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/configuracion/usos-cfdi
  static async obtenerUsosCFDI(req: Request, res: Response, next: NextFunction) {
    try {
      const usos = await ServicioConfiguracion.obtenerUsosCFDI();
      res.status(200).json({ usos });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/configuracion/unidades-medida
  static async obtenerUnidadesMedida(req: Request, res: Response, next: NextFunction) {
    try {
      const unidades = await ServicioConfiguracion.obtenerUnidadesMedida();
      res.status(200).json({ unidades });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/configuracion
  static async obtenerTodas(req: Request, res: Response, next: NextFunction) {
    try {
      const configuraciones = await ServicioConfiguracion.obtenerTodasConfiguraciones();
      res.status(200).json({ configuraciones });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/configuracion/:clave
  static async obtenerPorClave(req: Request, res: Response, next: NextFunction) {
    try {
      const { clave } = req.params;
      const configuracion = await ServicioConfiguracion.obtenerConfiguracion(clave);
      res.status(200).json({ configuracion });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/configuracion
  static async guardar(req: Request, res: Response, next: NextFunction) {
    try {
      const { clave, valor, tipo, descripcion } = req.body;

      if (!clave || valor === undefined) {
        return res.status(400).json({ error: 'Clave y valor son requeridos' });
      }

      const configuracion = await ServicioConfiguracion.guardarConfiguracion(
        clave,
        valor,
        tipo || 'string',
        descripcion
      );

      res.status(200).json({
        mensaje: 'Configuración guardada exitosamente',
        configuracion,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/configuracion/:clave
  static async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const { clave } = req.params;
      const resultado = await ServicioConfiguracion.eliminarConfiguracion(clave);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/configuracion/empresa/datos
  static async obtenerDatosEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      const datos = await ServicioConfiguracion.obtenerDatosEmpresa();
      res.status(200).json({ datos });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/configuracion/empresa/datos
  static async guardarDatosEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      const datos = req.body;
      await ServicioConfiguracion.guardarDatosEmpresa(datos);
      res.status(200).json({ mensaje: 'Datos de empresa guardados exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}
