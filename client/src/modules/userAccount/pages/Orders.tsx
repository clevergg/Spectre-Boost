/**
 * Orders — обновлённая страница заказов.
 *
 * БЫЛО: import { orders } from "../data/OrdersData" — хардкод массив
 * СТАЛО: getMyOrders() из API, данные загружаются с бэкенда
 *
 * Новые концепции тут:
 *
 * 1. useState для хранения заказов, загрузки, ошибки
 *    Три состояния: загрузка → данные → ошибка
 *
 * 2. useEffect для загрузки данных при монтировании
 *    Пустой массив зависимостей [] = вызвать один раз
 *
 * 3. useCallback для стабильной ссылки на fetchOrders
 *    Нужен чтобы можно было вызвать повторно (кнопка "обновить")
 *    без пересоздания функции при каждом рендере
 */

import { useState, useEffect, useCallback } from "react"
import { OrdersTitle } from "../components/OrdersTitle"
import { OrderBaseTemplate } from "../components/OrderBaseTemplate"
import { NotFoundOrders } from "../components/NotFoundOrders"
import { getMyOrders, type Order } from "../../../core/api/orders.api"

const Orders = () => {
  // Три состояния компонента
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Функция загрузки заказов
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getMyOrders()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки заказов")
    } finally {
      // finally выполняется И при успехе, И при ошибке
      setIsLoading(false)
    }
  }, [])

  // Загружаем заказы при первом рендере
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // ─── Рендер по состояниям ───

  if (isLoading) {
    return (
      <div className='bg-bgblack border w-full h-full min-h-[500px] border-white flex-1 rounded-[11px] p-4 flex items-center justify-center'>
        <p className='text-white font-gilroy text-[clamp(1rem,1.2vw,1.2rem)]'>
          Загрузка заказов...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-bgblack border w-full h-full min-h-[500px] border-white flex-1 rounded-[11px] p-4 flex flex-col items-center justify-center gap-4'>
        <p className='text-red-400 font-gilroy text-[clamp(1rem,1.2vw,1.2rem)]'>
          {error}
        </p>
        <button
          onClick={fetchOrders}
          className='text-white font-gilroy underline hover:text-gray-300'
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div
      className={`bg-bgblack ${orders.length < 4 ? "lgx:max-h-[500px]" : ""} border w-full h-full min-h-[500px] border-white flex-1 scrollbar-hide rounded-[11px] p-4`}
    >
      <OrdersTitle />

      {orders.length === 0 ? (
        <NotFoundOrders />
      ) : (
        <div className='space-y-2'>
          {orders.map(order => (
            <OrderBaseTemplate key={order.id} order={order} onUpdate={fetchOrders} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
