import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicioFacturas } from '@/servicios/facturas';
import { useAutenticacion } from '@/contextos/ContextoAutenticacion';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/card';
import { Plus, Search, ArrowLeft, FileText, Eye } from 'lucide-react';
import FormularioFactura from '@/componentes/facturas/FormularioFactura';
import type { Factura, FiltrosFactura, CrearFacturaInput } from '@/tipos/facturas';

export default function Facturas() {
  const navigate = useNavigate();
  const { usuario, logout } = useAutenticacion();

  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modoFormulario, setModoFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [paginacion, setPaginacion] = useState({
    total: 0,
    pagina: 1,
    limite: 10,
    totalPaginas: 0,
  });

  const cargarFacturas = async () => {
    try {
      setCargando(true);
      setError('');

      const filtros: FiltrosFactura = {
        busqueda: busqueda || undefined,
        pagina: paginacion.pagina,
        limite: paginacion.limite,
      };

      const resultado = await servicioFacturas.obtenerTodas(filtros);
      setFacturas(resultado.facturas);
      setPaginacion(resultado.paginacion);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar facturas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!modoFormulario) {
      cargarFacturas();
    }
  }, [paginacion.pagina, busqueda, modoFormulario]);

  const manejarCrear = async (datos: CrearFacturaInput) => {
    try {
      setCargando(true);
      await servicioFacturas.crear(datos);
      setModoFormulario(false);
      alert('Factura creada exitosamente');
      cargarFacturas();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al crear factura');
    } finally {
      setCargando(false);
    }
  };

  const manejarVer = (factura: Factura) => {
    alert(
      `Factura: ${factura.folioCompleto}\n` +
      `Cliente: ${factura.cliente?.razonSocial}\n` +
      `Total: ${formatearMoneda(factura.total)}\n` +
      `Estado: ${factura.estado}\n\n` +
      `Productos: ${factura.lineas.length} líneas`
    );
  };

  const manejarLogout = () => {
    logout();
    navigate('/login');
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(valor);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const obtenerColorEstado = (estado: string) => {
    const colores: Record<string, string> = {
      BORRADOR: 'bg-gray-100 text-gray-800',
      EMITIDA: 'bg-blue-100 text-blue-800',
      TIMBRADA: 'bg-purple-100 text-purple-800',
      PAGADA: 'bg-green-100 text-green-800',
      PARCIALMENTE_PAGADA: 'bg-yellow-100 text-yellow-800',
      VENCIDA: 'bg-red-100 text-red-800',
      CANCELADA: 'bg-red-200 text-red-900',
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  // Modo formulario
  if (modoFormulario) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setModoFormulario(false)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Nueva Factura</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {usuario?.nombre} {usuario?.apellido}
              </span>
              <Button variant="outline" onClick={manejarLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FormularioFactura
            onSubmit={manejarCrear}
            onCancelar={() => setModoFormulario(false)}
            cargando={cargando}
          />
        </main>
      </div>
    );
  }

  // Modo lista
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {usuario?.nombre} {usuario?.apellido}
            </span>
            <Button variant="outline" onClick={manejarLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Gestión de Facturas</CardTitle>
              <Button onClick={() => setModoFormulario(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Factura
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Búsqueda */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por folio, cliente o RFC..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                {error}
              </div>
            )}

            {/* Tabla */}
            {cargando ? (
              <div className="text-center py-8 text-gray-500">Cargando facturas...</div>
            ) : facturas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron facturas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {facturas.map((factura) => (
                      <tr key={factura.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {factura.folioCompleto}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div>{factura.cliente?.razonSocial}</div>
                          <div className="text-xs text-gray-500">{factura.cliente?.rfc}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {formatearFecha(factura.fecha)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          {formatearMoneda(factura.total)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${obtenerColorEstado(factura.estado)}`}>
                            {factura.estado}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => manejarVer(factura)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {paginacion.totalPaginas > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Mostrando {facturas.length} de {paginacion.total} facturas
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginacion({ ...paginacion, pagina: paginacion.pagina - 1 })}
                    disabled={paginacion.pagina === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginacion({ ...paginacion, pagina: paginacion.pagina + 1 })}
                    disabled={paginacion.pagina === paginacion.totalPaginas}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
