import { Link, useLocation } from "react-router-dom"
import { servicesLinksData } from "./servicesLinksData"

export const ServicesLinks = () => {
  const { pathname } = useLocation()
  return (
    <div className='w-full z-1 flex max-lg:flex-col max-lg:space-y-4 lg:flex-row lg:gap-4'>
      {servicesLinksData.map(({ label, to }) => (
        <Link key={label} to={to} className='lg:flex-1'>
          <button
            className={`w-full ${pathname === to ? "bg-violet" : "bg-transparent"} cursor-pointer border-violet border p-4 rounded-[11px]`}
          >
            <p className='font-unbounded italic font-normal text-white text-[clamp(1rem,1.2vw,1.3rem)] text-center'>
              {label}
            </p>
          </button>
        </Link>
      ))}
    </div>
  )
}
