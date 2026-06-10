import { Link } from 'react-router-dom'
import { SEO } from '../../components/seo/SEO'

/**
 * Pagina 404 do catch-all do router. Em producao o middleware de prerender
 * (server/apiPlugin.ts) ja responde rotas desconhecidas com status 404; aqui
 * cobrimos a navegacao client-side e marcamos a pagina com noindex.
 */
export function NotFoundPage() {
  return (
    <div className="rounded border border-slate-200 bg-white p-8 text-center">
      <SEO
        title="Página não encontrada | FIPE Brasil"
        description="A página que você procura não existe ou foi movida."
        noindex
      />
      <h1 className="text-xl font-bold text-slate-950">Página não encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">
        A página que você procura não existe ou foi movida.
      </p>
      <Link to="/" className="mt-4 inline-block rounded bg-slate-900 px-4 py-2 text-sm font-bold text-white">
        Voltar para a home
      </Link>
    </div>
  )
}
