import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import scrollToTop from "../../core/helpers/scrollToTop"

export const ScrollHandler = () => {
  const { pathname } = useLocation()
  const isInitLoaded = useRef<boolean>(true)
  const hasRestoredScroll = useRef<boolean>(false)

  useEffect(() => {
    const saveScrollPosition = (): void => {
      sessionStorage.setItem("scrollPosition", window.scrollY.toString())
      sessionStorage.setItem("pathname", pathname)
    }

    const handleBeforeUnload = (): void => {
      saveScrollPosition()
    }

    const handleScroll = (): void => {
      saveScrollPosition()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("scroll", handleScroll)
      saveScrollPosition()
    }
  }, [pathname])

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("scrollPosition")
    const savedPathname = sessionStorage.getItem("pathname")
    if (isInitLoaded.current) {
      if (savedPosition && savedPathname === pathname && !hasRestoredScroll.current) {
        window.scrollTo({
          top: parseInt(savedPosition),
          behavior: "instant",
        })

        sessionStorage.removeItem("scrollPosition")
        sessionStorage.removeItem("pathname")
      }
      isInitLoaded.current = false
    } else if (savedPathname !== pathname) {
      scrollToTop("instant")
    }
  }, [pathname])

  return <span className='m-0 p-0 h-0 w-0'></span>
}
