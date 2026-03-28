import { routes } from "../../../app/config/routes"

export const servicesLinksData = [
  { label: "Услуги", to: routes.services, disabled: false },
  { label: "Выживший", to: routes.survivor, disabled: false },
  { label: "Медали (скоро)", to: "#", disabled: true },
]
