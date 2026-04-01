import { NavLink } from "react-router-dom"
import { useNavigateLinks } from "../../../core/hooks/useNavigates"
import {
  HeaderNavBarData as desktopNavbarData,
  HeaderBurgerMenuData as mobileNavbarData,
} from "../data/HeaderNavBarData"
import { useIsBurgerOpen, useIsModalOpen, handleChangeIsModalClick } from "../store/HeaderStore"
import { useIsAuthenticated } from "../../../core/stores/authStore"
import { routes } from "../../../app/config/routes"

const GLOW_CLASS =
  "relative before:absolute before:inset-0 before:bg-[#E8CEE4] before:blur-[10px] before:rounded-full before:opacity-20"

export const DesktopNavigation = () => {
  const handleLinkClick = useNavigateLinks()
  const isModalOpen = useIsModalOpen()

  return (
    <ul className='hidden md:flex relative ml-5 space-x-5 mt-1'>
      {desktopNavbarData.map(item => (
        <NavLink
          to={item.link}
          key={item.link}
          onClick={() => handleLinkClick(item.link)}
          className={({ isActive }) =>
            `text-white text-[clamp(1.2rem,1.4vw,1.4rem)] font-light transition-all duration-500 ease-in-out font-gilroy ${
              isActive && !isModalOpen ? GLOW_CLASS : "hover:text-[#E8CEE4]"
            }`
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
  const isModalOpen = useIsModalOpen()

  const handleLoginClick = () => {
    handleChangeIsModalClick(true)
  }

  return (
    <ul
      className={`flex md:hidden flex-col ${!isBurgerOpen ? "hidden" : null} text-center space-y-4`}
    >
      {mobileNavbarData.map(item => (
        <NavLink
          to={item.link}
          key={item.link}
          onClick={() => handleLinkClick(item.link)}
          className={({ isActive }) =>
            `text-white text-[clamp(1.3rem,1.3vw,2rem)] font-gilroy ${
              isActive && !isModalOpen ? GLOW_CLASS : "hover:text-[#E8CEE4]"
            }`
          }
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
