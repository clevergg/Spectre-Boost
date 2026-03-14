import { DesktopNavigation, MobileNavigation } from "./HeaderNavigations"
import spectreLogo from "../../../assets/spectre.svg"
import { NavLink, useLocation } from "react-router-dom"
import { useIsBurgerOpen, handleChangeIsBurgerClick } from "../store/HeaderStore"
import scrollToTop from "../../../core/helpers/scrollToTop"
import { routes } from "../../../app/config/routes"
import { useIsMobile } from "../../../core/hooks/useIsMobile"

export const HeaderNavbar = () => {
  const { pathname } = useLocation()
  const isBurgerOpen = useIsBurgerOpen()
  const isMobile = useIsMobile()

  const handleLogoDeskClick = (): void => {
    if (!isMobile && pathname === routes.home) {
      scrollToTop()
    }
  }

  const handleBurgerClick = (): void => {
    handleChangeIsBurgerClick(!isBurgerOpen)
  }
  return (
    <div
      onClick={handleBurgerClick}
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
