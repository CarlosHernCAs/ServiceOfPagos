// Catálogos del SAT (Servicio de Administración Tributaria) - México
// Basado en las especificaciones del CFDI 4.0

// ============================================
// RÉGIMEN FISCAL
// ============================================
export const REGIMEN_FISCAL = [
  { clave: '601', descripcion: 'General de Ley Personas Morales' },
  { clave: '603', descripcion: 'Personas Morales con Fines no Lucrativos' },
  { clave: '605', descripcion: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { clave: '606', descripcion: 'Arrendamiento' },
  { clave: '607', descripcion: 'Régimen de Enajenación o Adquisición de Bienes' },
  { clave: '608', descripcion: 'Demás ingresos' },
  { clave: '610', descripcion: 'Residentes en el Extranjero sin Establecimiento Permanente en México' },
  { clave: '611', descripcion: 'Ingresos por Dividendos (socios y accionistas)' },
  { clave: '612', descripcion: 'Personas Físicas con Actividades Empresariales y Profesionales' },
  { clave: '614', descripcion: 'Ingresos por intereses' },
  { clave: '615', descripcion: 'Régimen de los ingresos por obtención de premios' },
  { clave: '616', descripcion: 'Sin obligaciones fiscales' },
  { clave: '620', descripcion: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos' },
  { clave: '621', descripcion: 'Incorporación Fiscal' },
  { clave: '622', descripcion: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { clave: '623', descripcion: 'Opcional para Grupos de Sociedades' },
  { clave: '624', descripcion: 'Coordinados' },
  { clave: '625', descripcion: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
  { clave: '626', descripcion: 'Régimen Simplificado de Confianza' },
] as const;

// ============================================
// MÉTODO DE PAGO
// ============================================
export const METODO_PAGO = [
  { clave: 'PUE', descripcion: 'Pago en una sola exhibición' },
  { clave: 'PPD', descripcion: 'Pago en parcialidades o diferido' },
] as const;

// ============================================
// FORMA DE PAGO
// ============================================
export const FORMA_PAGO = [
  { clave: '01', descripcion: 'Efectivo' },
  { clave: '02', descripcion: 'Cheque nominativo' },
  { clave: '03', descripcion: 'Transferencia electrónica de fondos' },
  { clave: '04', descripcion: 'Tarjeta de crédito' },
  { clave: '05', descripcion: 'Monedero electrónico' },
  { clave: '06', descripcion: 'Dinero electrónico' },
  { clave: '08', descripcion: 'Vales de despensa' },
  { clave: '12', descripcion: 'Dación en pago' },
  { clave: '13', descripcion: 'Pago por subrogación' },
  { clave: '14', descripcion: 'Pago por consignación' },
  { clave: '15', descripcion: 'Condonación' },
  { clave: '17', descripcion: 'Compensación' },
  { clave: '23', descripcion: 'Novación' },
  { clave: '24', descripcion: 'Confusión' },
  { clave: '25', descripcion: 'Remisión de deuda' },
  { clave: '26', descripcion: 'Prescripción o caducidad' },
  { clave: '27', descripcion: 'A satisfacción del acreedor' },
  { clave: '28', descripcion: 'Tarjeta de débito' },
  { clave: '29', descripcion: 'Tarjeta de servicios' },
  { clave: '30', descripcion: 'Aplicación de anticipos' },
  { clave: '31', descripcion: 'Intermediario pagos' },
  { clave: '99', descripcion: 'Por definir' },
] as const;

// ============================================
// USO DE CFDI
// ============================================
export const USO_CFDI = [
  { clave: 'G01', descripcion: 'Adquisición de mercancías' },
  { clave: 'G02', descripcion: 'Devoluciones, descuentos o bonificaciones' },
  { clave: 'G03', descripcion: 'Gastos en general' },
  { clave: 'I01', descripcion: 'Construcciones' },
  { clave: 'I02', descripcion: 'Mobiliario y equipo de oficina por inversiones' },
  { clave: 'I03', descripcion: 'Equipo de transporte' },
  { clave: 'I04', descripcion: 'Equipo de cómputo y accesorios' },
  { clave: 'I05', descripcion: 'Dados, troqueles, moldes, matrices y herramental' },
  { clave: 'I06', descripcion: 'Comunicaciones telefónicas' },
  { clave: 'I07', descripcion: 'Comunicaciones satelitales' },
  { clave: 'I08', descripcion: 'Otra maquinaria y equipo' },
  { clave: 'D01', descripcion: 'Honorarios médicos, dentales y gastos hospitalarios' },
  { clave: 'D02', descripcion: 'Gastos médicos por incapacidad o discapacidad' },
  { clave: 'D03', descripcion: 'Gastos funerales' },
  { clave: 'D04', descripcion: 'Donativos' },
  { clave: 'D05', descripcion: 'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)' },
  { clave: 'D06', descripcion: 'Aportaciones voluntarias al SAR' },
  { clave: 'D07', descripcion: 'Primas por seguros de gastos médicos' },
  { clave: 'D08', descripcion: 'Gastos de transportación escolar obligatoria' },
  { clave: 'D09', descripcion: 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones' },
  { clave: 'D10', descripcion: 'Pagos por servicios educativos (colegiaturas)' },
  { clave: 'S01', descripcion: 'Sin efectos fiscales' },
  { clave: 'CP01', descripcion: 'Pagos' },
  { clave: 'CN01', descripcion: 'Nómina' },
] as const;

// ============================================
// TIPO DE COMPROBANTE
// ============================================
export const TIPO_COMPROBANTE = [
  { clave: 'I', descripcion: 'Ingreso' },
  { clave: 'E', descripcion: 'Egreso' },
  { clave: 'T', descripcion: 'Traslado' },
  { clave: 'N', descripcion: 'Nómina' },
  { clave: 'P', descripcion: 'Pago' },
] as const;

// ============================================
// MONEDA
// ============================================
export const MONEDA = [
  { clave: 'MXN', descripcion: 'Peso Mexicano' },
  { clave: 'USD', descripcion: 'Dólar Americano' },
  { clave: 'EUR', descripcion: 'Euro' },
  { clave: 'XXX', descripcion: 'Los códigos de moneda' },
] as const;

// ============================================
// UNIDADES DE MEDIDA (Principales)
// ============================================
export const UNIDAD_MEDIDA = [
  { clave: 'H87', descripcion: 'Pieza' },
  { clave: 'EA', descripcion: 'Elemento' },
  { clave: 'E48', descripcion: 'Unidad de servicio' },
  { clave: 'ACT', descripcion: 'Actividad' },
  { clave: 'KGM', descripcion: 'Kilogramo' },
  { clave: 'GRM', descripcion: 'Gramo' },
  { clave: 'LTR', descripcion: 'Litro' },
  { clave: 'MTR', descripcion: 'Metro' },
  { clave: 'MTK', descripcion: 'Metro cuadrado' },
  { clave: 'MTQ', descripcion: 'Metro cúbico' },
  { clave: 'HUR', descripcion: 'Hora' },
  { clave: 'MON', descripcion: 'Mes' },
  { clave: 'ANN', descripcion: 'Año' },
  { clave: 'DAY', descripcion: 'Día' },
  { clave: 'XBX', descripcion: 'Caja' },
  { clave: 'XPK', descripcion: 'Paquete' },
  { clave: 'SET', descripcion: 'Conjunto' },
  { clave: 'XKI', descripcion: 'Kit' },
] as const;

// ============================================
// TIPOS DE RELACIÓN (para Notas de Crédito/Débito)
// ============================================
export const TIPO_RELACION = [
  { clave: '01', descripcion: 'Nota de crédito de los documentos relacionados' },
  { clave: '02', descripcion: 'Nota de débito de los documentos relacionados' },
  { clave: '03', descripcion: 'Devolución de mercancía sobre facturas o traslados previos' },
  { clave: '04', descripcion: 'Sustitución de los CFDI previos' },
  { clave: '05', descripcion: 'Traslados de mercancías facturados previamente' },
  { clave: '06', descripcion: 'Factura generada por los traslados previos' },
  { clave: '07', descripcion: 'CFDI por aplicación de anticipo' },
  { clave: '08', descripcion: 'Factura generada por pagos en parcialidades' },
  { clave: '09', descripcion: 'Factura generada por pagos diferidos' },
] as const;

// ============================================
// HELPERS
// ============================================

export function obtenerRegimenFiscal(clave: string) {
  return REGIMEN_FISCAL.find((r) => r.clave === clave);
}

export function obtenerMetodoPago(clave: string) {
  return METODO_PAGO.find((m) => m.clave === clave);
}

export function obtenerFormaPago(clave: string) {
  return FORMA_PAGO.find((f) => f.clave === clave);
}

export function obtenerUsoCFDI(clave: string) {
  return USO_CFDI.find((u) => u.clave === clave);
}

export function obtenerUnidadMedida(clave: string) {
  return UNIDAD_MEDIDA.find((u) => u.clave === clave);
}

// Types para TypeScript
export type RegimenFiscalClave = typeof REGIMEN_FISCAL[number]['clave'];
export type MetodoPagoClave = typeof METODO_PAGO[number]['clave'];
export type FormaPagoClave = typeof FORMA_PAGO[number]['clave'];
export type UsoCFDIClave = typeof USO_CFDI[number]['clave'];
export type TipoComprobanteClave = typeof TIPO_COMPROBANTE[number]['clave'];
export type MonedaClave = typeof MONEDA[number]['clave'];
export type UnidadMedidaClave = typeof UNIDAD_MEDIDA[number]['clave'];
export type TipoRelacionClave = typeof TIPO_RELACION[number]['clave'];
