'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import ResumenTotales from '@/components/store/ResumenTotales'
import EmptyState from '@/components/ui/EmptyState'
import Field, { inputTienda } from '@/components/ui/Field'
import Icon from '@/components/ui/Icon'
import { boton } from '@/components/ui/button'
import { useCarrito, useHidratado, type EstadoVariante } from '@/lib/carrito'
import { erroresPorCampo, formularioCheckoutSchema, type FormularioCheckout } from '@/lib/checkout/schema'
import { COSTO_ENVIO_PROVINCIA, DESTINO_PROVINCIA, DISTRITOS_LIMA, costoEnvio } from '@/lib/envios'
import { formatearPrecio } from '@/lib/format'
import { aCentimos, calcularTotales } from '@/lib/precios'

// ── Culqi Checkout v4 (script global) ─────────────────────────────────────────
declare global {
  interface Window {
    Culqi?: {
      publicKey: string
      settings: (opts: { title: string; currency: 'PEN'; amount: number; description?: string }) => void
      open: () => void
      close: () => void
      token?: { id: string }
      error?: { user_message: string }
    }
    culqi?: () => void
  }
}

const FORM_VACIO = {
  nombre: '',
  email: '',
  telefono: '',
  destino: '',
  ciudad: '',
  departamento: '',
  direccion: '',
  referencia: '',
}

type Campo = keyof typeof FORM_VACIO

function aSolicitud(f: typeof FORM_VACIO): FormularioCheckout {
  return {
    cliente: { nombre: f.nombre, email: f.email, telefono: f.telefono },
    envio: {
      destino: f.destino,
      ciudad: f.ciudad || undefined,
      departamento: f.departamento || undefined,
      direccion: f.direccion,
      referencia: f.referencia || undefined,
    },
  }
}

