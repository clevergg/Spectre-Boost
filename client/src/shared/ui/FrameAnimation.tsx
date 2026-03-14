import { useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import type { ReactNode } from 'react'
interface FrameAnimationProps {
  children: ReactNode
  className: string
  onClick?: () => void
}
export const FrameAnimation = ({ children, className, onClick }: FrameAnimationProps) => {
  const location = useLocation()

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={location.pathname}
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
