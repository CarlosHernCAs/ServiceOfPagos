import api from './api';
import type { CatalogosSAT, CatalogoSAT, Configuracion, DatosEmpresa } from '@/tipos/configuracion';

export const servicioConfiguracion = {
  // Catálogos SAT
  async obtenerCatalogosSAT(): Promise<CatalogosSAT> {
    const { data } = await api.get<CatalogosSAT>('/configuracion/catalogos-sat');
    return data;
  },

  async obtenerRegimenesFiscales(): Promise<CatalogoSAT[]> {
    const { data } = await api.get<{ regimenes: CatalogoSAT[] }>('/configuracion/regimenes-fiscales');
    return data.regimenes;
  },

  async obtenerMetodosPago(): Promise<CatalogoSAT[]> {
    const { data } = await api.get<{ metodos: CatalogoSAT[] }>('/configuracion/metodos-pago');
    return data.metodos;
  },

  async obtenerFormasPago(): Promise<CatalogoSAT[]> {
    const { data } = await api.get<{ formas: CatalogoSAT[] }>('/configuracion/formas-pago');
    return data.formas;
  },

  async obtenerUsosCFDI(): Promise<CatalogoSAT[]> {
    const { data } = await api.get<{ usos: CatalogoSAT[] }>('/configuracion/usos-cfdi');
    return data.usos;
  },

  async obtenerUnidadesMedida(): Promise<CatalogoSAT[]> {
    const { data } = await api.get<{ unidades: CatalogoSAT[] }>('/configuracion/unidades-medida');
    return data.unidades;
  },

  // Configuración general
  async obtenerTodas(): Promise<Configuracion[]> {
    const { data } = await api.get<{ configuraciones: Configuracion[] }>('/configuracion');
    return data.configuraciones;
  },

  async obtenerPorClave(clave: string): Promise<Configuracion> {
    const { data } = await api.get<{ configuracion: Configuracion }>(`/configuracion/${clave}`);
    return data.configuracion;
  },

  async guardar(
    clave: string,
    valor: any,
    tipo: 'string' | 'number' | 'boolean' | 'json' = 'string',
    descripcion?: string
  ): Promise<Configuracion> {
    const { data } = await api.post<{ mensaje: string; configuracion: Configuracion }>(
      '/configuracion',
      { clave, valor, tipo, descripcion }
    );
    return data.configuracion;
  },

  async eliminar(clave: string): Promise<{ mensaje: string }> {
    const { data } = await api.delete<{ mensaje: string }>(`/configuracion/${clave}`);
    return data;
  },

  // Datos de empresa
  async obtenerDatosEmpresa(): Promise<DatosEmpresa> {
    const { data } = await api.get<{ datos: DatosEmpresa }>('/configuracion/empresa/datos');
    return data.datos;
  },

  async guardarDatosEmpresa(datos: DatosEmpresa): Promise<{ mensaje: string }> {
    const { data } = await api.post<{ mensaje: string }>('/configuracion/empresa/datos', datos);
    return data;
  },
};
