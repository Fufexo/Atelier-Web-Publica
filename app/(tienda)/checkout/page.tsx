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

// ── Distritos de Lima con precio de envío ────────────────────────────────────
const DISTRITOS_LIMA = [
  { nombre: 'Ancón',                    precio: 25 },
  { nombre: 'Ate',                       precio: 15 },
  { nombre: 'Barranco',                  precio: 10 },
  { nombre: 'Bellavista',               precio: 20 },
  { nombre: 'Breña',                     precio: 10 },
  { nombre: 'Carabayllo',               precio: 20 },
  { nombre: 'Carmen de la Legua',       precio: 20 },
  { nombre: 'Cercado de Lima',          precio: 10 },
  { nombre: 'Chaclacayo',               precio: 25 },
  { nombre: 'Chorrillos',               precio: 15 },
  { nombre: 'Cieneguilla',              precio: 25 },
  { nombre: 'Comas',                    precio: 20 },
  { nombre: 'El Agustino',              precio: 15 },
  { nombre: 'Independencia',            precio: 20 },
  { nombre: 'Jesús María',              precio: 10 },
  { nombre: 'La Molina',                precio: 15 },
  { nombre: 'La Perla',                 precio: 20 },
  { nombre: 'La Punta',                 precio: 20 },
  { nombre: 'La Victoria',              precio: 15 },
  { nombre: 'Lince',                    precio: 10 },
  { nombre: 'Los Olivos',               precio: 20 },
  { nombre: 'Lurigancho',               precio: 25 },
  { nombre: 'Lurín',                    precio: 20 },
  { nombre: 'Magdalena del Mar',        precio: 10 },
  { nombre: 'Mi Perú',                  precio: 25 },
  { nombre: 'Miraflores',               precio: 10 },
  { nombre: 'Pachacámac',              precio: 25 },
  { nombre: 'Pueblo Libre',             precio: 10 },
  { nombre: 'Puente Piedra',            precio: 20 },
  { nombre: 'Rímac',                    precio: 15 },
  { nombre: 'San Borja',                precio: 10 },
  { nombre: 'San Isidro',               precio: 10 },
  { nombre: 'San Juan de Lurigancho',   precio: 20 },
  { nombre: 'San Juan de Miraflores',   precio: 20 },
  { nombre: 'San Luis',                 precio: 15 },
  { nombre: 'San Martín de Porres',     precio: 20 },
  { nombre: 'San Miguel',               precio: 10 },
  { nombre: 'Santa Anita',              precio: 15 },
  { nombre: 'Santa Rosa',               precio: 25 },
  { nombre: 'Santiago de Surco',        precio: 15 },
  { nombre: 'Surquillo',                precio: 10 },
  { nombre: 'Ventanilla',               precio: 25 },
  { nombre: 'Villa El Salvador',        precio: 20 },
  { nombre: 'Villa María del Triunfo',  precio: 20 },
]

// ── Tipos Culqi ───────────────────────────────────────────────────────────────
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
  const [envio, setEnvio] = useState<number | null>(null)

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    direccion: '', referencia: '',
    distrito: '',       // nombre del distrito seleccionado o 'provincia'
    ciudad: '',         // solo si distrito === 'provincia'
    departamento: '',   // solo si distrito === 'provincia'
  })

  const formRef = useRef(form)
  useEffect(() => { formRef.current = form }, [form])

  const itemsRef = useRef(items)
  useEffect(() => { itemsRef.current = items }, [items])

  const pagoEnProcesoRef = useRef(false)
  const envioRef = useRef(envio)
  useEffect(() => { envioRef.current = envio }, [envio])

  // Al seleccionar distrito actualizar envío y datos de ciudad
  function seleccionarDistrito(value: string) {
    if (value === 'provincia') {
      setEnvio(25)
      setForm(prev => ({ ...prev, distrito: 'provincia', ciudad: '', departamento: '' }))
    } else if (value === '') {
      setEnvio(null)
      setForm(prev => ({ ...prev, distrito: '', ciudad: '', departamento: '' }))
    } else {
      const d = DISTRITOS_LIMA.find(d => d.nombre === value)
      setEnvio(d?.precio ?? null)
      setForm(prev => ({ ...prev, distrito: value, ciudad: '', departamento: 'Lima' }))
    }
  }

  // Detectar cierre manual del modal Culqi
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const frame = document.querySelector(
        'iframe[name*="culqi"], iframe[src*="culqi"], #culqi-container, .culqi-container'
      )
      if (!frame && !pagoEnProcesoRef.current) setCargando(false)
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  // Fallback: habilitar botón si window.Culqi existe aunque onLoad no disparó
  useEffect(() => {
    if (scriptListo) return
    const iv = setInterval(() => {
      if (window.Culqi) { setScriptListo(true); clearInterval(iv) }
    }, 300)
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

    const distritoFinal = f.distrito === 'provincia' ? f.ciudad : f.distrito
    const departamentoFinal = f.distrito === 'provincia' ? f.departamento : 'Lima'
    const currentEnvio = envioRef.current ?? 0
    const totalFinal = currentTotal + currentEnvio

    try {
      const res = await fetch('/api/culqi/cobrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          nombre: f.nombre, email: f.email, telefono: f.telefono,
          departamento: departamentoFinal,
          provincia: departamentoFinal,
          distrito: distritoFinal,
          direccion: f.direccion,
          referencia: f.referencia,
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
    window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY!
    window.Culqi.settings({
      title: 'ATELIER',
      currency: 'PEN',
      description: 'Compra en ATELIER',
      amount: Math.round((total + (envio ?? 0)) * 100),
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
  const esProvinca = form.distrito === 'provincia'

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

                      {/* Distrito — dropdown */}
                      <div className={esProvinca ? '' : 'sm:col-span-2'}>
                        <label className={labelClass}>Distrito / Ciudad</label>
                        <div className="relative">
                          <select
                            required
                            value={form.distrito}
                            onChange={(e) => seleccionarDistrito(e.target.value)}
                            className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                            style={{ fontFamily: 'var(--font-manrope)' }}
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
                              <option value="provincia">Otra ciudad / Provincia — {formatearPrecio(25)}</option>
                            </optgroup>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-lg">
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* Si es provincia: ciudad + departamento */}
                      {esProvinca && (
                        <>
                          <div>
                            <label className={labelClass}>Ciudad</label>
                            <input required value={form.ciudad} onChange={campo('ciudad')} className={inputClass} placeholder="Arequipa" />
                          </div>
                          <div>
                            <label className={labelClass}>Departamento</label>
                            <input required value={form.departamento} onChange={campo('departamento')} className={inputClass} placeholder="Arequipa" />
                          </div>
                        </>
                      )}

                      {/* Dirección */}
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Dirección</label>
                        <input required value={form.direccion} onChange={campo('direccion')} className={inputClass} placeholder="Av. Larco 345, Dpto 4B" />
                      </div>

                      {/* Referencia */}
                      <div className="sm:col-span-2">
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
                          <span className="text-stone-400 text-xs">Selecciona tu distrito</span>
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
