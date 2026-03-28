import { twMerge } from "tailwind-merge"
import { useNavigateToServices } from "../../core/hooks/useNavigates"
import type { ReactNode } from "react"

type Button = "singleNavigate" | "cardsNavigate" | "default"
interface GradientButtonInterface {
  onClick?: () => void
  children: ReactNode
  className?: string
  type?: Button
}

export const GradientButton = ({ onClick, children, className, type }: GradientButtonInterface) => {
  const handleServicesClick = useNavigateToServices()

  const homeCardClasses =
    "w-full bg-gradient-to-r border-white border-1 group-hover:from-pink-gradient1 cursor-pointer group-hover:to-pink-gradient2 text-white text-[clamp(1rem,1.2vw,1.3rem)] group-hover:text-black rounded-[11px] transition-colors duration-500 ease-in-out font-gilroyMedium z-1 text-white"

  const basesClasses =
    type === "cardsNavigate"
      ? homeCardClasses
      : "bg-gradient-to-r from-pink-400 cursor-pointer via-pink-gradient1 to-pink-gradient2 hover:from-spectre-purple hover:via-spectre-cyan rounded-[11px] hover:to-spectre-blue text-[clamp(1rem,1.2vw,1.3rem)] transition-colors duration-500 ease-in-out font-gilroyMedium z-1"

  const handleClick = () => {
    if (type) {
      handleServicesClick()
    } else {
      onClick?.()
    }
  }

  return (
    <button onClick={onClick ? onClick : handleClick} className={twMerge(basesClasses, className)}>
      {children}
    </button>
  )
}
