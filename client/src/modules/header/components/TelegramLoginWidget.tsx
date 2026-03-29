import { useEffect, useRef, useState } from "react"
import { login } from "../../../core/stores/authStore"
import { handleChangeIsModalClick } from "../store/HeaderStore"
import type { TelegramAuthData } from "../../../core/api/auth.api"

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || "SpectreBoost_bot"

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramAuthData) => void
  }
}

export const TelegramLoginWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [widgetVisible, setWidgetVisible] = useState(false)

  useEffect(() => {
    window.onTelegramAuth = async (user: TelegramAuthData) => {
      try {
        await login(user)
        handleChangeIsModalClick(false)
        document.body.classList.remove("no-scroll")
      } catch (error) {
        console.error("Telegram auth failed:", error)
      }
    }

    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-widget.js?22"
    script.async = true
    script.setAttribute("data-telegram-login", BOT_USERNAME)
    script.setAttribute("data-size", "large")
    script.setAttribute("data-radius", "12")
    script.setAttribute("data-onauth", "onTelegramAuth(user)")
    script.setAttribute("data-request-access", "write")

    script.onload = () => {
      // Проверяем что iframe виджета реально появился
      setTimeout(() => {
        const iframe = containerRef.current?.querySelector("iframe")
        if (iframe) {
          setWidgetVisible(true)
        }
      }, 1000)
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = ""
      containerRef.current.appendChild(script)
    }

    return () => {
      delete (window as any).onTelegramAuth
    }
  }, [])

  return (
    <div className='flex flex-col items-center gap-4'>
      {/* Telegram Script Widget — может не загрузиться на мобильных */}
      <div ref={containerRef} className='flex justify-center' />

      {/* Кнопка-фоллбэк — видна всегда если виджет не загрузился */}
      {!widgetVisible && (
        <a
          href={`https://t.me/${BOT_USERNAME}?start=login`}
          target='_blank'
          rel='noopener noreferrer'
          className='w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#2AABEE] hover:bg-[#229ED9] rounded-xl transition-colors'
        >
          <svg width='24' height='24' viewBox='0 0 24 24' fill='white'>
            <path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.229.168.327.016.098.035.322.02.496z'/>
          </svg>
          <span className='text-white font-gilroyMedium text-[clamp(1rem,1.1vw,1.1rem)]'>
            Войти через Telegram
          </span>
        </a>
      )}

      {/* Подсказка */}
      {!widgetVisible && (
        <p className='text-gray-500 font-gilroy text-[clamp(0.75rem,0.85vw,0.85rem)] text-center'>
          Напишите боту /start для авторизации
        </p>
      )}
    </div>
  )
}
