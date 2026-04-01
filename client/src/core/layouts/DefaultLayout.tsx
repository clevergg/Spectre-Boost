import { Footer } from "../../modules/footer/Footer"
import { Header } from "../../modules/header"
import { AnimatedOutlet } from "./AnimatedOutlet"

export const DefaultLayout = ({ mainClassName }: { mainClassName?: string }) => {
  return (
    <div className='min-h-screen flex flex-col items-center min-w-[360px] overflow-hidden w-full bg-bgblack'>
      <Header />
      <main className={mainClassName}>
        <AnimatedOutlet />
      </main>
      <Footer />
    </div>
  )
}
