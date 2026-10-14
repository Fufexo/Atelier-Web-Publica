/**
 * Tarifas de envío. Fuente única para el checkout (lo que ve el cliente) y para
 * /api/culqi/cobrar (lo que realmente se cobra).
 */

export const COSTO_ENVIO_PROVINCIA = 25

/** Valor del selector de distrito que representa un envío fuera de Lima. */
export const DESTINO_PROVINCIA = 'provincia'

export const DISTRITOS_LIMA = [
  { nombre: 'Ancón', precio: 25 },
  { nombre: 'Ate', precio: 15 },
  { nombre: 'Barranco', precio: 10 },
  { nombre: 'Bellavista', precio: 20 },
  { nombre: 'Breña', precio: 10 },
  { nombre: 'Carabayllo', precio: 20 },
  { nombre: 'Carmen de la Legua', precio: 20 },
  { nombre: 'Cercado de Lima', precio: 10 },
  { nombre: 'Chaclacayo', precio: 25 },
  { nombre: 'Chorrillos', precio: 15 },
  { nombre: 'Cieneguilla', precio: 25 },
  { nombre: 'Comas', precio: 20 },
  { nombre: 'El Agustino', precio: 15 },
  { nombre: 'Independencia', precio: 20 },
  { nombre: 'Jesús María', precio: 10 },
  { nombre: 'La Molina', precio: 15 },
  { nombre: 'La Perla', precio: 20 },
  { nombre: 'La Punta', precio: 20 },
  { nombre: 'La Victoria', precio: 15 },
  { nombre: 'Lince', precio: 10 },
  { nombre: 'Los Olivos', precio: 20 },
  { nombre: 'Lurigancho', precio: 25 },
  { nombre: 'Lurín', precio: 20 },
  { nombre: 'Magdalena del Mar', precio: 10 },
  { nombre: 'Mi Perú', precio: 25 },
  { nombre: 'Miraflores', precio: 10 },
  { nombre: 'Pachacámac', precio: 25 },
  { nombre: 'Pueblo Libre', precio: 10 },
  { nombre: 'Puente Piedra', precio: 20 },
  { nombre: 'Rímac', precio: 15 },
  { nombre: 'San Borja', precio: 10 },
  { nombre: 'San Isidro', precio: 10 },
  { nombre: 'San Juan de Lurigancho', precio: 20 },
  { nombre: 'San Juan de Miraflores', precio: 20 },
  { nombre: 'San Luis', precio: 15 },
  { nombre: 'San Martín de Porres', precio: 20 },
  { nombre: 'San Miguel', precio: 10 },
  { nombre: 'Santa Anita', precio: 15 },
  { nombre: 'Santa Rosa', precio: 25 },
  { nombre: 'Santiago de Surco', precio: 15 },
  { nombre: 'Surquillo', precio: 10 },
  { nombre: 'Ventanilla', precio: 25 },
  { nombre: 'Villa El Salvador', precio: 20 },
  { nombre: 'Villa María del Triunfo', precio: 20 },
] as const

/**
 * Costo de envío para el valor elegido en el selector: un distrito de Lima o
 * `DESTINO_PROVINCIA`. Devuelve `null` si el destino no existe.
 */
export function costoEnvio(destino: string): number | null {
  if (destino === DESTINO_PROVINCIA) return COSTO_ENVIO_PROVINCIA
  return DISTRITOS_LIMA.find((d) => d.nombre === destino)?.precio ?? null
}
