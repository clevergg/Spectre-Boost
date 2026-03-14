import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { routes } from "../../app/config/routes"
import scrollToTop from "../helpers/scrollToTop"

export const useNavigateToServices = () => {
  const navigate = useNavigate()

  const handleServicesClick = () => {
    navigate(routes.services)
  }

  return handleServicesClick
}

export const useNavigateLinks = () => {
  const { pathname } = useLocation()

  const handleLinkClick = useCallback(
    (itemLink: string) => {
      if (pathname === itemLink) {
        scrollToTop()
      }
    },
    [pathname]
  )

  return handleLinkClick
}
