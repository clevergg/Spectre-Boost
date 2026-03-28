import { RankTiers } from "../data/CalculatorData"
import { changeAmount } from "../store/CalculatorAdditionsStore"
import { type additionItem } from "../types"

interface CalculatorProps {
  startRating: number
  targetRating: number
  items: additionItem[]
}

/**
 * Калькулятор цены на основе рейтинга.
 *
 * Логика: проходим по каждым 100 очков от start до target.
 * Для каждого участка определяем ранг и берём его pricePerHundred.
 * Например: 1300 → 1900 = 
 *   - 1300-1399: Бронза (150₽)
 *   - 1400-1499: Серебро (200₽)
 *   - 1500-1599: Серебро (200₽)
 *   - 1600-1699: Серебро (200₽)
 *   - 1700-1799: Серебро (200₽)
 *   - 1800-1899: Золото (300₽)
 *   = 150 + 200*4 + 300 = 1250₽
 */
class Calculator {
  calculatePrice(props: CalculatorProps): void {
    const { startRating, targetRating, items } = props

    if (startRating >= targetRating || startRating < 0) {
      changeAmount(0)
      return
    }

    let basePrice = 0
    let current = startRating

    // Считаем по шагам в 100 очков
    while (current < targetRating) {
      const stepEnd = Math.min(current + 100, targetRating)
      const stepSize = stepEnd - current // может быть < 100 для последнего шага

      // Находим ранг для текущего рейтинга
      const tier = RankTiers.find(t => current >= t.min && current <= t.max)
      if (!tier) break

      // Пропорциональная цена (если шаг меньше 100)
      basePrice += (tier.pricePerHundred / 100) * stepSize

      current = stepEnd
    }

    // Применяем множители доп. услуг
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
