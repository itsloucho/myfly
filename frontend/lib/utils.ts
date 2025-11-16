import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '')
const stripLeadingSlash = (value: string) => value.replace(/^\/+/, '')

const getDefaultStorageBase = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  const withoutApi = apiUrl.replace(/\/api\/?$/, '')
  return `${stripTrailingSlash(withoutApi)}/storage`
}

export const getStorageUrl = (path?: string | null) => {
  if (!path) return null
  const base = stripTrailingSlash(process.env.NEXT_PUBLIC_STORAGE_URL || getDefaultStorageBase())
  return `${base}/${stripLeadingSlash(path)}`
}

type LocationLike = {
  protocol: string
  hostname: string
  port: string
}

const getFallbackLocation = () => {
  const fallback = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  try {
    const url = new URL(fallback)
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
    }
  } catch {
    return {
      protocol: 'http:',
      hostname: 'localhost',
      port: '3000',
    }
  }
}

export const buildTenantResourceUrl = (
  path: string,
  tenantSlug?: string | null,
  loc?: LocationLike | Location | null
) => {
  if (!path || !tenantSlug) return null
  const location =
    loc ||
    (typeof window !== 'undefined' ? window.location : null) ||
    getFallbackLocation()

  if (!location) return null

  const hostname = location.hostname
  const port = location.port ? `:${location.port}` : ''
  const protocol = location.protocol || 'https:'

  const sanitizedPath = path.startsWith('/') ? path : `/${path}`

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${tenantSlug}.localhost${port}${sanitizedPath}`
  }

  const parts = hostname.split('.')
  if (parts.length > 1) {
    return `${protocol}//${tenantSlug}.${parts.slice(1).join('.')}${port}${sanitizedPath}`
  }

  return `${protocol}//${tenantSlug}.${hostname}${port}${sanitizedPath}`
}

export const buildTenantTripUrl = (
  tripSlug: string,
  tenantSlug?: string | null,
  loc?: LocationLike | Location | null
) => {
  if (!tripSlug) return null
  return buildTenantResourceUrl(`/trips/${tripSlug}`, tenantSlug, loc)
}

