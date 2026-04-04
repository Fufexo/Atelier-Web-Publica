'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { Link } from 'next-view-transitions'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import { useCarrito } from '@/lib/carrito'
import { formatearPrecio } from '@/lib/utils'

const IGV = 0.18

// ── Tabla de envío por distrito de Lima ──────────────────────────────────────
const ENVIO_LIMA: Record<string, number> = {
  // S/10 — Centro / Moderno
  'miraflores': 10, 'san isidro': 10, 'barranco': 10, 'surquillo': 10,
  'san borja': 10, 'jesús maría': 10, 'jesus maria': 10, 'lince': 10,
  'magdalena del mar': 10, 'pueblo libre': 10, 'san miguel': 10,
  'breña': 10, 'brena': 10, 'lima': 10, 'cercado de lima': 10,
  // S/15 — Este / Sur próximo
  'la molina': 15, 'santiago de surco': 15, 'surco': 15, 'ate': 15,
  'san luis': 15, 'santa anita': 15, 'el agustino': 15, 'chorrillos': 15,
  'la victoria': 15, 'rímac': 15, 'rimac': 15,
  // S/20 — Norte / Sur lejano / Callao
  'los olivos': 20, 'san martín de porres': 20, 'san martin de porres': 20,
  'independencia': 20, 'comas': 20, 'carabayllo': 20, 'puente piedra': 20,
  'san juan de lurigancho': 20, 'villa el salvador': 20,
  'villa maría del triunfo': 20, 'villa maria del triunfo': 20,
  'san juan de miraflores': 20, 'lurín': 20, 'lurin': 20,
  'callao': 20, 'bellavista': 20, 'la perla': 20, 'la punta': 20,
  'carmen de la legua reynoso': 20,
  // S/25 — Periférico
  'ventanilla': 25, 'mi perú': 25, 'mi peru': 25,
  'pachacámac': 25, 'pachacamac': 25, 'cieneguilla': 25,
  'chaclacayo': 25, 'lurigancho': 25, 'chosica': 25,
  'ancón': 25, 'ancon': 25, 'santa rosa': 25,
}

function calcularEnvio(distrito: string, departamento: string): number | null {
  const dep = departamento.toLowerCase().trim()
  const dist = distrito.toLowerCase().trim()
  if (!dist && !dep) return null
  // Departamento fuera de Lima/Callao → provincias
  if (dep && dep !== 'lima' && dep !== 'callao') return 25
  // Distrito reconocido en la tabla → precio exacto
  if (dist && ENVIO_LIMA[dist] !== undefined) return ENVIO_LIMA[dist]
  // Departamento confirmado como Lima pero distrito no mapeado → S/20 (zona no listada)
  if (dep === 'lima' || dep === 'callao') return 20
  // No hay suficiente información para calcular
  return null
}

// ── Tipos Google Places ───────────────────────────────────────────────────────
type GPlace = {
  address_components?: Array<{ long_name: string; short_name: string; types: string[] }>
  formatted_address?: string
}
type GAutocomplete = {
  addListener: (event: string, handler: () => void) => void
  getPlace: () => GPlace
}

