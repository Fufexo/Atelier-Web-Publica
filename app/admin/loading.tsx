/**
 * Esqueleto del panel mientras llega la página. Sin este archivo, Next espera al
 * servidor antes de cambiar de sección y la página anterior parece congelada; con
 * él, el cambio es inmediato y además se puede precargar al pasar por el enlace.
 */
export default function CargandoAdmin() {
  return (
    <div data-cargando role="status" className="p-8 motion-safe:animate-pulse">
      <span className="sr-only">Cargando…</span>

      <div aria-hidden className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-gray-200" />
          <div className="h-4 w-64 rounded bg-gray-100" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-gray-200" />
      </div>

      <div aria-hidden className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
            <div className="h-3 w-20 rounded bg-gray-100" />
            <div className="h-6 w-24 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div aria-hidden className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="h-4 w-32 rounded bg-gray-200" />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-gray-100 px-6 py-4 last:border-0">
            <div className="size-10 shrink-0 rounded-lg bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-1/5 rounded bg-gray-100" />
            </div>
            <div className="h-5 w-16 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
