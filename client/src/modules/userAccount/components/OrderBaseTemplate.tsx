/**
 * OrderBaseTemplate — обновлённый шаблон заказа.
 *
 * БЫЛО: использовал тип Order из OrdersData.tsx (моковый)
 * СТАЛО: использует тип Order из orders.api.ts (реальный)
 *
 * Ключевые отличия нового типа Order:
 * - id: number (было string)
 * - status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
 *   (было только pending/completed/cancelled)
 * - Добавлены ASSIGNED и IN_PROGRESS
 * - Есть данные о сервисе (service.name) и работнике (worker)
 * - Дата в формате ISO string (createdAt вместо date)
 */

import { type Order } from "../../../core/api/orders.api"
import { useState } from "react"

// Маппинг статусов на русский + цвета
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

export const OrderBaseTemplate = ({ order }: { order: Order }) => {
  const statusConfig = STATUS_CONFIG[order.status]

  // Название: берём из service, или формируем из рангов
  const title = order.service.name

  return (
    <div className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3'>
        <div>
          <h3 className='font-gilroy text-[clamp(0.9rem,1.1vw,1.1rem)] text-white'>
            #{order.id}
          </h3>
          <p className='text-[clamp(0.9rem,1.1vw,1.1rem)] font-gilroy text-white/90'>
            {new Date(order.createdAt).toLocaleDateString("ru-RU")}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-center rounded-full text-[clamp(1rem,1.1vw,1.1rem)] font-gilroy ${statusConfig.className} mt-2 sm:mt-0`}
        >
          {statusConfig.label}
        </span>
      </div>

      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-white font-gilroy text-[clamp(1.05rem,1.1vw,1.1rem)]'>
            {title}
          </p>
          {/* Показываем бустера если назначен */}
          {order.worker && (
            <p className='text-gray-400 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)] mt-1'>
              Бустер: {order.worker.username
                ? `@${order.worker.username}`
                : order.worker.firstName || "Назначен"}
            </p>
          )}
        </div>
        <p className='font-gilroyMedium text-[clamp(0.9rem,1.1vw,1.1rem)] text-white/95 mt-2 sm:mt-0'>
          {order.totalPrice.toLocaleString("ru-RU")} ₽
        </p>
      </div>
    </div>
  )
}
