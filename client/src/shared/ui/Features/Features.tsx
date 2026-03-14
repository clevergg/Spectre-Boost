import { ScrollAnimation } from "../ScrollAnimation"
import { ServicesFeaturesData } from "./data/ServicesFeaturesData"

const Features = () => {
  return (
    <section aria-labelledby='features' className='mb-20'>
      <ScrollAnimation className='w-full flex max-lg:flex-col justify-between max-lg:justify-center max-lg:items-center gap-25 max-lg:gap-10'>
        <header className='w-full lg:order-2 flex flex-col justify-center items-left text-white gap-5'>
          <h2
            id='features'
            className='font-unbounded flex flex-col text-[clamp(1.8rem,3vw,3.5rem)]/[120%] max-lg:text-center z-1 text-left shrink-0'
          >
            <span className='bg-linear-to-r bg-clip-text text-transparent from-[#FF93ED] to-[#799FFF]'>
              ПРЕИМУЩЕСТВА
            </span>{" "}
            <span className='text-nowrap'>ВЫБОРА SPECTRE</span>
          </h2>
          <p className='font-gilroy sm:text-center lg:text-left max-w-full whitespace-pre-line font-semibold text-balance text-[clamp(1rem,1vw,1.5rem)] z-1'>
            Многолетний опыт игры в совокупности с нашими преимуществами делает нас одними из лучших
            бустеров аккаунтов на рынке.
          </p>
        </header>
        <div className='w-full'>
          <dl className='grid max-md:grid-cols-1 grid-cols-2 max-md:gap-7 gap-10'>
            {ServicesFeaturesData.map((item, index) => (
              <div
                key={index}
                className='flex flex-col relative max-lg:items-center max-lg:text-center text-white max-md:space-y-2 space-y-4 z-1'
              >
                <img
                  src={item.image}
                  alt={item.title}
                  aria-hidden='true'
                  className={`w-[50px] ${
                    index % 3 === 0 ? "ShiningBlue" : "ShiningRed"
                  } h-[45px] object-contain z-1`}
                />
                <dt className='font-unbounded font-medium max-sm:text-[16px] text-[20px] tracking-normal'>
                  {item.title}
                </dt>
                <dd className='font-gilroyMedium max-lg:max-w-[500px] shrink-0 text-balance text-[clamp(1.1rem,1.5vw,1.5rem)]/[120%]'>
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

export default Features
