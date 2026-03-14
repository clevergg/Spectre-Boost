import { useEffect, useState, useCallback } from "react"

export const useHideHeader = (): boolean => {
  const [lastScrollY, setLastScrollY] = useState<number>(0)
  const [isHiding, setIsHiding] = useState<boolean>(false)
  const [scrollDirection, setScrollDirection] = useState<null | string>(null)

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    const direction: string = currentScrollY > lastScrollY && currentScrollY > 100 ? "down" : "up"

    if (direction !== scrollDirection) {
      setScrollDirection(direction)
      setIsHiding(direction === "down")
    }

    setLastScrollY(currentScrollY)
  }, [lastScrollY, scrollDirection])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return isHiding
}
