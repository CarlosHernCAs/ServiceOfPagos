import { Request, Response, NextFunction } from 'express';
import { ServicioClientes } from '../servicios/clientes';
import {
  esquemaCrearCliente,
  esquemaActualizarCliente,
  esquemaFiltrosCliente,
} from '../validaciones/clientes';

export class ControladorClientes {
  // POST /api/clientes
  static async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const datos = esquemaCrearCliente.parse(req.body);
      const cliente = await ServicioClientes.crear(datos);

      res.status(201).json({
        mensaje: 'Cliente creado exitosamente',
        cliente,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/clientes
  static async obtenerTodos(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = esquemaFiltrosCliente.parse(req.query);
      const resultado = await ServicioClientes.obtenerTodos(filtros);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/clientes/:id
  static async obtenerPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cliente = await ServicioClientes.obtenerPorId(id);

      res.status(200).json({ cliente });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/clientes/:id
  static async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const datos = esquemaActualizarCliente.parse(req.body);
      const cliente = await ServicioClientes.actualizar(id, datos);

      res.status(200).json({
        mensaje: 'Cliente actualizado exitosamente',
        cliente,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/clientes/:id
  static async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const resultado = await ServicioClientes.eliminar(id);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/clientes/:id/estado
  static async cambiarEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { activo } = req.body;

      if (typeof activo !== 'boolean') {
        return res.status(400).json({ error: 'El campo activo debe ser boolean' });
      }

      const resultado = await ServicioClientes.cambiarEstado(id, activo);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/clientes/:id/estadisticas
  static async obtenerEstadisticas(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const estadisticas = await ServicioClientes.obtenerEstadisticas(id);

      res.status(200).json({ estadisticas });
    } catch (error) {
      next(error);
    }
  }
}
