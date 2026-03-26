import { NavLink } from "react-router-dom"
import { useNavigateLinks } from "../../../core/hooks/useNavigates"
import {
  HeaderNavBarData as desktopNavbarData,
  HeaderBurgerMenuData as mobileNavbarData,
} from "../data/HeaderNavBarData"
import { useIsBurgerOpen, useIsModalOpen, handleChangeIsModalClick } from "../store/HeaderStore"
import { useIsAuthenticated } from "../../../core/stores/authStore"
import { routes } from "../../../app/config/routes"

export const DesktopNavigation = () => {
  const handleLinkClick = useNavigateLinks()
  const isModalOpen = useIsModalOpen()

  return (
    <ul className='hidden md:flex relative ml-5 space-x-5 mt-1'>
      {desktopNavbarData.map((item, index) => (
        <NavLink
          to={item.link}
          key={index}
          onClick={() => handleLinkClick(item.link)}
          className={({ isActive }) =>
            `text-white text-[clamp(1.2rem,1.4vw,1.4rem)] font-light ${
              !isActive ? "hover:text-[#E8CEE4]" : null
            } ${
              isActive && !isModalOpen ? "LinkHover" : null
            } transition-all duration-500 ease-in-out font-gilroy`
          }
        >
          {item.title}
        </NavLink>
      ))}
    </ul>
  )
}

export const MobileNavigation = () => {
  const handleLinkClick = useNavigateLinks()
  const isBurgerOpen = useIsBurgerOpen()
  const isAuthenticated = useIsAuthenticated()

  const handleLoginClick = () => {
    handleChangeIsModalClick(true)
  }

  return (
    <ul
      className={`flex md:hidden flex-col ${
        !isBurgerOpen ? "hidden" : null
      } text-center space-y-4`}
    >
      {mobileNavbarData.map((item, index) => (
        <NavLink
          to={item.link}
          key={index}
          onClick={() => handleLinkClick(item.link)}
          className='text-white text-[clamp(1.3rem,1.3vw,2rem)] font-gilroy'
        >
          {item.title}
        </NavLink>
      ))}

      {/* Динамическая ссылка: Войти или Аккаунт */}
      {isAuthenticated ? (
        <NavLink
          to={routes.account}
          onClick={() => handleLinkClick(routes.account)}
          className='text-white text-[clamp(1.3rem,1.3vw,2rem)] font-gilroy'
        >
          Аккаунт
        </NavLink>
      ) : (
        <button
          onClick={handleLoginClick}
          className='text-white text-[clamp(1.3rem,1.3vw,2rem)] font-gilroy'
        >
          Войти
        </button>
      )}
    </ul>
  )
}
