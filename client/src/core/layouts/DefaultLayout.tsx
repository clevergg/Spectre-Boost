import { Outlet } from "react-router-dom"
import { Footer } from "../../modules/footer/Footer"
import { Header } from "../../modules/header"
import { FrameAnimation } from "../../shared/ui/FrameAnimation"

export const DefaultLayout = () => {
  return (
    <FrameAnimation className='min-h-screen flex flex-col items-center min-w-[360px] overflow-hidden w-full bg-bgblack'>
      <Header />
      <main className={`grow flex flex-col justify-center items-center`}>
        <Outlet />
      </main>
      <Footer />
    </FrameAnimation>
  )
}
