import { Request, Response, NextFunction } from 'express';
import { ServicioFacturas } from '../servicios/facturas';
import {
  esquemaCrearFactura,
  esquemaActualizarFactura,
  esquemaFiltrosFactura,
  esquemaCambiarEstado,
} from '../validaciones/facturas';

export class ControladorFacturas {
  // POST /api/facturas
  static async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const datos = esquemaCrearFactura.parse(req.body);
      const usuarioId = (req as any).usuario.id;

      const factura = await ServicioFacturas.crear(datos, usuarioId);

      res.status(201).json({
        mensaje: 'Factura creada exitosamente',
        factura,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/facturas
  static async obtenerTodos(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = esquemaFiltrosFactura.parse(req.query);
      const resultado = await ServicioFacturas.obtenerTodos(filtros);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/facturas/:id
  static async obtenerPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const factura = await ServicioFacturas.obtenerPorId(id);

      res.status(200).json({ factura });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/facturas/folio/:folioCompleto
  static async obtenerPorFolio(req: Request, res: Response, next: NextFunction) {
    try {
      const { folioCompleto } = req.params;
      const factura = await ServicioFacturas.obtenerPorFolio(folioCompleto);

      res.status(200).json({ factura });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/facturas/:id
  static async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const datos = esquemaActualizarFactura.parse(req.body);

      const factura = await ServicioFacturas.actualizar(id, datos);

      res.status(200).json({
        mensaje: 'Factura actualizada exitosamente',
        factura,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/facturas/:id/estado
  static async cambiarEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const datos = esquemaCambiarEstado.parse(req.body);

      const factura = await ServicioFacturas.cambiarEstado(id, datos);

      res.status(200).json({
        mensaje: 'Estado de factura actualizado',
        factura,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/facturas/:id
  static async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const resultado = await ServicioFacturas.eliminar(id);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/facturas/:id/cancelar
  static async cancelar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const resultado = await ServicioFacturas.cancelar(id, motivo);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/facturas/estadisticas/general
  static async obtenerEstadisticas(req: Request, res: Response, next: NextFunction) {
    try {
      const estadisticas = await ServicioFacturas.obtenerEstadisticas();

      res.status(200).json({ estadisticas });
    } catch (error) {
      next(error);
    }
  }
}
