import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useIsAuthenticated } from "../../core/stores/authStore"
import { AuthorizationModalHeader } from "./components/AuthorizationModalHeader"
import { HeaderNavbar } from "./components/HeaderNavbar"
import { HeaderUserMenu } from "./components/HeaderUserMenu"
import { LoginButton } from "./components/LoginButton"
import { useHideHeader } from "./hooks/useHideHeader"
import { handleChangeIsBurgerClick } from "./store/HeaderStore"
import { useIsMobile, useWindowWidth } from "../../core/stores/windowStore"

export const Header = () => {
  const isHiding = useHideHeader()
  const width = useWindowWidth()
  const isAuthenticated = useIsAuthenticated()
  const isMobile = useIsMobile()
  const { pathname } = useLocation()

  useEffect(() => {
    if (isHiding || !isMobile) {
      handleChangeIsBurgerClick(false)
    }
  }, [isHiding, width, isMobile])

  useEffect(() => {
    handleChangeIsBurgerClick(false)
  }, [pathname])

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

        {isAuthenticated ? <HeaderUserMenu /> : <LoginButton />}

        <AuthorizationModalHeader />
      </div>
    </header>
  )
}
