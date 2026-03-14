import { useState } from "react"
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io"
import { ScrollAnimation } from "../ScrollAnimation"
import { QuestionsData } from "./data/QuestionsData"
export const Questions = () => {
  const [openQuestionIndex, setOpenQuestionIndex] = useState<null | number>(null)

  const handleQuestionClick = (index: number) => {
    setOpenQuestionIndex(prev => (prev === index ? null : index))
  }

  return (
    <section className='mb-[calc(2.5rem+2.5vw)]'>
      <ScrollAnimation
        duration={0.4}
        className='w-full flex max-lg:flex-col max-lg:items-center max-lg:space-y-8 bg-transparent'
      >
        <div className='gap-5 max-w-[627px] lg:mr-[calc(3.5rem+3.5vw)] text-white flex flex-col items-center max-lg:text-center justify-center z-1'>
          <h1 className='font-unbounded text-[clamp(1.5rem,5vw,3rem)] '>
            Часто задаваемые вопросы
          </h1>
          <p className='font-gilroyMedium text-balance text-[clamp(1rem,2.5vw,1.3rem)]'>
            Здесь мы собрали список самых часто задаваемых вопросов и ответили на них, чтобы вы
            имели представление о работе нашего сервиса.
          </p>
        </div>
        <dl className='w-full flex flex-col space-y-4'>
          {QuestionsData.map((data, index) => (
            <button
              onClick={() => handleQuestionClick(index)}
              key={index}
              className={`z-1 text-left flex flex-col justify-between ${
                openQuestionIndex === index ? "items-start" : "items-center"
              } border text-white border-violet font-gilroyMedium list-none rounded-[11px] cursor-pointer ${
                openQuestionIndex === index ? "bg-[#0E0E0E]" : "bg-transparent"
              }`}
            >
              <div className='min-w-full flex items-center justify-between p-4'>
                <dt className='font-gilroyMedium text-[clamp(1.1rem,2vw,1.3rem)] text-left text-balance'>
                  {data.title}
                </dt>
                {openQuestionIndex === index ? (
                  <IoIosArrowUp className='ml-3 shrink-0' />
                ) : (
                  <IoIosArrowDown className='ml-3 shrink-0' />
                )}
              </div>
              {openQuestionIndex === index && (
                <dd className='w-full px-3 sm:px-4 pb-3 lg:mb-4 font-gilroyMedium text-balance text-[clamp(1rem,1.4vw,1.4rem)] text-[#BEBFC0]'>
                  {data.desc}
                </dd>
              )}
            </button>
          ))}
        </dl>
      </ScrollAnimation>
    </section>
  )
}
