import { lazy } from "react"
import ServicesLayout from "./pageLayouts/ServicesLayout"
import { SEO_CONFIG } from "../core/config/seo.config"

const Survivor = lazy(() => import("../modules/survivor"))

const SurvivorRoute = () => {
  return <ServicesLayout children={<Survivor />} seo_config={SEO_CONFIG.survivor} />
}

export default SurvivorRoute
