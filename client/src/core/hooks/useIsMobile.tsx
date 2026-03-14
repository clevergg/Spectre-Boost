import { useMemo } from "react"
import { MOBILE_BREAKPOINT } from "../constants"
import { useWindowSize } from "./useWindowsSize"

export const useIsMobile = () => {
  const { width } = useWindowSize()
  const isMobile = useMemo(() => {
    return width !== null && width! <= MOBILE_BREAKPOINT
  }, [width])
  return isMobile
}
