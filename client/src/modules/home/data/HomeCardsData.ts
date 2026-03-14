import spectreLogo from "../../../assets/spectre.svg"

interface HomeCardsDataInterface {
  id: number
  title: string
  description: string
  buttonText: string
  image: string
}

export const HomeCardsData: HomeCardsDataInterface[] = [
  {
    id: 1,
    title: "Открыть медали",
    description:
      "Все заказы выполняются в режиме невидимка, ваша анонимность – наш приоритет. Никто не узнает о том, что вы заказывали буст.",
    buttonText: "Открыть медали",
    image: spectreLogo,
  },
  {
    id: 2,
    title: "Буст ранга",
    description:
      "Все заказы выполняются в режиме невидимка, ваша анонимность – наш приоритет. Никто не узнает о том, что вы заказывали буст.",
    buttonText: "Заказать буст",
    image: spectreLogo,
  },
  {
    id: 3,
    title: "Уровень выживания",
    description:
      "Все заказы выполняются в режиме невидимка, ваша анонимность – наш приоритет. Никто не узнает о том, что вы заказывали буст.",
    buttonText: "Прокачать уровень",
    image: spectreLogo,
  },
]