export default function CheckoutForm() {
  const router = useRouter()
  const hidratado = useHidratado()
  const { items, total, vaciar, sincronizar } = useCarrito()

  const [form, setForm] = useState(FORM_VACIO)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorPago, setErrorPago] = useState<string | null>(null)
  const [culqiListo, setCulqiListo] = useState(false)
  const [procesando, setProcesando] = useState(false)

  const envio = form.destino ? costoEnvio(form.destino) : null
  const totales = calcularTotales(total, envio ?? 0)
  const esProvincia = form.destino === DESTINO_PROVINCIA

  // Culqi llama a window.culqi() sin argumentos cuando hay token o error. El ref
  // le da acceso a los datos vigentes sin re-registrar el callback en cada render.
  const pagarRef = useRef<(token: string) => Promise<void>>(async () => {})
  useEffect(() => {
    pagarRef.current = async (token: string) => {
      setProcesando(true)
      setErrorPago(null)
      try {
        const res = await fetch('/api/culqi/cobrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...aSolicitud(form),
            token,
            items: items.map((i) => ({ varianteId: i.varianteId, cantidad: i.cantidad })),
            totalEsperado: totales.total,
          }),
        })
        const data: { numero?: number; error?: string; carrito?: EstadoVariante[] } = await res.json()
        if (!res.ok || !data.numero) {
          if (data.carrito) sincronizar(data.carrito)
          setErrorPago(data.error ?? 'No se pudo procesar el pago.')
          setProcesando(false)
          return
        }
        vaciar()
        router.push(`/checkout/confirmacion?numero=${data.numero}`)
      } catch {
        setErrorPago('Error de conexión. Revisa tu internet e intenta de nuevo.')
        setProcesando(false)
      }
    }
  })

  useEffect(() => {
    window.culqi = () => {
      const culqi = window.Culqi
      if (culqi?.token) {
        const token = culqi.token.id
        culqi.close()
        void pagarRef.current(token)
      } else if (culqi?.error) {
        setErrorPago(culqi.error.user_message)
      }
    }
    return () => {
      window.culqi = undefined
    }
  }, [])

  function campo(nombre: Campo) {
    return {
      id: `checkout-${nombre}`,
      name: nombre,
      value: form[nombre],
      error:
        errores[
          nombre === 'nombre' || nombre === 'email' || nombre === 'telefono'
            ? `cliente.${nombre}`
            : `envio.${nombre}`
        ],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [nombre]: e.target.value })),
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorPago(null)

    const validado = formularioCheckoutSchema.safeParse(aSolicitud(form))
    if (!validado.success) {
      const nuevos = erroresPorCampo(validado.error)
      setErrores(nuevos)
      // Lleva el foco al primer campo con error.
      const primero = Object.keys(nuevos)[0]?.split('.').at(-1)
      document.getElementById(`checkout-${primero}`)?.focus()
      return
    }
    setErrores({})

    const culqi = window.Culqi
    if (!culqi) return
    culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY!
    culqi.settings({
      title: 'ATELIER',
      currency: 'PEN',
      description: 'Compra en ATELIER',
      amount: aCentimos(totales.total),
    })
    culqi.open()
  }

  if (!hidratado) return <div className="flex-1 bg-white" aria-busy="true" />

  if (items.length === 0 && !procesando) {
    return (
      <div className="flex flex-1 bg-white">
        <EmptyState titulo="Tu carrito está vacío" descripcion="Agrega productos antes de pagar.">
          <Link href="/tienda" className={boton()}>
            Volver a la tienda
          </Link>
        </EmptyState>
      </div>
    )
  }

  return (
    <>
      {/* onReady (no onLoad): también se dispara si el script ya estaba cargado de una visita anterior. */}
      <Script
        src="https://checkout.culqi.com/js/v4"
        strategy="afterInteractive"
        onReady={() => setCulqiListo(true)}
      />

      {procesando && (
        <div
          role="status"
          className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-6 bg-white/90 backdrop-blur-sm"
        >
          <div className="size-10 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900 motion-reduce:animate-none" />
          <div className="text-center">
            <p className="mb-1 text-sm font-medium text-stone-900">Confirmando tu pago</p>
            <p className="text-xs text-stone-500">No cierres esta ventana</p>
          </div>
        </div>
      )}

      <div className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
          <h1 className="mb-10 font-serif text-3xl text-stone-900">Checkout</h1>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16"
          >
            <div className="space-y-10 lg:col-span-2">
              <fieldset>
                <legend className="mb-5 text-xs tracking-widest text-stone-500 uppercase">
                  Información de contacto
                </legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Nombre completo"
                    className="sm:col-span-2"
                    autoComplete="name"
                    placeholder="Ej: María García"
                    {...campo('nombre')}
                  />
                  <Field
                    label="Correo electrónico"
                    type="email"
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    {...campo('email')}
                  />
                  <Field
                    label="Teléfono"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="987 654 321"
                    {...campo('telefono')}
                  />
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-5 text-xs tracking-widest text-stone-500 uppercase">
                  Dirección de envío
                </legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    id="checkout-destino"
                    label="Distrito / Ciudad"
                    error={errores['envio.destino']}
                    className={esProvincia ? '' : 'sm:col-span-2'}
                  >
                    <div className="relative">
                      <select
                        id="checkout-destino"
                        name="destino"
                        value={form.destino}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, destino: e.target.value, ciudad: '', departamento: '' }))
                        }
                        aria-invalid={errores['envio.destino'] ? true : undefined}
                        aria-describedby={errores['envio.destino'] ? 'checkout-destino-error' : undefined}
                        className={`${inputTienda} cursor-pointer appearance-none pr-10`}
                      >
                        <option value="">Selecciona tu distrito</option>
                        <optgroup label="Lima Metropolitana">
                          {DISTRITOS_LIMA.map((d) => (
                            <option key={d.nombre} value={d.nombre}>
                              {d.nombre} — {formatearPrecio(d.precio)}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Fuera de Lima">
                          <option value={DESTINO_PROVINCIA}>
                            Otra ciudad / Provincia — {formatearPrecio(COSTO_ENVIO_PROVINCIA)}
                          </option>
                        </optgroup>
                      </select>
                      <Icon
                        name="abajo"
                        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-stone-500"
                      />
                    </div>
                  </Field>

                  {esProvincia && (
                    <>
                      <Field
                        label="Ciudad"
                        autoComplete="address-level2"
                        placeholder="Arequipa"
                        {...campo('ciudad')}
                      />
                      <Field
                        label="Departamento"
                        autoComplete="address-level1"
                        placeholder="Arequipa"
                        {...campo('departamento')}
                      />
                    </>
                  )}

                  <Field
                    label="Dirección"
                    className="sm:col-span-2"
                    autoComplete="street-address"
                    placeholder="Av. Larco 345, Dpto 4B"
                    {...campo('direccion')}
                  />
                  <Field
                    label="Referencia"
                    opcional
                    className="sm:col-span-2"
                    placeholder="Frente al parque, edificio beige"
                    {...campo('referencia')}
                  />
                </div>
              </fieldset>
            </div>

            <aside aria-labelledby="titulo-resumen" className="lg:col-span-1">
              <div className="bg-crema sticky top-28 p-6">
                <h2 id="titulo-resumen" className="mb-5 text-xs tracking-widest text-stone-600 uppercase">
                  Resumen
                </h2>

                <ul className="mb-6 space-y-3 border-b border-stone-200 pb-4 text-sm">
                  {items.map((item) => (
                    <li key={item.varianteId} className="flex justify-between">
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="truncate text-stone-700">{item.nombre}</p>
                        <p className="text-xs text-stone-600">
                          {[item.talla, item.color].filter(Boolean).join(' · ')} × {item.cantidad}
                        </p>
                      </div>
                      <span className="shrink-0 text-stone-900">
                        {formatearPrecio(item.precio * item.cantidad)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mb-6">
                  <ResumenTotales totales={totales} envio={envio} textoSinEnvio="Selecciona tu distrito" />
                </div>

                {errorPago && (
                  <p role="alert" className="mb-4 text-center text-xs text-red-600">
                    {errorPago}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!culqiListo || procesando}
                  className={boton({ ancho: 'completo', className: 'py-4' })}
                >
                  {culqiListo ? 'Pagar con tarjeta' : 'Cargando pasarela…'}
                </button>

                <Link
                  href="/carrito"
                  className="mt-4 block text-center text-xs text-stone-600 underline underline-offset-4 transition-colors hover:text-stone-800"
                >
                  Volver al carrito
                </Link>
              </div>
            </aside>
          </form>
        </div>
      </div>
    </>
  )
}
