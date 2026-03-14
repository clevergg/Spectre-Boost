import { NavLink } from "react-router-dom"
import { useNavigateLinks } from "../../../core/hooks/useNavigates"
import {
  HeaderNavBarData as descktopNavbarData,
  HeaderBurgerMenuData as mobileNavbarData,
} from "../data/HeaderNavBarData"
import { useIsBurgerOpen, useIsModalOpen } from "../store/HeaderStore"

export const DesktopNavigation = () => {
  const handleLinkClick = useNavigateLinks()
  const isModalOpen = useIsModalOpen()
  return (
    <ul className='hidden md:flex relative ml-5 space-x-5 mt-1'>
      {descktopNavbarData.map((item, index) => (
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
  return (
    <ul
      className={`flex md:hidden flex-col  ${
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
    </ul>
  )
}
