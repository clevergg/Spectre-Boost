import { useEffect, useState, useCallback, useRef } from "react"

export const useHideHeader = (): boolean => {
  const lastScrollY = useRef<number>(0)
  const [isHiding, setIsHiding] = useState<boolean>(false)
  const scrollDirection = useRef<string | null>(null)

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    const direction: string =
      currentScrollY > lastScrollY.current && currentScrollY > 100 ? "down" : "up"

    if (direction !== scrollDirection.current) {
        scrollDirection.current = direction
        setIsHiding(direction === "down")
    }

    lastScrollY.current = currentScrollY
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return isHiding
}
