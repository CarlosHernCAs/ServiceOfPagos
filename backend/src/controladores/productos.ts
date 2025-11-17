import { Request, Response, NextFunction } from 'express';
import { ServicioProductos } from '../servicios/productos';
import {
  esquemaCrearProducto,
  esquemaActualizarProducto,
  esquemaFiltrosProducto,
} from '../validaciones/productos';
import { z } from 'zod';

export class ControladorProductos {
  // POST /api/productos
  static async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const datos = esquemaCrearProducto.parse(req.body);
      const producto = await ServicioProductos.crear(datos);

      res.status(201).json({
        mensaje: 'Producto creado exitosamente',
        producto,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/productos
  static async obtenerTodos(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = esquemaFiltrosProducto.parse(req.query);
      const resultado = await ServicioProductos.obtenerTodos(filtros);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/productos/:id
  static async obtenerPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const producto = await ServicioProductos.obtenerPorId(id);

      res.status(200).json({ producto });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/productos/clave/:clave
  static async obtenerPorClave(req: Request, res: Response, next: NextFunction) {
    try {
      const { clave } = req.params;
      const producto = await ServicioProductos.obtenerPorClave(clave);

      res.status(200).json({ producto });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/productos/:id
  static async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const datos = esquemaActualizarProducto.parse(req.body);
      const producto = await ServicioProductos.actualizar(id, datos);

      res.status(200).json({
        mensaje: 'Producto actualizado exitosamente',
        producto,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/productos/:id
  static async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const resultado = await ServicioProductos.eliminar(id);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/productos/:id/estado
  static async cambiarEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { activo } = req.body;

      if (typeof activo !== 'boolean') {
        return res.status(400).json({ error: 'El campo activo debe ser boolean' });
      }

      const resultado = await ServicioProductos.cambiarEstado(id, activo);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/productos/categorias/listar
  static async obtenerCategorias(req: Request, res: Response, next: NextFunction) {
    try {
      const categorias = await ServicioProductos.obtenerCategorias();

      res.status(200).json({ categorias });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/productos/inventario/stock-bajo
  static async obtenerStockBajo(req: Request, res: Response, next: NextFunction) {
    try {
      const productos = await ServicioProductos.obtenerStockBajo();

      res.status(200).json({ productos, total: productos.length });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/productos/:id/ajustar-stock
  static async ajustarStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Validar body
      const schema = z.object({
        cantidad: z.number().positive('La cantidad debe ser positiva'),
        tipo: z.enum(['entrada', 'salida']),
      });

      const { cantidad, tipo } = schema.parse(req.body);
      const producto = await ServicioProductos.ajustarStock(id, cantidad, tipo);

      res.status(200).json({
        mensaje: `Stock ${tipo === 'entrada' ? 'incrementado' : 'decrementado'} exitosamente`,
        producto,
      });
    } catch (error) {
      next(error);
    }
  }
}
