import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { SESSION_COOKIES } from './shared/lib/session'

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATHS = ['/dashboard', '/cargar', '/pagar']
const PUBLIC_PATHS = ['/onboarding']

function stripLocale(pathname: string): { locale: string; path: string } {
  for (const locale of routing.locales) {
    const prefix = `/${locale}`
    if (pathname === prefix) return { locale, path: '/' }
    if (pathname.startsWith(`${prefix}/`)) return { locale, path: pathname.slice(prefix.length) }
  }
  return { locale: routing.defaultLocale, path: pathname }
}

function withLocale(locale: string, path: string): string {
  if (locale === routing.defaultLocale && routing.localePrefix === 'as-needed') return path
  return `/${locale}${path}`
}

export default function proxy(request: NextRequest) {
  const { locale, path } = stripLocale(request.nextUrl.pathname)
  const isProtected = PROTECTED_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIES.cuentaId)?.value)

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL(withLocale(locale, '/onboarding'), request.url))
  }

  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL(withLocale(locale, '/dashboard'), request.url))
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'], // NOSONAR S7780
}
