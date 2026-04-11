/**
 * MainRouter — обновлённый роутер с защитой /account.
 *
 * Отличие от текущего: /account обёрнут в ProtectedRoute.
 * Неавторизованный юзер не увидит личный кабинет.
 */

import { lazy, Suspense } from "react"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { DefaultLayout } from "../../core/layouts/DefaultLayout"
import { ProtectedRoute } from "../../core/components/ProtectedRoute"
import { ScrollHandler } from "../../shared/ui/ScrollHandler"
import { usePromoFromUrl } from "../../core/hooks/usePromoFromUrl"
import SpectreFallback from "../../shared/ui/SpectreFallback"
import { routes } from "../config/routes"
import { ErrorBoundary } from "../../components/ErrorBoundary"

const HomePage = lazy(() => import("../../pages/HomeRoute"))
const ServicesPage = lazy(() => import("../../pages/ServicesRoute"))
const AboutUsPage = lazy(() => import("../../pages/AboutUsRoute"))
const AccountPage = lazy(() => import("../../pages/AccountRoute"))
const SurvivorPage = lazy(() => import("../../pages/SurvivorRoute"))
const NotFound = lazy(() => import("../../pages/404"))

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
      <ErrorBoundary>
        <Suspense fallback={<SpectreFallback />}>
          <ScrollHandler />
          <Routes>
            <Route
              element={
                <DefaultLayout mainClassName='grow flex flex-col justify-center items-center' />
              }
            >
              <Route index element={<HomePage />} />
              <Route path={routes.services} element={<ServicesPage />} />
              <Route path={routes.aboutus} element={<AboutUsPage />} />
              <Route path={routes.survivor} element={<SurvivorPage />} />
            </Route>

            {/* Защищённые роуты — требуют авторизации */}
            <Route
              element={
                <ProtectedRoute>
                  <DefaultLayout mainClassName='flex-1 flex w-full max-w-[1720px] px-4 md:px-8' />
                </ProtectedRoute>
              }
            >
              <Route path={routes.account} element={<AccountPage />} />
            </Route>
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  )
}
