import spectreLogo from "../../assets/spectre.svg"
import scrollToTop from "../../core/helpers/scrollToTop"
import { ScrollAnimation } from "../../shared/ui/ScrollAnimation"
export const Footer = () => {
  const currentYear: number = new Date().getFullYear()

  const handleImgClick = () => {
    scrollToTop()
  }

  return (
    <footer className='w-full border-t border-gray flex justify-center z-1'>
      <ScrollAnimation className='flex items-center flex-col py-[calc(1rem+1vw)] space-y-3 relative max-w-[1920px]'>
        <img
          src={spectreLogo}
          alt='spectre'
          loading='lazy'
          className='mx-5 cursor-pointer'
          onClick={handleImgClick}
        />
        <p className='font-gilroy max-sm:max-w-[300px] max-sm:text-center text-[clamp(0.8rem,2vw,1rem)] text-gray'>
          По всем вопросам и поддержке, обращайтесь в телеграмм бота
        </p>
        <p className='font-gilroy text-[clamp(0.8rem,2vw,1rem)] text-gray'>
          @spectre.boost {currentYear}. Все права защищены.
        </p>
      </ScrollAnimation>
    </footer>
  )
}
