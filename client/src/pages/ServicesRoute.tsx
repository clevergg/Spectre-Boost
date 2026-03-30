import { lazy } from "react"
import { Questions } from "../shared/ui/Questions"
import { ServicesRouteClass } from "./constants"
import { SEO } from "../core/components/SEO"
import { SEO_CONFIG } from "../core/config/seo.config"
import { BgShiningGroup } from "../shared/ui/BackgroudShining/BgShiningGroup"
import {
  servicesBottomShinings,
  servicesTopShinings,
} from "../shared/ui/BackgroudShining/BgShiningSets"

const Features = lazy(() => import("../shared/ui/Features"))
const Calculator = lazy(() => import("../modules/calculator"))
const Reviews = lazy(() => import("../modules/reviews"))

const ServicesRoute = () => {
  return (
    <>
      <SEO {...SEO_CONFIG.services} />
      <div className={ServicesRouteClass}>
        <BgShiningGroup items={servicesTopShinings} />
        <Calculator />
      </div>
      <Reviews />
      <div className={ServicesRouteClass}>
        <BgShiningGroup items={servicesBottomShinings.slice(0, 2)} />

        <Features />

        <BgShiningGroup items={servicesBottomShinings.slice(2, 4)} />

        <Questions />
        <BgShiningGroup items={servicesBottomShinings.slice(4)} />
      </div>
    </>
  )
}

export default ServicesRoute
