/**
 * HeaderUserMenu — компонент для авторизованного юзера в хедере.
 *
 * Показывается вместо кнопки "Войти" когда isAuthenticated = true.
 * Содержит аватар, имя и ссылку на личный кабинет.
 *
 * Кнопка "Выйти" вызывает logout() из authStore:
 * - Очищает cookie на бэке (POST /auth/logout)
 * - Очищает token в памяти (setAccessToken(null))
 * - Обновляет store (isAuthenticated = false, user = null)
 * - Header перерисовывается и снова показывает "Войти"
 */

import { NavLink } from "react-router-dom"
import { routes } from "../../../app/config/routes"
import { useUser, logout } from "../../../core/stores/authStore"

export const HeaderUserMenu = () => {
  const user = useUser()

  if (!user) return null

  const displayName = user.username || user.firstName || "Аккаунт"

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className='max-md:hidden flex items-center gap-4'>
      {/* Ссылка на личный кабинет */}
      <NavLink
        to={routes.account}
        className='flex items-center gap-3 hover:opacity-80 transition-opacity'
      >
        {/* Аватар */}
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={displayName}
            className='w-10 h-10 rounded-full object-cover'
          />
        ) : (
          <div className='w-10 h-10 rounded-full bg-gradient-to-r from-pink-gradient1 to-pink-gradient2 flex items-center justify-center'>
            <span className='text-sm font-unbounded text-white'>
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <span className='text-white font-gilroyMedium text-[clamp(1rem,1.1vw,1.1rem)]'>
          {displayName}
        </span>
      </NavLink>

      {/* Кнопка выхода */}
      <button
        onClick={handleLogout}
        className='text-gray-400 hover:text-white font-gilroy text-[clamp(0.9rem,1vw,1rem)] transition-colors'
      >
        Выйти
      </button>
    </div>
  )
}
