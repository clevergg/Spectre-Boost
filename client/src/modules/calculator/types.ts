export interface RankTier {
  id: number
  name: string
  image: string
  min: number
  max: number
  pricePerHundred: number
}

export interface Rank {
  id: number
  price: number
  name: string
  image: string
}

export interface additionItem {
  id: number
  title: string
  description: string
  value: string
  isActive: boolean
  koef: number
}
