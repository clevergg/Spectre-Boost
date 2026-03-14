/**
 * OrderOpenModal — обновлённая модалка деталей заказа.
 *
 * БЫЛО: тип Order из OrdersData.tsx (id: string, date: string, total: number)
 * СТАЛО: тип Order из orders.api.ts (id: number, createdAt: string, totalPrice: number)
 *
 * Также добавлено:
 * - Отображение ASSIGNED и IN_PROGRESS статусов
 * - Инфо о бустере (если назначен)
 * - Кнопка "Отменить" для PENDING заказов
 * - Название услуги из service.name
 */

import { lazy, useEffect, useState } from "react"
import { type Order } from "../../../core/api/orders.api"
import { cancelOrder } from "../../../core/api/orders.api"

interface OrderOpenModalProps {
  order: Order | null
  isModalOpen: boolean
  onClose: () => void
}

const CreatePortalModal = lazy(
  () => import("../../../shared/ui/CreatePortalModal")
)

const STATUS_CONFIG = {
  PENDING: {
    label: "Ожидание",
    className: "border border-[#F2D04E] text-[#F2D04E]",
  },
  ASSIGNED: {
    label: "Назначен",
    className: "border border-[#4EA8F2] text-[#4EA8F2]",
  },
  IN_PROGRESS: {
    label: "В работе",
    className: "border border-[#4E7CF2] text-[#4E7CF2]",
  },
  COMPLETED: {
    label: "Завершён",
    className: "border border-[#071E07] text-[#2D531A]",
  },
  CANCELLED: {
    label: "Отменён",
    className: "border border-[#8D0004] text-[#8D0004]",
  },
} as const

export function OrderOpenModal({
  order,
  isModalOpen,
  onClose,
}: OrderOpenModalProps) {
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (!isModalOpen) {
      document.body.classList.remove("no-scroll")
    }
  }, [isModalOpen])

  if (!order) return null

  const statusConfig = STATUS_CONFIG[order.status]

  const handleCancel = async () => {
    try {
      setIsCancelling(true)
      await cancelOrder(order.id)
      onClose()
    } catch (err) {
      console.error("Cancel failed:", err)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <CreatePortalModal isOpen={isModalOpen} onClose={onClose}>
      <div className='border border-gray-200 rounded-lg p-4'>
        {/* Шапка: номер + дата + статус */}
        <div className='flex flex-row justify-between items-start mb-4'>
          <div>
            <h3 className='font-gilroy text-[clamp(1.1rem,1.3vw,1.3rem)] text-white'>
              Заказ #{order.id}
            </h3>
            <p className='text-[clamp(0.9rem,1vw,1rem)] font-gilroy text-white/70'>
              {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[clamp(0.9rem,1vw,1rem)] font-gilroy ${statusConfig.className}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Услуга */}
        <div className='mb-4'>
          <p className='text-white/50 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)] mb-1'>
            Услуга
          </p>
          <p className='text-white font-gilroy text-[clamp(1rem,1.1vw,1.1rem)]'>
            {order.service.name}
          </p>
          <p className='text-white/60 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)]'>
            {order.service.gameCategory.name}
          </p>
        </div>

        {/* Ранги (если есть) */}
        {order.startValue && order.targetValue && (
          <div className='mb-4'>
            <p className='text-white/50 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)] mb-1'>
              Диапазон
            </p>
            <p className='text-white font-gilroy text-[clamp(1rem,1.1vw,1.1rem)]'>
              {order.startValue} → {order.targetValue}
            </p>
          </div>
        )}

        {/* Бустер (если назначен) */}
        {order.worker && (
          <div className='mb-4'>
            <p className='text-white/50 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)] mb-1'>
              Бустер
            </p>
            <p className='text-white font-gilroy text-[clamp(1rem,1.1vw,1.1rem)]'>
              {order.worker.username
                ? `@${order.worker.username}`
                : order.worker.firstName || "Назначен"}
            </p>
            <p className='text-white/60 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)]'>
              ⭐ {order.worker.rating}/5 · {order.worker.completedCount} заказов
            </p>
          </div>
        )}

        {/* Цена */}
        <div className='border-t border-gray-700 pt-3 mt-3 flex justify-between items-center'>
          <p className='font-gilroyMedium text-[clamp(1.1rem,1.2vw,1.2rem)] text-white'>
            {order.totalPrice.toLocaleString("ru-RU")} ₽
          </p>

          {/* Кнопка отмены — только для PENDING */}
          {order.status === "PENDING" && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className='text-red-400 hover:text-red-300 font-gilroy text-[clamp(0.9rem,1vw,1rem)] transition-colors disabled:opacity-50'
            >
              {isCancelling ? "Отмена..." : "Отменить заказ"}
            </button>
          )}
        </div>
      </div>
    </CreatePortalModal>
  )
}
