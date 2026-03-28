import spectreLogo from "../../../assets/spectre.svg"

interface HomeCardsDataInterface {
  id: number
  title: string
  description: string
  buttonText: string
  image: string
  soon?: boolean
  aria?: "topfifty" | "boost" | "medals"
}

export const HomeCardsData: HomeCardsDataInterface[] = [
  {
    id: 1,
    title: "Открыть медали",
    aria: "medals",
    soon: true,
    description: "Поможем получить медали без лишней траты времени. Быстро и конфиденциально.",
    buttonText: "Открыть медали",
    image: spectreLogo,
  },
  {
    id: 2,
    title: "Буст ранга",
    aria: "boost",
    description:
      "Все заказы выполняются в режиме невидимка, ваша анонимность – наш приоритет. Никто не узнает о том, что вы заказывали буст.",
    buttonText: "Заказать буст",
    image: spectreLogo,
  },
  {
    id: 3,
    title: "Буст топ 50",
    aria: "topfifty",
    description:
      "Попадание в топ 50 сервера - без гринда и бессонных ночей. Быстро и с гарантией результата.",
    buttonText: "Заказать буст топ 50",
    image: spectreLogo,
  },
]
