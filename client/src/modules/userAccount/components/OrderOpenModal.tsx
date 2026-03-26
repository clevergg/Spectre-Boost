import { lazy, useEffect, useState } from "react"
import { type Order, cancelOrder } from "../../../core/api/orders.api"
import { createReview } from "../../../core/api/reviews.api"

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
    className: "border border-[#2D531A] text-[#2D531A]",
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
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  useEffect(() => {
    if (!isModalOpen) {
      document.body.classList.remove("no-scroll")
      // Сбрасываем форму при закрытии
      setReviewRating(0)
      setReviewText("")
      setReviewError(null)
    }
  }, [isModalOpen])

  if (!order) return null

  const statusConfig = STATUS_CONFIG[order.status]
  const canReview = order.status === "COMPLETED" && !order.rating && !reviewSubmitted

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

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      setReviewError("Выберите оценку")
      return
    }
    if (reviewText.length < 5) {
      setReviewError("Минимум 5 символов")
      return
    }

    try {
      setIsSubmittingReview(true)
      setReviewError(null)
      await createReview({
        orderId: order.id,
        rating: reviewRating,
        text: reviewText,
      })
      setReviewSubmitted(true)
    } catch (err: any) {
      setReviewError(err.message || "Ошибка отправки")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <CreatePortalModal isOpen={isModalOpen} onClose={onClose}>
      <div className='border border-gray-700 rounded-lg p-5 max-w-[500px] w-full'>
        {/* Шапка */}
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
            className={`px-3 py-1 rounded-full text-[clamp(0.85rem,0.95vw,0.95rem)] font-gilroy ${statusConfig.className}`}
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

        {/* Диапазон */}
        {order.startValue != null && order.targetValue != null && (
          <div className='mb-4'>
            <p className='text-white/50 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)] mb-1'>
              Диапазон
            </p>
            <p className='text-white font-gilroy text-[clamp(1rem,1.1vw,1.1rem)]'>
              {order.startValue} → {order.targetValue}
            </p>
          </div>
        )}

        {/* Бустер — только рейтинг, без имени */}
        {order.worker && (
          <div className='mb-4'>
            <p className='text-white/50 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)] mb-1'>
              Бустер
            </p>
            <p className='text-white font-gilroy text-[clamp(1rem,1.1vw,1.1rem)]'>
              ⭐ {order.worker.rating}/5 · {order.worker.completedCount} заказов
            </p>
          </div>
        )}

        {/* Скидка */}
        {order.discount && (
          <div className='mb-4'>
            <p className='text-green-400 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)]'>
              🏷 Скидка {order.discount}% по промокоду
            </p>
          </div>
        )}

        {/* Цена + кнопки */}
        <div className='border-t border-gray-700 pt-3 mt-3 flex justify-between items-center'>
          <p className='font-gilroyMedium text-[clamp(1.1rem,1.2vw,1.2rem)] text-white'>
            {order.totalPrice.toLocaleString("ru-RU")} ₽
          </p>

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

        {/* Форма отзыва — только для COMPLETED без оценки */}
        {canReview && (
          <div className='border-t border-gray-700 pt-4 mt-4'>
            <p className='text-white font-gilroyMedium text-[clamp(1rem,1.1vw,1.1rem)] mb-3'>
              Оставить отзыв
            </p>

            {/* Звёзды */}
            <div className='flex gap-2 mb-3'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= reviewRating ? "text-yellow-400" : "text-gray-600"
                  } hover:text-yellow-300`}
                >
                  ⭐
                </button>
              ))}
            </div>

            {/* Текст */}
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder='Опишите ваш опыт (минимум 5 символов)...'
              maxLength={500}
              rows={3}
              className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white font-gilroy text-[clamp(0.9rem,1vw,1rem)] outline-none focus:border-pink-400 resize-none'
            />

            {reviewError && (
              <p className='text-red-400 font-gilroy text-[clamp(0.8rem,0.9vw,0.9rem)] mt-1'>
                {reviewError}
              </p>
            )}

            <button
              onClick={handleSubmitReview}
              disabled={isSubmittingReview}
              className='mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-pink-gradient1 to-pink-gradient2 text-white font-gilroyMedium text-[clamp(0.95rem,1.05vw,1.05rem)] hover:opacity-90 transition-opacity disabled:opacity-50'
            >
              {isSubmittingReview ? "Отправка..." : "Отправить отзыв"}
            </button>
          </div>
        )}

        {/* Отзыв уже отправлен */}
        {(reviewSubmitted || (order.status === "COMPLETED" && order.rating)) && (
          <div className='border-t border-gray-700 pt-4 mt-4 text-center'>
            <p className='text-green-400 font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>
              ✅ Отзыв отправлен на модерацию
            </p>
          </div>
        )}
      </div>
    </CreatePortalModal>
  )
}
