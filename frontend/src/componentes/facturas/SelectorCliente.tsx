import { useState, useEffect } from 'react';
import { servicioClientes } from '@/servicios/clientes';
import { Input } from '@/componentes/ui/input';
import { Button } from '@/componentes/ui/button';
import { Card, CardContent } from '@/componentes/ui/card';
import { Search, X, User } from 'lucide-react';
import type { Cliente } from '@/tipos/clientes';

interface Props {
  clienteSeleccionado: Cliente | null;
  onSeleccionar: (cliente: Cliente) => void;
  onLimpiar: () => void;
}

export default function SelectorCliente({ clienteSeleccionado, onSeleccionar, onLimpiar }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  useEffect(() => {
    const buscarClientes = async () => {
      if (busqueda.length < 2) {
        setClientes([]);
        return;
      }

      setCargando(true);
      try {
        const resultado = await servicioClientes.obtenerTodos({
          busqueda,
          limite: 10,
          pagina: 1,
        });
        setClientes(resultado.clientes);
        setMostrarResultados(true);
      } catch (error) {
        console.error('Error al buscar clientes:', error);
      } finally {
        setCargando(false);
      }
    };

    const timer = setTimeout(buscarClientes, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const handleSeleccionar = (cliente: Cliente) => {
    onSeleccionar(cliente);
    setMostrarResultados(false);
    setBusqueda('');
  };

  if (clienteSeleccionado) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <div className="font-semibold text-gray-900">
                  {clienteSeleccionado.razonSocial}
                </div>
                <div className="text-sm text-gray-600">
                  RFC: {clienteSeleccionado.rfc}
                </div>
                {clienteSeleccionado.email && (
                  <div className="text-sm text-gray-600">
                    Email: {clienteSeleccionado.email}
                  </div>
                )}
                {clienteSeleccionado.regimenFiscal && (
                  <div className="text-xs text-gray-500 mt-1">
                    Régimen: {clienteSeleccionado.regimenFiscal}
                  </div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onLimpiar}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
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
          placeholder="Buscar cliente por razón social, RFC o email..."
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
                Buscando clientes...
              </div>
            ) : clientes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {busqueda.length < 2
                  ? 'Escribe al menos 2 caracteres para buscar'
                  : 'No se encontraron clientes'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {clientes.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => handleSeleccionar(cliente)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {cliente.razonSocial}
                    </div>
                    <div className="text-sm text-gray-600">
                      RFC: {cliente.rfc}
                    </div>
                    {cliente.email && (
                      <div className="text-sm text-gray-500">
                        {cliente.email}
                      </div>
                    )}
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
