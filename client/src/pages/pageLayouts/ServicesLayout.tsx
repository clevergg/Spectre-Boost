import { lazy } from "react"

import type { SeoPageConfig } from "../../core/config/seo.config"
import { ServicesRouteClass } from "../constants"
import {
  servicesBottomShinings,
  servicesTopShinings,
} from "../../shared/ui/BackgroundShining/BgShiningSets"
import { BgShiningGroup } from "../../shared/ui/BackgroundShining/BgShiningGroup"
import { SEO } from "../../core/components/SEO"
import { Questions } from "../../shared/ui/Questions"

const Features = lazy(() => import("../../shared/ui/Features"))
const Reviews = lazy(() => import("../../modules/reviews"))

interface ServicesLayoutProps {
  children: React.ReactNode
  seo_config: SeoPageConfig
}

const ServicesLayout = ({ children, seo_config }: ServicesLayoutProps) => {
  return (
    <>
      <SEO {...seo_config} />
      <div className={ServicesRouteClass}>
        <BgShiningGroup items={servicesTopShinings} />
        {children}
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

export default ServicesLayout
