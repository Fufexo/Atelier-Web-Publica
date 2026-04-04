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
  const [errorPago, setErrorPago] = useState<string | null>(null)
  const [scriptListo, setScriptListo] = useState(false)

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    referencia: '',
    tipoComprobante: 'boleta' as 'boleta' | 'factura',
    dni: '',
    ruc: '',
    razonSocial: '',
  })

  const formRef = useRef(form)
  useEffect(() => { formRef.current = form }, [form])

  const itemsRef = useRef(items)
  useEffect(() => { itemsRef.current = items }, [items])

  // Registrar función global que Culqi llama al tokenizar o cancelar
  useEffect(() => {
    window.culqi = async function () {
      if (window.Culqi.token) {
        const token = window.Culqi.token.id
        window.Culqi.close()
        await procesarPago(token)
      } else if (window.Culqi.error) {
        setErrorPago(window.Culqi.error.user_message)
        setCargando(false)
      } else {
        // Usuario cerró el modal sin pagar
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

    try {
      const res = await fetch('/api/culqi/cobrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          nombre: f.nombre,
          email: f.email,
          telefono: f.telefono,
          departamento: f.departamento,
          provincia: f.provincia,
          distrito: f.distrito,
          direccion: f.direccion,
          referencia: f.referencia,
          tipoComprobante: f.tipoComprobante,
          dni: f.tipoComprobante === 'boleta' ? f.dni : undefined,
          ruc: f.tipoComprobante === 'factura' ? f.ruc : undefined,
          razonSocial: f.tipoComprobante === 'factura' ? f.razonSocial : undefined,
          items: currentItems.map((i) => ({
            varianteId: i.varianteId,
            productoId: i.productoId,
            nombre: i.nombre,
            precio: i.precio,
            cantidad: i.cantidad,
            talla: i.talla,
            color: i.color,
          })),
          subtotal: currentSubtotal,
          igv: currentIgv,
          total: currentTotal,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorPago(data.error ?? 'Error al procesar el pago')
        setCargando(false)
        return
      }

      vaciar()
      router.push(`/checkout/confirmacion?numero=${data.numero}`)
    } catch {
      setErrorPago('Error de conexión. Intenta de nuevo.')
      setCargando(false)
    }
  }

  function abrirCulqi() {
    if (!scriptListo || !window.Culqi) return

    window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY!
    window.Culqi.settings({
      title: 'ATELIER',
      currency: 'PEN',
      description: 'Compra en ATELIER',
      amount: Math.round(total * 100),
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
      <Script
        src="https://checkout.culqi.com/js/v4"
        strategy="lazyOnload"
        onLoad={() => setScriptListo(true)}
      />

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
                      <div>
                        <label className={labelClass}>Departamento</label>
                        <input required value={form.departamento} onChange={campo('departamento')} className={inputClass} placeholder="Lima" />
                      </div>
                      <div>
                        <label className={labelClass}>Provincia</label>
                        <input required value={form.provincia} onChange={campo('provincia')} className={inputClass} placeholder="Lima" />
                      </div>
                      <div>
                        <label className={labelClass}>Distrito</label>
                        <input required value={form.distrito} onChange={campo('distrito')} className={inputClass} placeholder="Miraflores" />
                      </div>
                      <div>
                        <label className={labelClass}>Dirección</label>
                        <input required value={form.direccion} onChange={campo('direccion')} className={inputClass} placeholder="Av. Larco 123, Dpto 4B" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Referencia <span className="text-stone-300">(opcional)</span></label>
                        <input value={form.referencia} onChange={campo('referencia')} className={inputClass} placeholder="Frente al parque, edificio beige" />
                      </div>
                    </div>
                  </section>

                  {/* Comprobante */}
                  <section>
                    <h2 className={sectionTitle}>Comprobante de pago</h2>
                    <div className="flex gap-3 mb-5">
                      {(['boleta', 'factura'] as const).map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, tipoComprobante: tipo }))}
                          className={`px-5 py-2.5 text-xs uppercase tracking-widest border transition-colors ${
                            form.tipoComprobante === tipo
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-200 text-stone-500 hover:border-stone-400'
                          }`}
                          style={{ fontFamily: 'var(--font-manrope)' }}
                        >
                          {tipo === 'boleta' ? 'Boleta' : 'Factura'}
                        </button>
                      ))}
                    </div>

                    {form.tipoComprobante === 'boleta' ? (
                      <div>
                        <label className={labelClass}>DNI <span className="text-stone-300">(opcional)</span></label>
                        <input
                          value={form.dni}
                          onChange={campo('dni')}
                          className={inputClass}
                          placeholder="12345678"
                          maxLength={8}
                          style={{ maxWidth: '200px' }}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>RUC</label>
                          <input required value={form.ruc} onChange={campo('ruc')} className={inputClass} placeholder="20123456789" maxLength={11} />
                        </div>
                        <div>
                          <label className={labelClass}>Razón social</label>
                          <input required value={form.razonSocial} onChange={campo('razonSocial')} className={inputClass} placeholder="Empresa S.A.C." />
                        </div>
                      </div>
                    )}
                  </section>
                </div>

                {/* ── Resumen ── */}
                <div className="lg:col-span-1">
                  <div className="bg-[#f5f2ed] p-6 sticky top-28">
                    <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-5" style={{ fontFamily: 'var(--font-manrope)' }}>
                      Resumen
                    </h2>

                    {/* Items */}
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
                        <span className="text-stone-400">Por coordinar</span>
                      </div>
                    </div>

                    <div className="border-t border-stone-200 pt-4 mb-6">
                      <div className="flex justify-between" style={{ fontFamily: 'var(--font-manrope)' }}>
                        <span className="font-medium text-stone-900">Total</span>
                        <span className="font-medium text-stone-900 text-lg">{formatearPrecio(total)}</span>
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
