import { ScrollAnimation } from "../ScrollAnimation"
import { ServicesFeaturesData } from "./data/ServicesFeaturesData"

const GLOW_COLORS = {
  blue: "before:bg-[#3e7084]",
  red: "before:bg-[#42245e]",
} as const

const Features = () => {
  return (
    <section aria-labelledby='features-heading' className='mb-20'>
      <ScrollAnimation className='w-full flex max-lg:flex-col justify-between max-lg:justify-center max-lg:items-center gap-25 max-lg:gap-10'>
        <header className='w-full lg:order-2 flex flex-col justify-center text-white gap-5'>
          <h2
            id='features-heading'
            className='font-unbounded flex flex-col text-[clamp(1.8rem,3vw,3.5rem)]/[120%] max-lg:text-center z-1 text-left shrink-0'
          >
            <span className='bg-linear-to-r bg-clip-text text-transparent from-[#FF93ED] to-[#799FFF]'>
              ПРЕИМУЩЕСТВА
            </span>{" "}
            <span className='text-nowrap'>ВЫБОРА SPECTRE</span>
          </h2>
          <p className='font-gilroy sm:text-center lg:text-left whitespace-pre-line font-semibold text-balance text-[clamp(1rem,1vw,1.5rem)] z-1'>
            Многолетний опыт игры в совокупности с нашими преимуществами делает нас одними из лучших
            бустеров аккаунтов на рынке.
          </p>
        </header>

        <dl className='w-full grid max-md:grid-cols-1 grid-cols-2 max-md:gap-7 gap-10'>
          {ServicesFeaturesData.map((item, index) => (
            <div
              key={index}
              role='group'
              aria-label={item.title}
              className='flex flex-col relative max-lg:items-center max-lg:text-center text-white max-md:space-y-2 space-y-4 z-1'
            >
              <div
                className={`relative w-[50px] h-[45px] ${
                  index % 3 === 0 ? GLOW_COLORS.blue : GLOW_COLORS.red
                } before:absolute before:inset-0 before:blur-[10px] before:rounded-full before:opacity-70`}
                aria-hidden='true'
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading='lazy'
                  className='relative w-full h-full object-contain'
                />
              </div>
              <dt className='font-unbounded font-medium max-sm:text-[16px] text-[20px]'>
                {item.title}
              </dt>
              <dd className='font-gilroyMedium max-lg:max-w-[500px] text-balance text-[clamp(1.1rem,1.5vw,1.5rem)]/[120%]'>
                {item.desc}
              </dd>
            </div>
          ))}
        </dl>
      </ScrollAnimation>
    </section>
  )
}

export default Features
