import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAutenticacion } from '@/contextos/ContextoAutenticacion';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Label } from '@/componentes/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/componentes/ui/card';

export default function Registro() {
  const navigate = useNavigate();
  const { registrar } = useAutenticacion();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    passwordConfirmacion: '',
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.passwordConfirmacion) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);

    try {
      await registrar({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>
            Completa el formulario para registrarte
          </CardDescription>
        </CardHeader>
        <form onSubmit={manejarSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={manejarCambio}
                  required
                  disabled={cargando}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  name="apellido"
                  type="text"
                  placeholder="Pérez"
                  value={formData.apellido}
                  onChange={manejarCambio}
                  disabled={cargando}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={manejarCambio}
                required
                disabled={cargando}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={manejarCambio}
                required
                disabled={cargando}
              />
              <p className="text-xs text-gray-500">
                Debe contener mayúsculas, minúsculas y números
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmacion">Confirmar Contraseña *</Label>
              <Input
                id="passwordConfirmacion"
                name="passwordConfirmacion"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.passwordConfirmacion}
                onChange={manejarCambio}
                required
                disabled={cargando}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={cargando}
            >
              {cargando ? 'Registrando...' : 'Crear Cuenta'}
            </Button>

            <p className="text-sm text-center text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Inicia Sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
