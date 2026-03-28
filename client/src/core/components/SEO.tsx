/**
 * SEO — компонент для динамических мета-тегов.
 *
 * Используется на каждой странице для уникальных title и description.
 * Требует: bun add react-helmet-async
 *
 * Использование:
 *   <SEO title="Услуги" description="Калькулятор буста PUBG" />
 */

import { Helmet } from "react-helmet-async"

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  ogImage?: string
}

const SITE_NAME = "Spectre Boost"
const DEFAULT_DESCRIPTION = "Профессиональный буст рейтинга в PUBG. Быстро, безопасно, анонимно."
const DEFAULT_OG_IMAGE = "https://spectreboost.com/og-image.png"

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Буст рейтинга PUBG`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      {keywords && <meta name='keywords' content={keywords} />}
      {canonical && <link rel='canonical' href={canonical} />}

      {/* Open Graph */}
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={ogImage} />
      {canonical && <meta property='og:url' content={canonical} />}

      {/* Twitter */}
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={ogImage} />
    </Helmet>
  )
}