declare global {
  interface Window {
    Culqi: {
      publicKey: string
      settings: (opts: object) => void
      open: () => void
      close: () => void
      token?: { id: string; email: string }
      order?: object
      error?: { user_message: string }
    }
    culqi: () => void
    google?: {
      maps: { places: { Autocomplete: new (input: HTMLInputElement, opts?: object) => GAutocomplete } }
    }
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, vaciar, total } = useCarrito()

  const subtotal = total / (1 + IGV)
  const igv = total - subtotal

  const [cargando, setCargando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [errorPago, setErrorPago] = useState<string | null>(null)
  const [scriptListo, setScriptListo] = useState(false)
  const [googleListo, setGoogleListo] = useState(false)
  const [envio, setEnvio] = useState<number | null>(null)

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    departamento: '', provincia: '', distrito: '',
    direccion: '', referencia: '',
  })

  const formRef = useRef(form)
  useEffect(() => { formRef.current = form }, [form])

  const itemsRef = useRef(items)
  useEffect(() => { itemsRef.current = items }, [items])

  const pagoEnProcesoRef = useRef(false)
  const addressInputRef = useRef<HTMLInputElement>(null)

  // Recalcular envío al cambiar distrito o departamento
  useEffect(() => {
    setEnvio(calcularEnvio(form.distrito, form.departamento))
  }, [form.distrito, form.departamento])

  // Inicializar Google Places Autocomplete
  useEffect(() => {
    if (!googleListo || !addressInputRef.current || !window.google?.maps?.places) return

    const ac = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      componentRestrictions: { country: 'pe' },
      fields: ['address_components', 'formatted_address'],
      types: ['address'],
    })

    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place.address_components) return

      let distrito = '', provincia = '', departamento = '', calle = '', numero = ''
      for (const comp of place.address_components) {
        const t = comp.types
        if (t.includes('locality') || t.includes('sublocality_level_1')) distrito = comp.long_name
        if (t.includes('administrative_area_level_2')) provincia = comp.long_name
        if (t.includes('administrative_area_level_1')) departamento = comp.long_name
        if (t.includes('route')) calle = comp.long_name
        if (t.includes('street_number')) numero = comp.long_name
      }

      setForm(prev => ({
        ...prev,
        direccion: [calle, numero].filter(Boolean).join(' ') || prev.direccion,
        distrito,
        provincia,
        departamento,
      }))
    })
  }, [googleListo])

  // Detectar cierre manual del modal Culqi (no llama window.culqi al cerrar con X)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const frame = document.querySelector('iframe[name*="culqi"], iframe[src*="culqi"], #culqi-container, .culqi-container')
      if (!frame && !pagoEnProcesoRef.current) setCargando(false)
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  // Fallback: habilitar botón si window.Culqi ya existe aunque onLoad no disparó
  useEffect(() => {
    if (scriptListo) return
    const iv = setInterval(() => { if (window.Culqi) { setScriptListo(true); clearInterval(iv) } }, 300)
    return () => clearInterval(iv)
  }, [scriptListo])

  // Callback global de Culqi
  useEffect(() => {
    window.culqi = async function () {
      if (window.Culqi.token) {
        pagoEnProcesoRef.current = true
        const token = window.Culqi.token.id
        window.Culqi.close()
        setProcesando(true)
        await procesarPago(token)
        pagoEnProcesoRef.current = false
      } else if (window.Culqi.error) {
        setErrorPago(window.Culqi.error.user_message)
        setCargando(false)
      } else {
        setCargando(false)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function procesarPago(token: string) {
    setCargando(true)
    setErrorPago(null)

    const f = formRef.current
    const currentItems = itemsRef.current
    const currentTotal = currentItems.reduce((s, i) => s + i.precio * i.cantidad, 0)
    const currentSubtotal = currentTotal / (1 + IGV)
    const currentIgv = currentTotal - currentSubtotal
    const currentEnvio = calcularEnvio(f.distrito, f.departamento) ?? 0
    const totalFinal = currentTotal + currentEnvio

    try {
      const res = await fetch('/api/culqi/cobrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          nombre: f.nombre, email: f.email, telefono: f.telefono,
          departamento: f.departamento, provincia: f.provincia,
          distrito: f.distrito, direccion: f.direccion, referencia: f.referencia,
          items: currentItems.map((i) => ({
            varianteId: i.varianteId, productoId: i.productoId,
            nombre: i.nombre, precio: i.precio, cantidad: i.cantidad,
            talla: i.talla, color: i.color,
          })),
          subtotal: currentSubtotal,
          igv: currentIgv,
          envio: currentEnvio,
          total: totalFinal,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorPago(data.error ?? 'Error al procesar el pago')
        setCargando(false)
        setProcesando(false)
        return
      }

      vaciar()
      router.push(`/checkout/confirmacion?numero=${data.numero}`)
    } catch {
      setErrorPago('Error de conexión. Intenta de nuevo.')
      setCargando(false)
      setProcesando(false)
    }
  }

  function abrirCulqi() {
    if (!scriptListo || !window.Culqi) return
    const montoTotal = total + (envio ?? 0)
    window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY!
    window.Culqi.settings({
      title: 'ATELIER',
      currency: 'PEN',
      description: 'Compra en ATELIER',
      amount: Math.round(montoTotal * 100),
    })
    window.Culqi.open()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorPago(null)
    setCargando(true)
    abrirCulqi()
  }

  function campo(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const totalConEnvio = total + (envio ?? 0)

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-white flex flex-col items-center justify-center text-center px-8">
          <h1 className="text-2xl text-stone-900 mb-4" style={{ fontFamily: 'var(--font-noto-serif)' }}>
            Tu carrito está vacío
          </h1>
          <Link href="/tienda" className="text-sm text-stone-400 hover:text-stone-900 underline underline-offset-4 transition-colors" style={{ fontFamily: 'var(--font-manrope)' }}>
            Volver a la tienda
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <>
      {/* Overlay: bloquea interacción mientras se confirma el pago */}
      {procesando && (
        <div className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
          <div className="w-10 h-10 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-sm text-stone-900 font-medium mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
              Confirmando tu pago
            </p>
            <p className="text-xs text-stone-400" style={{ fontFamily: 'var(--font-manrope)' }}>
              No cierres esta ventana
            </p>
          </div>
        </div>
      )}

      <Script src="https://checkout.culqi.com/js/v4" strategy="afterInteractive" onLoad={() => setScriptListo(true)} />
      {process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
          strategy="afterInteractive"
          onLoad={() => setGoogleListo(true)}
        />
      )}

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-white">
          <div className="max-w-7xl mx-auto px-8 py-12">

            <h1 className="text-3xl text-stone-900 mb-10" style={{ fontFamily: 'var(--font-noto-serif)' }}>
              Checkout
            </h1>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                {/* ── Formulario ── */}
                <div className="lg:col-span-2 space-y-10">

                  {/* Contacto */}
                  <section>
                    <h2 className={sectionTitle}>Información de contacto</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Nombre completo</label>
                        <input required value={form.nombre} onChange={campo('nombre')} className={inputClass} placeholder="Ej: María García" />
                      </div>
                      <div>
                        <label className={labelClass}>Correo electrónico</label>
                        <input required type="email" value={form.email} onChange={campo('email')} className={inputClass} placeholder="correo@ejemplo.com" />
                      </div>
                      <div>
                        <label className={labelClass}>Teléfono</label>
                        <input required value={form.telefono} onChange={campo('telefono')} className={inputClass} placeholder="987 654 321" />
                      </div>
                    </div>
                  </section>

                  {/* Dirección */}
                  <section>
                    <h2 className={sectionTitle}>Dirección de envío</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>
                          Dirección
                          {googleListo && (
                            <span className="text-stone-300 normal-case tracking-normal ml-1.5">— escribe para buscar</span>
                          )}
                        </label>
                        <input
                          ref={addressInputRef}
                          required
                          value={form.direccion}
                          onChange={campo('direccion')}
                          className={inputClass}
                          placeholder="Av. Larco 345"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Distrito</label>
                        <input required value={form.distrito} onChange={campo('distrito')} className={inputClass} placeholder="Miraflores" />
                      </div>
                      <div>
                        <label className={labelClass}>Provincia</label>
                        <input required value={form.provincia} onChange={campo('provincia')} className={inputClass} placeholder="Lima" />
                      </div>
                      <div>
                        <label className={labelClass}>Departamento</label>
                        <input required value={form.departamento} onChange={campo('departamento')} className={inputClass} placeholder="Lima" />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Referencia <span className="text-stone-300">(opcional)</span>
                        </label>
                        <input value={form.referencia} onChange={campo('referencia')} className={inputClass} placeholder="Frente al parque, edificio beige" />
                      </div>
                    </div>
                  </section>
                </div>

                {/* ── Resumen ── */}
                <div className="lg:col-span-1">
                  <div className="bg-[#f5f2ed] p-6 sticky top-28">
                    <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-5" style={{ fontFamily: 'var(--font-manrope)' }}>
                      Resumen
                    </h2>

                    <div className="space-y-3 mb-6">
                      {items.map((item) => (
                        <div key={item.varianteId} className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-stone-700 truncate">{item.nombre}</p>
                            <p className="text-stone-400 text-xs">
                              {[item.talla, item.color].filter(Boolean).join(' · ')} × {item.cantidad}
                            </p>
                          </div>
                          <span className="text-stone-900 shrink-0">{formatearPrecio(item.precio * item.cantidad)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-stone-200 pt-4 space-y-2 mb-4">
                      <div className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                        <span className="text-stone-500">Subtotal (sin IGV)</span>
                        <span className="text-stone-900">{formatearPrecio(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                        <span className="text-stone-500">IGV (18%)</span>
                        <span className="text-stone-900">{formatearPrecio(igv)}</span>
                      </div>
                      <div className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                        <span className="text-stone-500">Envío</span>
                        {envio !== null ? (
                          <span className="text-stone-900">{formatearPrecio(envio)}</span>
                        ) : (
                          <span className="text-stone-400 text-xs">Ingresa tu distrito</span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-stone-200 pt-4 mb-6">
                      <div className="flex justify-between" style={{ fontFamily: 'var(--font-manrope)' }}>
                        <span className="font-medium text-stone-900">Total</span>
                        <span className="font-medium text-stone-900 text-lg">{formatearPrecio(totalConEnvio)}</span>
                      </div>
                    </div>

                    {errorPago && (
                      <p className="text-xs text-red-500 mb-4 text-center" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {errorPago}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={cargando || !scriptListo}
                      className={`w-full py-4 text-xs uppercase tracking-widest transition-colors ${
                        cargando || !scriptListo
                          ? 'bg-stone-300 text-white cursor-not-allowed'
                          : 'bg-stone-900 text-white hover:bg-stone-700'
                      }`}
                      style={{ fontFamily: 'var(--font-manrope)' }}
                    >
                      {cargando ? 'Procesando...' : 'Pagar con tarjeta'}
                    </button>

                    <Link
                      href="/carrito"
                      className="block text-center mt-4 text-xs text-stone-400 hover:text-stone-700 underline underline-offset-4 transition-colors"
                      style={{ fontFamily: 'var(--font-manrope)' }}
                    >
                      Volver al carrito
                    </Link>
                  </div>
                </div>

              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

const sectionTitle = 'text-xs uppercase tracking-widest text-stone-400 mb-5'
const labelClass = 'block text-xs uppercase tracking-widest text-stone-400 mb-1.5'
const inputClass = 'w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-500 transition-colors'
