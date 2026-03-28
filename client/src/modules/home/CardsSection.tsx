import { FaCircleArrowRight } from "react-icons/fa6"
import { GradientButton } from "../../shared/ui/GradientButton"
import { HomeCardsData as cardData } from "./data/HomeCardsData"
import { useNavigate } from "react-router-dom"
import { routes } from "../../app/config/routes"

export const CardsSection = () => {
  const navigate = useNavigate()
  const handleNavigateToTopfifty = () => {
    navigate(routes.topfifty)
  }
  return (
    <section className='w-full mb-30 font-unbounded'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-5 2xl:gap-10 transition-transform ease-in-out duration-500'>
        {cardData.map((card, index) => (
          <article
            key={index}
            className={`bg-black w-full flex flex-col relative rounded-2xl shadow-lg transition-all ease-in-out duration-500 border border-gray hover:border-pink-gradient2 group hover:scale-105 p-5 gap-3 justify-self-center z-1 text-center`}
          >
            <div>
              <img
                src={card.image}
                alt={card.title}
                loading='lazy'
                className='w-full object-fit transition-transform duration-500 rounded-xl max-md:h-[103px] h-[206px]'
              />
            </div>

            <div className='max-md:mt-5 mb-6'>
              <h2 className='text-[clamp(1rem,1.4vw,1.5rem)] font-medium text-white mb-2'>
                {card.title}
              </h2>
              <p className='text-gray-300 font-gilroyMedium text-[clamp(0.9rem,1.3vw,1.3rem)]]'>
                {card.description}
              </p>
            </div>

            <GradientButton
              onClick={card.aria === "topfifty" ? handleNavigateToTopfifty : undefined}
              type='cardsNavigate'
              className='px-5 py-2.5 flex items-center mt-auto justify-center gap-5'
            >
              {card.soon ? (
                <p>Будет в скором времени</p>
              ) : (
                <>
                  {card.buttonText} <FaCircleArrowRight className='w-[30px] h-[30px]' />
                </>
              )}
            </GradientButton>
          </article>
        ))}
      </div>
    </section>
  )
}
