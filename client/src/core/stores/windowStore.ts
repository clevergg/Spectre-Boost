// src/core/stores/windowStore.ts
import { create } from "zustand"
import { MOBILE_BREAKPOINT } from "../constants"

interface WindowStore {
  width: number
  isMobile: boolean
}

const useWindowStore = create<WindowStore>(() => ({
  width: window.innerWidth,
  isMobile: window.innerWidth <= MOBILE_BREAKPOINT,
}))

let timeoutId: ReturnType<typeof setTimeout>

window.addEventListener("resize", () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    const width = window.innerWidth
    useWindowStore.setState({
      width,
      isMobile: width <= MOBILE_BREAKPOINT,
    })
  }, 150)
})

export const useWindowWidth = () => useWindowStore(s => s.width)
export const useIsMobile = () => useWindowStore(s => s.isMobile)
