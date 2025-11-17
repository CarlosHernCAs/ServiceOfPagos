import { useState, useEffect } from 'react';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Label } from '@/componentes/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/card';
import SelectorCliente from './SelectorCliente';
import SelectorProducto from './SelectorProducto';
import TablaLineasFactura from './TablaLineasFactura';
import type { Cliente } from '@/tipos/clientes';
import type { CrearFacturaInput, LineaFacturaInput } from '@/tipos/facturas';

interface Props {
  onSubmit: (datos: CrearFacturaInput) => void;
  onCancelar: () => void;
  cargando?: boolean;
}

export default function FormularioFactura({ onSubmit, onCancelar, cargando = false }: Props) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [serie, setSerie] = useState('A');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [metodoPago, setMetodoPago] = useState('PUE');
  const [formaPago, setFormaPago] = useState('99');
  const [condicionPago, setCondicionPago] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [lineas, setLineas] = useState<LineaFacturaInput[]>([]);

  // Cálculos automáticos
  const [totales, setTotales] = useState({
    subtotal: 0,
    descuento: 0,
    iva: 0,
    ieps: 0,
    total: 0,
  });

  useEffect(() => {
    calcularTotales();
  }, [lineas]);

  const calcularTotales = () => {
    let subtotal = 0;
    let descuento = 0;
    let totalIVA = 0;
    let totalIEPS = 0;

    lineas.forEach((linea) => {
      const subtotalLinea = linea.cantidad * linea.precioUnitario;
      subtotal += subtotalLinea;
      descuento += linea.descuento || 0;

      const baseImponible = subtotalLinea - (linea.descuento || 0);
      totalIVA += baseImponible * ((linea.iva || 0) / 100);
      totalIEPS += baseImponible * ((linea.ieps || 0) / 100);
    });

    const total = subtotal - descuento + totalIVA + totalIEPS;

    setTotales({
      subtotal,
      descuento,
      iva: totalIVA,
      ieps: totalIEPS,
      total,
    });
  };

  const handleAgregarProducto = (linea: LineaFacturaInput) => {
    setLineas([...lineas, linea]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cliente) {
      alert('Selecciona un cliente');
      return;
    }

    if (lineas.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }

    const datos: CrearFacturaInput = {
      clienteId: cliente.id,
      serie,
      fecha: new Date(fecha),
      fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : undefined,
      estado: 'BORRADOR',
      metodoPago,
      formaPago,
      condicionPago: condicionPago || undefined,
      observaciones: observaciones || undefined,
      lineas,
    };

    onSubmit(datos);
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(valor);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>1. Seleccionar Cliente *</CardTitle>
        </CardHeader>
        <CardContent>
          <SelectorCliente
            clienteSeleccionado={cliente}
            onSeleccionar={setCliente}
            onLimpiar={() => setCliente(null)}
          />
        </CardContent>
      </Card>

      {/* Configuración de Factura */}
      <Card>
        <CardHeader>
          <CardTitle>2. Configuración de Factura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="serie">Serie</Label>
              <Input
                id="serie"
                value={serie}
                onChange={(e) => setSerie(e.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>
            <div>
              <Label htmlFor="fecha">Fecha de Emisión *</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fechaVencimiento"
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                min={fecha}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="metodoPago">Método de Pago</Label>
              <select
                id="metodoPago"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="PUE">PUE - Pago en una exhibición</option>
                <option value="PPD">PPD - Pago en parcialidades o diferido</option>
              </select>
            </div>
            <div>
              <Label htmlFor="formaPago">Forma de Pago</Label>
              <select
                id="formaPago"
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="01">01 - Efectivo</option>
                <option value="03">03 - Transferencia electrónica</option>
                <option value="04">04 - Tarjeta de crédito</option>
                <option value="28">28 - Tarjeta de débito</option>
                <option value="99">99 - Por definir</option>
              </select>
            </div>
            <div>
              <Label htmlFor="condicionPago">Condiciones de Pago</Label>
              <Input
                id="condicionPago"
                value={condicionPago}
                onChange={(e) => setCondicionPago(e.target.value)}
                placeholder="Ej: Contado, 30 días, etc."
                maxLength={200}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="observaciones">Observaciones</Label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              maxLength={1000}
              placeholder="Notas adicionales sobre la factura..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Productos */}
      <Card>
        <CardHeader>
          <CardTitle>3. Agregar Productos *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SelectorProducto onAgregar={handleAgregarProducto} />

          <TablaLineasFactura lineas={lineas} onActualizar={setLineas} />
        </CardContent>
      </Card>

      {/* Totales */}
      {lineas.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatearMoneda(totales.subtotal)}</span>
              </div>
              {totales.descuento > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-medium text-red-600">
                    -{formatearMoneda(totales.descuento)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (16%):</span>
                <span className="font-medium">{formatearMoneda(totales.iva)}</span>
              </div>
              {totales.ieps > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IEPS:</span>
                  <span className="font-medium">{formatearMoneda(totales.ieps)}</span>
                </div>
              )}
              <div className="border-t border-blue-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatearMoneda(totales.total)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones */}
      <div className="flex gap-4">
        <Button type="submit" disabled={cargando || !cliente || lineas.length === 0} className="flex-1">
          {cargando ? 'Guardando...' : 'Crear Factura'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancelar} disabled={cargando}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
