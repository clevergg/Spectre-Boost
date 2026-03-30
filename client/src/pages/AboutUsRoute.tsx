import { lazy } from "react"
import { AboutUsHero, AboutUsRecords } from "../modules/aboutus"
import { Questions } from "../shared/ui/Questions"
import { aboutUsRouteClass, baseLayoutClass } from "./constants"
import { SEO } from "../core/components/SEO"
import { SEO_CONFIG } from "../core/config/seo.config"
import { BgShiningGroup } from "../shared/ui/BackgroudShining/BgShiningGroup"
import { aboutUsShinings } from "../shared/ui/BackgroudShining/BgShiningSets"

const Features = lazy(() => import("../shared/ui/Features"))
const Reviews = lazy(() => import("../modules/reviews"))

const AboutUsRoute = () => {
  return (
    <>
      <SEO {...SEO_CONFIG.aboutus} />
      <div className={aboutUsRouteClass}>
        <AboutUsHero />
        <AboutUsRecords />
      </div>
      <Reviews />
      <div className={baseLayoutClass}>
        <Features />
        <BgShiningGroup items={aboutUsShinings} />
        <Questions />
      </div>
    </>
  )
}

export default AboutUsRoute
