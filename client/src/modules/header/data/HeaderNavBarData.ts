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
  {
    title: "Личный кабинет",
    link: routes.account,
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
  {
    title: "Личный кабинет",
    link: routes.account,
  },
]
