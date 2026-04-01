import { Footer } from "../../modules/footer/Footer"
import { Header } from "../../modules/header"
import { AnimatedOutlet } from "./AnimatedOutlet"

export const UserAccountLayout = () => {
  return (
    <div className='min-h-screen flex flex-col items-center min-w-[360px] overflow-hidden w-full bg-bgblack'>
      <Header />
      <main className='flex-1 flex w-full max-w-[1720px] px-4 md:px-8 justify-center'>
        <AnimatedOutlet />
      </main>
      <Footer />
    </div>
  )
}
