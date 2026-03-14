import quality from "../assets/servicesFeatures/servicesFeatquality.svg"
import clock from "../assets/servicesFeatures/servicesFeatClock.svg"
import safety from "../assets/servicesFeatures/servicesFeatSafety.svg"

interface ServicesFeaturesDataInterface {
  image: string
  title: string
  desc: string
}

export const ServicesFeaturesData: ServicesFeaturesDataInterface[] = [
  {
    image: clock,
    title: "Безопасность",
    desc: "Мы за безопасность ваших аккаунтов! Весь буст выполняют без посторонних программ действующие или бывшие про-игроки.",
  },
  {
    image: quality,
    title: "Качество",
    desc: "Предоставляем только качественные услуги с самой доступной ценой и максимально быстро. Качество - наш главный критерий!",
  },
  {
    image: safety,
    title: "Анонимность",
    desc: "Все заказы выполняются в режиме невидимка, ваша анонимность - наш приоритет. Никто не узнает о том, что вы заказывали буст.",
  },
  {
    image: clock,
    title: "Скорость",
    desc: "Заказ поступает бустеру в течение 3 минут через телеграм бота, что позволяет приступить к вашему аккаунту максимально быстро!",
  },
]
