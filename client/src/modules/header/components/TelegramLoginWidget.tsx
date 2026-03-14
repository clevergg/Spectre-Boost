/**
 * TelegramLoginWidget — компонент для авторизации через Telegram.
 *
 * КАК ЭТО РАБОТАЕТ:
 *
 * Telegram предоставляет два способа авторизации:
 *
 * 1. Iframe Widget — Telegram сам рисует кнопку через <script>.
 *    Плюс: просто вставить. Минус: нельзя стилизовать, выглядит чужеродно.
 *
 * 2. Callback Mode — мы рисуем свою кнопку, а Telegram вызывает
 *    нашу callback-функцию с данными юзера после авторизации.
 *
 * Мы используем вариант 1 (script widget), потому что:
 * - Telegram доверяет только своему виджету (меньше шансов на фишинг)
 * - Не нужно делать redirect на другую страницу
 * - Работает надёжнее
 *
 * Как устроен этот компонент:
 *
 * 1. useRef создаёт ссылку на div-контейнер
 * 2. useEffect при монтировании создаёт <script> от Telegram
 * 3. Script рисует кнопку авторизации внутри контейнера
 * 4. Когда юзер авторизуется — Telegram вызывает window.onTelegramAuth
 * 5. Мы ловим данные и отправляем на бэкенд через authStore.login()
 *
 * ВАЖНО: BOT_USERNAME нужно заменить на реальное имя бота.
 * Это @username бота без @.
 */

import { useEffect, useRef } from "react"
import { login } from "../../../core/stores/authStore"
import { handleChangeIsModalClick } from "../store/HeaderStore"
import type { TelegramAuthData } from "../../../core/api/auth.api"

// Замени на username своего бота (без @)
const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || "SpectreBoostBot"

// Расширяем тип window чтобы TypeScript знал о callback-функции
declare global {
  interface Window {
    onTelegramAuth: (user: TelegramAuthData) => void
  }
}

export const TelegramLoginWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. Определяем callback-функцию на window
    // Telegram вызовет её после авторизации юзера
    window.onTelegramAuth = async (user: TelegramAuthData) => {
      try {
        // Отправляем данные на бэкенд, получаем JWT
        await login(user)

        // Закрываем модалку
        handleChangeIsModalClick(false)
        document.body.classList.remove("no-scroll")
      } catch (error) {
        console.error("Telegram auth failed:", error)
      }
    }

    // 2. Создаём <script> элемент от Telegram
    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-widget.js?22"
    script.async = true

    // Атрибуты виджета:
    script.setAttribute("data-telegram-login", BOT_USERNAME)
    script.setAttribute("data-size", "large")         // размер кнопки
    script.setAttribute("data-radius", "12")           // скругление углов
    script.setAttribute("data-onauth", "onTelegramAuth(user)") // callback
    script.setAttribute("data-request-access", "write") // запрос доступа

    // 3. Вставляем script в контейнер
    if (containerRef.current) {
      // Очищаем контейнер (на случай повторного рендера)
      containerRef.current.innerHTML = ""
      containerRef.current.appendChild(script)
    }

    // 4. Cleanup при размонтировании
    return () => {
      // Удаляем callback чтобы не было утечек памяти
      // @ts-ignore — удаляем свойство с window
      delete window.onTelegramAuth
    }
  }, [])

  return <div ref={containerRef} className='flex justify-center py-2' />
}
