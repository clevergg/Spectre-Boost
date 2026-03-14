import { lazy } from "react"
import { FirstSelectRank } from "./FirstSelectRank"
import { SecondSelectRank } from "./SecondSelectRank"

interface SelectsModalInterface {
  isModalOpen: boolean
  handleChangeIsModalOpen: (isModalOpen: boolean) => void
}

const CreatePortalModal = lazy(() => import("../../../shared/ui/CreatePortalModal"))

export const SelectsModal = ({ isModalOpen, handleChangeIsModalOpen }: SelectsModalInterface) => {
  return (
    <CreatePortalModal
      type='notdefault'
      isOpen={isModalOpen}
      onClose={() => handleChangeIsModalOpen(false)}
    >
      <div className='flex max-lgx:flex-col gap-3 justify-around'>
        <FirstSelectRank />

        <SecondSelectRank />
      </div>
    </CreatePortalModal>
  )
}
