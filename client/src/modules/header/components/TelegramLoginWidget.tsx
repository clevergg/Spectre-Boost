import { useEffect, useState, useRef } from "react"
import { generateLoginCode, checkLoginCode } from "../../../core/api/auth.api"
import { loginWithCode } from "../../../core/stores/authStore"
import { handleChangeIsModalClick } from "../store/HeaderStore"
import { unlockScroll } from "../../../core/helpers/controlScroll"

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || "SpectreBoost_bot"

export const TelegramLoginWidget = () => {
  const [code, setCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Генерируем код при открытии
  useEffect(() => {
    requestCode()
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const requestCode = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await generateLoginCode()
      setCode(result.code)
      setTimeLeft(result.expiresIn)

      // Таймер обратного отсчёта
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            if (pollingRef.current) clearInterval(pollingRef.current)
            setCode(null)
            setError("Код истёк. Получите новый.")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Опрашиваем бэкенд каждые 2 сек
      if (pollingRef.current) clearInterval(pollingRef.current)
      pollingRef.current = setInterval(async () => {
        try {
          const check = await checkLoginCode(result.code)
          if (check.confirmed && check.accessToken && check.user) {
            // Успех!
            if (pollingRef.current) clearInterval(pollingRef.current)
            if (timerRef.current) clearInterval(timerRef.current)

            loginWithCode(check.accessToken, check.user)
            handleChangeIsModalClick(false)
            unlockScroll()
          }
        } catch {
          // Ошибка сети — игнорируем, попробуем снова
        }
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Ошибка")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className='flex flex-col items-center gap-5'>
      {isLoading ? (
        <p className='text-white font-gilroy'>Генерация кода...</p>
      ) : code ? (
        <>
          {/* Код */}
          <div className='bg-white/5 border border-white/10 rounded-2xl w-full py-5 text-center'>
            <p className='text-gray-400 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)] mb-2'>
              Ваш код для входа
            </p>
            <p className='text-white font-unbounded text-[clamp(1.6rem,2.2vw,2.2rem)] tracking-[0.3em]'>
              {code}
            </p>
            <p className='text-gray-500 font-gilroy text-[clamp(0.85rem,0.9vw,0.9rem)] mt-2'>
              Действителен {formatTime(timeLeft)}
            </p>
          </div>

          {/* Инструкция */}
          <div className='text-center space-y-2'>
            <p className='text-white font-gilroyMedium text-[clamp(0.95rem,1.05vw,1.05rem)]'>
              Откройте бота и отправьте:
            </p>
            <p className='bg-white/5 rounded-xl px-4 py-2 font-mono text-[clamp(0.95rem,1.05vw,1.05rem)] text-white'>
              /login {code}
            </p>
          </div>

          {/* Кнопка открыть бота */}
          <a
            href={`https://t.me/${BOT_USERNAME}`}
            target='_blank'
            rel='noopener noreferrer'
            className='w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#2AABEE] hover:bg-[#229ED9] rounded-xl transition-colors'
          >
            <svg width='24' height='24' viewBox='0 0 24 24' fill='white'>
              <path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.229.168.327.016.098.035.322.02.496z' />
            </svg>
            <span className='text-white font-gilroyMedium text-[clamp(1rem,1.1vw,1.1rem)]'>
              Открыть бота
            </span>
          </a>

          {/* Ожидание */}
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
            <p className='text-gray-400 font-gilroy text-[clamp(0.8rem,0.9vw,0.9rem)]'>
              Ожидаем подтверждение...
            </p>
          </div>
        </>
      ) : error ? (
        <>
          <p className='text-red-400 font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>{error}</p>
          <button
            onClick={requestCode}
            className='px-6 py-2 rounded-xl bg-white/10 text-white font-gilroy hover:bg-white/20 transition-colors'
          >
            Получить новый код
          </button>
        </>
      ) : null}
    </div>
  )
}
