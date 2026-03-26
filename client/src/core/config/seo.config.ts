/**
 * Конфигурация SEO для каждой страницы.
 * Импортируется в page-компонентах.
 */

export const SEO_CONFIG = {
  home: {
    title: undefined, // Используется дефолтный: "Spectre Boost — Буст рейтинга PUBG"
    description:
      "Spectre Boost — профессиональный буст рейтинга в PUBG. Повышение ранга от Бронзы до Мастера. Безопасно, анонимно, с гарантией результата.",
    keywords:
      "буст PUBG, буст рейтинга, boost PUBG, прокачка ранга, Spectre Boost, повышение рейтинга PUBG",
    canonical: "https://spectreboost.com/",
  },
  services: {
    title: "Калькулятор буста",
    description:
      "Рассчитайте стоимость буста рейтинга в PUBG. Выберите текущий и желаемый рейтинг, добавьте доп. услуги. Цены от 150₽ за 100 очков.",
    keywords:
      "калькулятор буста PUBG, цена буста PUBG, стоимость прокачки ранга, буст ранга цена",
    canonical: "https://spectreboost.com/services",
  },
  aboutus: {
    title: "О нас",
    description:
      "Spectre Boost — команда профессиональных бустеров PUBG. Быстрое выполнение, анонимный режим, поддержка 24/7.",
    keywords:
      "Spectre Boost, команда бустеров, буст PUBG отзывы, о нас",
    canonical: "https://spectreboost.com/aboutus",
  },
  account: {
    title: "Личный кабинет",
    description: "Управление заказами и настройки аккаунта Spectre Boost.",
  },
} as const
