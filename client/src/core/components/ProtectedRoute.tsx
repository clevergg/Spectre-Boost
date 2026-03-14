/**
 * ProtectedRoute — компонент-обёртка для защищённых страниц.
 *
 * Оборачивает роуты которые требуют авторизации.
 * Если юзер не авторизован — редирект на главную.
 * Если ещё загружается (initAuth не завершился) — показываем лоадер.
 *
 * Использование в роутере:
 *   <Route element={<ProtectedRoute><UserAccountLayout /></ProtectedRoute>}>
 *     <Route path="/account" element={<AccountPage />} />
 *   </Route>
 */

import { Navigate } from "react-router-dom"
import { useIsAuthenticated, useIsAuthLoading } from "../stores/authStore"
import SpectreFallback from "../../shared/ui/SpectreFallback"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useIsAuthLoading()

  // Пока initAuth не завершился — показываем лоадер
  // Без этого при перезагрузке страницы /account
  // юзера сразу кинет на главную (isAuthenticated = false),
  // а потом initAuth восстановит сессию — но уже поздно, redirect случился.
  if (isLoading) {
    return <SpectreFallback />
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
