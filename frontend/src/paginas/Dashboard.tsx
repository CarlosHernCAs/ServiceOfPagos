import { useAutenticacion } from '@/contextos/ContextoAutenticacion';
import { Button } from '@/componentes/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/componentes/ui/card';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { usuario, logout } = useAutenticacion();
  const navigate = useNavigate();

  const manejarLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Facturación
          </h1>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Bienvenido, {usuario?.nombre}!
          </h2>
          <p className="text-gray-600 mt-2">
            Este es tu dashboard principal del sistema de facturación
          </p>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Facturas del Mes</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Próximamente disponible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Clientes Activos</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Próximamente disponible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Productos</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Próximamente disponible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Facturado</CardDescription>
              <CardTitle className="text-3xl">$0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Próximamente disponible
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Información del Usuario */}
        <Card>
          <CardHeader>
            <CardTitle>Información de tu Cuenta</CardTitle>
            <CardDescription>
              Detalles de tu perfil de usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span className="text-gray-600">{usuario?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nombre:</span>
                <span className="text-gray-600">
                  {usuario?.nombre} {usuario?.apellido}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Rol:</span>
                <span className="text-gray-600">{usuario?.rol}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Estado:</span>
                <span className="text-green-600 font-medium">
                  {usuario?.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Módulos Disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/clientes')}
            >
              <CardHeader>
                <CardTitle className="text-lg">Clientes ✅</CardTitle>
                <CardDescription>
                  Gestiona tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ir a Clientes</Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/productos')}
            >
              <CardHeader>
                <CardTitle className="text-lg">Productos ✅</CardTitle>
                <CardDescription>
                  Administra tu catálogo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Ir a Productos</Button>
              </CardContent>
            </Card>

            <Card className="cursor-not-allowed opacity-60">
              <CardHeader>
                <CardTitle className="text-lg">Facturas 🔜</CardTitle>
                <CardDescription>
                  Crea y gestiona facturas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">Próximamente</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
