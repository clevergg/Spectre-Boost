import { lazy } from "react"
import { RadioSurvivor } from "./RadioSurvivor"
import { useBoostVariant } from "../store/SurvivorStore"
import { detailsByBoostType } from "../data/FirstCardDetails"
import { AnimatePresence, motion } from "framer-motion"
import { Title } from "./Title"

const TextType = lazy(() => import("../../../shared/ui/TextType"))

export const FirstCard = () => {
  const boostVariant = useBoostVariant()
  const details = detailsByBoostType[boostVariant]
  return (
    <article className='bg-transparent border lg:shrink-0 flex flex-col justify-between border-gray lg:flex-3 rounded-xl shadow-md py-12 lg:py-20 h-full gap-8'>
      <div className='flex flex-col justify-center items-center space-y-8'>
        <Title
          text='Рассчитайте стоимость'
          strong='буста'
          className='text-[clamp(1.55rem,2.7vw,2rem)] text-center text-gradient-purple-blue max-lg:px-[calc(1rem+2vw)] [&_strong]:text-white font-unbounded'
        />
        <TextType
          text={["Выживший — топ 50", "Мы всё сделаем"]}
          typingSpeed={60}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter='|'
          className='text-white font-unbounded text-center text-[clamp(1.5rem,2.5vw,3rem)]'
        />
        <hr className='h-0.5 bg-gray w-[250px]' />

        <RadioSurvivor />
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={boostVariant}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
          className={"flex flex-col space-y-5 px-[calc(0.5rem+1.5vw)]"}
        >
          <h3 className='text-[clamp(1.1rem,1.5vw,1.3rem)] font-unbounded text-white text-center'>
            Как это работает
          </h3>
          <ul className='flex flex-col space-y-4'>
            {details.map((text, index) => (
              <li key={index} className='flex items-start gap-3'>
                <p className='text-[clamp(0.85rem,1vw,1rem)] font-gilroy text-gray-300'>{text}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </article>
  )
}
