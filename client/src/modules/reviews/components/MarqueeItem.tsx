import { motion } from "framer-motion"
import type { Review } from "../types"
import { SliderDeskCard } from "./SliderDeskCard"
interface MarqueeItem {
  review: Review[]
  from: number | string
  to: number | string
}

const MarqueeItem = ({ review, from, to }: MarqueeItem) => {
  return (
    <div className='flex'>
      <motion.div
        initial={{ x: `${from}` }}
        animate={{ x: `${to}` }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className='flex shrink-0'
      >
        {review.map((review: Review) => {
          return <SliderDeskCard key={review.id} review={review} />
        })}
      </motion.div>

      <motion.div
        initial={{ x: `${from}` }}
        animate={{ x: `${to}` }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className='flex shrink-0'
      >
        {review.map((review: Review) => {
          return <SliderDeskCard key={review.id} review={review} />
        })}
      </motion.div>
    </div>
  )
}

export default MarqueeItem
