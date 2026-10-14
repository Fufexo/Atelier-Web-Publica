'use client'

import Link from 'next/link'
import { useActionState, useRef } from 'react'
import { Alerta, botonAdmin, botonAdminSecundario, inputAdmin, labelAdmin } from '@/components/admin/ui'
import type { Categoria } from '@/lib/types'
import type { EstadoFormulario } from './actions'

interface Props {
  action: (prev: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>
  categoria?: Pick<Categoria, 'nombre' | 'descripcion' | 'orden'>
  textoBoton: string
  /** Muestra "Cancelar" hacia el listado (al editar). */
  conCancelar?: boolean
}

/** Formulario de categoría para crear y editar. Muestra los errores que devuelve la acción. */
export default function CategoriaForm({ action, categoria, textoBoton, conCancelar }: Props) {
  const form = useRef<HTMLFormElement>(null)
  const [estado, enviar, pendiente] = useActionState(async (prev: EstadoFormulario, fd: FormData) => {
    const res = await action(prev, fd)
    if (res.ok && !categoria) form.current?.reset()
    return res
  }, {})

  return (
    <form ref={form} action={enviar} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {estado.error && (
        <div className="md:col-span-2">
          <Alerta>{estado.error}</Alerta>
        </div>
      )}
      <label>
        <span className={labelAdmin}>
          Nombre <span className="text-red-500">*</span>
        </span>
        <input
          name="nombre"
          required
          defaultValue={categoria?.nombre}
          placeholder="Ej: Polos, Pantalones…"
          className={inputAdmin}
        />
      </label>
      <label>
        <span className={labelAdmin}>Descripción</span>
        <input
          name="descripcion"
          defaultValue={categoria?.descripcion ?? ''}
          placeholder="Opcional"
          className={inputAdmin}
        />
      </label>
      <label>
        <span className={labelAdmin}>Imagen de portada</span>
        <input
          type="file"
          name="imagen"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className={`${inputAdmin} file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs file:text-slate-700`}
        />
      </label>
      <label>
        <span className={labelAdmin}>Orden</span>
        <input
          type="number"
          name="orden"
          min={0}
          defaultValue={categoria?.orden ?? 0}
          className={inputAdmin}
        />
      </label>
      <div className="flex gap-3 md:col-span-2">
        <button type="submit" disabled={pendiente} className={botonAdmin}>
          {pendiente ? 'Guardando…' : textoBoton}
        </button>
        {conCancelar && (
          <Link href="/admin/categorias" className={botonAdminSecundario}>
            Cancelar
          </Link>
        )}
      </div>
    </form>
  )
}
