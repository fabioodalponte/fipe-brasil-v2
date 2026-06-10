import { createBrowserRouter, Navigate, RouterProvider, useParams } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { BestSellingPage } from './pages/BestSelling'
import { BrandPage } from './pages/Brand'
import { CategoryPage } from './pages/Category'
import { ComparePage } from './pages/Compare'
import { HomePage } from './pages/Home'
import { IFBIndexPage } from './pages/Index'
import { NotFoundPage } from './pages/NotFound'
import { RankingLandingPage } from './pages/RankingLanding'
import { SegmentBestSellingPage } from './pages/SegmentBestSelling'
import { VehiclePage } from './pages/Vehicle'

function LegacyVehicleRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/carro/${slug}`} replace />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'carro/:slug', element: <VehiclePage /> },
      // Rota legada: /vehicle/:slug -> /carro/:slug (o redirect 301 real e feito
      // no servidor; isto cobre navegacao client-side e dev).
      { path: 'vehicle/:slug', element: <LegacyVehicleRedirect /> },
      { path: 'marca/:slug', element: <BrandPage /> },
      { path: 'categoria/:slug', element: <CategoryPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'index', element: <IFBIndexPage /> },
      { path: 'mais-vendidos', element: <BestSellingPage /> },
      { path: 'suvs-mais-vendidos', element: <SegmentBestSellingPage /> },
      { path: 'picapes-mais-vendidas', element: <SegmentBestSellingPage /> },
      { path: 'mais-valorizados', element: <RankingLandingPage /> },
      { path: 'mais-desvalorizados', element: <RankingLandingPage /> },
      { path: 'mais-caros', element: <RankingLandingPage /> },
      { path: 'mais-baratos', element: <RankingLandingPage /> },
      // Rotas novas tambem precisam entrar em KNOWN_PAGES/KNOWN_DYNAMIC no
      // server/apiPlugin.ts, senao o middleware responde 404 antes do SPA.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
