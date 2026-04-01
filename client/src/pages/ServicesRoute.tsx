import { lazy } from "react"
import ServicesLayout from "./pageLayouts/ServicesLayout"
import { SEO_CONFIG } from "../core/config/seo.config"

const Calculator = lazy(() => import("../modules/calculator"))

const ServicesRoute = () => {
  return (
    <ServicesLayout seo_config={SEO_CONFIG.services}>
      <Calculator />
    </ServicesLayout>
  )
}

export default ServicesRoute
