import { useState, useEffect } from 'react';
import { servicioProductos } from '@/servicios/productos';
import { Input } from '@/componentes/ui/input';
import { Button } from '@/componentes/ui/button';
import { Card, CardContent } from '@/componentes/ui/card';
import { Search, Plus, Package } from 'lucide-react';
import type { Producto } from '@/tipos/productos';
import type { LineaFacturaInput } from '@/tipos/facturas';

interface Props {
  onAgregar: (linea: LineaFacturaInput) => void;
}

export default function SelectorProducto({ onAgregar }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Estado para el producto seleccionado y cantidad
  const [productoTemp, setProductoTemp] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const buscarProductos = async () => {
      if (busqueda.length < 2) {
        setProductos([]);
        return;
      }

      setCargando(true);
      try {
        const resultado = await servicioProductos.obtenerTodos({
          busqueda,
          activo: 'true',
          limite: 10,
          pagina: 1,
        });
        setProductos(resultado.productos);
        setMostrarResultados(true);
      } catch (error) {
        console.error('Error al buscar productos:', error);
      } finally {
        setCargando(false);
      }
    };

    const timer = setTimeout(buscarProductos, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const handleSeleccionarProducto = (producto: Producto) => {
    setProductoTemp(producto);
    setCantidad(1);
    setMostrarResultados(false);
    setBusqueda('');
  };

  const handleAgregar = () => {
    if (!productoTemp) return;

    const linea: LineaFacturaInput = {
      productoId: productoTemp.id,
      cantidad,
      precioUnitario: productoTemp.precio,
      descuento: 0,
      iva: productoTemp.iva,
      ieps: productoTemp.ieps || 0,
    };

    onAgregar(linea);
    setProductoTemp(null);
    setCantidad(1);
  };

  const handleCancelar = () => {
    setProductoTemp(null);
    setCantidad(1);
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(valor);
  };

  if (productoTemp) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-green-600 mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {productoTemp.nombre}
                </div>
                <div className="text-sm text-gray-600">
                  Clave: {productoTemp.clave}
                </div>
                <div className="text-sm text-gray-600">
                  Precio: {formatearMoneda(productoTemp.precio)}
                </div>
                {productoTemp.controlaInventario && productoTemp.stockActual !== null && (
                  <div className="text-xs text-gray-500 mt-1">
                    Stock disponible: {productoTemp.stockActual} {productoTemp.unidadMedida}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <Input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseFloat(e.target.value) || 1)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtotal
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  {formatearMoneda(productoTemp.precio * cantidad)}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAgregar} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Agregar a Factura
              </Button>
              <Button variant="outline" onClick={handleCancelar}>
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar producto por clave o nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onFocus={() => busqueda.length >= 2 && setMostrarResultados(true)}
          className="pl-10"
        />
      </div>

      {mostrarResultados && (
        <Card className="absolute z-10 w-full mt-2 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {cargando ? (
              <div className="p-4 text-center text-gray-500">
                Buscando productos...
              </div>
            ) : productos.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {busqueda.length < 2
                  ? 'Escribe al menos 2 caracteres para buscar'
                  : 'No se encontraron productos'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {productos.map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => handleSeleccionarProducto(producto)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {producto.nombre}
                        </div>
                        <div className="text-sm text-gray-600">
                          Clave: {producto.clave}
                        </div>
                        {producto.controlaInventario && producto.stockActual !== null && (
                          <div className="text-xs text-gray-500 mt-1">
                            Stock: {producto.stockActual} {producto.unidadMedida}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatearMoneda(producto.precio)}
                        </div>
                        <div className="text-xs text-gray-500">
                          IVA {producto.iva}%
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
