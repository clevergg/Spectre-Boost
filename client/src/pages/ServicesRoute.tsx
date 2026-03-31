import { lazy } from "react"
import ServicesLayout from "./pageLayouts/ServicesLayout"
import { SEO_CONFIG } from "../core/config/seo.config"

const Calculator = lazy(() => import("../modules/calculator"))

const ServicesRoute = () => {
  return <ServicesLayout children={<Calculator />} seo_config={SEO_CONFIG.services} />
}

export default ServicesRoute
