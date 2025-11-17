import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorAutenticacion } from '@/contextos/ContextoAutenticacion';
import RutaProtegida from '@/componentes/comunes/RutaProtegida';
import Login from '@/paginas/Login';
import Registro from '@/paginas/Registro';
import Dashboard from '@/paginas/Dashboard';
import Clientes from '@/paginas/Clientes';

function App() {
  return (
    <BrowserRouter>
      <ProveedorAutenticacion>
        <Routes>
          {/* Redirigir raíz a login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            }
          />
          <Route
            path="/clientes"
            element={
              <RutaProtegida>
                <Clientes />
              </RutaProtegida>
            }
          />

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ProveedorAutenticacion>
    </BrowserRouter>
  );
}

export default App;
