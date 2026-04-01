import { DesktopNavigation, MobileNavigation } from "./HeaderNavigations"
import spectreLogo from "../../../assets/spectre.svg"
import { NavLink, useLocation } from "react-router-dom"
import { useIsBurgerOpen, handleChangeIsBurgerClick } from "../store/HeaderStore"
import scrollToTop from "../../../core/helpers/scrollToTop"
import { routes } from "../../../app/config/routes"
import { useEffect, useRef } from "react"
import { useIsMobile } from "../../../core/stores/windowStore"

export const HeaderNavbar = () => {
  const { pathname } = useLocation()
  const isBurgerOpen = useIsBurgerOpen()
  const isMobile = useIsMobile()
  const navbarRef = useRef<HTMLDivElement | null>(null)
  const handleLogoDeskClick = (): void => {
    if (!isMobile && pathname === routes.home) {
      scrollToTop()
    }
  }

  useEffect(() => {
    if (!isBurgerOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target as Node)) {
        handleChangeIsBurgerClick(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isBurgerOpen])

  const handleBurgerClick = (): void => {
    handleChangeIsBurgerClick(!isBurgerOpen)
  }
  return (
    <div
      onClick={isMobile ? handleBurgerClick : undefined}
      ref={navbarRef}
      className='flex max-md:flex-col max-md:justify-center items-center'
    >
      {!isMobile ? (
        <NavLink to='/'>
          <img
            src={spectreLogo}
            alt='spectre'
            onClick={handleLogoDeskClick}
            className={`mx-5 w-[85%] h-[85%] shrink-0`}
          />
        </NavLink>
      ) : (
        <img
          src={spectreLogo}
          alt='spectre'
          className={`mx-5 duration-150 transition-all linear shrink-0 ${
            isBurgerOpen ? "pb-5" : null
          }`}
        />
      )}
      <nav>
        <DesktopNavigation />
        <MobileNavigation />
      </nav>
    </div>
  )
}
