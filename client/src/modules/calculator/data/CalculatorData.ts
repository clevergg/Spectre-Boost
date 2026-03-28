import bronze from "../../../assets/pubgIcons/prodIcons/bronze.png"
import serebro from "../../../assets/pubgIcons/prodIcons/silver.png"
import gold from "../../../assets/pubgIcons/prodIcons/gold.png"
import platina from "../../../assets/pubgIcons/prodIcons/platinum.png"
import crystal from "../../../assets/pubgIcons/prodIcons/crystal.png"
import diamond from "../../../assets/pubgIcons/prodIcons/diamond.png"
import master from "../../../assets/pubgIcons/prodIcons/Master.png"
import { type RankTier, type additionItem } from "../types"

export const RankTiers: RankTier[] = [
  { id: 1, name: "Бронза", image: bronze, min: 0, max: 1399, pricePerHundred: 150 },
  { id: 2, name: "Серебро", image: serebro, min: 1400, max: 1799, pricePerHundred: 200 },
  { id: 3, name: "Золото", image: gold, min: 1800, max: 2199, pricePerHundred: 300 },
  { id: 4, name: "Платина", image: platina, min: 2200, max: 2599, pricePerHundred: 450 },
  { id: 5, name: "Кристалл", image: crystal, min: 2600, max: 2999, pricePerHundred: 650 },
  { id: 6, name: "Бриллиант", image: diamond, min: 3000, max: 3399, pricePerHundred: 900 },
  { id: 7, name: "Мастер", image: master, min: 3400, max: 3800, pricePerHundred: 1200 },
]

export const CalculatorData = RankTiers.map(tier => ({
  id: tier.id,
  price: tier.pricePerHundred,
  name: tier.name,
  image: tier.image,
}))

export const MIN_RATING = 0
export const MAX_RATING = 3800

export function getRankByRating(rating: number): RankTier | null {
  return RankTiers.find(tier => rating >= tier.min && rating <= tier.max) || null
}

export const DopServicesData: additionItem[] = [
  {
    id: 1,
    title: "Оффлайн режим",
    description: "Включается режим невидимки в Steam и в самой игре",
    value: "0%",
    isActive: true,
    koef: 0,
  },
  {
    id: 2,
    title: "Пати с бустерами",
    description: "Буст выполняется без передачи аккаунта, в команде с бустерами",
    value: "+50%",
    isActive: false,
    koef: 0.5,
  },
  {
    id: 3,
    title: "Экспресс буст",
    description: "Выполнение за 1-2 дня вместо стандартных 5. Бустер работает без перерывов",
    value: "+75%",
    isActive: false,
    koef: 0.75,
  },
  {
    id: 4,
    title: "Повышение приоритета",
    description: "Ваш заказ попадает в начало очереди. Работа начнётся в течение 1 часа",
    value: "+50%",
    isActive: false,
    koef: 0.5,
  },
]
