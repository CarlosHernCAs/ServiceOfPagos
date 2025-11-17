import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicioProductos } from '@/servicios/productos';
import { useAutenticacion } from '@/contextos/ContextoAutenticacion';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Label } from '@/componentes/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/card';
import { Plus, Search, ArrowLeft, Edit, Trash2, Package } from 'lucide-react';
import type { Producto, CrearProductoInput, FiltrosProducto } from '@/tipos/productos';

export default function Productos() {
  const navigate = useNavigate();
  const { usuario, logout } = useAutenticacion();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modoFormulario, setModoFormulario] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | undefined>();
  const [busqueda, setBusqueda] = useState('');
  const [paginacion, setPaginacion] = useState({
    total: 0,
    pagina: 1,
    limite: 10,
    totalPaginas: 0,
  });

  // Estado del formulario
  const [formData, setFormData] = useState<CrearProductoInput>({
    clave: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    unidadMedida: 'PZA',
    tipo: 'PRODUCTO',
    precio: 0,
    costo: 0,
    iva: 16,
    ieps: 0,
    controlaInventario: false,
    stockActual: 0,
    stockMinimo: 0,
    stockMaximo: 0,
    activo: true,
  });

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError('');

      const filtros: FiltrosProducto = {
        busqueda: busqueda || undefined,
        pagina: paginacion.pagina,
        limite: paginacion.limite,
      };

      const resultado = await servicioProductos.obtenerTodos(filtros);
      setProductos(resultado.productos);
      setPaginacion(resultado.paginacion);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar productos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [paginacion.pagina, busqueda]);

  const manejarCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await servicioProductos.crear(formData);
      setModoFormulario(false);
      resetFormulario();
      cargarProductos();
      alert('Producto creado exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al crear producto');
    }
  };

  const manejarActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoEditar) return;

    try {
      await servicioProductos.actualizar(productoEditar.id, formData);
      setModoFormulario(false);
      setProductoEditar(undefined);
      resetFormulario();
      cargarProductos();
      alert('Producto actualizado exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al actualizar producto');
    }
  };

  const manejarEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const resultado = await servicioProductos.eliminar(id);
      alert(resultado.mensaje);
      cargarProductos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar producto');
    }
  };

  const manejarEditar = (producto: Producto) => {
    setProductoEditar(producto);
    setFormData({
      clave: producto.clave,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoria: producto.categoria || '',
      unidadMedida: producto.unidadMedida,
      tipo: producto.tipo,
      precio: producto.precio,
      costo: producto.costo || 0,
      iva: producto.iva,
      ieps: producto.ieps || 0,
      controlaInventario: producto.controlaInventario,
      stockActual: producto.stockActual || 0,
      stockMinimo: producto.stockMinimo || 0,
      stockMaximo: producto.stockMaximo || 0,
      activo: producto.activo,
    });
    setModoFormulario(true);
  };

  const manejarCancelar = () => {
    setModoFormulario(false);
    setProductoEditar(undefined);
    resetFormulario();
  };

  const resetFormulario = () => {
    setFormData({
      clave: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      unidadMedida: 'PZA',
      tipo: 'PRODUCTO',
      precio: 0,
      costo: 0,
      iva: 16,
      ieps: 0,
      controlaInventario: false,
      stockActual: 0,
      stockMinimo: 0,
      stockMaximo: 0,
      activo: true,
    });
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
                {productoEditar ? 'Editar Producto' : 'Nuevo Producto'}
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={productoEditar ? manejarActualizar : manejarCrear} className="space-y-6">
                {/* Identificación */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Identificación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clave">Clave *</Label>
                      <Input
                        id="clave"
                        value={formData.clave}
                        onChange={(e) => setFormData({ ...formData, clave: e.target.value.toUpperCase() })}
                        required
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      maxLength={500}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="categoria">Categoría</Label>
                      <Input
                        id="categoria"
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unidadMedida">Unidad de Medida</Label>
                      <Input
                        id="unidadMedida"
                        value={formData.unidadMedida}
                        onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value.toUpperCase() })}
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <select
                        id="tipo"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'PRODUCTO' | 'SERVICIO' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="PRODUCTO">Producto</option>
                        <option value="SERVICIO">Servicio</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Precios e Impuestos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Precios e Impuestos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="precio">Precio *</Label>
                      <Input
                        id="precio"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.precio}
                        onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="costo">Costo</Label>
                      <Input
                        id="costo"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costo}
                        onChange={(e) => setFormData({ ...formData, costo: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="iva">IVA (%)</Label>
                      <Input
                        id="iva"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.iva}
                        onChange={(e) => setFormData({ ...formData, iva: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ieps">IEPS (%)</Label>
                      <Input
                        id="ieps"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.ieps}
                        onChange={(e) => setFormData({ ...formData, ieps: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Inventario */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Inventario</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="controlaInventario"
                      checked={formData.controlaInventario}
                      onChange={(e) => setFormData({ ...formData, controlaInventario: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="controlaInventario">Controlar inventario</Label>
                  </div>

                  {formData.controlaInventario && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="stockActual">Stock Actual</Label>
                        <Input
                          id="stockActual"
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.stockActual}
                          onChange={(e) => setFormData({ ...formData, stockActual: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                        <Input
                          id="stockMinimo"
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.stockMinimo}
                          onChange={(e) => setFormData({ ...formData, stockMinimo: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stockMaximo">Stock Máximo</Label>
                        <Input
                          id="stockMaximo"
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.stockMaximo}
                          onChange={(e) => setFormData({ ...formData, stockMaximo: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    {productoEditar ? 'Actualizar' : 'Crear'} Producto
                  </Button>
                  <Button type="button" variant="outline" onClick={manejarCancelar}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
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
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
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

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Gestión de Productos</CardTitle>
              <Button onClick={() => setModoFormulario(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Búsqueda */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por clave, nombre o descripción..."
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
              <div className="text-center py-8 text-gray-500">Cargando productos...</div>
            ) : productos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron productos
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clave</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productos.map((producto) => (
                      <tr key={producto.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{producto.clave}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div>{producto.nombre}</div>
                          {producto.categoria && (
                            <div className="text-xs text-gray-500">{producto.categoria}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">{producto.tipo}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          {formatearMoneda(producto.precio)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {producto.controlaInventario ? (
                            <span className={producto.stockActual && producto.stockMinimo && producto.stockActual < producto.stockMinimo ? 'text-red-600 font-medium' : ''}>
                              {producto.stockActual} {producto.unidadMedida}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              producto.activo
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {producto.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => manejarEditar(producto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => manejarEliminar(producto.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
                  Mostrando {productos.length} de {paginacion.total} productos
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
