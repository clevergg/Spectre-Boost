/**
 * Header — обновлённый хедер.
 *
 * БЫЛО: useIsAuthorized() из HeaderStore (boolean, ни к чему не привязан)
 * СТАЛО: useIsAuthenticated() из authStore (реальная проверка JWT)
 *
 * Что изменилось:
 * - Кнопка "Войти" показывается/скрывается по реальному состоянию авторизации
 * - Когда юзер авторизован — вместо "Войти" можно показать аватар/меню
 * - Импорт useIsAuthorized заменён на useIsAuthenticated
 *
 * Что НЕ изменилось:
 * - isModalOpen, isBurgerOpen остаются в HeaderStore (это UI-состояние)
 * - Вся логика бургера и скрытия хедера
 */

import { useEffect } from "react"
import { useWindowSize } from "../../core/hooks/useWindowsSize"
import { AuthorizationModalHeader } from "./components/AuthorizationModalHeader"
import { HeaderNavbar } from "./components/HeaderNavbar"
import { LogginButton } from "./components/LoginButton"
import { HeaderUserMenu } from "./components/HeaderUserMenu"
import { useHideHeader } from "./hooks/useHideHeader"
import { handleChangeIsBurgerClick } from "./store/HeaderStore"
import { useIsAuthenticated } from "../../core/stores/authStore"
import { useIsMobile } from "../../core/hooks/useIsMobile"

export const Header = () => {
  const isHiding = useHideHeader()
  const { width } = useWindowSize()
  const isAuthenticated = useIsAuthenticated()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isHiding || !isMobile) {
      handleChangeIsBurgerClick(false)
    }
  }, [isHiding, width, isMobile])

  return (
    <header
      className={`fixed top-7 w-full max-w-[1720px] px-8 max-[769px]:flex max-[769px]:justify-center z-10 min-w-[360px]`}
    >
      <div
        className={`w-fit md:w-full flex justify-center md:justify-between duration-300 transition-transform ease-in-out bg-gray-dark p-5 rounded-[33px] ${
          isHiding ? "-translate-y-[140%]" : "translate-y-0"
        }`}
      >
        <HeaderNavbar />

        {/* Авторизован — показываем меню юзера, нет — кнопку "Войти" */}
        {isAuthenticated ? <HeaderUserMenu /> : <LogginButton />}

        <AuthorizationModalHeader />
      </div>
    </header>
  )
}
