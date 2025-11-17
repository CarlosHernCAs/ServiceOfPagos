import { Request, Response, NextFunction } from 'express';
import { ServicioPagos } from '../servicios/pagos';
import {
  esquemaCrearPago,
  esquemaActualizarPago,
  esquemaAplicarPago,
  esquemaFiltrosPago,
  esquemaCambiarEstadoPago,
} from '../validaciones/pagos';

export class ControladorPagos {
  // POST /api/pagos
  static async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const datos = esquemaCrearPago.parse(req.body);
      const pago = await ServicioPagos.crear(datos);

      res.status(201).json({
        mensaje: 'Pago registrado exitosamente',
        pago,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/pagos
  static async obtenerTodos(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = esquemaFiltrosPago.parse(req.query);
      const resultado = await ServicioPagos.obtenerTodos(filtros);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/pagos/:id
  static async obtenerPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pago = await ServicioPagos.obtenerPorId(id);

      res.status(200).json({ pago });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/pagos/:id
  static async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const datos = esquemaActualizarPago.parse(req.body);
      const pago = await ServicioPagos.actualizar(id, datos);

      res.status(200).json({
        mensaje: 'Pago actualizado exitosamente',
        pago,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/pagos/:id/aplicar
  static async aplicarAFactura(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const datos = esquemaAplicarPago.parse(req.body);
      const pago = await ServicioPagos.aplicarAFactura(id, datos);

      res.status(200).json({
        mensaje: 'Pago aplicado a factura exitosamente',
        pago,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/pagos/:id/estado
  static async cambiarEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const datos = esquemaCambiarEstadoPago.parse(req.body);
      const pago = await ServicioPagos.cambiarEstado(id, datos);

      res.status(200).json({
        mensaje: 'Estado del pago actualizado',
        pago,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/pagos/:id
  static async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const resultado = await ServicioPagos.eliminar(id);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/pagos/cliente/:clienteId/estado-cuenta
  static async estadoDeCuenta(req: Request, res: Response, next: NextFunction) {
    try {
      const { clienteId } = req.params;
      const estadoCuenta = await ServicioPagos.estadoDeCuenta(clienteId);

      res.status(200).json(estadoCuenta);
    } catch (error) {
      next(error);
    }
  }
}
