import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import scrollToTop from "../../core/helpers/scrollToTop"

export const ScrollHandler = () => {
  const { pathname } = useLocation()
  const isInitLoaded = useRef(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const saveNow = () => {
      sessionStorage.setItem("scrollPosition", window.scrollY.toString())
      sessionStorage.setItem("pathname", pathname)
    }

    const handleScroll = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(saveNow, 200)
    }

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("beforeunload", saveNow)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("beforeunload", saveNow)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [pathname])

  useEffect(() => {
    if (isInitLoaded.current) {
      isInitLoaded.current = false

      const savedPosition = sessionStorage.getItem("scrollPosition")
      const savedPathname = sessionStorage.getItem("pathname")

      if (savedPosition && savedPathname === pathname) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: parseInt(savedPosition),
            behavior: "instant",
          })
        })
      }

      sessionStorage.removeItem("scrollPosition")
      sessionStorage.removeItem("pathname")
      return
    }

    scrollToTop("instant")
  }, [pathname])

  return null
}
