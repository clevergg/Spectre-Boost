import { GradientButton } from "../../../shared/ui/GradientButton"
import { handleChangeIsModalClick, useIsModalOpen } from "../store/HeaderStore"
export const LogginButton = () => {
  const isModalOpen = useIsModalOpen()

  const openModal = (): void => {
    handleChangeIsModalClick(!isModalOpen)
    document.body.classList.toggle("no-scroll")
  }
  return (
    <GradientButton onClick={() => openModal()} className='max-md:hidden px-8 py-4 rounded-4xl'>
      <span className='font-Montserrat text-[18px]/[20px] font-normal'>Войти</span>
    </GradientButton>
  )
}
