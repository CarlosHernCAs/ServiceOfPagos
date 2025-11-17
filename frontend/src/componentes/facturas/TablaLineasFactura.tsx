import { useState, useEffect } from 'react';
import { servicioProductos } from '@/servicios/productos';
import { Input } from '@/componentes/ui/input';
import { Button } from '@/componentes/ui/button';
import { Trash2 } from 'lucide-react';
import type { LineaFacturaInput } from '@/tipos/facturas';
import type { Producto } from '@/tipos/productos';

interface LineaConProducto extends LineaFacturaInput {
  producto?: Producto;
}

interface Props {
  lineas: LineaFacturaInput[];
  onActualizar: (lineas: LineaFacturaInput[]) => void;
}

export default function TablaLineasFactura({ lineas, onActualizar }: Props) {
  const [lineasConProductos, setLineasConProductos] = useState<LineaConProducto[]>([]);

  // Cargar información de productos
  useEffect(() => {
    const cargarProductos = async () => {
      const lineasTemp: LineaConProducto[] = [];

      for (const linea of lineas) {
        try {
          const producto = await servicioProductos.obtenerPorId(linea.productoId);
          lineasTemp.push({ ...linea, producto });
        } catch (error) {
          lineasTemp.push(linea);
        }
      }

      setLineasConProductos(lineasTemp);
    };

    if (lineas.length > 0) {
      cargarProductos();
    } else {
      setLineasConProductos([]);
    }
  }, [lineas]);

  const calcularSubtotal = (linea: LineaFacturaInput) => {
    return linea.cantidad * linea.precioUnitario;
  };

  const calcularImpuestos = (linea: LineaFacturaInput) => {
    const subtotal = calcularSubtotal(linea);
    const baseImponible = subtotal - (linea.descuento || 0);
    const iva = baseImponible * ((linea.iva || 0) / 100);
    const ieps = baseImponible * ((linea.ieps || 0) / 100);
    return { iva, ieps };
  };

  const calcularTotal = (linea: LineaFacturaInput) => {
    const subtotal = calcularSubtotal(linea);
    const impuestos = calcularImpuestos(linea);
    return subtotal - (linea.descuento || 0) + impuestos.iva + impuestos.ieps;
  };

  const handleCantidadChange = (index: number, cantidad: number) => {
    const nuevasLineas = [...lineas];
    nuevasLineas[index] = {
      ...nuevasLineas[index],
      cantidad: cantidad > 0 ? cantidad : 1,
    };
    onActualizar(nuevasLineas);
  };

  const handlePrecioChange = (index: number, precio: number) => {
    const nuevasLineas = [...lineas];
    nuevasLineas[index] = {
      ...nuevasLineas[index],
      precioUnitario: precio >= 0 ? precio : 0,
    };
    onActualizar(nuevasLineas);
  };

  const handleDescuentoChange = (index: number, descuento: number) => {
    const nuevasLineas = [...lineas];
    nuevasLineas[index] = {
      ...nuevasLineas[index],
      descuento: descuento >= 0 ? descuento : 0,
    };
    onActualizar(nuevasLineas);
  };

  const handleEliminar = (index: number) => {
    const nuevasLineas = lineas.filter((_, i) => i !== index);
    onActualizar(nuevasLineas);
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(valor);
  };

  if (lineas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
        No hay productos agregados. Usa el buscador de arriba para agregar productos.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-28">Cantidad</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Precio Unit.</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Descuento</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">IVA %</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Subtotal</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Total</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">Acción</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lineasConProductos.map((linea, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">
                  {linea.producto?.nombre || 'Cargando...'}
                </div>
                <div className="text-xs text-gray-500">
                  {linea.producto?.clave}
                </div>
              </td>
              <td className="px-4 py-3">
                <Input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={linea.cantidad}
                  onChange={(e) => handleCantidadChange(index, parseFloat(e.target.value) || 1)}
                  className="text-center"
                />
              </td>
              <td className="px-4 py-3">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={linea.precioUnitario}
                  onChange={(e) => handlePrecioChange(index, parseFloat(e.target.value) || 0)}
                  className="text-right"
                />
              </td>
              <td className="px-4 py-3">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={linea.descuento || 0}
                  onChange={(e) => handleDescuentoChange(index, parseFloat(e.target.value) || 0)}
                  className="text-right"
                />
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {linea.iva}%
                {linea.ieps && linea.ieps > 0 && (
                  <div className="text-xs text-gray-500">
                    +{linea.ieps}% IEPS
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium">
                {formatearMoneda(calcularSubtotal(linea))}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 font-semibold">
                {formatearMoneda(calcularTotal(linea))}
              </td>
              <td className="px-4 py-3 text-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEliminar(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
