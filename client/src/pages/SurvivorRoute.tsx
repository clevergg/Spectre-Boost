import { lazy } from "react"
import ServicesLayout from "./pageLayouts/ServicesLayout"
import { SEO_CONFIG } from "../core/config/seo.config"

const Survivor = lazy(() => import("../modules/survivor"))

const SurvivorRoute = () => {
  return (
    <ServicesLayout seo_config={SEO_CONFIG.survivor}>
      <Survivor />
    </ServicesLayout>
  )
}

export default SurvivorRoute
