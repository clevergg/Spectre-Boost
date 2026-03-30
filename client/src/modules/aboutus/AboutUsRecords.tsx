import type { CSSProperties } from "react"
import { RecordsData } from "./data/AboutusRecordsData"
import recordsBg from "./assets/images/recordsBg.webp"
import { ScrollAnimation } from "../../shared/ui/ScrollAnimation"

const backgroundStyle: CSSProperties = {
  backgroundImage: `url(${recordsBg})`,
}

export const AboutUsRecords = () => {
  return (
    <section
      className='relative w-full mb-15 md:mb-20 min-h-[520px]'
      aria-labelledby='records-heading'
    >
      <ScrollAnimation>
        <div
          style={backgroundStyle}
          className='absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed will-change-transform transform-gpu'
          role='presentation'
          aria-hidden='true'
        >
          <div className='absolute inset-0 bg-[#1b002b]/60 backdrop-blur-[1px] brightness-60' />
        </div>

        <div className='relative max-sm:py-[10%] max-lg:py-[5%] px-[8%] min-h-[520px] z-1 flex max-lg:flex-col justify-around lg:space-x-10 max-lg:justify-between items-center max-lg:space-y-8'>
          <header className='flex flex-col space-y-5 max-lg:justify-center max-lg:items-center'>
            <h2
              id='records-heading'
              className='font-unbounded text-white max-w-[575px] text-[clamp(1.5rem,2.2vw,3rem)] font-medium'
            >
              Ваши ожидания наши проблемы
            </h2>
            <p className='font-gilroyMedium font-medium max-lg:text-center max-sm:text-left text-balance text-white max-w-[500px] text-[clamp(1.1rem,1.2vw,1.5rem)]'>
              Имея послужной список успешных проектов, довольных клиентов и многолетний опыт, мы
              являемся ведущей компанией по бусту аккаунтов. Наше стремление к совершенству отличает
              нас в отрасли.
            </p>
          </header>

          <dl className='grid grid-cols-2 gap-8' aria-label='Ключевые показатели компании'>
            {RecordsData.map((item, index) => (
              <div
                key={index}
                className='flex flex-col border-l lg:border-l-2 px-5 border-white text-white gap-4 min-h-[100px]'
                role='group'
                aria-label={`${item.title} — ${item.desc}`}
              >
                <dt className='font-gilroy font-bold text-[clamp(1.5rem,3vw,3rem)]'>
                  {item.title}
                </dt>
                <dd className='font-gilroy font-semibold text-[clamp(1.3rem,2.5vw,2rem)]'>
                  {item.desc}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </ScrollAnimation>
    </section>
  )
}
