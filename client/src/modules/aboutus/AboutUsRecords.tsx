import { useMemo, type CSSProperties } from "react"
import recordsBg from "./assets/images/recordsBg.webp"
import { ScrollAnimation } from "../../shared/ui/ScrollAnimation"
import { RecordsData } from "./data/AboutusRecordsData"

export const AboutUsRecords = () => {
  const backgroundImage = useMemo<CSSProperties>(
    () => ({
      backgroundImage: `url(${recordsBg})`,
    }),
    [recordsBg]
  )

  return (
    <section className='relative w-full mb-15 md:mb-20 min-h-[520px]'>
      <ScrollAnimation>
        <div
          style={backgroundImage}
          className={`absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat bg-fixed will-change-transform transform-gpu`}
        >
          <div className='absolute inset-0 bg-[#1b002b]/60 bg-opacity-50 backdrop-blur-[1px] brightness-60' />
        </div>

        <div className='relative max-sm:py-[10%] max-lg:py-[5%] px-[10%] min-h-[520px] z-1 flex max-lg:flex-col justify-around lg:space-x-10 max-lg:justify-between items-center max-lg:space-y-8'>
          <div className='flex flex-col space-y-5 max-lg:justify-center max-lg:items-center'>
            <h2 className='font-unbounded text-white max-w-[550px] text-[clamp(1.5rem,2.5vw,3.5rem)] font-medium'>
              Ваши ожидания - наши проблемы
            </h2>
            <p className='font-gilroyMedium font-medium max-lg:text-center max-sm:text-left text-balance text-white max-w-[500px] text-[clamp(1.1rem,1.2vw,1.5rem)]'>
              Имея послужной список успешных проектов, довольных клиентов и многолетний опыт, мы
              являемся ведущей компанией по бусту аккаунтов. Наше стремление к совершенству отличает
              нас в отрасли.
            </p>
          </div>
          <aside className='flex'>
            <dl className='grid h-full grid-cols-2 gap-8'>
              {RecordsData.map((item, index) => (
                <div
                  key={index}
                  className='flex flex-col border-l lg:border-l-2 px-5 border-[#FFFFFF] text-white gap-4 min-h-[100px]'
                >
                  <dt className='font-gilroy font-bold text-[clamp(1.5rem,3vw,3rem)] lg:tracking-[1%]'>
                    {item.title}
                  </dt>
                  <dd className='font-gilroy font-semibold text-[clamp(1.3rem,2.5vw,2.rem)] tracking-[1%]'>
                    {item.desc}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </ScrollAnimation>
    </section>
  )
}
