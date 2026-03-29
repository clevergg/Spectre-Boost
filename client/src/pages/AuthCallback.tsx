/**
 * AuthCallback — обрабатывает redirect от Telegram Login Widget.
 *
 * Telegram перенаправляет юзера на:
 * /auth/callback?id=123&first_name=John&username=john&auth_date=1234567890&hash=abc123
 *
 * Мы берём эти параметры, отправляем на бэкенд для верификации, авторизуем юзера.
 */

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { login } from "../core/stores/authStore"
import type { TelegramAuthData } from "../core/api/auth.api"

const AuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      // Собираем данные из URL параметров
      const id = searchParams.get("id")
      const hash = searchParams.get("hash")
      const auth_date = searchParams.get("auth_date")

      if (!id || !hash || !auth_date) {
        setError("Неверные данные авторизации")
        setTimeout(() => navigate("/"), 3000)
        return
      }

      const authData: TelegramAuthData = {
        id: parseInt(id, 10),
        hash,
        auth_date: parseInt(auth_date, 10),
        first_name: searchParams.get("first_name") || undefined,
        last_name: searchParams.get("last_name") || undefined,
        username: searchParams.get("username") || undefined,
        photo_url: searchParams.get("photo_url") || undefined,
      }

      try {
        await login(authData)
        // Успешно — редирект на главную
        navigate("/")
      } catch (err: any) {
        console.error("Auth callback failed:", err)
        setError(err.message || "Ошибка авторизации")
        setTimeout(() => navigate("/"), 3000)
      }
    }

    handleAuth()
  }, [searchParams, navigate])

  return (
    <div className='min-h-screen bg-bgblack flex items-center justify-center'>
      <div className='text-center'>
        {error ? (
          <>
            <p className='text-red-400 font-gilroy text-[clamp(1rem,1.2vw,1.2rem)] mb-2'>
              {error}
            </p>
            <p className='text-gray-500 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)]'>
              Перенаправляем на главную...
            </p>
          </>
        ) : (
          <p className='text-white font-gilroy text-[clamp(1rem,1.2vw,1.2rem)]'>
            Авторизация...
          </p>
        )}
      </div>
    </div>
  )
}

export default AuthCallback
