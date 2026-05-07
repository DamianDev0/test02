import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

// Next requires the matcher value to be a literal string for build-time AST analysis.
// String.raw is a runtime template (not statically analyzable), so we use plain escapes here.
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'], // NOSONAR S7780
}
