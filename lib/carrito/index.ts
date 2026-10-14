'use client'

import { useSyncExternalStore } from 'react'
import {
  agregarItem,
  cambiarCantidad,
  parsearCarrito,
  quitarItem,
  resumenCarrito,
  sincronizarItems,
  type EstadoVariante,
  type ItemCarrito,
  type NuevoItem,
} from './items'

export type { EstadoVariante, ItemCarrito, NuevoItem } from './items'

// Store externo sobre localStorage. useSyncExternalStore evita el patrón
// "leer en un useEffect y hacer setState", que en StrictMode podía sobrescribir
// el carrito guardado con uno vacío, y sincroniza entre pestañas.

const CLAVE = 'carrito'
const VACIO: ItemCarrito[] = []
const listeners = new Set<() => void>()
let items: ItemCarrito[] | null = null

function leer(): ItemCarrito[] {
  try {
    return parsearCarrito(localStorage.getItem(CLAVE))
  } catch {
    return VACIO // Almacenamiento bloqueado (modo privado): el carrito vive solo en memoria.
  }
}

function emitir() {
  listeners.forEach((l) => l())
}

function guardar(siguiente: ItemCarrito[]) {
  items = siguiente
  try {
    localStorage.setItem(CLAVE, JSON.stringify(siguiente))
  } catch {
    // Sin almacenamiento: se mantiene en memoria.
  }
  emitir()
}

function alCambiarEnOtraPestana(e: StorageEvent) {
  if (e.key !== CLAVE) return
  items = parsearCarrito(e.newValue)
  emitir()
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', alCambiarEnOtraPestana)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', alCambiarEnOtraPestana)
  }
}

function getSnapshot(): ItemCarrito[] {
  if (items === null) items = leer()
  return items
}

const getServerSnapshot = () => VACIO

const acciones = {
  agregar: (item: NuevoItem, cantidad = 1) => guardar(agregarItem(getSnapshot(), item, cantidad)),
  actualizarCantidad: (varianteId: string, cantidad: number) =>
    guardar(cambiarCantidad(getSnapshot(), varianteId, cantidad)),
  quitar: (varianteId: string) => guardar(quitarItem(getSnapshot(), varianteId)),
  vaciar: () => guardar(VACIO),
  sincronizar: (estados: EstadoVariante[]) => guardar(sincronizarItems(getSnapshot(), estados)),
}

export function useCarrito() {
  const actuales = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return { items: actuales, ...resumenCarrito(actuales), ...acciones }
}

const noop = () => () => {}

/**
 * `false` en el render del servidor y durante la hidratación; `true` después.
 * Sirve para no mostrar "carrito vacío" antes de leer localStorage.
 */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}
