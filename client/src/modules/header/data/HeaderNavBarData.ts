/**
 * HeaderNavBarData — обновлённые данные навигации.
 *
 * БЫЛО:
 *   Desktop: Услуги, О нас, Личный кабинет
 *   Mobile:  Главная, Услуги, О нас, Личный кабинет
 *
 * СТАЛО:
 *   Desktop: Услуги, О нас (кнопка Войти/аватар отдельно в Header.tsx)
 *   Mobile:  Главная, Услуги, О нас (Войти/Аккаунт добавляется динамически)
 */

import { routes } from "../../../app/config/routes"

interface HeaderDataInterface {
  title: string
  link: string
}

export const HeaderNavBarData: HeaderDataInterface[] = [
  {
    title: "Услуги",
    link: routes.services,
  },
  {
    title: "О нас",
    link: routes.aboutus,
  },
]

export const HeaderBurgerMenuData: HeaderDataInterface[] = [
  {
    title: "Главная",
    link: routes.home,
  },
  {
    title: "Услуги",
    link: routes.services,
  },
  {
    title: "О нас",
    link: routes.aboutus,
  },
]
