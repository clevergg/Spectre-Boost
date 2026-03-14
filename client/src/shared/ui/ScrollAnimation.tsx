// components/ScrollAnimation.tsx
import { motion, useInView, type Variants } from "framer-motion"
import type { ReactNode } from 'react'
import { useRef } from "react"

type AnimationType = "slideUp" | "zoom"

interface ScrollAnimationProps {
  children: ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
  className?: string
  triggerOnce?: boolean
}

const animationVariants: Record<AnimationType, Variants> = {
  slideUp: {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
}

export const ScrollAnimation = ({
  children,
  animation = "zoom",
  delay = 0,
  duration = 0.5,
  className = "",
  triggerOnce = true,
}: ScrollAnimationProps) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, {
    once: triggerOnce,
    margin: "-30px",
  })

  return (
    <motion.div
      ref={ref}
      initial='hidden'
      animate={isInView ? "visible" : "hidden"}
      variants={animationVariants[animation]}
      transition={{
        duration,
        delay,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
