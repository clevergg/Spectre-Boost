import { useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import type { ReactNode } from "react"
interface FrameAnimationProps {
  children: ReactNode
  className: string
  onClick?: () => void
  animateKey?: string
}
export const FrameAnimation = ({
  children,
  className,
  onClick,
  animateKey,
}: FrameAnimationProps) => {
  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={animateKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.1,
          ease: "linear",
        }}
        className={className}
        onClick={onClick}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
