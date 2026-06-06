import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ComparePage } from './pages/Compare'
import { HomePage } from './pages/Home'
import { IFBIndexPage } from './pages/Index'
import { VehiclePage } from './pages/Vehicle'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'vehicle/:slug', element: <VehiclePage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'index', element: <IFBIndexPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
