import { Outlet } from "react-router-dom"
import { Footer } from "../../modules/footer/Footer"
import { Header } from "../../modules/header"
import { FrameAnimation } from "../../shared/ui/FrameAnimation"

export const UserAccountLayout = () => {
  return (
    <FrameAnimation className='min-h-screen flex flex-col items-center min-w-[360px] overflow-hidden w-full bg-bgblack'>
      <Header />
      <main className='flex-1 flex w-full max-w-[1720px] px-4 md:px-8 justify-center'>
        <Outlet />
      </main>
      <Footer />
    </FrameAnimation>
  )
}
