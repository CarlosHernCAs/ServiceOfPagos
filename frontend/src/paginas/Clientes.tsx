import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicioClientes } from '@/servicios/clientes';
import { useAutenticacion } from '@/contextos/ContextoAutenticacion';
import TablaClientes from '@/componentes/clientes/TablaClientes';
import FormularioCliente from '@/componentes/clientes/FormularioCliente';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/card';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import type { Cliente, CrearClienteInput, FiltrosCliente } from '@/tipos/clientes';

export default function Clientes() {
  const navigate = useNavigate();
  const { usuario, logout } = useAutenticacion();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modoFormulario, setModoFormulario] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<Cliente | undefined>();
  const [busqueda, setBusqueda] = useState('');
  const [paginacion, setPaginacion] = useState({
    total: 0,
    pagina: 1,
    limite: 10,
    totalPaginas: 0,
  });

  const cargarClientes = async () => {
    try {
      setCargando(true);
      setError('');

      const filtros: FiltrosCliente = {
        busqueda: busqueda || undefined,
        pagina: paginacion.pagina,
        limite: paginacion.limite,
      };

      const resultado = await servicioClientes.obtenerTodos(filtros);
      setClientes(resultado.clientes);
      setPaginacion(resultado.paginacion);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar clientes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, [paginacion.pagina, busqueda]);

  const manejarCrear = async (datos: CrearClienteInput) => {
    try {
      await servicioClientes.crear(datos);
      setModoFormulario(false);
      cargarClientes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al crear cliente');
    }
  };

  const manejarActualizar = async (datos: CrearClienteInput) => {
    if (!clienteEditar) return;

    try {
      await servicioClientes.actualizar(clienteEditar.id, datos);
      setModoFormulario(false);
      setClienteEditar(undefined);
      cargarClientes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al actualizar cliente');
    }
  };

  const manejarEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      const resultado = await servicioClientes.eliminar(id);
      alert(resultado.mensaje);
      cargarClientes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar cliente');
    }
  };

  const manejarVer = (cliente: Cliente) => {
    alert(`Ver detalles de: ${cliente.razonSocial}\nRFC: ${cliente.rfc}`);
  };

  const manejarEditar = (cliente: Cliente) => {
    setClienteEditar(cliente);
    setModoFormulario(true);
  };

  const manejarCancelar = () => {
    setModoFormulario(false);
    setClienteEditar(undefined);
  };

  const manejarLogout = () => {
    logout();
    navigate('/login');
  };

  if (modoFormulario) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={manejarCancelar}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {clienteEditar ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h1>
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
          <FormularioCliente
            cliente={clienteEditar}
            onSubmit={clienteEditar ? manejarActualizar : manejarCrear}
            onCancelar={manejarCancelar}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
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

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Acciones y Búsqueda */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre, RFC o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={() => setModoFormulario(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tabla de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Clientes ({paginacion.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando clientes...</p>
              </div>
            ) : (
              <>
                <TablaClientes
                  clientes={clientes}
                  onEditar={manejarEditar}
                  onEliminar={manejarEliminar}
                  onVer={manejarVer}
                />

                {/* Paginación */}
                {paginacion.totalPaginas > 1 && (
                  <div className="mt-6 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPaginacion({ ...paginacion, pagina: paginacion.pagina - 1 })}
                      disabled={paginacion.pagina === 1}
                    >
                      Anterior
                    </Button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Página {paginacion.pagina} de {paginacion.totalPaginas}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPaginacion({ ...paginacion, pagina: paginacion.pagina + 1 })}
                      disabled={paginacion.pagina === paginacion.totalPaginas}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
