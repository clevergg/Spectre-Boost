import { CalculatorData as ranks } from "../data/CalculatorData"
import { changeAmount } from "../store/CalculatorAdditionsStore"
import { type additionItem, type Rank } from "../types"

interface CalculatorProps {
  selectedRankFirst: Rank | null
  selectedRankSecond: Rank | null
  items: additionItem[]
}

class Calculator {
  calculatePrice(props: CalculatorProps): void {
    const { selectedRankFirst, selectedRankSecond, items } = props
    if (!selectedRankFirst || !selectedRankSecond) {
      changeAmount(0)
      return
    }
    const firstRankIndex = ranks.findIndex(rank => rank.id === selectedRankFirst?.id)
    const secondRankIndex = ranks.findIndex(rank => rank.id === selectedRankSecond?.id)

    if (firstRankIndex === -1 || secondRankIndex === -1 || firstRankIndex >= secondRankIndex) {
      changeAmount(0)
      return
    }

    let basePrice = 0
    for (let i = firstRankIndex; i < secondRankIndex; i++) {
      const currentRank = ranks[i]
      const nextRank = ranks[i + 1]

      if (!currentRank || !nextRank) {
        continue
      }

      const currentRankPrice = currentRank.price
      const nextRankPrice = nextRank.price
      basePrice += (currentRankPrice + nextRankPrice) / 2
    }

    let totalMultiplier = 1
    items.forEach(item => {
      if (item.isActive && item.koef > 0) {
        totalMultiplier *= 1 + item.koef
      }
    })

    const finalAmount = basePrice * totalMultiplier
    changeAmount(Math.round(finalAmount))
  }
}

export const calculator = new Calculator()
