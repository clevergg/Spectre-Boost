import { lazy } from "react"
import { CardsSection, HeroSection } from "../modules/home"
import { Questions } from "../shared/ui/Questions"
import { baseLayoutClass, HomeQuestionsLayoutClass } from "./constants"
import { SEO } from "../core/components/SEO"
import { SEO_CONFIG } from "../core/config/seo.config"
import { BgShiningGroup } from "../shared/ui/BackgroudShining/BgShiningGroup"
import { homeCardsShinings, homeHeroShinings } from "../shared/ui/BackgroudShining/BgShiningSets"

const Reviews = lazy(() => import("../modules/reviews"))

const HomeRoute = () => {
  return (
    <>
      <SEO {...SEO_CONFIG.home} />
      <div className={baseLayoutClass}>
        <BgShiningGroup items={homeHeroShinings} />
        <HeroSection />
        <CardsSection />
        <BgShiningGroup items={homeCardsShinings} />
      </div>

      <Reviews />
      <div className={HomeQuestionsLayoutClass}>
        <Questions />
      </div>
    </>
  )
}

export default HomeRoute
