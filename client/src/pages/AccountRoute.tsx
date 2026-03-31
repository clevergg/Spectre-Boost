import { Account } from "../modules/userAccount"
import { SEO } from "../core/components/SEO"
import { SEO_CONFIG } from "../core/config/seo.config"
import { BgShiningGroup } from "../shared/ui/BackgroundShining/BgShiningGroup"
import { accountShinings } from "../shared/ui/BackgroundShining/BgShiningSets"

const AccountRoute = () => {
  return (
    <div className='relative w-full max-w-[1720px]'>
      <SEO {...SEO_CONFIG.account} />
      <BgShiningGroup items={accountShinings.slice(0, 1)} />
      <Account />
      <BgShiningGroup items={accountShinings.slice(1)} />
    </div>
  )
}

export default AccountRoute
