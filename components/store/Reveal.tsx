interface Props {
  children: React.ReactNode
  className?: string
  /** `scroll`: aparece al entrar en pantalla. `carga`: al cargar la página (hero). */
  modo?: 'scroll' | 'carga'
  direction?: 'up' | 'left' | 'right'
  delay?: number
}

const DESPLAZAMIENTO = {
  up: { '--reveal-x': '0', '--reveal-y': '28px' },
  left: { '--reveal-x': '-28px', '--reveal-y': '0' },
  right: { '--reveal-x': '28px', '--reveal-y': '0' },
}

/**
 * Animación de aparición en CSS (ver `.reveal` en globals.css). Es un Server
 * Component: el contenido llega visible en el HTML y no depende de hidratar.
 */
export default function Reveal({
  children,
  className = '',
  modo = 'scroll',
  direction = 'up',
  delay = 0,
}: Props) {
  const style: Record<string, string> = { ...DESPLAZAMIENTO[direction], '--reveal-delay': `${delay}ms` }
  return (
    <div className={`${modo === 'carga' ? 'reveal-carga' : 'reveal'} ${className}`} style={style}>
      {children}
    </div>
  )
}
