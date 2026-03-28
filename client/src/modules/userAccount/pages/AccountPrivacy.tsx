/**
 * AccountPrivacy — страница "Аккаунт" в личном кабинете.
 * Показывает информацию о профиле и статистику.
 */

import { useUser, logout } from "../../../core/stores/authStore"
import { AccountPrivacyTitle } from "../components/OrdersTitle"

const AccountPrivacy = () => {
  const user = useUser()

  if (!user) return null

  const displayName = user.username || user.firstName || "Пользователь"

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className='bg-bgblack w-full max-lgx:min-h-full rounded-[11px] border border-white p-6'>
      <AccountPrivacyTitle />

      {/* Информация профиля */}
      <div className='space-y-6 mt-4'>
        {/* Профиль */}
        <div className='border border-gray-700 rounded-xl p-5'>
          <h2 className='text-white font-gilroyMedium text-[clamp(1rem,1.2vw,1.2rem)] mb-4'>
            Профиль
          </h2>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-white/50 font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>Имя</span>
              <span className='text-white font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>
                {user.firstName || "—"}
              </span>
            </div>
            {user.lastName && (
              <div className='flex justify-between items-center'>
                <span className='text-white/50 font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>Фамилия</span>
                <span className='text-white font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>
                  {user.lastName}
                </span>
              </div>
            )}
            <div className='flex justify-between items-center'>
              <span className='text-white/50 font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>Username</span>
              <span className='text-white font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>
                {user.username ? `@${user.username}` : "—"}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-white/50 font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>Telegram ID</span>
              <span className='text-white font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>
                {user.telegramId}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-white/50 font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>Роль</span>
              <span className='text-white font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>
                {user.role === "ADMIN" ? "Администратор" : user.role === "WORKER" ? "Бустер" : "Покупатель"}
              </span>
            </div>
          </div>
        </div>

        {/* Безопасность */}
        <div className='border border-gray-700 rounded-xl p-5'>
          <h2 className='text-white font-gilroyMedium text-[clamp(1rem,1.2vw,1.2rem)] mb-4'>
            Безопасность
          </h2>
          <p className='text-white/60 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)] mb-4'>
            Вход в аккаунт выполнен через Telegram. Для защиты аккаунта включите двухфакторную аутентификацию в настройках Telegram.
          </p>
          <button
            onClick={handleLogout}
            className='w-full py-3 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 font-gilroy text-[clamp(0.9rem,1vw,1rem)] transition-colors'
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountPrivacy
