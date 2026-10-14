import type { NextConfig } from 'next'

// Las imágenes de productos viven en el Storage del proyecto de Supabase configurado.
const supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://dykrrpgdfqxwlencyzin.supabase.co')
const supabaseLocal = ['127.0.0.1', 'localhost'].includes(supabase.hostname)

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: supabase.protocol === 'http:' ? 'http' : 'https',
        hostname: supabase.hostname,
        port: supabase.port,
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // Solo con `supabase start`: el optimizador bloquea IPs locales por defecto.
    dangerouslyAllowLocalIP: supabaseLocal,
  },
}

export default nextConfig
