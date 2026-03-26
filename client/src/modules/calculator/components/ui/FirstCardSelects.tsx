/**
 * FirstCardSelects — обновлённый.
 *
 * БЫЛО: две кнопки которые открывали модалку с выбором ранга из списка
 * СТАЛО: два числовых инпута для ввода рейтинга
 */

import { RatingInput } from "../RatingInput"
import {
  useStartRating,
  useTargetRating,
  setStartRating,
  setTargetRating,
} from "../../store/CalculatorSelectedStore"

export const FirstCardSelects = () => {
  const startRating = useStartRating()
  const targetRating = useTargetRating()

  return (
    <div className='flex flex-col gap-3'>
      <RatingInput
        label='Текущий рейтинг'
        placeholder='Например: 1200'
        value={startRating}
        onChange={setStartRating}
      />
      <RatingInput
        label='Желаемый рейтинг'
        placeholder='Например: 2500'
        value={targetRating}
        onChange={setTargetRating}
        min={startRating > 0 ? startRating + 1 : 0}
      />
    </div>
  )
}
