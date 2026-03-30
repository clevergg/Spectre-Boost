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
const Survivor = lazy(() => import("../modules/survivor"))
const Reviews = lazy(() => import("../modules/reviews"))

const SurvivorRoute = () => {
  return (
    <>
      <SEO {...SEO_CONFIG.survivor} />
      <div className={`${ServicesRouteClass} w-full`}>
        <BgShiningGroup items={servicesTopShinings} />
        <Survivor />
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

export default SurvivorRoute
