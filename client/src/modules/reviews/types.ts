/**
 * Тип отзыва.
 *
 * БЫЛО: { id, author: string, img: string, rating, date, text }
 * СТАЛО: маппится из API Review в формат для компонентов слайдера
 *
 * Компоненты SliderDeskCard и SliderMobile используют этот тип.
 * Маппинг из API в этот формат происходит в Reviews.tsx.
 */
export interface Review {
  id: number
  author: string
  img: string | null
  rating: number
  date: string
  text: string
}
