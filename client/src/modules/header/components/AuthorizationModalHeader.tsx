/**
 * AuthorizationModalHeader — обновлённая модалка авторизации.
 *
 * БЫЛО: текст "СЮДА ТГШКУ СУВАЙ" и кнопка "Закрыть"
 * СТАЛО: Telegram Login Widget + кнопка закрыть
 *
 * Модалка открывается когда:
 * - Юзер нажимает "Войти" в хедере
 * - Юзер нажимает "Оплатить" в калькуляторе без авторизации
 *
 * После успешного входа через Telegram:
 * - TelegramLoginWidget вызывает login() из authStore
 * - authStore обновляется: isAuthenticated = true, user = {...}
 * - Модалка закрывается
 * - Header перерисовывается: вместо "Войти" — аватар/имя
 */

import { lazy, useEffect } from "react"
import { GradientButton } from "../../../shared/ui/GradientButton"
import { handleChangeIsModalClick, useIsModalOpen } from "../store/HeaderStore"
import { TelegramLoginWidget } from "./TelegramLoginWidget"

const CreatePortalModal = lazy(
  () => import("../../../shared/ui/CreatePortalModal")
)

export function AuthorizationModalHeader() {
  const isModalOpen = useIsModalOpen()

  useEffect(() => {
    if (!isModalOpen) {
      document.body.classList.remove("no-scroll")
    }
  }, [isModalOpen])

  return (
    <CreatePortalModal
      isOpen={isModalOpen}
      onClose={() => handleChangeIsModalClick(false)}
    >
      <h2 className='text-[20px] tracking-wider text-white font-unbounded font-bold mb-4'>
        Вход через Telegram
      </h2>

      <p className='text-gray-400 font-gilroy text-[clamp(0.9rem,1vw,1rem)] mb-6'>
        Авторизуйтесь через Telegram для доступа к личному кабинету и созданию заказов
      </p>

      {/* Telegram Login Widget — рисует кнопку авторизации */}
      <div className='mb-6'>
        <TelegramLoginWidget />
      </div>

      <GradientButton
        onClick={() => handleChangeIsModalClick(false)}
        className='px-5 py-2.5 rounded-4xl'
      >
        <span className='font-Montserrat text-[16px]/[20px] font-normal'>
          Закрыть
        </span>
      </GradientButton>
    </CreatePortalModal>
  )
}
