import { type Order } from "../../../core/api/orders.api"
import { useState } from "react"
import { OrderOpenModal } from "./OrderOpenModal"

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
    className: "border border-[#2D531A] text-[#2D531A]",
  },
  CANCELLED: {
    label: "Отменён",
    className: "border border-[#8D0004] text-[#8D0004]",
  },
} as const

export const OrderBaseTemplate = ({
  order,
  onUpdate,
}: {
  order: Order
  onUpdate?: () => void
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const statusConfig = STATUS_CONFIG[order.status]

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className='border border-gray-700 rounded-lg p-4 hover:border-gray-500 transition-colors cursor-pointer'
      >
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3'>
          <div>
            <h3 className='font-gilroy text-[clamp(0.9rem,1.1vw,1.1rem)] text-white'>
              #{order.id}
            </h3>
            <p className='text-[clamp(0.85rem,0.95vw,0.95rem)] font-gilroy text-white/60'>
              {new Date(order.createdAt).toLocaleDateString("ru-RU")}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-center rounded-full text-[clamp(0.85rem,0.95vw,0.95rem)] font-gilroy ${statusConfig.className} mt-2 sm:mt-0`}
          >
            {statusConfig.label}
          </span>
        </div>

        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-white font-gilroy text-[clamp(1rem,1.1vw,1.1rem)]'>
              {order.service.name}
            </p>
            {order.worker && (
              <p className='text-gray-500 font-gilroy text-[clamp(0.8rem,0.9vw,0.9rem)] mt-1'>
                ⭐ {order.worker.rating}/5 · {order.worker.completedCount} заказов
              </p>
            )}
          </div>
          <div className='flex items-center gap-3 mt-2 sm:mt-0'>
            {order.status === "COMPLETED" && !order.rating && (
              <span className='text-pink-gradient1 font-gilroy text-[clamp(0.8rem,0.9vw,0.9rem)]'>
                Оставить отзыв →
              </span>
            )}
            <p className='font-gilroyMedium text-[clamp(0.9rem,1.1vw,1.1rem)] text-white/95'>
              {order.totalPrice.toLocaleString("ru-RU")} ₽
            </p>
          </div>
        </div>
      </div>

      <OrderOpenModal
        order={order}
        isModalOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          onUpdate?.()
        }}
      />
    </>
  )
}
