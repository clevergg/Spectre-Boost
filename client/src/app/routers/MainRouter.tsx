/**
 * MainRouter — обновлённый роутер с защитой /account.
 *
 * Отличие от текущего: /account обёрнут в ProtectedRoute.
 * Неавторизованный юзер не увидит личный кабинет.
 */

import { lazy, Suspense } from "react"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { DefaultLayout } from "../../core/layouts/DefaultLayout"
import { UserAccountLayout } from "../../core/layouts/UserAccountLayout"
import { ProtectedRoute } from "../../core/components/ProtectedRoute"
import { ScrollHandler } from "../../shared/ui/ScrollHandler"
import { usePromoFromUrl } from "../../core/hooks/usePromoFromUrl"
import SpectreFallback from "../../shared/ui/SpectreFallback"
import { routes } from "../config/routes"

const HomePage = lazy(() => import("../../pages/HomeRoute"))
const ServicesPage = lazy(() => import("../../pages/ServicesRoute"))
const AboutUsPage = lazy(() => import("../../pages/AboutUsRoute"))
const AccountPage = lazy(() => import("../../pages/AccountRoute"))
const TopfiftyPage = lazy(() => import("../../pages/ServicesTopFifty"))

/**
 * Компонент внутри Router — вызывает хуки зависящие от роутера
 */
const AppInit = () => {
  usePromoFromUrl() // Ловит ?promo=CODE из URL на любой странице
  return null
}

export const MainRouter = () => {
  return (
    <Router>
      <AppInit />
      <Suspense fallback={<SpectreFallback />}>
        <ScrollHandler />
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route index element={<HomePage />} />
            <Route path={routes.services} element={<ServicesPage />} />
            <Route path={routes.aboutus} element={<AboutUsPage />} />
            <Route path={routes.topfifty} element={<TopfiftyPage />} />
          </Route>

          {/* Защищённые роуты — требуют авторизации */}
          <Route
            element={
              <ProtectedRoute>
                <UserAccountLayout />
              </ProtectedRoute>
            }
          >
            <Route path={routes.account} element={<AccountPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}
