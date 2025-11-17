import { useForm } from 'react-hook-form';
import { CrearClienteInput, Cliente } from '@/tipos/clientes';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Label } from '@/componentes/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/card';

interface FormularioClienteProps {
  cliente?: Cliente;
  onSubmit: (datos: CrearClienteInput) => Promise<void>;
  onCancelar: () => void;
  cargando?: boolean;
}

export default function FormularioCliente({
  cliente,
  onSubmit,
  onCancelar,
  cargando = false,
}: FormularioClienteProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CrearClienteInput>({
    defaultValues: cliente || {
      pais: 'México',
      diasCredito: 0,
      activo: true,
      usoCfdi: 'G03',
    },
  });

  const manejarEnvio = async (datos: CrearClienteInput) => {
    await onSubmit(datos);
  };

  return (
    <form onSubmit={handleSubmit(manejarEnvio)} className="space-y-6">
      {/* Datos Fiscales */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Fiscales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="razonSocial">
                Razón Social <span className="text-red-500">*</span>
              </Label>
              <Input
                id="razonSocial"
                {...register('razonSocial', { required: 'Campo requerido' })}
                placeholder="Empresa SA de CV"
                disabled={cargando}
              />
              {errors.razonSocial && (
                <p className="text-sm text-red-600 mt-1">{errors.razonSocial.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="nombreComercial">Nombre Comercial</Label>
              <Input
                id="nombreComercial"
                {...register('nombreComercial')}
                placeholder="Nombre con el que se conoce"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="rfc">
                RFC <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rfc"
                {...register('rfc', { required: 'Campo requerido' })}
                placeholder="ABC123456XXX"
                maxLength={13}
                className="uppercase"
                disabled={cargando}
              />
              {errors.rfc && (
                <p className="text-sm text-red-600 mt-1">{errors.rfc.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="regimenFiscal">
                Régimen Fiscal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="regimenFiscal"
                {...register('regimenFiscal', { required: 'Campo requerido' })}
                placeholder="601, 603, etc."
                disabled={cargando}
              />
              {errors.regimenFiscal && (
                <p className="text-sm text-red-600 mt-1">{errors.regimenFiscal.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="usoCfdi">Uso CFDI</Label>
              <Input
                id="usoCfdi"
                {...register('usoCfdi')}
                placeholder="G03"
                disabled={cargando}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="contacto@empresa.com"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                {...register('telefono')}
                placeholder="55 1234 5678"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="celular">Celular</Label>
              <Input
                id="celular"
                {...register('celular')}
                placeholder="55 9876 5432"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="sitioWeb">Sitio Web</Label>
              <Input
                id="sitioWeb"
                type="url"
                {...register('sitioWeb')}
                placeholder="https://www.empresa.com"
                disabled={cargando}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dirección Fiscal */}
      <Card>
        <CardHeader>
          <CardTitle>Dirección Fiscal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="calle">Calle</Label>
              <Input
                id="calle"
                {...register('calle')}
                placeholder="Av. Reforma"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="numeroExterior">Núm. Exterior</Label>
              <Input
                id="numeroExterior"
                {...register('numeroExterior')}
                placeholder="123"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="numeroInterior">Núm. Interior</Label>
              <Input
                id="numeroInterior"
                {...register('numeroInterior')}
                placeholder="A-1"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="colonia">Colonia</Label>
              <Input
                id="colonia"
                {...register('colonia')}
                placeholder="Centro"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="codigoPostal">Código Postal</Label>
              <Input
                id="codigoPostal"
                {...register('codigoPostal')}
                placeholder="12345"
                maxLength={5}
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                {...register('ciudad')}
                placeholder="Ciudad de México"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                {...register('estado')}
                placeholder="CDMX"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                {...register('pais')}
                placeholder="México"
                disabled={cargando}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración Comercial */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración Comercial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="diasCredito">Días de Crédito</Label>
              <Input
                id="diasCredito"
                type="number"
                {...register('diasCredito', { valueAsNumber: true })}
                placeholder="0"
                min="0"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="limiteCredito">Límite de Crédito</Label>
              <Input
                id="limiteCredito"
                type="number"
                {...register('limiteCredito', { valueAsNumber: true })}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={cargando}
              />
            </div>

            <div>
              <Label htmlFor="descuentoGeneral">Descuento General (%)</Label>
              <Input
                id="descuentoGeneral"
                type="number"
                {...register('descuentoGeneral', { valueAsNumber: true })}
                placeholder="0"
                step="0.01"
                min="0"
                max="100"
                disabled={cargando}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="notas">Notas</Label>
          <textarea
            id="notas"
            {...register('notas')}
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Información adicional sobre el cliente..."
            disabled={cargando}
          />
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancelar} disabled={cargando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={cargando}>
          {cargando ? 'Guardando...' : cliente ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
