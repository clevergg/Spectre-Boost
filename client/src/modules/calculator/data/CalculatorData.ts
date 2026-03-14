import bronze from "../../../assets/pubgIcons/bronze.jpg"
import diamond from "../../../assets/pubgIcons/diamond.jpg"
import gold from "../../../assets/pubgIcons/gold.jpg"
import master from "../../../assets/pubgIcons/master.png"
import platina from "../../../assets/pubgIcons/platina.png"
import serebro from "../../../assets/pubgIcons/serebro.jpg"
import { type additionItem, type Rank } from "../types"

export const CalculatorData: Rank[] = [
  { id: 1, price: 1000, name: "Бронза", image: bronze },
  { id: 2, price: 1000, name: "Серебро", image: serebro },
  { id: 3, price: 1000, name: "Золото", image: gold },
  { id: 4, price: 1000, name: "Платина", image: platina },
  { id: 5, price: 1000, name: "Алмаз", image: diamond },
  { id: 6, price: 1000, name: "Мастер", image: master },
]

export const DopServicesData: additionItem[] = [
  {
    id: 1,
    title: "Оффлайн режим",
    value: "0%",
    isActive: true,
    koef: 0,
  },
  {
    id: 2,
    title: "Пати с бустерами",
    value: "+50%",
    isActive: false,
    koef: 0.5,
  },
  {
    id: 3,
    title: "Экспресс буст",
    value: "+75%",
    isActive: false,
    koef: 0.75,
  },
  {
    id: 4,
    title: "Повышение приоритета",
    value: "+50%",
    isActive: false,
    koef: 0.5,
  },
]
