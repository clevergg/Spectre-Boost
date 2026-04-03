import { AnimatePresence } from "framer-motion"
import { motion } from "framer-motion"
import { useLocation, useOutlet } from "react-router-dom"

export const AnimatedOutlet = () => {
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <AnimatePresence mode='wait'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.1,
          ease: "linear",
        }}
        key={location.pathname}
				className='w-full'
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
