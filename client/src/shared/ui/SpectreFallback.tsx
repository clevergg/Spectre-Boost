import { memo } from "react"
import logo from "../../assets/SpectreLogo.svg"

const SpectreFallback = () => {
  return (
    <div className='fixed inset-0 bg-bgblack flex items-center justify-center '>
      <img src={logo} alt='spectre' className='w-1/3 h-1/3' />
    </div>
  )
}

export default memo(SpectreFallback)
