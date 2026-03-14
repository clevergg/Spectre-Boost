import { useState, useEffect } from "react"
import { useDebounce } from "./UseDebounce"

type WindowSizes = {
  width: number | null
  height: number | null
}

export function useWindowSize(): WindowSizes {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : null,
    height: typeof window !== "undefined" ? window.innerHeight : null,
  })

  const DebounceResize = useDebounce(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, 150)

  useEffect(() => {
    if (typeof window === "undefined") return

    window.addEventListener("resize", DebounceResize)
    return () => window.removeEventListener("resize", DebounceResize)
  }, [])

  return windowSize
}
