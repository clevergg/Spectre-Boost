import spectreLogo from "../../assets/spectre.svg"
import scrollToTop from "../../core/helpers/scrollToTop"
import { ScrollAnimation } from "../../shared/ui/ScrollAnimation"
import { INN } from "./footerData"
export const Footer = () => {
  const currentYear: number = new Date().getFullYear()

  const handleImgClick = () => {
    scrollToTop()
  }

  return (
    <footer className='w-full font-gilroy text-balance text-[clamp(1rem,1vw,1rem)] text-gray border-t border-gray flex justify-center z-1'>
      <ScrollAnimation className='flex items-center flex-col py-[calc(1rem+1vw)] space-y-3 relative max-w-[1920px]'>
        <button onClick={handleImgClick} className='mx-5 cursor-pointer'>
          <img src={spectreLogo} alt='spectre' loading='lazy' />
        </button>
        <div className='space-y-2 text-center'>
          <p>По всем вопросам и поддержке, обращайтесь в телеграм бота</p>
          <div className='flex items-center md:flex-row flex-col md:space-x-2 max-md:space-y-2'>
            <p>@spectre.boost {currentYear}. Все права защищены.</p>
            <span className='max-md:hidden'>|</span>
            <p>ИНН: {INN}</p>
          </div>
        </div>
      </ScrollAnimation>
    </footer>
  )
}
