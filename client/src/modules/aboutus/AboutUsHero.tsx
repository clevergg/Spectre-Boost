import { FaCircleArrowRight } from "react-icons/fa6"
import { BgShining } from "../../shared/ui/BackgroundShining"
import { GradientButton } from "../../shared/ui/GradientButton"
export const AboutUsHero = () => {
  return (
    <section className='px-7 w-full relative py-[calc(4rem+4vw)]'>
      <div className='relative space-y-8 pt-15 xl:pt-10 flex flex-col justify-center items-center text-center'>
        <h1 className='text-[clamp(3rem,6.5vw,7.3rem)]/[115%] font-unbounded text-gradient-purple-blue relative z-1'>
          SPECTRE BOOST
        </h1>

        <BgShining
          top='top-[-80px] max-md:top-[-100px]'
          left='lg:left-1/4.5'
          bgColor='bg-[#110f22]'
          blur='blur-[100px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='w-204 h-204 max-md:w-104 max-md:h-104'
        />
        <h2 className='text-white font-unbounded text-[clamp(1.5rem,3vw,3rem)] z-1'>
          НАША ИСТОРИЯ
        </h2>
        <p className='text-white w-full md:max-w-[80%] xl:max-w-1/2 font-gilroy font-medium text-[clamp(1rem,1.2vw,1.5rem)] text-balance z-1'>
          Всё началось с того, что несколько друзей-геймеров решили объединиться и создать нечто
          уникальное в мире видеоигр. Они были настоящими фанатами PUBG и мечтали о том, чтобы их
          навыки игры стали ещё лучше. Друзья начали изучать различные методы улучшения своих
          навыков и поняли, что существует множество способов буста аккаунтов. Однако большинство из
          них были либо незаконными, либо неэффективными. Тогда друзья решили создать свой
          собственный сервис по бусту аккаунтов, который будет основан на легальных и безопасных
          методах.
        </p>
        <GradientButton type='singleNavigate' className='md:mt-5 px-7 py-3'>
          <span className='flex flex-row items-center text-center gap-5 text-[clamp(1.3rem,1.4vw,1.5rem)] '>
            Заказать буст <FaCircleArrowRight className='w-[30px] h-[30px]' />
          </span>
        </GradientButton>
      </div>
    </section>
  )
}
