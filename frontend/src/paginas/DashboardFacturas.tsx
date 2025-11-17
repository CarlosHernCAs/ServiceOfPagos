import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicioFacturas } from '@/servicios/facturas';
import { useAutenticacion } from '@/contextos/ContextoAutenticacion';
import { Button } from '@/componentes/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/componentes/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { EstadisticasFacturas } from '@/tipos/facturas';

export default function DashboardFacturas() {
  const navigate = useNavigate();
  const { usuario, logout } = useAutenticacion();
  const [estadisticas, setEstadisticas] = useState<EstadisticasFacturas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      setError('');
      const datos = await servicioFacturas.obtenerEstadisticas();
      setEstadisticas(datos);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar estadísticas');
    } finally {
      setCargando(false);
    }
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

  // Colores para las gráficas
  const COLORES_ESTADO = {
    BORRADOR: '#6b7280',
    EMITIDA: '#3b82f6',
    TIMBRADA: '#8b5cf6',
    PAGADA: '#10b981',
    PARCIALMENTE_PAGADA: '#f59e0b',
    VENCIDA: '#ef4444',
    CANCELADA: '#dc2626',
  };

  const COLORES_GRAFICA = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !estadisticas) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600">{error || 'No se pudieron cargar las estadísticas'}</p>
            <Button onClick={cargarEstadisticas} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Datos para gráfica de pie (distribución por estado)
  const datosPorEstado = [
    { name: 'Borradores', value: estadisticas.porEstado.borradores, color: COLORES_ESTADO.BORRADOR },
    { name: 'Emitidas', value: estadisticas.porEstado.emitidas, color: COLORES_ESTADO.EMITIDA },
    { name: 'Timbradas', value: estadisticas.porEstado.timbradas, color: COLORES_ESTADO.TIMBRADA },
    { name: 'Pagadas', value: estadisticas.porEstado.pagadas, color: COLORES_ESTADO.PAGADA },
    { name: 'Vencidas', value: estadisticas.porEstado.vencidas, color: COLORES_ESTADO.VENCIDA },
    { name: 'Canceladas', value: estadisticas.porEstado.canceladas, color: COLORES_ESTADO.CANCELADA },
  ].filter((item) => item.value > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Facturas</h1>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Facturas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Facturas
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.totalFacturas}</div>
              <p className="text-xs text-gray-500 mt-1">Todas las facturas registradas</p>
            </CardContent>
          </Card>

          {/* Facturado Total */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Facturado Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatearMoneda(estadisticas.montos.total)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Monto total emitido</p>
            </CardContent>
          </Card>

          {/* Por Cobrar */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Por Cobrar</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatearMoneda(estadisticas.montos.porCobrar)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Pendiente de pago</p>
            </CardContent>
          </Card>

          {/* Cobrado */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cobrado</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatearMoneda(estadisticas.montos.pagado)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Facturas pagadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas del Mes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Facturas del Mes
              </CardTitle>
              <CardDescription>Facturación del mes actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Cantidad</span>
                    <span className="text-2xl font-bold">{estadisticas.delMes.cantidad}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (estadisticas.delMes.cantidad / estadisticas.totalFacturas) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Monto</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatearMoneda(estadisticas.delMes.monto)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (estadisticas.delMes.monto / estadisticas.montos.total) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribución por Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
              <CardDescription>Facturas según su estado actual</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={datosPorEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datosPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tendencia de Facturación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfica de Barras - Facturación por Mes */}
          <Card>
            <CardHeader>
              <CardTitle>Facturación por Mes</CardTitle>
              <CardDescription>Últimos 6 meses - Cantidad de facturas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estadisticas.facturasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cantidad" fill="#3b82f6" name="Facturas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfica de Líneas - Montos por Mes */}
          <Card>
            <CardHeader>
              <CardTitle>Montos Facturados</CardTitle>
              <CardDescription>Últimos 6 meses - Montos en pesos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={estadisticas.facturasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatearMoneda(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="monto"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Monto"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Estados */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Estado</CardTitle>
            <CardDescription>Desglose detallado de facturas por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Porcentaje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Borradores
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {estadisticas.porEstado.borradores}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {((estadisticas.porEstado.borradores / estadisticas.totalFacturas) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Emitidas
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {estadisticas.porEstado.emitidas}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {((estadisticas.porEstado.emitidas / estadisticas.totalFacturas) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Timbradas
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {estadisticas.porEstado.timbradas}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {((estadisticas.porEstado.timbradas / estadisticas.totalFacturas) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Pagadas
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {estadisticas.porEstado.pagadas}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {((estadisticas.porEstado.pagadas / estadisticas.totalFacturas) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Vencidas
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {estadisticas.porEstado.vencidas}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {((estadisticas.porEstado.vencidas / estadisticas.totalFacturas) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-900">
                        Canceladas
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {estadisticas.porEstado.canceladas}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {((estadisticas.porEstado.canceladas / estadisticas.totalFacturas) * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Botón para ir a Facturas */}
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate('/facturas')} size="lg">
            <FileText className="h-5 w-5 mr-2" />
            Ver Todas las Facturas
          </Button>
        </div>
      </main>
    </div>
  );
}
