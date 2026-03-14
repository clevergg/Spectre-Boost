import { Account } from "../modules/userAccount"
import { BgShining } from "../shared/ui/BackgroundShining"
const AccountRoute = () => {
  return (
    <div className='relative w-full max-w-[1720px]'>
      <BgShining
        top='top-0'
        left='left-[-250px] max-md:left-[-150px]'
        bgColor='bg-[#140819]'
        blur='blur-[90px]'
        animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
        className='w-140 h-120 max-md:w-full max-md:h-[50%]'
      />
      <Account />
      <BgShining
        top='top-40 max-md:top-0'
        left='right-[-250px] max-md:right-[-100px]'
        bgColor='bg-[#090717]'
        blur='blur-[90px]'
        animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
        className='w-130 h-110 max-md:w-full max-md:h-[50%]'
      />
    </div>
  )
}

export default AccountRoute
