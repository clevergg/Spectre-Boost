/**
 * UserProfile — обновлённый компонент.
 *
 * БЫЛО: хардкод "zdes nik", хардкод аватар AVA.jpeg
 * СТАЛО: данные из authStore (реальный юзер из Telegram)
 *
 * useUser() возвращает объект UserData | null.
 * Мы берём из него username, firstName, photoUrl.
 * Если photoUrl нет — показываем первую букву имени (аватар-плейсхолдер).
 */

import { useUser } from "../../../core/stores/authStore"

export const UserProfile = () => {
  const user = useUser()

  // Пока данные загружаются (теоретически не должно быть,
  // потому что ProtectedRoute не пустит без авторизации)
  if (!user) return null

  // Отображаемое имя: username > firstName > "Пользователь"
  const displayName = user.username || user.firstName || "Пользователь"

  // Подзаголовок: @username если есть, иначе telegramId
  const subtitle = user.username
    ? `@${user.username}`
    : `ID: ${user.telegramId}`

  return (
    <div className='flex-shrink-0 border border-white bg-bgblack rounded-[11px]'>
      <figure className='flex flex-col py-6 xl:flex-row xl:justify-center items-center md:space-x-4 max-md:space-y-1'>

        {/* Аватар: фото из Telegram или плейсхолдер с первой буквой */}
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={displayName}
            loading='lazy'
            className='w-25 h-25 object-cover rounded-full'
          />
        ) : (
          <div className='w-25 h-25 rounded-full bg-gradient-to-r from-pink-gradient1 to-pink-gradient2 flex items-center justify-center'>
            <span className='text-3xl font-unbounded text-white'>
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <figcaption className='text-center md:text-left'>
          <h1 className='text-[clamp(1.4rem,1.6vw,1.6rem)] font-unbounded text-white'>
            {displayName}
          </h1>
          <p className='text-gray-600 font-gilroy text-[clamp(1rem,1.4vw,1.4rem)]'>
            {subtitle}
          </p>
        </figcaption>
      </figure>
    </div>
  )
}
